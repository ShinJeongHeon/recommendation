import { describe, expect, it } from 'vitest';
import { checkDisplay } from '../../src/domain/measurement/rules';

describe('1인분 현실 계량 표기 규칙 (FR-011)', () => {
  it('rejects decimal counts like "계란 1.5개"', () => {
    expect(checkDisplay('계란 1.5개')).not.toEqual([]);
  });

  it('rejects decimal counts for any counting unit (모·봉지 등)', () => {
    expect(checkDisplay('두부 0.5모')).not.toEqual([]);
    expect(checkDisplay('콩나물 1.5봉지')).not.toEqual([]);
  });

  it('accepts realistic corrections like "계란 2개(소)"', () => {
    expect(checkDisplay('계란 2개(소)')).toEqual([]);
    expect(checkDisplay('두부 반 모')).toEqual([]);
  });

  it('accepts 밥숟가락·종이컵 병기 units', () => {
    expect(checkDisplay('간장 밥숟가락 2술')).toEqual([]);
    expect(checkDisplay('물 종이컵 반 컵')).toEqual([]);
  });
});
