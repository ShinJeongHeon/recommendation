import { describe, expect, it } from 'vitest';
import { inventoryQuestion, reasonText } from '../../src/domain/engine/reason';
import { recommend, type EngineInput } from '../../src/domain/engine/recommend';
import { ingredientMap, inv, makeIngredient, makeProfile, makeRecipe } from '../helpers/fixtures';

const NOW = new Date(2026, 7, 4, 19, 0);
const INGREDIENTS = ingredientMap([
  makeIngredient('tofu', { name: '두부' }),
  makeIngredient('onion', { name: '양파' }),
  makeIngredient('zucchini', { name: '애호박', seasonalMonths: [8] }),
]);

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

describe('근거 문구 (FR-006)', () => {
  it('inventory reason is always a confirm-style question', () => {
    expect(inventoryQuestion('두부')).toBe('두부 아직 있죠?');
  });

  it('joins at most two reason parts with +', () => {
    expect(
      reasonText([
        { kind: 'seasonal', text: '애호박이 제철이라 저렴해요' },
        { kind: 'nutrition', text: '어제 채소가 부족했어요' },
        { kind: 'price', text: '재료비가 가벼워요' },
      ]),
    ).toBe('애호박이 제철이라 저렴해요 + 어제 채소가 부족했어요');
  });

  it('falls back to a friendly default with no parts', () => {
    expect(reasonText([])).toBe('오늘은 이 메뉴 어때요?');
  });

  it('emits a question-form inventory part when the tiebreaker used inventory — 단정형 금지', () => {
    const a = makeRecipe('a', { ingredients: [{ ingredientId: 'onion', display: '양파', amount: 1, unit: '개' }] });
    const b = makeRecipe('b', { ingredients: [{ ingredientId: 'tofu', display: '두부', amount: 1, unit: '모' }] });
    const out = recommend(
      input({
        catalog: [a, b],
        inventory: [inv('onion', { purchasedAt: '2026-08-03' }), inv('tofu', { purchasedAt: '2026-07-30' })],
      }),
    );
    const invPart = out.reason.find((p) => p.kind === 'inventory');
    expect(invPart).toBeDefined();
    expect(invPart!.text).toMatch(/아직 있죠\?$/);
    expect(invPart!.text).not.toMatch(/남았어요/);
  });

  it('uses only 제철·취향·가격·영양 parts when no inventory data exists', () => {
    const seasonal = makeRecipe('seasonal', {
      ingredients: [{ ingredientId: 'zucchini', display: '애호박 반 개', amount: 0.5, unit: '개' }],
    });
    const out = recommend(input({ catalog: [seasonal] }));
    expect(out.reason.length).toBeGreaterThan(0);
    expect(out.reason.every((p) => p.kind !== 'inventory')).toBe(true);
  });
});
