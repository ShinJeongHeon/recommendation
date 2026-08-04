import type { Ingredient, InventoryItem, MealRecord, Recipe, TasteProfile } from '../../src/domain/types';

export function makeIngredient(id: string, over: Partial<Ingredient> = {}): Ingredient {
  return { id, name: id, shelfLifeDays: 7, seasonalMonths: [], ...over };
}

export function makeRecipe(id: string, over: Partial<Recipe> = {}): Recipe {
  return {
    id,
    name: id,
    steps: ['1단계'],
    ingredients: [{ ingredientId: 'tofu', display: '두부 반 모', amount: 0.5, unit: '모' }],
    cookMinutes: 10,
    difficulty: 'easy',
    dishwashTag: 'minimal',
    burnerCount: 1,
    nutritionTags: [],
    estimatedCost: 3000,
    source: { channel: 'ch', videoTitle: 'vt', url: 'https://example.com' },
    isStaple: false,
    spicyLevel: 1,
    ...over,
  };
}

export function makeProfile(over: Partial<TasteProfile> = {}): TasteProfile {
  return {
    excludedIngredients: [],
    spicyTolerance: 3,
    basePreferences: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    learned: {},
    ...over,
  };
}

export function ingredientMap(list: Ingredient[]): Map<string, Ingredient> {
  return new Map(list.map((i) => [i.id, i]));
}

export function mealAt(recipeId: string, daysAgo: number, now: Date): MealRecord {
  return { recipeId, completedAt: new Date(now.getTime() - daysAgo * 86_400_000).toISOString() };
}

export function inv(ingredientId: string, over: Partial<InventoryItem> = {}): InventoryItem {
  return { ingredientId, purchasedAt: '2026-08-01', roughAmount: 'some', ...over };
}
