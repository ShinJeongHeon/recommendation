import { isWithinFirstWeek } from '../dates';
import type { Recipe, TasteProfile } from '../types';

/**
 * 콜드스타트 가중 (FR-009) — 가입 첫 주에는 검증된 국민 메뉴 풀이 일반 가중치를
 * 압도하도록 큰 보너스를 준다. 첫 주의 목표는 적중률이 아니라 신뢰 형성이다.
 * 못 먹는 재료 절대 제외(FR-010)는 필터 단계에서 이미 보장된다.
 */
const FIRST_WEEK_STAPLE_BONUS = 100;

export function coldStartBonus(recipe: Recipe, profile: TasteProfile, now: Date): number {
  return recipe.isStaple && isWithinFirstWeek(profile.createdAt, now) ? FIRST_WEEK_STAPLE_BONUS : 0;
}
