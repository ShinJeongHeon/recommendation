import { localDateKey } from '../dates';
import { recommend } from './recommend';
import { reasonText } from './reason';
import type { Storage } from '../../storage/local';
import type { Ingredient, Recipe, RecommendationLog } from '../types';

// 하루 고정 오케스트레이션 (FR-002a) — 고정성은 저장 계층이, 계산은 엔진이 책임진다 (research R5)

export interface TodayDeps {
  recipes: Recipe[];
  ingredients: Map<string, Ingredient>;
  storage: Storage;
  clock: () => Date;
}

export interface TodayView {
  log: RecommendationLog;
  recipe: Recipe;
  reasonLine: string;
  alternatives: Recipe[];
}

function byId(recipes: Recipe[], id: string): Recipe {
  const r = recipes.find((x) => x.id === id);
  if (!r) throw new Error(`카탈로그에 없는 레시피: ${id}`);
  return r;
}

function computeRecommendation(deps: TodayDeps, now: Date, tiredMode: boolean, exclude: string[]) {
  const profile = deps.storage.loadProfile();
  if (!profile) throw new Error('온보딩이 필요합니다 — 취향 프로필이 없습니다.');
  return recommend({
    catalog: deps.recipes,
    ingredients: deps.ingredients,
    profile,
    meals: deps.storage.loadMeals(),
    inventory: deps.storage.loadInventory(),
    now,
    tiredMode,
    excludeRecipeIds: exclude,
  });
}

/** 앱 실행 시 진입점 — 오늘 로그가 있으면 재계산 없이 복원, 없으면 계산·고정 (FR-001·002a) */
export function getToday(deps: TodayDeps): TodayView {
  const now = deps.clock();
  const today = localDateKey(now);

  let log = deps.storage.loadTodayLog(today);
  if (!log) {
    const rec = computeRecommendation(deps, now, false, []);
    log = {
      date: today,
      currentRecipeId: rec.recipeId,
      tiredMode: false,
      rejections: [],
      reasonParts: rec.reason.map((p) => p.text),
      accepted: false,
    };
    deps.storage.saveTodayLog(log);
  }

  const recipe = byId(deps.recipes, log.currentRecipeId);
  // 대안은 저장하지 않고 재계산한다 — 현재 추천·오늘 거절분 제외 (FR-002)
  const alt = computeRecommendation(deps, now, log.tiredMode, [
    log.currentRecipeId,
    ...log.rejections.map((r) => r.recipeId),
  ]);
  const altIds = [alt.recipeId, ...alt.alternatives].filter((id) => id !== log.currentRecipeId).slice(0, 3);

  return {
    log,
    recipe,
    reasonLine: log.reasonParts.slice(0, 2).join(' + ') || reasonText([]),
    alternatives: altIds.map((id) => byId(deps.recipes, id)),
  };
}

/** 원본 영상 링크 탭 기록 — SC-008 재생률·전환율의 입력. 첫 탭만 기록한다. */
export function markVideoOpened(deps: TodayDeps): void {
  const now = deps.clock();
  const log = deps.storage.loadTodayLog(localDateKey(now));
  if (!log || log.videoOpenedAt) return;
  log.videoOpenedAt = now.toISOString();
  deps.storage.saveTodayLog(log);
}

/**
 * "오늘 지쳤어요" 원탭 (FR-017) — 15분·1구·설거지 최소 메뉴로 즉시 전환.
 * 전환은 거절이 아니므로 취향 학습 신호를 남기지 않는다.
 * 상태는 오늘 로그에만 저장되므로 자정이 지나면 자동 해제된다.
 */
export function enableTiredMode(deps: TodayDeps): RecommendationLog {
  const now = deps.clock();
  const today = localDateKey(now);
  let log = deps.storage.loadTodayLog(today);
  if (!log) {
    getToday(deps);
    log = deps.storage.loadTodayLog(today)!;
  }
  if (log.tiredMode) return log;

  log.tiredMode = true;
  const rec = computeRecommendation(deps, now, true, log.rejections.map((r) => r.recipeId));
  log.currentRecipeId = rec.recipeId;
  log.reasonParts = rec.reason.map((p) => p.text);
  deps.storage.saveTodayLog(log);
  return log;
}

/**
 * "다른 메뉴 보기"에서 대안 1개를 선택 — 현재 추천을 교체하고,
 * 대체된 기존 추천만 거절(learned −1)로 기록한다 (FR-002, U1 결정)
 */
export function selectAlternative(deps: TodayDeps, newRecipeId: string): RecommendationLog {
  const now = deps.clock();
  const today = localDateKey(now);
  const log = deps.storage.loadTodayLog(today);
  if (!log) throw new Error('오늘의 추천이 아직 없습니다.');
  if (log.currentRecipeId === newRecipeId) return log;

  const replaced = log.currentRecipeId;
  log.rejections.push({ recipeId: replaced, at: now.toISOString() });
  log.currentRecipeId = newRecipeId;

  // 새 현재 추천의 근거를 다시 계산해 저장한다 — 단일 레시피 카탈로그로 항상 해당 메뉴의 근거를 얻는다
  const chosen = byId(deps.recipes, newRecipeId);
  const profile0 = deps.storage.loadProfile();
  if (!profile0) throw new Error('온보딩이 필요합니다 — 취향 프로필이 없습니다.');
  const rec = recommend({
    catalog: [chosen],
    ingredients: deps.ingredients,
    profile: profile0,
    meals: deps.storage.loadMeals(),
    inventory: deps.storage.loadInventory(),
    now,
    tiredMode: log.tiredMode,
    excludeRecipeIds: [],
  });
  log.reasonParts = rec.reason.map((p) => p.text);
  deps.storage.saveTodayLog(log);

  const profile = deps.storage.loadProfile();
  if (profile) {
    profile.learned[replaced] = (profile.learned[replaced] ?? 0) - 1;
    deps.storage.saveProfile(profile);
  }
  return log;
}
