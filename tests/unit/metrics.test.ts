import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/data/loader';
import { getToday, markVideoOpened, type TodayDeps } from '../../src/domain/engine/today';
import { completionConversionRate, videoPlayRate } from '../../src/domain/metrics';
import { createStorage } from '../../src/storage/local';
import { makeProfile } from '../helpers/fixtures';
import { memoryBackend } from '../helpers/memory';
import type { RecommendationLog } from '../../src/domain/types';

function log(over: Partial<RecommendationLog>): RecommendationLog {
  return {
    date: '2026-08-04',
    currentRecipeId: 'r',
    tiredMode: false,
    rejections: [],
    reasonParts: [],
    accepted: false,
    ...over,
  };
}

describe('SC-008 — 재생률·전환율 산출 (콘텐츠 품질 대리 지표)', () => {
  it('video play rate = 영상 탭 로그 / 전체 추천 로그', () => {
    const logs = [
      log({ date: '2026-08-01', videoOpenedAt: 'x' }),
      log({ date: '2026-08-02' }),
      log({ date: '2026-08-03', videoOpenedAt: 'x' }),
      log({ date: '2026-08-04' }),
    ];
    expect(videoPlayRate(logs)).toBe(0.5);
  });

  it('completion conversion = 완료까지 간 영상 탭 / 영상 탭', () => {
    const logs = [
      log({ date: '2026-08-01', videoOpenedAt: 'x', accepted: true }),
      log({ date: '2026-08-02', videoOpenedAt: 'x', accepted: false }),
      log({ date: '2026-08-03', accepted: true }),
    ];
    expect(completionConversionRate(logs)).toBe(0.5);
  });

  it('returns 0 for empty data instead of NaN', () => {
    expect(videoPlayRate([])).toBe(0);
    expect(completionConversionRate([])).toBe(0);
  });
});

describe('markVideoOpened — 영상 링크 탭 기록', () => {
  it('stamps videoOpenedAt on today log once (first tap wins)', () => {
    const cat = loadCatalog('dev');
    const storage = createStorage(memoryBackend());
    storage.saveProfile(makeProfile());
    const NOW = new Date(2026, 7, 4, 19, 0);
    const deps: TodayDeps = { recipes: cat.recipes, ingredients: cat.ingredients, storage, clock: () => NOW };

    getToday(deps);
    markVideoOpened(deps);
    const first = storage.loadTodayLog('2026-08-04')!.videoOpenedAt;
    expect(first).toBeTruthy();
    markVideoOpened(deps);
    expect(storage.loadTodayLog('2026-08-04')!.videoOpenedAt).toBe(first);
  });
});
