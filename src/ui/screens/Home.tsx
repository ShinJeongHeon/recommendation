import { useMemo, useState } from 'react';
import { enableTiredMode, getToday, selectAlternative, type TodayDeps } from '../../domain/engine/today';
import { RecommendCard } from '../components/RecommendCard';

interface HomeProps {
  deps: TodayDeps;
  onOpenRecipe: (recipeId: string) => void;
}

/**
 * Zero-Question Home (FR-001) — 구성 요소는 추천 카드 + 근거 한 줄 + "오늘 지쳤어요" 버튼뿐.
 * 확인형 질문·가격 표시는 홈에 배치할 수 없다 (FR-015·018).
 */
export function Home({ deps, onOpenRecipe }: HomeProps) {
  const [version, setVersion] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const view = useMemo(() => getToday(deps), [deps, version]);

  const pick = (id: string) => {
    selectAlternative(deps, id);
    setShowAlternatives(false);
    setVersion((v) => v + 1);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f6f4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 16,
        padding: 20,
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <RecommendCard
        recipe={view.recipe}
        reasonLine={view.reasonLine}
        onOpen={() => onOpenRecipe(view.recipe.id)}
        onOtherMenus={() => setShowAlternatives((s) => !s)}
      />

      {showAlternatives && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {view.alternatives.map((alt) => (
            <button
              key={alt.id}
              onClick={() => pick(alt.id)}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 15,
                textAlign: 'left',
              }}
            >
              {alt.name} <span style={{ color: '#888', fontSize: 13 }}>· {alt.cookMinutes}분</span>
            </button>
          ))}
        </section>
      )}

      <button
        onClick={() => {
          enableTiredMode(deps);
          setShowAlternatives(false);
          setVersion((v) => v + 1);
        }}
        disabled={view.log.tiredMode}
        style={{
          background: view.log.tiredMode ? '#faf0d7' : '#fff',
          color: '#b7791f',
          border: '1px solid #ecc94b',
          borderRadius: 12,
          padding: '12px 0',
          fontSize: 15,
        }}
      >
        {view.log.tiredMode ? '지친 날 모드 — 15분 메뉴로 골랐어요' : '오늘 지쳤어요'}
      </button>
    </main>
  );
}
