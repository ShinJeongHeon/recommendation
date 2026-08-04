import { coldStartBonus } from './coldstart';
import { activeInventory, applyFilters, type FilterContext, type FilterOptions } from './filters';
import { leftoverBonus } from './leftover';
import { buildLadder } from './relax';
import { inventoryQuestion } from './reason';
import { scoreRecipe, seasonalIngredientName, urgentInventoryFor, type UrgentItem } from './weights';
import { deriveNutritionGap } from '../nutrition/gap';
import type {
  Ingredient,
  InventoryItem,
  MealRecord,
  ReasonPart,
  Recipe,
  Relaxation,
  TasteProfile,
} from '../types';

// contracts/engine.md — 순수 함수. 시계·난수·브라우저 API에 의존하지 않는다.

export interface EngineInput {
  catalog: Recipe[];
  ingredients: Map<string, Ingredient>;
  profile: TasteProfile;
  meals: MealRecord[];
  inventory: InventoryItem[];
  now: Date;
  tiredMode: boolean;
  excludeRecipeIds?: string[];
}

export interface Recommendation {
  recipeId: string;
  alternatives: string[];
  reason: ReasonPart[];
  relaxations: Relaxation[];
  tiredOverrunMinutes?: number;
}

interface Ranked {
  recipe: Recipe;
  total: number;
  nutritionMatched: string | null;
  urgent: UrgentItem | null;
}

export function recommend(input: EngineInput): Recommendation {
  const ctx: FilterContext = {
    profile: input.profile,
    meals: input.meals,
    inventory: input.inventory,
    ingredients: input.ingredients,
    now: input.now,
    tiredMode: input.tiredMode,
  };
  let opts: FilterOptions = {
    dedupeDays: 7,
    maxMissing: 2,
    tiredMaxMinutes: input.tiredMode ? 15 : null,
    excludeRecipeIds: new Set(input.excludeRecipeIds ?? []),
    ignoreRejections: false,
  };

  const relaxations: Relaxation[] = [];
  let candidates: Recipe[] = [];
  for (const step of buildLadder(input.tiredMode)) {
    opts = step.apply(opts);
    if (step.relax !== null) relaxations.push(step.relax);
    candidates = applyFilters(input.catalog, ctx, opts);
    if (candidates.length > 0) break;
  }
  if (candidates.length === 0) {
    throw new Error('추천 가능한 메뉴가 없습니다 — 못 먹는 재료 제약을 만족하는 레시피가 카탈로그에 없습니다.');
  }
  // 실제로 소비된 완화 단계만 남긴다 (후보를 찾은 시점까지)
  const appliedRelaxations = relaxations.slice();

  const gapTags = deriveNutritionGap(input.meals, input.catalog, input.now);
  const month = input.now.getMonth() + 1;
  const active = activeInventory(input.inventory, input.ingredients, input.now);

  const ranked: Ranked[] = candidates
    .map((recipe) => {
      const s = scoreRecipe(recipe, input.profile, gapTags, input.ingredients, month);
      return {
        recipe,
        total: s.total + coldStartBonus(recipe, input.profile, input.now) + leftoverBonus(recipe, active),
        nutritionMatched: s.nutrition > 0 ? (recipe.nutritionTags.find((t) => gapTags.includes(t)) ?? null) : null,
        urgent: urgentInventoryFor(recipe, active, input.ingredients),
      };
    })
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      // 동점자: 유통기한 임박 재료 소진 우선 — 만료 항목은 이미 제외됨 (FR-004)
      const aU = a.urgent ? a.urgent.expiresAtMs : Number.POSITIVE_INFINITY;
      const bU = b.urgent ? b.urgent.expiresAtMs : Number.POSITIVE_INFINITY;
      if (aU !== bU) return aU - bU;
      return a.recipe.id < b.recipe.id ? -1 : 1;
    });

  const top = ranked[0]!;
  const alternatives = ranked.slice(1, 4).map((r) => r.recipe.id);

  const result: Recommendation = {
    recipeId: top.recipe.id,
    alternatives,
    reason: buildReason(top, input),
    relaxations: appliedRelaxations,
  };
  if (input.tiredMode && appliedRelaxations.includes('tired-20min') && top.recipe.cookMinutes > 15) {
    result.tiredOverrunMinutes = top.recipe.cookMinutes;
  }
  return result;
}

/** 상위 기여 요소 → 근거 조각. 재고 조각은 항상 확인형 (FR-006) */
function buildReason(top: Ranked, input: EngineInput): ReasonPart[] {
  const parts: ReasonPart[] = [];
  if (top.urgent) {
    parts.push({ kind: 'inventory', text: inventoryQuestion(top.urgent.ingredientName) });
  }
  const learned = input.profile.learned[top.recipe.id] ?? 0;
  if (learned > 0) {
    parts.push({ kind: 'taste', text: '입맛에 잘 맞던 메뉴예요' });
  }
  if (top.nutritionMatched) {
    parts.push({ kind: 'nutrition', text: `요즘 ${top.nutritionMatched} 메뉴가 뜸했어요` });
  }
  const seasonalName = seasonalIngredientName(top.recipe, input.ingredients, input.now.getMonth() + 1);
  if (seasonalName) {
    parts.push({ kind: 'seasonal', text: `${seasonalName}이 제철이라 저렴해요` });
  }
  if (top.recipe.estimatedCost <= 4000) {
    parts.push({ kind: 'price', text: '재료비가 가벼운 메뉴예요' });
  }
  if (parts.length === 0) {
    parts.push({ kind: 'taste', text: '오늘 입맛에 무난한 메뉴예요' });
  }
  return parts;
}
