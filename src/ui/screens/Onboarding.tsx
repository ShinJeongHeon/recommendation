import { useState } from 'react';
import { completeOnboarding, ONBOARDING_QUESTIONS } from '../../domain/onboarding';
import type { Storage } from '../../storage/local';
import type { Ingredient } from '../../domain/types';

interface OnboardingProps {
  storage: Storage;
  ingredients: Ingredient[];
  clock: () => Date;
  onDone: () => void;
}

const SPICY_LABELS = ['안 매운 것만', '약간 매콤까지', '매콤한 것 좋아요', '아주 매워도 OK'];
const PREFERENCE_OPTIONS = ['국물 요리', '볶음·구이', '밑반찬', '한 그릇 요리'];

const chipBase: React.CSSProperties = {
  borderRadius: 999,
  padding: '8px 14px',
  fontSize: 14,
  border: '1px solid #ccc',
  background: '#fff',
};

/** 온보딩 — 문항 3개만 묻고 즉시 첫 추천으로 (FR-008) */
export function Onboarding({ storage, ingredients, clock, onDone }: OnboardingProps) {
  const [excluded, setExcluded] = useState<string[]>([]);
  const [spicy, setSpicy] = useState(2);
  const [prefs, setPrefs] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = () => {
    completeOnboarding(storage, { excludedIngredients: excluded, spicyTolerance: spicy, basePreferences: prefs }, clock());
    onDone();
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f6f4', padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, margin: '8px 0 4px' }}>딱 3가지만 알려주세요</h1>
      <p style={{ margin: '0 0 20px', color: '#666', fontSize: 14 }}>바로 오늘 저녁 메뉴를 추천해 드릴게요.</p>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>1. {ONBOARDING_QUESTIONS[0]!.title}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ingredients.map((ing) => (
            <button
              key={ing.id}
              onClick={() => toggle(excluded, setExcluded, ing.id)}
              style={{
                ...chipBase,
                background: excluded.includes(ing.id) ? '#fed7d7' : '#fff',
                borderColor: excluded.includes(ing.id) ? '#e53e3e' : '#ccc',
              }}
            >
              {ing.name}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>2. {ONBOARDING_QUESTIONS[1]!.title}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SPICY_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setSpicy(i)}
              style={{
                ...chipBase,
                background: spicy === i ? '#c6f6d5' : '#fff',
                borderColor: spicy === i ? '#2f855a' : '#ccc',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>3. {ONBOARDING_QUESTIONS[2]!.title}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PREFERENCE_OPTIONS.map((p) => (
            <button
              key={p}
              onClick={() => toggle(prefs, setPrefs, p)}
              style={{
                ...chipBase,
                background: prefs.includes(p) ? '#c6f6d5' : '#fff',
                borderColor: prefs.includes(p) ? '#2f855a' : '#ccc',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={finish}
        style={{
          width: '100%',
          background: '#2f855a',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '16px 0',
          fontSize: 17,
          fontWeight: 700,
        }}
      >
        오늘 저녁 추천받기
      </button>
    </main>
  );
}
