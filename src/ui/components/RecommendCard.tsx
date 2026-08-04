import type { Recipe } from '../../domain/types';

interface RecommendCardProps {
  recipe: Recipe;
  reasonLine: string;
  onOpen: () => void;
  onOtherMenus: () => void;
}

/** 홈의 추천 카드 — 가격은 절대 노출하지 않는다 (FR-018) */
export function RecommendCard({ recipe, reasonLine, onOpen, onOtherMenus }: RecommendCardProps) {
  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <p style={{ margin: 0, color: '#2f855a', fontSize: 14 }}>오늘의 저녁</p>
      <h1 style={{ margin: 0, fontSize: 28 }}>{recipe.name}</h1>
      <p style={{ margin: 0, color: '#555', fontSize: 15 }}>{reasonLine}</p>
      <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
        {recipe.cookMinutes}분 · {recipe.difficulty === 'easy' ? '쉬움' : '보통'} ·{' '}
        {recipe.dishwashTag === 'minimal' ? '설거지 적음' : '설거지 보통'}
      </p>
      <button
        onClick={onOpen}
        style={{
          background: '#2f855a',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px 0',
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        레시피 보기
      </button>
      <button
        onClick={onOtherMenus}
        style={{
          background: 'transparent',
          color: '#2f855a',
          border: 'none',
          padding: '6px 0',
          fontSize: 14,
        }}
      >
        다른 메뉴 보기
      </button>
    </section>
  );
}
