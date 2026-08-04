import { weekStartKey } from '../dates';
import type { InventoryItem, PriceTable, Recipe, SavingsEntry, SavingsLedger } from '../types';

// 가격 이중 표시·절약 회계 (FR-018·019·020, data-model.md 가격 파생 규칙)

/**
 * 배달 한 끼 기준가 — 15,000원 이하의 고정 상수 (Clarification Q4).
 * 화면에 기준값을 반드시 명시한다. 사용자 입력을 받지 않는다.
 */
export const DELIVERY_BASELINE = 14000;

/** 장보기 총액 = 재고에 없는 재료의 구매 단위 가격 합계 */
export function shoppingTotal(recipe: Recipe, inventory: InventoryItem[], prices: PriceTable): number {
  const owned = new Set(inventory.map((i) => i.ingredientId));
  const priceById = new Map(prices.items.map((p) => [p.id, p.price]));
  return recipe.ingredients
    .filter((ri) => !owned.has(ri.ingredientId))
    .reduce((sum, ri) => sum + (priceById.get(ri.ingredientId) ?? 0), 0);
}

/** N끼 = max(1, floor(총액 ÷ 끼당 재료비)) */
export function mealsFromShopping(total: number, estimatedCostPerMeal: number): number {
  if (estimatedCostPerMeal <= 0) return 1;
  return Math.max(1, Math.floor(total / estimatedCostPerMeal));
}

/** "평균 시세 기준 추정" 문구 — 기준 연월 병기 (FR-019) */
export function priceNotice(prices: PriceTable): string {
  return `${prices.asOf} 평균 시세 기준 추정 — 동네 마트 실제가와 다를 수 있어요`;
}

export interface PriceBlockData {
  shoppingTotal: number;
  mealsCount: number;
  perMeal: number;
  notice: string;
}

/** 레시피 상세의 가격 블록 데이터 — "이번 장보기 ○○원 → 이걸로 N끼" + 끼당 환산가 */
export function buildPriceBlockData(recipe: Recipe, inventory: InventoryItem[], prices: PriceTable): PriceBlockData {
  const total = shoppingTotal(recipe, inventory, prices);
  const meals = mealsFromShopping(total, recipe.estimatedCost);
  return {
    shoppingTotal: total,
    mealsCount: meals,
    perMeal: Math.round(total / meals),
    notice: priceNotice(prices),
  };
}

/** 요리 완료 1끼의 절약액 = 기준가 − 끼당 재료비 (FR-020) */
export function savedForMeal(recipe: Recipe): number {
  return DELIVERY_BASELINE - recipe.estimatedCost;
}

export function makeSavingsEntry(recipe: Recipe, now: Date): SavingsEntry {
  return { weekStart: weekStartKey(now), recipeId: recipe.id, saved: savedForMeal(recipe) };
}

/** 이번 주(월요일 시작) 누적 절약액 */
export function weeklyTotal(ledger: SavingsLedger, now: Date): number {
  const week = weekStartKey(now);
  return ledger.entries.filter((e) => e.weekStart === week).reduce((sum, e) => sum + e.saved, 0);
}
