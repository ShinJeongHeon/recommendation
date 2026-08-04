import { withinDays } from '../dates';
import type { Ingredient, InventoryItem, MealRecord, Recipe, TasteProfile } from '../types';

const DAY_MS = 86_400_000;

/** 필터 파라미터 — 완화 사다리(relax.ts)가 단계적으로 조정한다 */
export interface FilterOptions {
  dedupeDays: number; // 7 → 5 → 0(해제)
  maxMissing: number; // 2 → 3
  tiredMaxMinutes: number | null; // tiredMode에서만 15 → 20, 아니면 null
  excludeRecipeIds: ReadonlySet<string>;
  ignoreRejections: boolean;
}

export interface FilterContext {
  profile: TasteProfile;
  meals: MealRecord[];
  inventory: InventoryItem[];
  ingredients: Map<string, Ingredient>;
  now: Date;
  tiredMode: boolean;
}

/** 못 먹는 재료 포함 여부 — 어떤 완화 단계에서도 절대 제외 (FR-010) */
export function hasExcludedIngredient(r: Recipe, profile: TasteProfile): boolean {
  return r.ingredients.some((ri) => profile.excludedIngredients.includes(ri.ingredientId));
}

/** 구매일 + 재료별 평균 보관 기간으로 유통기한 추정 (FR-016) */
export function estimateExpiry(item: InventoryItem, ingredients: Map<string, Ingredient>): Date | null {
  const ing = ingredients.get(item.ingredientId);
  if (!ing) return null;
  const base = item.purchasedAt.includes('T')
    ? new Date(item.purchasedAt)
    : new Date(`${item.purchasedAt}T00:00:00`);
  return new Date(base.getTime() + ing.shelfLifeDays * DAY_MS);
}

/** 만료되지 않은 재고만 — 만료 항목은 추천 근거·동점자 처리에서 제외 (엣지 케이스) */
export function activeInventory(
  inventory: InventoryItem[],
  ingredients: Map<string, Ingredient>,
  now: Date,
): InventoryItem[] {
  return inventory.filter((item) => {
    const exp = estimateExpiry(item, ingredients);
    return exp !== null && exp.getTime() >= now.getTime();
  });
}

export function missingCount(r: Recipe, ownedIngredientIds: ReadonlySet<string>): number {
  return r.ingredients.filter((ri) => !ownedIngredientIds.has(ri.ingredientId)).length;
}

/** 필터 1(중복 회피) → 2(조리 환경·시간) → 3(조리 가능성) 순서 적용 (FR-003) */
export function applyFilters(catalog: Recipe[], ctx: FilterContext, opts: FilterOptions): Recipe[] {
  const recentIds = new Set(
    opts.dedupeDays > 0
      ? ctx.meals.filter((m) => withinDays(m.completedAt, ctx.now, opts.dedupeDays)).map((m) => m.recipeId)
      : [],
  );
  const active = activeInventory(ctx.inventory, ctx.ingredients, ctx.now);
  const ownedIds = new Set(active.map((i) => i.ingredientId));

  return catalog.filter((r) => {
    if (hasExcludedIngredient(r, ctx.profile)) return false;
    if (!opts.ignoreRejections && opts.excludeRecipeIds.has(r.id)) return false;
    if (recentIds.has(r.id)) return false;
    if (r.burnerCount !== 1) return false;
    if (ctx.tiredMode) {
      const limit = opts.tiredMaxMinutes ?? 15;
      if (r.cookMinutes > limit || r.dishwashTag !== 'minimal') return false;
    }
    // 재고 정보가 없으면 조리 가능성 필터를 건너뛴다 (FR-005 우아한 성능 저하)
    if (active.length > 0 && missingCount(r, ownedIds) > opts.maxMissing) return false;
    return true;
  });
}
