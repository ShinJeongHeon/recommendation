import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/data/loader';
import { getToday, selectAlternative, type TodayDeps } from '../../src/domain/engine/today';
import { createStorage } from '../../src/storage/local';
import { makeProfile } from '../helpers/fixtures';
import { memoryBackend } from '../helpers/memory';

function setup(nowInit = new Date(2026, 7, 4, 19, 0)) {
  const cat = loadCatalog('dev');
  const storage = createStorage(memoryBackend());
  storage.saveProfile(makeProfile());
  let now = nowInit;
  const deps: TodayDeps = {
    recipes: cat.recipes,
    ingredients: cat.ingredients,
    storage,
    clock: () => now,
  };
  return {
    deps,
    storage,
    setNow: (d: Date) => {
      now = d;
    },
  };
}

describe('US1 — 오늘의 추천 홈 (수용 시나리오 1~6)', () => {
  it('AS1: shows one recommendation with a reason line and 2~3 alternatives, no questions asked', () => {
    const { deps } = setup();
    const view = getToday(deps);
    expect(view.recipe.id).toBeTruthy();
    expect(view.reasonLine.length).toBeGreaterThan(0);
    expect(view.alternatives.length).toBeGreaterThanOrEqual(2);
    expect(view.alternatives.length).toBeLessThanOrEqual(3);
  });

  it('AS6/FR-002a: keeps the same recommendation across same-day reopens even when state changed', () => {
    const { deps, storage } = setup();
    const first = getToday(deps);
    // 재계산이라면 오늘 먹은 메뉴는 중복 회피로 빠져야 하지만, 하루 고정은 유지되어야 한다
    storage.appendMeal({ recipeId: first.recipe.id, completedAt: new Date(2026, 7, 4, 20, 0).toISOString() });
    const second = getToday(deps);
    expect(second.recipe.id).toBe(first.recipe.id);
  });

  it('AS2/FR-002: replaces the recommendation only when an alternative is selected, recording exactly one rejection', () => {
    const { deps, storage } = setup();
    const first = getToday(deps);
    const chosen = first.alternatives[0]!;
    selectAlternative(deps, chosen.id);
    const after = getToday(deps);
    expect(after.recipe.id).toBe(chosen.id);
    const log = storage.loadTodayLog('2026-08-04')!;
    expect(log.rejections.map((r) => r.recipeId)).toEqual([first.recipe.id]);
    expect(storage.loadProfile()!.learned[first.recipe.id]).toBe(-1);
  });

  it('AS6: creates a fresh recommendation log after midnight', () => {
    const { deps, storage, setNow } = setup();
    const first = getToday(deps);
    selectAlternative(deps, first.alternatives[0]!.id);
    setNow(new Date(2026, 7, 5, 0, 10));
    getToday(deps);
    const log = storage.loadTodayLog('2026-08-05');
    expect(log).not.toBeNull();
    expect(log!.date).toBe('2026-08-05');
    expect(log!.rejections).toEqual([]);
  });

  it('AS4·AS5: recommends purely from 취향·제철·가격 when inventory is empty — 확인형 재고 문구 없음', () => {
    const { deps } = setup();
    const view = getToday(deps);
    expect(view.reasonLine).not.toMatch(/있죠\?/);
  });
});
