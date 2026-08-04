import { withinDays } from '../dates';
import type { MealRecord, Recipe } from '../types';

/** 부족 추론에 사용하는 최근 이력 창(일) */
const RECENT_DAYS = 3;

/**
 * 최근 이력의 영양 태그 분포에서 부족 태그를 추론한다 (FR-021).
 * 최근 데이터가 없으면 아무것도 주장하지 않는다 — 빈 배열.
 */
export function deriveNutritionGap(meals: MealRecord[], catalog: Recipe[], now: Date): string[] {
  const recent = meals.filter((m) => withinDays(m.completedAt, now, RECENT_DAYS));
  if (recent.length === 0) return [];

  const byId = new Map(catalog.map((r) => [r.id, r]));
  const coveredTags = new Set<string>();
  for (const m of recent) {
    const r = byId.get(m.recipeId);
    if (r) for (const t of r.nutritionTags) coveredTags.add(t);
  }

  const universe: string[] = [];
  for (const r of catalog) {
    for (const t of r.nutritionTags) {
      if (!universe.includes(t)) universe.push(t);
    }
  }
  return universe.filter((t) => !coveredTags.has(t));
}
