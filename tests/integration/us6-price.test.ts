import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/data/loader';
import { completeCooking, type CompleteDeps } from '../../src/domain/complete';
import { getToday } from '../../src/domain/engine/today';
import { buildPriceBlockData, DELIVERY_BASELINE } from '../../src/domain/savings/index';
import { createStorage } from '../../src/storage/local';
import { makeProfile } from '../helpers/fixtures';
import { memoryBackend } from '../helpers/memory';

const NOW = new Date(2026, 7, 4, 19, 0);

function setup() {
  const cat = loadCatalog('dev');
  const storage = createStorage(memoryBackend());
  storage.saveProfile(makeProfile());
  const deps: CompleteDeps = { recipes: cat.recipes, ingredients: cat.ingredients, storage, clock: () => NOW };
  return { deps, storage, prices: cat.prices };
}

describe('US6 — 가격 이중 표시와 절약 누적 (수용 시나리오 1~3)', () => {
  it('AS1: detail price block shows 총액 → N끼, 끼당 환산가, and the estimate notice with 기준 연월', () => {
    const { deps, storage, prices } = setup();
    const view = getToday(deps);
    const block = buildPriceBlockData(view.recipe, storage.loadInventory(), prices);
    expect(block.shoppingTotal).toBeGreaterThan(0);
    expect(block.mealsCount).toBeGreaterThanOrEqual(1);
    expect(block.perMeal).toBeGreaterThan(0);
    expect(block.notice).toContain(prices.asOf);
    expect(block.notice).toMatch(/추정/);
  });

  it('AS2: completing a meal accrues (기준가 − 끼당 재료비) into the weekly ledger', () => {
    const { deps, storage } = setup();
    const view = getToday(deps);
    completeCooking(deps, view.recipe.id);
    const ledger = storage.loadSavings();
    expect(ledger.entries).toHaveLength(1);
    expect(ledger.entries[0]!.saved).toBe(DELIVERY_BASELINE - view.recipe.estimatedCost);
    expect(ledger.entries[0]!.weekStart).toBe('2026-08-03');
  });

  it('AS3: the home reason line never exposes a price amount (FR-018 홈 비노출)', () => {
    const { deps } = setup();
    const view = getToday(deps);
    expect(view.reasonLine).not.toMatch(/\d[\d,]*\s*원/);
  });
});
