import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/data/loader';
import { enableTiredMode, getToday, type TodayDeps } from '../../src/domain/engine/today';
import { createStorage } from '../../src/storage/local';
import { makeProfile } from '../helpers/fixtures';
import { memoryBackend } from '../helpers/memory';

function setup(nowInit = new Date(2026, 7, 4, 19, 0)) {
  const cat = loadCatalog('dev');
  const storage = createStorage(memoryBackend());
  storage.saveProfile(makeProfile());
  let now = nowInit;
  const deps: TodayDeps = { recipes: cat.recipes, ingredients: cat.ingredients, storage, clock: () => now };
  return {
    deps,
    storage,
    setNow: (d: Date) => {
      now = d;
    },
  };
}

describe('US5 — "오늘 지쳤어요" 컨디션 분기 (수용 시나리오 1~2)', () => {
  it('AS1: one tap switches to a 15-minute·minimal-dishwashing menu with no extra questions', () => {
    const { deps } = setup();
    getToday(deps);
    enableTiredMode(deps);
    const view = getToday(deps);
    expect(view.recipe.cookMinutes).toBeLessThanOrEqual(15);
    expect(view.recipe.dishwashTag).toBe('minimal');
    expect(view.log.tiredMode).toBe(true);
  });

  it('AS2: tired mode persists across same-day reopens', () => {
    const { deps } = setup();
    getToday(deps);
    enableTiredMode(deps);
    const again = getToday(deps);
    expect(again.log.tiredMode).toBe(true);
    expect(again.recipe.cookMinutes).toBeLessThanOrEqual(15);
  });

  it('AS2: tired mode is released automatically after midnight (FR-017)', () => {
    const { deps, setNow } = setup();
    getToday(deps);
    enableTiredMode(deps);
    setNow(new Date(2026, 7, 5, 0, 10));
    const nextDay = getToday(deps);
    expect(nextDay.log.date).toBe('2026-08-05');
    expect(nextDay.log.tiredMode).toBe(false);
  });

  it('switching to tired mode is not a rejection — 취향 학습 신호를 남기지 않는다', () => {
    const { deps, storage } = setup();
    const before = getToday(deps);
    enableTiredMode(deps);
    const log = storage.loadTodayLog('2026-08-04')!;
    expect(log.rejections).toEqual([]);
    expect(storage.loadProfile()!.learned[before.recipe.id]).toBeUndefined();
  });
});
