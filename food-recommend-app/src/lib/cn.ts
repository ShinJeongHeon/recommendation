import { twMerge } from "tailwind-merge";

/**
 * 조건부 클래스 결합 + Tailwind 충돌 해소(뒤에 오는 클래스가 이긴다).
 * Tailwind 클래스는 항상 정적 리터럴로 전달할 것(스캐너 감지).
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}
