import { describe, expect, it } from 'vitest';
import { loadCatalog, validateCatalog } from '../../src/data/loader';
import type { Ingredient, Recipe } from '../../src/domain/types';

function ing(id: string): Ingredient {
  return { id, name: id, shelfLifeDays: 7, seasonalMonths: [] };
}

function recipe(overrides: Partial<Recipe> & { id: string }): Recipe {
  return {
    name: overrides.id,
    steps: ['1단계'],
    ingredients: [{ ingredientId: 'tofu', display: '두부 반 모', amount: 0.5, unit: '모' }],
    cookMinutes: 10,
    difficulty: 'easy',
    dishwashTag: 'minimal',
    burnerCount: 1,
    nutritionTags: ['단백질 풍부'],
    estimatedCost: 2000,
    source: { channel: '채널', videoTitle: '영상', url: 'https://example.com' },
    isStaple: true,
    spicyLevel: 1,
    ...overrides,
  };
}

const ingredients = [ing('tofu')];
const validFive = [
  recipe({ id: 'r1' }),
  recipe({ id: 'r2' }),
  recipe({ id: 'r3' }),
  recipe({ id: 'r4', isStaple: false }),
  recipe({ id: 'r5', isStaple: false, cookMinutes: 20 }),
];

describe('validateCatalog — contracts/catalog-schema.md 검증 규칙', () => {
  it('accepts a contract-compliant catalog', () => {
    expect(() => validateCatalog(validFive, ingredients, { mode: 'dev' })).not.toThrow();
  });

  it('rejects an unknown ingredient reference', () => {
    const bad = [
      ...validFive.slice(1),
      recipe({ id: 'rx', ingredients: [{ ingredientId: 'ghost', display: 'x', amount: 1, unit: '개' }] }),
    ];
    expect(() => validateCatalog(bad, ingredients, { mode: 'dev' })).toThrow(/ghost/);
  });

  it('rejects recipes needing more than one burner', () => {
    const bad = [...validFive.slice(1), recipe({ id: 'rx', burnerCount: 2 })];
    expect(() => validateCatalog(bad, ingredients, { mode: 'dev' })).toThrow(/burner/i);
  });

  it('rejects a catalog whose 15-minute share is below 50%', () => {
    const bad = [
      recipe({ id: 'r1', cookMinutes: 20 }),
      recipe({ id: 'r2', cookMinutes: 20 }),
      recipe({ id: 'r3', cookMinutes: 20 }),
      recipe({ id: 'r4' }),
      recipe({ id: 'r5' }),
    ];
    expect(() => validateCatalog(bad, ingredients, { mode: 'dev' })).toThrow(/15분/);
  });

  it('rejects an empty source field', () => {
    const bad = [...validFive.slice(1), recipe({ id: 'rx', source: { channel: '', videoTitle: 't', url: 'u' } })];
    expect(() => validateCatalog(bad, ingredients, { mode: 'dev' })).toThrow(/출처/);
  });

  it('rejects a catalog with no tired-mode candidate', () => {
    const bad = validFive.map((r) => ({ ...r, dishwashTag: 'normal' as const }));
    expect(() => validateCatalog(bad, ingredients, { mode: 'dev' })).toThrow(/지침/);
  });

  it('rejects a catalog with too few staple recipes', () => {
    const bad = validFive.map((r) => ({ ...r, isStaple: false }));
    expect(() => validateCatalog(bad, ingredients, { mode: 'dev' })).toThrow(/국민/);
  });

  it('rejects a dev catalog smaller than 5 recipes', () => {
    expect(() => validateCatalog(validFive.slice(0, 3), ingredients, { mode: 'dev' })).toThrow(/크기/);
  });
});

describe('bundled sample data (src/data/*.json)', () => {
  it('passes dev-mode validation and exposes asOf for the price notice', () => {
    const { recipes, ingredients: map, prices } = loadCatalog('dev');
    expect(recipes.length).toBeGreaterThanOrEqual(5);
    expect(map.size).toBeGreaterThan(0);
    expect(prices.asOf).toMatch(/^\d{4}-\d{2}$/);
  });
});
