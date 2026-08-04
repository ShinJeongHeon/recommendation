import { localDateKey } from './dates';
import { answerConfirm, applyCookingToInventory, confirmCandidates, type ConfirmCandidate } from './inventory/index';
import { makeSavingsEntry } from './savings/index';
import type { Storage } from '../storage/local';
import type { Ingredient, Recipe } from './types';

// 요리 완료 플로우 (FR-014·015) — 완료 원탭이 "추천 수용"의 유일한 판정 이벤트

export interface CompleteDeps {
  recipes: Recipe[];
  ingredients: Map<string, Ingredient>;
  storage: Storage;
  clock: () => Date;
}

export interface CompleteResult {
  questions: ConfirmCandidate[];
}

const LEARNED_COMPLETE_BONUS = 2; // 거절 −1, 완료 +2 (data-model, 게이트 A/B로 조정)

export function completeCooking(deps: CompleteDeps, recipeId: string): CompleteResult {
  const recipe = deps.recipes.find((r) => r.id === recipeId);
  if (!recipe) throw new Error(`카탈로그에 없는 레시피: ${recipeId}`);
  const now = deps.clock();

  // 1) 식사 이력 — 같은 날 복수 기록 허용 (엣지 케이스)
  deps.storage.appendMeal({ recipeId, completedAt: now.toISOString() });

  // 2) 수용 판정 — 오늘의 현재 추천을 완료한 경우에만 accepted (FR-014, SC-002)
  const log = deps.storage.loadTodayLog(localDateKey(now));
  if (log && log.currentRecipeId === recipeId) {
    log.accepted = true;
    deps.storage.saveTodayLog(log);
  }

  // 3) 재고 자동 차감 + 잔량 자동 등록
  const nextInventory = applyCookingToInventory(deps.storage.loadInventory(), recipe, deps.ingredients, now);
  deps.storage.saveInventory(nextInventory);

  // 4) 취향 학습 — 완료는 강한 양성 신호
  const profile = deps.storage.loadProfile();
  if (profile) {
    profile.learned[recipeId] = (profile.learned[recipeId] ?? 0) + LEARNED_COMPLETE_BONUS;
    deps.storage.saveProfile(profile);
  }

  // 5) 배달 대비 절약 누적 — (기준가 − 끼당 재료비) × 완료 끼니 (FR-020)
  deps.storage.appendSaving(makeSavingsEntry(recipe, now));

  // 6) 완료 후 화면의 확인형 질문 후보 — 홈에는 절대 배치하지 않는다 (FR-015)
  return { questions: confirmCandidates(nextInventory, recipe, deps.ingredients) };
}

export function answerInventoryQuestion(deps: CompleteDeps, ingredientId: string, stillHave: boolean): void {
  const next = answerConfirm(deps.storage.loadInventory(), ingredientId, stillHave);
  deps.storage.saveInventory(next);
}
