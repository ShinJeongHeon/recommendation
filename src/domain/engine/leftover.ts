import type { InventoryItem, Recipe } from '../types';

/**
 * 연계 메뉴 가중 (FR-022) — 남은 재료(활성 재고)를 쓰는 메뉴에 소폭 보너스.
 * 취향 가중치(3/단위)보다 작아 취향 적합 후보의 순위를 뒤집지 못한다 —
 * "식욕이 이기고 냉장고가 거든다" (PRD 인사이트 3').
 */
const LEFTOVER_BONUS = 1;

export function leftoverBonus(recipe: Recipe, activeInv: InventoryItem[]): number {
  const owned = new Set(activeInv.map((i) => i.ingredientId));
  return recipe.ingredients.some((ri) => owned.has(ri.ingredientId)) ? LEFTOVER_BONUS : 0;
}
