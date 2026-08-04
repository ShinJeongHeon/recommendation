import { describe, expect, it } from 'vitest';
import { createStorage, type KeyValueBackend } from '../../src/storage/local';

function memoryBackend(initial: Record<string, string> = {}): KeyValueBackend & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k)! : null),
    setItem: (k, v) => {
      data.set(k, v);
    },
    removeItem: (k) => {
      data.delete(k);
    },
  };
}

describe('storage adapter — contracts/storage-schema.md', () => {
  it('returns null profile when nothing is stored (onboarding not done)', () => {
    const s = createStorage(memoryBackend());
    expect(s.loadProfile()).toBeNull();
  });

  it('falls back to defaults on corrupt JSON', () => {
    const s = createStorage(
      memoryBackend({ 'fr.v1.meals': '{not json', 'fr.v1.profile': '[broken', 'fr.v1.savings': 'x' }),
    );
    expect(s.loadMeals()).toEqual([]);
    expect(s.loadProfile()).toBeNull();
    expect(s.loadSavings()).toEqual({ entries: [] });
  });

  it('round-trips profile, meals and inventory under fr.v1.* keys', () => {
    const backend = memoryBackend();
    const s = createStorage(backend);
    s.saveProfile({
      excludedIngredients: ['peanut'],
      spicyTolerance: 1,
      basePreferences: [],
      createdAt: '2026-08-01',
      learned: {},
    });
    s.appendMeal({ recipeId: 'r1', completedAt: '2026-08-04T19:00:00.000Z' });
    s.saveInventory([{ ingredientId: 'tofu', purchasedAt: '2026-08-04', roughAmount: 'some' }]);
    expect(backend.data.has('fr.v1.profile')).toBe(true);
    expect(backend.data.has('fr.v1.meals')).toBe(true);
    expect(s.loadProfile()?.excludedIngredients).toEqual(['peanut']);
    expect(s.loadMeals()).toHaveLength(1);
    expect(s.loadInventory()[0]?.ingredientId).toBe('tofu');
  });

  it('never returns a log from another day (midnight boundary — FR-002a)', () => {
    const s = createStorage(memoryBackend());
    s.saveTodayLog({
      date: '2026-08-03',
      currentRecipeId: 'r1',
      tiredMode: true,
      rejections: [],
      reasonParts: [],
      accepted: false,
    });
    expect(s.loadTodayLog('2026-08-04')).toBeNull();
    expect(s.loadTodayLog('2026-08-03')?.currentRecipeId).toBe('r1');
  });

  it('propagates write failures instead of swallowing them', () => {
    const backend = memoryBackend();
    backend.setItem = () => {
      throw new Error('quota exceeded');
    };
    const s = createStorage(backend);
    expect(() => s.appendMeal({ recipeId: 'r1', completedAt: '2026-08-04T19:00:00.000Z' })).toThrow(/quota/);
  });
});
