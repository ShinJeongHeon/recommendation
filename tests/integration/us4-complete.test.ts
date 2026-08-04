import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/data/loader';
import { answerInventoryQuestion, completeCooking, type CompleteDeps } from '../../src/domain/complete';
import { getToday } from '../../src/domain/engine/today';
import { createStorage } from '../../src/storage/local';
import { makeProfile } from '../helpers/fixtures';
import { memoryBackend } from '../helpers/memory';

const NOW = new Date(2026, 7, 4, 19, 0);

function setup() {
  const cat = loadCatalog('dev');
  const storage = createStorage(memoryBackend());
  storage.saveProfile(makeProfile());
  const deps: CompleteDeps = { recipes: cat.recipes, ingredients: cat.ingredients, storage, clock: () => NOW };
  return { deps, storage };
}

describe('US4 — 요리 완료와 자동 이력·재고 갱신 (수용 시나리오 1~3)', () => {
  it('AS1: one tap records the meal, marks acceptance, updates inventory and learned score (FR-014, SC-002)', () => {
    const { deps, storage } = setup();
    const view = getToday(deps);
    completeCooking(deps, view.recipe.id);

    expect(storage.loadMeals()).toHaveLength(1);
    expect(storage.loadMeals()[0]!.recipeId).toBe(view.recipe.id);
    expect(storage.loadTodayLog('2026-08-04')!.accepted).toBe(true);
    expect(storage.loadProfile()!.learned[view.recipe.id]).toBe(2);
  });

  it('AS2: confirm-question answers update inventory directly (예/아니오 원탭)', () => {
    const { deps, storage } = setup();
    const view = getToday(deps);
    const result = completeCooking(deps, view.recipe.id);
    expect(result.questions.length).toBeGreaterThan(0);

    const target = result.questions[0]!;
    answerInventoryQuestion(deps, target.ingredientId, false);
    expect(storage.loadInventory().find((i) => i.ingredientId === target.ingredientId)).toBeUndefined();
  });

  it('AS3/엣지: multiple completions on the same day are all recorded', () => {
    const { deps, storage } = setup();
    const view = getToday(deps);
    completeCooking(deps, view.recipe.id);
    completeCooking(deps, view.recipe.id);
    expect(storage.loadMeals()).toHaveLength(2);
  });

  it('acceptance counts only the current recommendation — 다른 메뉴를 완료해도 수용 아님 (FR-014)', () => {
    const { deps, storage } = setup();
    const view = getToday(deps);
    const other = deps.recipes.find((r) => r.id !== view.recipe.id)!;
    completeCooking(deps, other.id);
    expect(storage.loadMeals()).toHaveLength(1);
    expect(storage.loadTodayLog('2026-08-04')!.accepted).toBe(false);
  });
});
