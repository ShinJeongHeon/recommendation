import { describe, expect, it } from 'vitest';
import { recommend, type EngineInput } from '../../src/domain/engine/recommend';
import { ingredientMap, makeIngredient, makeProfile, makeRecipe } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0);
const INGREDIENTS = ingredientMap([makeIngredient('tofu')]);

function input(over: Partial<EngineInput> = {}): EngineInput {
  return {
    catalog: [],
    ingredients: INGREDIENTS,
    profile: makeProfile(),
    meals: [],
    inventory: [],
    now: NOW,
    tiredMode: true,
    ...over,
  };
}

describe('지침 모드 필터 — 15분·설거지 최소 (FR-017)', () => {
  it('keeps only recipes within 15 minutes and minimal dishwashing', () => {
    const fast = makeRecipe('fast', { cookMinutes: 12, dishwashTag: 'minimal' });
    const slow = makeRecipe('slow', { cookMinutes: 25, dishwashTag: 'minimal' });
    const out = recommend(input({ catalog: [fast, slow] }));
    expect(out.recipeId).toBe('fast');
    expect(out.tiredOverrunMinutes).toBeUndefined();
  });

  it('excludes heavy-dishwashing recipes even when they are fast', () => {
    const fastMessy = makeRecipe('fast-messy', { cookMinutes: 10, dishwashTag: 'normal' });
    const fastClean = makeRecipe('fast-clean', { cookMinutes: 14, dishwashTag: 'minimal' });
    const out = recommend(input({ catalog: [fastMessy, fastClean] }));
    expect(out.recipeId).toBe('fast-clean');
  });

  it('relaxes to 20 minutes with an honest tiredOverrunMinutes when nothing fits 15 (엣지 케이스, contracts/engine.md)', () => {
    const nearMiss = makeRecipe('near-miss', { cookMinutes: 18, dishwashTag: 'minimal' });
    const out = recommend(input({ catalog: [nearMiss] }));
    expect(out.recipeId).toBe('near-miss');
    expect(out.relaxations).toContain('tired-20min');
    expect(out.tiredOverrunMinutes).toBe(18);
  });
});
