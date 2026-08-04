import catalogJson from './catalog.json';
import ingredientsJson from './ingredients.json';
import pricesJson from './prices.json';
import { checkRecipeDisplays } from '../domain/measurement/rules';
import type { Ingredient, PriceTable, Recipe } from '../domain/types';

export type CatalogMode = 'dev' | 'prod';

// contracts/catalog-schema.md — 개발 모드는 샘플 5개, 운영 모드는 30개 기준
const THRESHOLDS: Record<CatalogMode, { minSize: number; minStaple: number }> = {
  dev: { minSize: 5, minStaple: 2 },
  prod: { minSize: 30, minStaple: 7 },
};

export class CatalogValidationError extends Error {
  constructor(problems: string[]) {
    super(`카탈로그 계약 위반:\n${problems.join('\n')}`);
    this.name = 'CatalogValidationError';
  }
}

export function validateCatalog(recipes: Recipe[], ingredients: Ingredient[], opts: { mode: CatalogMode }): void {
  const problems: string[] = [];
  const t = THRESHOLDS[opts.mode];
  const known = new Set(ingredients.map((i) => i.id));

  if (recipes.length < t.minSize) problems.push(`카탈로그 크기 부족: ${recipes.length} < ${t.minSize}`);

  for (const r of recipes) {
    for (const ri of r.ingredients) {
      if (!known.has(ri.ingredientId)) problems.push(`${r.id}: 미등록 재료 참조 "${ri.ingredientId}"`);
    }
    if (r.burnerCount !== 1) problems.push(`${r.id}: burnerCount는 1이어야 함 (1구 인덕션 제약)`);
    if (!r.source.channel || !r.source.videoTitle || !r.source.url) problems.push(`${r.id}: 출처(source) 필드 누락`);
    problems.push(...checkRecipeDisplays(r.id, r.ingredients.map((ri) => ri.display)));
  }

  const quick = recipes.filter((r) => r.cookMinutes <= 15).length;
  if (recipes.length > 0 && quick / recipes.length < 0.5) {
    problems.push(`15분 이내 비중 미달: ${quick}/${recipes.length}`);
  }
  if (!recipes.some((r) => r.cookMinutes <= 15 && r.dishwashTag === 'minimal')) {
    problems.push('지침 모드 후보(15분 이내·설거지 최소) 없음');
  }
  const staples = recipes.filter((r) => r.isStaple).length;
  if (staples < t.minStaple) problems.push(`국민 메뉴(staple) 부족: ${staples} < ${t.minStaple}`);

  if (problems.length > 0) throw new CatalogValidationError(problems);
}

export interface Catalog {
  recipes: Recipe[];
  ingredients: Map<string, Ingredient>;
  prices: PriceTable;
}

export function loadCatalog(mode: CatalogMode = 'dev'): Catalog {
  const recipes = catalogJson as unknown as Recipe[];
  const ingredients = ingredientsJson as unknown as Ingredient[];
  const prices = pricesJson as unknown as PriceTable;
  validateCatalog(recipes, ingredients, { mode });
  return { recipes, ingredients: new Map(ingredients.map((i) => [i.id, i])), prices };
}
