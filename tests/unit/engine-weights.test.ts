import { describe, expect, it } from 'vitest';
import { recommend, type EngineInput } from '../../src/domain/engine/recommend';
import { ingredientMap, inv, makeIngredient, makeProfile, makeRecipe, mealAt } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0); // 8월
const INGREDIENTS = ingredientMap([
  makeIngredient('tofu'),
  makeIngredient('onion'),
  makeIngredient('zucchini', { seasonalMonths: [8] }),
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

describe('가중치 — 취향(상) > 영양 = 제철(중) > 재료비(하) (FR-004)', () => {
  it('taste outweighs seasonal + nutrition + price combined', () => {
    const a = makeRecipe('a', { estimatedCost: 5000 });
    const b = makeRecipe('b', {
      estimatedCost: 3000,
      nutritionTags: ['채소 보충'],
      ingredients: [{ ingredientId: 'zucchini', display: '애호박 반 개', amount: 0.5, unit: '개' }],
    });
    const proteinSrc = makeRecipe('protein-src', { nutritionTags: ['단백질 풍부'] });
    const profile = makeProfile({ learned: { a: 2 } });
    const out = recommend(
      input({ catalog: [a, b, proteinSrc], profile, meals: [mealAt('protein-src', 1, NOW)] }),
    );
    expect(out.recipeId).toBe('a');
  });

  it('nutrition complement outweighs price', () => {
    const nutri = makeRecipe('nutri', { estimatedCost: 5000, nutritionTags: ['채소 보충'] });
    const cheap = makeRecipe('cheap', { estimatedCost: 3000 });
    const proteinSrc = makeRecipe('protein-src', { nutritionTags: ['단백질 풍부'] });
    const out = recommend(input({ catalog: [nutri, cheap, proteinSrc], meals: [mealAt('protein-src', 1, NOW)] }));
    expect(out.recipeId).toBe('nutri');
  });

  it('seasonal ingredient outweighs price', () => {
    const seasonal = makeRecipe('seasonal', {
      estimatedCost: 5000,
      ingredients: [{ ingredientId: 'zucchini', display: '애호박 반 개', amount: 0.5, unit: '개' }],
    });
    const cheap = makeRecipe('cheap', { estimatedCost: 3000 });
    const out = recommend(input({ catalog: [seasonal, cheap] }));
    expect(out.recipeId).toBe('seasonal');
  });

  it('breaks ties with the soonest-expiring inventory ingredient (동점자 처리)', () => {
    const a = makeRecipe('a', { ingredients: [{ ingredientId: 'onion', display: '양파', amount: 1, unit: '개' }] });
    const b = makeRecipe('b', { ingredients: [{ ingredientId: 'tofu', display: '두부', amount: 1, unit: '모' }] });
    // 두부: 7/30 구매 + 보관 7일 → 8/6 만료(임박). 양파: 8/3 구매 → 8/10 만료.
    const out = recommend(
      input({
        catalog: [a, b],
        inventory: [inv('onion', { purchasedAt: '2026-08-03' }), inv('tofu', { purchasedAt: '2026-07-30' })],
      }),
    );
    expect(out.recipeId).toBe('b');
  });

  it('ignores expired inventory items in the tiebreaker', () => {
    const a = makeRecipe('a', { ingredients: [{ ingredientId: 'onion', display: '양파', amount: 1, unit: '개' }] });
    const b = makeRecipe('b', { ingredients: [{ ingredientId: 'tofu', display: '두부', amount: 1, unit: '모' }] });
    // 두부는 이미 만료(7/20 구매 → 7/27 만료) → 동점자에서 무시, 양파가 유효 임박 → a
    const out = recommend(
      input({
        catalog: [a, b],
        inventory: [inv('onion', { purchasedAt: '2026-08-03' }), inv('tofu', { purchasedAt: '2026-07-20' })],
      }),
    );
    expect(out.recipeId).toBe('a');
  });

  it('is deterministic for identical inputs', () => {
    const base = input({ catalog: [makeRecipe('a'), makeRecipe('b'), makeRecipe('c')] });
    expect(recommend(base)).toEqual(recommend(base));
  });
});
