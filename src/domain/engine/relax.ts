import type { FilterOptions } from './filters';
import type { Relaxation } from '../types';

/**
 * 완화 사다리 (FR-007, contracts/engine.md) — 누적 적용.
 * 못 먹는 재료 제외는 어떤 단계에서도 완화하지 않는다 (filters.ts에서 항상 우선).
 */
export interface LadderStep {
  relax: Relaxation | null;
  apply(opts: FilterOptions): FilterOptions;
}

export function buildLadder(tiredMode: boolean): LadderStep[] {
  const steps: LadderStep[] = [
    { relax: null, apply: (o) => o },
    { relax: 'dedupe-5d', apply: (o) => ({ ...o, dedupeDays: 5 }) },
    { relax: 'missing-3', apply: (o) => ({ ...o, maxMissing: 3 }) },
  ];
  if (tiredMode) {
    steps.push({ relax: 'tired-20min', apply: (o) => ({ ...o, tiredMaxMinutes: 20 }) });
  }
  steps.push({ relax: 'recycle-rejected', apply: (o) => ({ ...o, ignoreRejections: true }) });
  steps.push({ relax: 'dedupe-off', apply: (o) => ({ ...o, dedupeDays: 0 }) });
  return steps;
}
