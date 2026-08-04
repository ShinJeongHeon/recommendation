import type { Recipe } from '../../domain/types';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  /** US4에서 배선 — 요리 완료 원탭 */
  onComplete?: () => void;
  /** T050 — 원본 영상 링크 탭 기록 (SC-008) */
  onVideoOpen?: () => void;
  /** US6에서 배선 — 가격 이중 표시 블록 */
  priceBlock?: React.ReactNode;
}

const tagStyle: React.CSSProperties = {
  background: '#edf2f0',
  borderRadius: 8,
  padding: '4px 10px',
  fontSize: 13,
  color: '#2f5548',
};

/** 레시피 상세 — 1인분 현실 계량 + 자체 재작성 절차 + 원본 출처 (FR-011~013) */
export function RecipeDetail({ recipe, onBack, onComplete, onVideoOpen, priceBlock }: RecipeDetailProps) {
  return (
    <main style={{ minHeight: '100vh', background: '#f5f6f4', padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 15, color: '#2f855a', padding: 0 }}>
        ← 오늘의 추천
      </button>

      <h1 style={{ fontSize: 26, margin: '16px 0 8px' }}>{recipe.name}</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={tagStyle}>{recipe.cookMinutes}분</span>
        <span style={tagStyle}>{recipe.difficulty === 'easy' ? '쉬움' : '보통'}</span>
        <span style={tagStyle}>{recipe.dishwashTag === 'minimal' ? '설거지 적음' : '설거지 보통'}</span>
        {recipe.nutritionTags.map((t) => (
          <span key={t} style={tagStyle}>
            {t}
          </span>
        ))}
      </div>

      {priceBlock}

      <section style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, margin: '0 0 10px' }}>재료 — 1인분 현실 계량</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recipe.ingredients.map((ri) => (
            <li key={ri.ingredientId} style={{ fontSize: 15 }}>
              {ri.display}
            </li>
          ))}
        </ul>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: '#888' }}>
          예상 재료비(끼당): 약 {recipe.estimatedCost.toLocaleString()}원
        </p>
      </section>

      <section style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, margin: '0 0 10px' }}>만드는 법</h2>
        <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recipe.steps.map((step, i) => (
            <li key={i} style={{ fontSize: 15, lineHeight: 1.5 }}>
              {step}
            </li>
          ))}
        </ol>
        <a
          href={recipe.source.url}
          target="_blank"
          rel="noreferrer"
          onClick={onVideoOpen}
          style={{ display: 'inline-block', marginTop: 12, fontSize: 14, color: '#2f855a' }}
        >
          ▶ 원본 영상 보며 따라 하기 — {recipe.source.channel} 「{recipe.source.videoTitle}」
        </a>
      </section>

      {onComplete && (
        <button
          onClick={onComplete}
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
          요리 완료!
        </button>
      )}
    </main>
  );
}
