import { describe, expect, it } from 'vitest';
import { recommend, type EngineInput } from '../../src/domain/engine/recommend';
import { ingredientMap, inv, makeIngredient, makeProfile, makeRecipe, mealAt } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0);
const INGREDIENTS = ingredientMap([
  makeIngredient('tofu'),
  makeIngredient('onion'),
  makeIngredient('egg'),
  makeIngredient('zucchini'),
]);

function input(over: Partial<EngineInput> = {}): EngineInput {
  return {
    catalog: [],
    ingredients: INGREDIENTS,
    profile: makeProfile(),
    meals: [],
    inventory: [],
    now: NOW,
    tiredMode: false,
    ...over,
  };
}

describe('완화 순서 — 후보 0개면 단계적으로 풀어 항상 1개 이상 (FR-007)', () => {
  it('relaxes the dedupe window from 7 to 5 days first', () => {
    const out = recommend(
      input({
        catalog: [makeRecipe('a'), makeRecipe('b')],
        meals: [mealAt('a', 2, NOW), mealAt('b', 6, NOW)],
      }),
    );
    expect(out.recipeId).toBe('b');
    expect(out.relaxations).toContain('dedupe-5d');
  });

  it('then relaxes the missing-ingredient allowance from 2 to 3', () => {
    const needs3 = makeRecipe('needs3', {
      ingredients: ['onion', 'egg', 'zucchini'].map((id) => ({ ingredientId: id, display: id, amount: 1, unit: '개' })),
    });
    const out = recommend(input({ catalog: [needs3], inventory: [inv('tofu')] }));
    expect(out.recipeId).toBe('needs3');
    expect(out.relaxations).toContain('missing-3');
  });

  it('recycles rejected menus as a last resort (엣지: 대안 소진 순환)', () => {
    const out = recommend(input({ catalog: [makeRecipe('a')], excludeRecipeIds: ['a'] }));
    expect(out.recipeId).toBe('a');
    expect(out.relaxations).toContain('recycle-rejected');
  });

  it('never returns a recipe containing an excluded ingredient, under any relaxation combination (FR-010 불변식)', () => {
    const withEgg = makeRecipe('with-egg', {
      ingredients: [{ ingredientId: 'egg', display: '계란 2개(소)', amount: 2, unit: '구' }],
    });
    const safe = makeRecipe('safe');
    const profile = makeProfile({ excludedIngredients: ['egg'] });
    const mealCombos = [[], [mealAt('safe', 1, NOW)], [mealAt('safe', 6, NOW)], [mealAt('with-egg', 1, NOW)]];
    const invCombos = [[], [inv('tofu')], [inv('egg')]];
    const rejCombos = [[], ['safe'], ['with-egg'], ['safe', 'with-egg']];
    for (const meals of mealCombos) {
      for (const inventory of invCombos) {
        for (const excludeRecipeIds of rejCombos) {
          const out = recommend(input({ catalog: [withEgg, safe], profile, meals, inventory, excludeRecipeIds }));
          expect(out.recipeId).toBe('safe');
          expect(out.alternatives).not.toContain('with-egg');
        }
      }
    }
  });
});
