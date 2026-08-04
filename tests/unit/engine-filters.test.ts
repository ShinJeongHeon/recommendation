import { describe, expect, it } from 'vitest';
import { recommend, type EngineInput } from '../../src/domain/engine/recommend';
import { ingredientMap, inv, makeIngredient, makeProfile, makeRecipe, mealAt } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0);
const INGREDIENTS = ingredientMap([
  makeIngredient('tofu'),
  makeIngredient('onion'),
  makeIngredient('egg'),
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

describe('필터 1 — 7일 중복 회피 (FR-003)', () => {
  it('excludes a recipe eaten within the last 7 days', () => {
    const out = recommend(input({ catalog: [makeRecipe('a'), makeRecipe('b')], meals: [mealAt('a', 1, NOW)] }));
    expect(out.recipeId).toBe('b');
  });

  it('allows a recipe eaten more than 7 days ago, without relaxation', () => {
    const out = recommend(input({ catalog: [makeRecipe('a')], meals: [mealAt('a', 8, NOW)] }));
    expect(out.recipeId).toBe('a');
    expect(out.relaxations).toEqual([]);
  });
});

describe('필터 2 — 조리 환경·시간 (FR-003)', () => {
  it('does not filter by cook time when tiredMode is off', () => {
    const out = recommend(input({ catalog: [makeRecipe('slow', { cookMinutes: 20 })] }));
    expect(out.recipeId).toBe('slow');
  });
});

describe('필터 3 — 조리 가능성: 부족 재료 0~2개 (FR-003·FR-005)', () => {
  const needsMany = makeRecipe('needs-many', {
    ingredients: ['tofu', 'onion', 'egg', 'zucchini'].map((id) => ({
      ingredientId: id,
      display: id,
      amount: 1,
      unit: '개',
    })),
  });
  const needsFew = makeRecipe('needs-few', {
    ingredients: [{ ingredientId: 'tofu', display: '두부 반 모', amount: 0.5, unit: '모' }],
  });

  it('filters recipes missing more than 2 ingredients when inventory exists, even if taste prefers them', () => {
    const profile = makeProfile({ learned: { 'needs-many': 2 } });
    const out = recommend(
      input({ catalog: [needsMany, needsFew], profile, inventory: [inv('tofu', { purchasedAt: '2026-08-03' })] }),
    );
    expect(out.recipeId).toBe('needs-few');
  });

  it('skips the cookability filter entirely when there is no inventory data (우아한 성능 저하)', () => {
    const out = recommend(input({ catalog: [needsMany] }));
    expect(out.recipeId).toBe('needs-many');
    expect(out.relaxations).toEqual([]);
  });
});

describe('오늘 거절된 메뉴 제외 (FR-002)', () => {
  it('does not re-recommend a recipe rejected today', () => {
    const out = recommend(input({ catalog: [makeRecipe('a'), makeRecipe('b')], excludeRecipeIds: ['a'] }));
    expect(out.recipeId).toBe('b');
  });
});
