import { describe, expect, it } from 'vitest';
import { recommend, type EngineInput } from '../../src/domain/engine/recommend';
import { ingredientMap, makeIngredient, makeProfile, makeRecipe } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0);
const INGREDIENTS = ingredientMap([makeIngredient('tofu'), makeIngredient('egg')]);

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

describe('콜드스타트 — 가입 첫 주 국민 메뉴 풀 우선 (FR-009)', () => {
  const staple = makeRecipe('staple', { isStaple: true, estimatedCost: 5000 });
  const tasty = makeRecipe('tasty', { estimatedCost: 3000 });

  it('prefers staple recipes during the first week even against higher-scoring menus', () => {
    const profile = makeProfile({ createdAt: '2026-08-02T00:00:00.000Z', learned: { tasty: 2 } });
    const out = recommend(input({ catalog: [staple, tasty], profile }));
    expect(out.recipeId).toBe('staple');
  });

  it('returns to normal weighting from day 8', () => {
    const profile = makeProfile({ createdAt: '2026-07-20T00:00:00.000Z', learned: { tasty: 2 } });
    const out = recommend(input({ catalog: [staple, tasty], profile }));
    expect(out.recipeId).toBe('tasty');
  });

  it('never returns excluded-ingredient recipes even in the first week (FR-010)', () => {
    const stapleWithEgg = makeRecipe('staple-egg', {
      isStaple: true,
      ingredients: [{ ingredientId: 'egg', display: '계란 2개(소)', amount: 2, unit: '구' }],
    });
    const safe = makeRecipe('safe');
    const profile = makeProfile({ createdAt: '2026-08-02T00:00:00.000Z', excludedIngredients: ['egg'] });
    const out = recommend(input({ catalog: [stapleWithEgg, safe], profile }));
    expect(out.recipeId).toBe('safe');
  });
});
