import type { ReasonPart } from '../types';

/** 재고 근거는 신선도와 무관하게 항상 확인형 — 단정형 생성 경로 자체가 없다 (FR-006) */
export function inventoryQuestion(ingredientName: string): string {
  return `${ingredientName} 아직 있죠?`;
}

/** 근거 한 줄 — 상위 기여 요소 최대 2개를 조합 (FR-001) */
export function reasonText(parts: ReasonPart[]): string {
  if (parts.length === 0) return '오늘은 이 메뉴 어때요?';
  return parts
    .slice(0, 2)
    .map((p) => p.text)
    .join(' + ');
}
