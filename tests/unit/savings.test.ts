import { describe, expect, it } from 'vitest';
import {
  DELIVERY_BASELINE,
  buildPriceBlockData,
  mealsFromShopping,
  priceNotice,
  savedForMeal,
  shoppingTotal,
  weeklyTotal,
} from '../../src/domain/savings/index';
import { inv, makeRecipe } from '../helpers/fixtures';
import type { PriceTable, SavingsLedger } from '../../src/domain/types';

const PRICES: PriceTable = {
  asOf: '2026-07',
  items: [
    { id: 'tofu', unit: '1모(300g)', price: 1500 },
    { id: 'egg', unit: '10구', price: 4500 },
  ],
};

const recipe = makeRecipe('r', {
  estimatedCost: 2000,
  ingredients: [
    { ingredientId: 'tofu', display: '두부 반 모', amount: 0.5, unit: '모' },
    { ingredientId: 'egg', display: '계란 2개(소)', amount: 2, unit: '구' },
  ],
});

describe('가격 파생 규칙 (data-model.md, FR-018)', () => {
  it('shopping total sums purchase-unit prices of ingredients NOT in inventory', () => {
    expect(shoppingTotal(recipe, [], PRICES)).toBe(6000);
    expect(shoppingTotal(recipe, [inv('tofu')], PRICES)).toBe(4500);
  });

  it('N끼 = max(1, floor(총액 ÷ 끼당 재료비))', () => {
    expect(mealsFromShopping(6000, 2000)).toBe(3);
    expect(mealsFromShopping(1500, 2000)).toBe(1);
  });

  it('assembles the dual-display block: 총액 → N끼 + 끼당 환산가 + 추정 문구', () => {
    const block = buildPriceBlockData(recipe, [], PRICES);
    expect(block.shoppingTotal).toBe(6000);
    expect(block.mealsCount).toBe(3);
    expect(block.perMeal).toBe(2000);
    expect(block.notice).toContain('2026-07');
    expect(block.notice).toContain('평균 시세');
  });
});

describe('배달 대비 절약 (FR-020, Clarification Q4)', () => {
  it('baseline is a fixed constant at or below 15,000원', () => {
    expect(DELIVERY_BASELINE).toBeLessThanOrEqual(15000);
    expect(DELIVERY_BASELINE).toBeGreaterThan(0);
  });

  it('saved = 기준가 − 끼당 재료비', () => {
    expect(savedForMeal(recipe)).toBe(DELIVERY_BASELINE - 2000);
  });

  it('weekly total accumulates per completed meal within the week (주 시작 = 월요일)', () => {
    const ledger: SavingsLedger = {
      entries: [
        { weekStart: '2026-08-03', recipeId: 'r', saved: 10000 },
        { weekStart: '2026-08-03', recipeId: 'r', saved: 10000 },
        { weekStart: '2026-07-27', recipeId: 'r', saved: 9999 },
      ],
    };
    expect(weeklyTotal(ledger, new Date(2026, 7, 4))).toBe(20000);
  });

  it('price notice always marks the number as an estimate', () => {
    expect(priceNotice(PRICES)).toMatch(/추정/);
  });
});
