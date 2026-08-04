import type { RecommendationLog } from './types';

// SC-008 — 레시피 카드 → 영상 재생률, 영상 시청 → 요리 완료 전환율 (콘텐츠 품질 대리 지표)
// 데이터는 기기 안의 추천 로그만 사용한다. 목표치는 컨시어지 기준선 이후 설정.

export function videoPlayRate(logs: RecommendationLog[]): number {
  if (logs.length === 0) return 0;
  return logs.filter((l) => l.videoOpenedAt).length / logs.length;
}

export function completionConversionRate(logs: RecommendationLog[]): number {
  const opened = logs.filter((l) => l.videoOpenedAt);
  if (opened.length === 0) return 0;
  return opened.filter((l) => l.accepted).length / opened.length;
}
