import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/data/loader';
import { getToday, type TodayDeps } from '../../src/domain/engine/today';
import { completeOnboarding, ONBOARDING_QUESTIONS } from '../../src/domain/onboarding';
import { createStorage } from '../../src/storage/local';
import { memoryBackend } from '../helpers/memory';

const NOW = new Date(2026, 7, 4, 19, 0);

function setup() {
  const cat = loadCatalog('dev');
  const storage = createStorage(memoryBackend());
  const deps: TodayDeps = { recipes: cat.recipes, ingredients: cat.ingredients, storage, clock: () => NOW };
  return { deps, storage, recipes: cat.recipes };
}

describe('US3 — 온보딩 콜드스타트 (수용 시나리오 1~3)', () => {
  it('AS1: asks at most 3 questions and yields the first recommendation immediately after answers', () => {
    const { deps, storage } = setup();
    expect(ONBOARDING_QUESTIONS.length).toBeLessThanOrEqual(3);
    expect(storage.loadProfile()).toBeNull(); // 프로필 없음 → 온보딩 필요
    completeOnboarding(storage, { excludedIngredients: [], spicyTolerance: 2, basePreferences: [] }, NOW);
    const view = getToday(deps);
    expect(view.recipe.id).toBeTruthy();
    expect(view.reasonLine.length).toBeGreaterThan(0);
  });

  it('AS3: first-week recommendations come from the staple (국민 메뉴) pool', () => {
    const { deps, storage } = setup();
    completeOnboarding(storage, { excludedIngredients: [], spicyTolerance: 2, basePreferences: [] }, NOW);
    const view = getToday(deps);
    expect(view.recipe.isStaple).toBe(true);
  });

  it('AS2: menus containing an excluded ingredient never appear — 추천도 대안도 (FR-010)', () => {
    const { deps, storage } = setup();
    completeOnboarding(storage, { excludedIngredients: ['egg'], spicyTolerance: 2, basePreferences: [] }, NOW);
    const view = getToday(deps);
    const containsEgg = (id: string) =>
      deps.recipes.find((r) => r.id === id)!.ingredients.some((ri) => ri.ingredientId === 'egg');
    expect(containsEgg(view.recipe.id)).toBe(false);
    for (const alt of view.alternatives) {
      expect(containsEgg(alt.id), alt.id).toBe(false);
    }
  });
});
