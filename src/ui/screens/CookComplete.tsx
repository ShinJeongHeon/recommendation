import { useState } from 'react';
import type { ConfirmCandidate } from '../../domain/inventory/index';

interface CookCompleteProps {
  recipeName: string;
  questions: ConfirmCandidate[];
  onAnswer: (ingredientId: string, stillHave: boolean) => void;
  onDone: () => void;
  onShowSavings?: () => void;
}

/**
 * 요리 완료 후 화면 — 확인형 재고 질문은 오직 여기에만 배치한다 (FR-015).
 * [게이트 B1] 실패 시 질문 블록만 제거하고 완료 축하·홈 복귀는 유지.
 */
export function CookComplete({ recipeName, questions, onAnswer, onDone, onShowSavings }: CookCompleteProps) {
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const remaining = questions.filter((q) => !answered.has(q.ingredientId));

  const answer = (id: string, stillHave: boolean) => {
    onAnswer(id, stillHave);
    setAnswered((s) => new Set(s).add(id));
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f6f4',
        padding: 20,
        maxWidth: 480,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <section style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 44, margin: 0 }}>🍽️</p>
        <h1 style={{ fontSize: 24, margin: '8px 0 4px' }}>{recipeName} 완성!</h1>
        <p style={{ color: '#666', fontSize: 15, margin: 0 }}>오늘도 집밥 성공이에요.</p>
      </section>

      {remaining.length > 0 && (
        <section style={{ background: '#fff', borderRadius: 16, padding: 20 }}>
          {remaining.slice(0, 1).map((q) => (
            <div key={q.ingredientId} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0, fontSize: 17, textAlign: 'center' }}>{q.name} 아직 있죠?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => answer(q.ingredientId, true)}
                  style={{
                    flex: 1,
                    background: '#c6f6d5',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 0',
                    fontSize: 15,
                  }}
                >
                  예
                </button>
                <button
                  onClick={() => answer(q.ingredientId, false)}
                  style={{
                    flex: 1,
                    background: '#fed7d7',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 0',
                    fontSize: 15,
                  }}
                >
                  아니오, 다 썼어요
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {onShowSavings && (
        <button
          onClick={onShowSavings}
          style={{
            background: '#fff',
            color: '#2f855a',
            border: '1px solid #2f855a',
            borderRadius: 12,
            padding: '12px 0',
            fontSize: 15,
          }}
        >
          이번 주 배달 대비 절약 보기
        </button>
      )}
      <button
        onClick={onDone}
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
        홈으로
      </button>
    </main>
  );
}
