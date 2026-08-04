import { describe, expect, it } from 'vitest';
import { isWithinFirstWeek, localDateKey, weekStartKey, withinDays } from '../../src/domain/dates';

describe('localDateKey', () => {
  it('formats a date as local YYYY-MM-DD', () => {
    expect(localDateKey(new Date(2026, 7, 4, 19, 30))).toBe('2026-08-04');
  });

  it('separates days at local midnight', () => {
    expect(localDateKey(new Date(2026, 7, 4, 23, 59, 59))).toBe('2026-08-04');
    expect(localDateKey(new Date(2026, 7, 5, 0, 0, 0))).toBe('2026-08-05');
  });
});

describe('withinDays (7일 중복 회피 창)', () => {
  const now = new Date(2026, 7, 4, 19, 0);

  it('includes a meal 6 days 23 hours ago in the 7-day window', () => {
    const at = new Date(now.getTime() - (6 * 24 + 23) * 3_600_000);
    expect(withinDays(at.toISOString(), now, 7)).toBe(true);
  });

  it('excludes a meal just over 7 days ago', () => {
    const at = new Date(now.getTime() - 7 * 24 * 3_600_000 - 60_000);
    expect(withinDays(at.toISOString(), now, 7)).toBe(false);
  });
});

describe('isWithinFirstWeek (콜드스타트 첫 주 판정)', () => {
  it('is true 6 days after signup and false 8 days after', () => {
    const createdAt = new Date(2026, 7, 1, 9, 0).toISOString();
    expect(isWithinFirstWeek(createdAt, new Date(2026, 7, 7, 9, 0))).toBe(true);
    expect(isWithinFirstWeek(createdAt, new Date(2026, 7, 9, 9, 0))).toBe(false);
  });
});

describe('weekStartKey (절약 주간 집계 키)', () => {
  it('returns the Monday of the current week', () => {
    // 2026-08-04는 화요일
    expect(weekStartKey(new Date(2026, 7, 4))).toBe('2026-08-03');
    // 일요일은 지난 월요일 주에 속한다
    expect(weekStartKey(new Date(2026, 7, 9))).toBe('2026-08-03');
  });
});
