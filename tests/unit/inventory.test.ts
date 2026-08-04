import { describe, expect, it } from 'vitest';
import {
  answerConfirm,
  applyCookingToInventory,
  confirmCandidates,
} from '../../src/domain/inventory/index';
import { estimateExpiry } from '../../src/domain/engine/filters';
import { localDateKey } from '../../src/domain/dates';
import { ingredientMap, inv, makeIngredient, makeRecipe } from '../helpers/fixtures';

const COMPLETED = new Date(2026, 7, 4, 20, 0);
const INGREDIENTS = ingredientMap([
  makeIngredient('tofu', { name: '두부', shelfLifeDays: 7 }),
  makeIngredient('soy-sauce', { name: '간장', shelfLifeDays: 365 }),
  makeIngredient('kongnamul', { name: '콩나물', shelfLifeDays: 4 }),
]);

const recipe = makeRecipe('r', {
  ingredients: [
    { ingredientId: 'tofu', display: '두부 반 모', amount: 0.5, unit: '모' },
    { ingredientId: 'soy-sauce', display: '간장 밥숟가락 2술', amount: 0.5, unit: '숟가락' },
    { ingredientId: 'kongnamul', display: '콩나물 300g 한 봉지', amount: 1, unit: '봉지' },
  ],
});

describe('유통기한 자동 추정 (FR-016)', () => {
  it('derives expiry as purchase date + shelf life, no user input', () => {
    const exp = estimateExpiry(inv('tofu', { purchasedAt: '2026-08-01' }), INGREDIENTS)!;
    expect(localDateKey(exp)).toBe('2026-08-08');
  });
});

describe('요리 완료 → 재고 반영 (data-model 상태 전이)', () => {
  it('registers leftovers for fractional-use perishables with purchasedAt = completion date', () => {
    const next = applyCookingToInventory([], recipe, INGREDIENTS, COMPLETED);
    const tofu = next.find((i) => i.ingredientId === 'tofu');
    expect(tofu).toBeDefined();
    expect(tofu!.purchasedAt).toBe('2026-08-04');
  });

  it('does not register pantry staples (긴 보관 기간) or fully-used ingredients as leftovers', () => {
    const next = applyCookingToInventory([], recipe, INGREDIENTS, COMPLETED);
    expect(next.find((i) => i.ingredientId === 'soy-sauce')).toBeUndefined();
    expect(next.find((i) => i.ingredientId === 'kongnamul')).toBeUndefined();
  });

  it('steps down an existing item on fractional use and removes it on full use', () => {
    const existing = [
      inv('tofu', { roughAmount: 'enough' }),
      inv('kongnamul', { roughAmount: 'some' }),
    ];
    const next = applyCookingToInventory(existing, recipe, INGREDIENTS, COMPLETED);
    expect(next.find((i) => i.ingredientId === 'tofu')!.roughAmount).toBe('some');
    expect(next.find((i) => i.ingredientId === 'kongnamul')).toBeUndefined();
  });
});

describe('확인형 재고 질문 (FR-015)', () => {
  it('lists touched inventory items as confirm candidates', () => {
    const afterCooking = applyCookingToInventory([], recipe, INGREDIENTS, COMPLETED);
    const qs = confirmCandidates(afterCooking, recipe, INGREDIENTS);
    expect(qs.map((q) => q.ingredientId)).toContain('tofu');
    expect(qs.find((q) => q.ingredientId === 'tofu')!.name).toBe('두부');
  });

  it('answer "아니오" removes the item, "예" keeps it with purchasedAt intact', () => {
    const items = [inv('tofu', { purchasedAt: '2026-08-01' })];
    expect(answerConfirm(items, 'tofu', false)).toEqual([]);
    const kept = answerConfirm(items, 'tofu', true);
    expect(kept).toHaveLength(1);
    expect(kept[0]!.purchasedAt).toBe('2026-08-01');
  });
});
