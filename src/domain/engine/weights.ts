import { estimateExpiry } from './filters';
import type { Ingredient, InventoryItem, Recipe, TasteProfile } from '../types';

// 가중치: 취향(상 3) > 영양 보완(중 2) = 제철(중 2) > 재료비(하 1) (FR-004)
// 수치는 초기값 — 최종 위치는 게이트 A/B 결과로 확정 (spec FR-004)
const W_TASTE = 3;
const W_NUTRITION = 2;
const W_SEASONAL = 2;
const W_PRICE = 1;

/** KR3 — 재료비 4,000원 이하를 저가로 간주 */
const CHEAP_THRESHOLD = 4000;

export interface ScoreBreakdown {
  taste: number;
  nutrition: number;
  seasonal: number;
  price: number;
  total: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function isSeasonalRecipe(r: Recipe, ingredients: Map<string, Ingredient>, month: number): boolean {
  return seasonalIngredientName(r, ingredients, month) !== null;
}

export function seasonalIngredientName(
  r: Recipe,
  ingredients: Map<string, Ingredient>,
  month: number,
): string | null {
  for (const ri of r.ingredients) {
    const ing = ingredients.get(ri.ingredientId);
    if (ing && ing.seasonalMonths.includes(month)) return ing.name;
  }
  return null;
}

export function scoreRecipe(
  r: Recipe,
  profile: TasteProfile,
  gapTags: string[],
  ingredients: Map<string, Ingredient>,
  month: number,
): ScoreBreakdown {
  const learned = clamp(profile.learned[r.id] ?? 0, -2, 2);
  const spicyFit = r.spicyLevel <= profile.spicyTolerance ? 1 : -1;
  const taste = learned + spicyFit;
  const nutrition = r.nutritionTags.some((t) => gapTags.includes(t)) ? 1 : 0;
  const seasonal = isSeasonalRecipe(r, ingredients, month) ? 1 : 0;
  const price = r.estimatedCost <= CHEAP_THRESHOLD ? 1 : 0;
  return {
    taste,
    nutrition,
    seasonal,
    price,
    total: W_TASTE * taste + W_NUTRITION * nutrition + W_SEASONAL * seasonal + W_PRICE * price,
  };
}

export interface UrgentItem {
  ingredientName: string;
  expiresAtMs: number;
}

/** 레시피가 사용하는 활성 재고 중 유통기한이 가장 임박한 항목 — 동점자 처리 입력 (FR-004) */
export function urgentInventoryFor(
  r: Recipe,
  activeInv: InventoryItem[],
  ingredients: Map<string, Ingredient>,
): UrgentItem | null {
  let best: UrgentItem | null = null;
  const used = new Set(r.ingredients.map((ri) => ri.ingredientId));
  for (const item of activeInv) {
    if (!used.has(item.ingredientId)) continue;
    const exp = estimateExpiry(item, ingredients);
    const ing = ingredients.get(item.ingredientId);
    if (!exp || !ing) continue;
    if (best === null || exp.getTime() < best.expiresAtMs) {
      best = { ingredientName: ing.name, expiresAtMs: exp.getTime() };
    }
  }
  return best;
}
