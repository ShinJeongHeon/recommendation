import { DELIVERY_BASELINE, weeklyTotal } from '../../domain/savings/index';
import type { Recipe, SavingsLedger } from '../../domain/types';

interface SavingsProps {
  ledger: SavingsLedger;
  recipes: Recipe[];
  now: Date;
  onBack: () => void;
}

/** 절약 현황 — 주간 누적 "배달 대비 절약" (FR-020). 홈에는 노출하지 않는다. */
export function Savings({ ledger, recipes, now, onBack }: SavingsProps) {
  const total = weeklyTotal(ledger, now);
  const nameOf = (id: string) => recipes.find((r) => r.id === id)?.name ?? id;

  return (
    <main style={{ minHeight: '100vh', background: '#f5f6f4', padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 15, color: '#2f855a', padding: 0 }}>
        ← 돌아가기
      </button>

      <section style={{ background: '#fff', borderRadius: 16, padding: 24, margin: '16px 0', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>이번 주 배달 대비 절약</p>
        <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#2f855a' }}>
          {total.toLocaleString()}원
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#999' }}>
          배달 한 끼 기준가 {DELIVERY_BASELINE.toLocaleString()}원과 끼당 재료비의 차액을 요리 완료마다 누적해요.
        </p>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ledger.entries
          .slice()
          .reverse()
          .map((e, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 14,
              }}
            >
              <span>{nameOf(e.recipeId)}</span>
              <span style={{ color: '#2f855a', fontWeight: 600 }}>+{e.saved.toLocaleString()}원</span>
            </div>
          ))}
      </section>
    </main>
  );
}
