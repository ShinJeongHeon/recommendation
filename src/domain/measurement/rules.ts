// 1인분 현실 계량 표기 규칙 (FR-011) — 큐레이션 산출물(display)을 검증한다

/** 셀 수 있는 현실 단위 — 소수점과 함께 쓰면 비현실 계량("계란 1.5개") */
const COUNTING_UNITS = ['개', '모', '알', '장', '쪽', '봉지', '공기', '단', '줄', '캔'];

/**
 * display 문자열의 계량 규칙 위반 목록을 반환한다. 빈 배열 = 통과.
 * 밥숟가락·종이컵·한 줌·반 모 같은 현실 단위 표기는 허용된다.
 */
export function checkDisplay(display: string): string[] {
  const problems: string[] = [];
  const decimalCount = new RegExp(`\\d+\\.\\d+\\s*(${COUNTING_UNITS.join('|')})`);
  if (decimalCount.test(display)) {
    problems.push(`소수점 개수 금지: "${display}" — 현실 단위로 보정하세요 (예: "계란 1.5개" → "계란 2개(소)")`);
  }
  return problems;
}

/** 레시피 재료 display 전체 검사 — 카탈로그 로더 검증에 연결된다 */
export function checkRecipeDisplays(recipeId: string, displays: string[]): string[] {
  return displays.flatMap((d) => checkDisplay(d).map((p) => `${recipeId}: ${p}`));
}
