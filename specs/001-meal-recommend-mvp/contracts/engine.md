# Contract: 추천 엔진 (`src/domain/engine`)

순수 함수 계약 — React·브라우저 API·시계·난수에 직접 의존하지 않는다. 시간은 항상 인자로 받는다.

## recommend

```ts
interface EngineInput {
  catalog: Recipe[];            // 검증된 카탈로그
  ingredients: Map<string, Ingredient>;
  profile: TasteProfile;
  meals: MealRecord[];          // 전체 이력 (엔진이 7일 창을 계산)
  inventory: InventoryItem[];
  now: Date;                    // 자정·제철·만료 판정 기준
  tiredMode: boolean;           // FR-017
  excludeRecipeIds?: string[];  // 오늘 이미 거절된 메뉴 (FR-002)
}

interface Recommendation {
  recipeId: string;
  alternatives: string[];       // 대안 2~3개 (FR-002)
  reason: ReasonPart[];         // 근거 한 줄의 재료 — 상위 기여 요소 순 (FR-004)
  relaxations: Relaxation[];    // 일반 완화 단계 (관측용, 화면·근거 문구 비노출) (FR-007)
  tiredOverrunMinutes?: number; // 지침 모드에서 15분을 완화했을 때의 실제 조리 시간 — 화면에 정직 표기 (스펙 엣지 케이스)
}

function recommend(input: EngineInput): Recommendation
```

**보장 사항**:

1. 결정적 — 같은 입력이면 같은 출력 (하루 고정은 저장 계층 책임, research R5).
2. 항상 1개 이상 반환 — 완화 순서를 소진해도 후보가 없으면 거절 목록 순환 (FR-007, 엣지 케이스).
3. `profile.excludedIngredients` 포함 레시피는 어떤 완화 단계에서도 반환하지 않는다 (FR-010).
4. 필터 순서: 7일 중복 제외 → 조리 환경·시간(tiredMode 시 15분·설거지 최소) → 조리 가능성(부족 재료 0~2개, 재고 정보 없으면 통과) (FR-003, FR-005).
5. 가중치: 취향(상) > 영양 보완(중) = 제철(중) > 재료비(하). 동점자: 유통기한 임박 재고 소진 — 만료 항목 제외 (FR-004).
6. 가입 첫 주(`profile.createdAt` 기준 7일)면 `isStaple` 레시피를 우선한다 (FR-009).

**완화 순서 (FR-007)**: ① 중복 회피 7일 → 5일 ② 부족 재료 허용 2개 → 3개 ③ (tiredMode) 15분 → 20분, 초과 시 `tiredOverrunMinutes`로 반환해 화면에 정직 표기 — 일반 `relaxations`와 달리 이것만 노출된다 ④ 거절 목록 순환. 각 단계는 누적 적용.

## reasonText

```ts
function reasonText(reason: ReasonPart[], lang?: "ko"): string
```

- 상위 기여 요소 1~2개를 한 줄로 조합.
- 재고에 근거한 조각은 **항상 확인형**("두부 아직 있죠?") — 단정형 생성 경로 자체가 없다 (FR-006).
- 재고 정보가 없으면 제철·취향·가격 조각만 사용.

## deriveNutritionGap

```ts
function deriveNutritionGap(meals: MealRecord[], catalog: Recipe[], now: Date): string[]
// 최근 이력의 nutritionTags 분포에서 부족 태그를 추론 (FR-021). 사용자 입력 없음.
```

## 테스트 의무 (tasks 단계에서 강제)

- 필터별 단독 테스트 + 완화 순서 누적 테스트 (후보 0 → 항상 1개 이상).
- `excludedIngredients` 불변식은 임의 입력 조합(퍼저 스타일)으로 검증.
- 자정 경계·첫 주 경계는 fake timer로 `now`를 주입해 검증.
