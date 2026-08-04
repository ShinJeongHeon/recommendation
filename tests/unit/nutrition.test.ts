import { describe, expect, it } from 'vitest';
import { deriveNutritionGap } from '../../src/domain/nutrition/gap';
import { makeRecipe, mealAt } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0);
const CATALOG = [
  makeRecipe('protein-src', { nutritionTags: ['단백질 풍부'] }),
  makeRecipe('veg-src', { nutritionTags: ['채소 보충'] }),
];

describe('deriveNutritionGap — 이력 기반 부족 영양 태그 추론 (FR-021)', () => {
  it('returns [] when there is no meal history (기록 노동 없음, 추정도 없음)', () => {
    expect(deriveNutritionGap([], CATALOG, NOW)).toEqual([]);
  });

  it('returns tags not covered by meals in the last 3 days', () => {
    const gap = deriveNutritionGap([mealAt('protein-src', 1, NOW)], CATALOG, NOW);
    expect(gap).toEqual(['채소 보충']);
  });

  it('ignores meals older than 3 days — no recent data means no claimed gap', () => {
    expect(deriveNutritionGap([mealAt('protein-src', 5, NOW)], CATALOG, NOW)).toEqual([]);
  });
});
