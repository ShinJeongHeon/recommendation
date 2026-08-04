const DAY_MS = 86_400_000;

/** 로컬 자정 기준 날짜 키 "YYYY-MM-DD" — 하루 고정(FR-002a)·주간 집계의 기준 */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** atIso 시점이 now로부터 최근 days일 이내인지 — 7일 중복 회피 창(FR-003) */
export function withinDays(atIso: string, now: Date, days: number): boolean {
  const diff = now.getTime() - new Date(atIso).getTime();
  return diff < days * DAY_MS;
}

/** 가입(createdAt) 후 첫 7일 이내인지 — 콜드스타트 풀 판정(FR-009) */
export function isWithinFirstWeek(createdAt: string, now: Date): boolean {
  return withinDays(createdAt, now, 7);
}

/** 해당 주의 월요일 날짜 키 — 절약 주간 집계(FR-020) */
export function weekStartKey(now: Date): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  return localDateKey(d);
}
