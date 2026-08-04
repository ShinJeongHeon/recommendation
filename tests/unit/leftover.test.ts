import { describe, expect, it } from 'vitest';
import { leftoverBonus } from '../../src/domain/engine/leftover';
import { recommend, type EngineInput } from '../../src/domain/engine/recommend';
import { activeInventory } from '../../src/domain/engine/filters';
import { ingredientMap, inv, makeIngredient, makeProfile, makeRecipe } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0);
const INGREDIENTS = ingredientMap([makeIngredient('tofu', { name: '두부' }), makeIngredient('onion', { name: '양파' })]);

function input(over: Partial<EngineInput> = {}): EngineInput {
  return {
    catalog: [],
    ingredients: INGREDIENTS,
    profile: makeProfile(),
    meals: [],
    inventory: [],
    now: NOW,
    tiredMode: false,
    ...over,
  };
}

describe('연계 메뉴 — 남은 재료를 다음 끼니로 잇기 (FR-022)', () => {
  const usesLeftover = makeRecipe('uses-leftover', {
    estimatedCost: 5000,
    ingredients: [{ ingredientId: 'tofu', display: '두부 반 모', amount: 0.5, unit: '모' }],
  });
  const noLeftover = makeRecipe('no-leftover', {
    estimatedCost: 3000,
    ingredients: [{ ingredientId: 'onion', display: '양파 반 개', amount: 0.5, unit: '개' }],
  });

  it('scores a bonus for menus that use active leftover inventory', () => {
    const active = activeInventory([inv('tofu')], INGREDIENTS, NOW);
    expect(leftoverBonus(usesLeftover, active)).toBeGreaterThan(0);
    expect(leftoverBonus(noLeftover, active)).toBe(0);
  });

  it('prefers a leftover-using menu over an equally-tasty cheaper menu', () => {
    const out = recommend(input({ catalog: [usesLeftover, noLeftover], inventory: [inv('tofu')] }));
    expect(out.recipeId).toBe('uses-leftover');
  });

  it('never overrides taste — 취향 적합 후보 내에서만 우선 (FR-004 원칙 유지)', () => {
    const profile = makeProfile({ learned: { 'no-leftover': 1 } });
    const out = recommend(input({ catalog: [usesLeftover, noLeftover], profile, inventory: [inv('tofu')] }));
    expect(out.recipeId).toBe('no-leftover');
  });

  it('states the linkage in the reason line, in confirm-question form (FR-006)', () => {
    const out = recommend(input({ catalog: [usesLeftover, noLeftover], inventory: [inv('tofu')] }));
    const linkage = out.reason.find((p) => p.kind === 'inventory' || p.kind === 'leftover');
    expect(linkage).toBeDefined();
    expect(linkage!.text).toMatch(/아직 있죠\?$/);
  });
});
