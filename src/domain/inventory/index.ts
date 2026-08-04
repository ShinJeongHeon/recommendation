import { localDateKey } from '../dates';
import type { Ingredient, InventoryItem, Recipe } from '../types';

// 재고 상태 전이 (data-model.md) — 구매 입력 흐름은 없다. 재고는 요리의 부산물로만 생긴다.

/** 이 기간 이상 보관 가능한 재료(간장·소금 등 저장 식품)는 잔량 추적 대상에서 제외 */
const PANTRY_SHELF_DAYS = 180;

const STEP_DOWN: Record<InventoryItem['roughAmount'], InventoryItem['roughAmount'] | null> = {
  enough: 'some',
  some: 'little',
  little: null, // 소진
};

/**
 * 부분 사용(레시피 소요량 < 1단위) 여부 — "구매 단위가 1끼 소요량보다 크다"의
 * 구현 근사치. 정수 단위를 전부 쓰면 잔량 없음으로 본다.
 */
function isFractionalUse(amount: number): boolean {
  return amount < 1;
}

/**
 * 요리 완료를 재고에 반영한다 (FR-014·FR-016):
 * - 기존 항목: 부분 사용은 한 단계 차감, 전량 사용은 제거
 * - 미보유 항목: 부분 사용한 비저장 식품을 잔량으로 자동 등록 (purchasedAt = 완료일)
 */
export function applyCookingToInventory(
  inventory: InventoryItem[],
  recipe: Recipe,
  ingredients: Map<string, Ingredient>,
  completedAt: Date,
): InventoryItem[] {
  const byId = new Map(inventory.map((i) => [i.ingredientId, { ...i }]));

  for (const ri of recipe.ingredients) {
    const ing = ingredients.get(ri.ingredientId);
    if (!ing) continue;
    const existing = byId.get(ri.ingredientId);

    if (existing) {
      if (isFractionalUse(ri.amount)) {
        const next = STEP_DOWN[existing.roughAmount];
        if (next === null) byId.delete(ri.ingredientId);
        else existing.roughAmount = next;
      } else {
        byId.delete(ri.ingredientId);
      }
    } else if (isFractionalUse(ri.amount) && ing.shelfLifeDays < PANTRY_SHELF_DAYS) {
      byId.set(ri.ingredientId, {
        ingredientId: ri.ingredientId,
        purchasedAt: localDateKey(completedAt),
        roughAmount: 'some',
      });
    }
  }
  return [...byId.values()];
}

export interface ConfirmCandidate {
  ingredientId: string;
  name: string;
}

/** 완료 후 화면의 확인형 질문 후보 — 이번 요리가 건드린 재고 항목 (FR-015) */
export function confirmCandidates(
  inventory: InventoryItem[],
  recipe: Recipe,
  ingredients: Map<string, Ingredient>,
): ConfirmCandidate[] {
  const used = new Set(recipe.ingredients.map((ri) => ri.ingredientId));
  return inventory
    .filter((i) => used.has(i.ingredientId))
    .map((i) => ({ ingredientId: i.ingredientId, name: ingredients.get(i.ingredientId)?.name ?? i.ingredientId }));
}

/** 확인 질문 응답을 그대로 재고에 반영 — "예"는 유지(purchasedAt 불변), "아니오"는 소진 처리 */
export function answerConfirm(
  inventory: InventoryItem[],
  ingredientId: string,
  stillHave: boolean,
): InventoryItem[] {
  if (stillHave) return inventory;
  return inventory.filter((i) => i.ingredientId !== ingredientId);
}
