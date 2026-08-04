# Data Model: 집밥 요리 추천 서비스 MVP

**Date**: 2026-08-04 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

정적 데이터(번들 JSON)와 사용자 상태(localStorage)로 나뉜다. 저장 형식·키는 [contracts/storage-schema.md](./contracts/storage-schema.md), 카탈로그 파일 계약은 [contracts/catalog-schema.md](./contracts/catalog-schema.md) 참조.

## 정적 데이터 (빌드 시 번들, 읽기 전용)

### Recipe (레시피)

| 필드 | 타입 | 제약 (근거 FR) |
|------|------|----------------|
| id | string | 고유, 불변 (예: `"kimchi-jjigae"`) |
| name | string | 필수 |
| steps | string[] | 자체 재작성 문장, 1개 이상 (FR-012) |
| ingredients | RecipeIngredient[] | 1개 이상. 각 항목: ingredientId, 보정 계량 표기(`display`), 정규화 양(`amount`, `unit`) (FR-011) |
| cookMinutes | number | > 0. 15분 이내 여부의 판정 원천 (FR-003, FR-017) |
| difficulty | `"easy" \| "normal"` | 초급~중급 범위 (페르소나 제약) |
| dishwashTag | `"minimal" \| "normal"` | 설거지 태그 (FR-013) |
| burnerCount | number | MVP 카탈로그는 전부 1 (1구 인덕션 제약) |
| nutritionTags | string[] | "단백질 풍부" 등 일반 상식 수준 태그 (FR-021) |
| estimatedCost | number | **끼당(1인분 1회 조리분)** 예상 재료비, 원 단위 ≥ 0 (FR-013). 장보기 총액이 아님 — 총액·N끼는 아래 "가격 파생 규칙" |
| source | { channel, videoTitle, url } | 모두 필수 — 출처 표기 의무 (FR-012) |
| isStaple | boolean | 국민 메뉴 여부 — 콜드스타트 풀 (FR-009) |
| spicyLevel | number (0~3) | 온보딩 매운맛 취향 매칭 |

**검증 규칙 (로더에서 강제, FR-023)**: 전 레시피 `burnerCount === 1`, `cookMinutes <= 20` 비중 계산 시 15분 이내 비중 ≥ 50%, 카탈로그 크기 30(개발 중 샘플은 5).

### Ingredient (재료 기준 데이터)

| 필드 | 타입 | 제약 |
|------|------|------|
| id | string | 고유 (예: `"tofu"`) |
| name | string | 필수 |
| shelfLifeDays | number | 평균 보관 기간, > 0 (FR-016) |
| seasonalMonths | number[] | 제철 월 (1~12), 없으면 빈 배열 (FR-004) |
| priceRef | string | PriceTable 항목 참조 (없으면 가격 근거 미사용) |

### PriceTable (시세 테이블)

`asOf`(`"2026-07"` 형식, 화면 표기용 — FR-019) + 항목별 `{ id, unit, price }`. 월 단위 커밋 갱신 (research R6).

### SeasonalTable / StorageLifeTable

Ingredient에 내장(`seasonalMonths`, `shelfLifeDays`)하므로 별도 파일 없음 — 엔티티로는 Ingredient의 속성.

### 가격 파생 규칙 (FR-018·FR-020, US6)

- **장보기 총액** = 레시피 재료 중 재고에 없는 재료의 구매 단위 가격(PriceTable `price`) 합계.
- **N끼** = `max(1, floor(장보기 총액 ÷ estimatedCost))` — "이번 장보기 ○○원 → 이걸로 N끼"의 N.
- **끼당 환산가** = 장보기 총액 ÷ N끼.
- **절약 계산의 끼당 재료비** = `Recipe.estimatedCost` (SavingsLedger의 `saved` 계산에 사용).

## 사용자 상태 (localStorage, 어댑터 경유)

### TasteProfile (취향 프로필)

| 필드 | 타입 | 제약 |
|------|------|------|
| excludedIngredients | string[] | 못 먹는 재료 — 어떤 완화 단계에서도 절대 제외 (FR-010) |
| spicyTolerance | number (0~3) | 온보딩 응답 |
| basePreferences | string[] | 기본 취향 태그 (온보딩 문항 3) |
| createdAt | ISO date | 첫 주(콜드스타트 풀 우선) 판정 기준 (FR-009) |
| learned | { recipeId: score } | 수용/거절/완료 이력에서 갱신되는 선호 점수 (FR-002) |

**규칙**: 온보딩 문항은 최대 3개 (FR-008). `learned`는 사용자에게 보이지 않는 내부 상태. 갱신 규칙 — 대체(거절)된 추천 −1, 요리 완료 +2의 단순 증감으로 시작하고 수치는 게이트 A/B 결과로 조정한다. 선택되지 않은 대안은 갱신하지 않는다 (FR-002).

### MealRecord (식사 이력)

| 필드 | 타입 | 제약 |
|------|------|------|
| recipeId | string | 필수 |
| completedAt | ISO datetime | 요리 완료 원탭 시각 (FR-014) |

**규칙**: 같은 날 복수 기록 허용 (엣지 케이스). 최근 7일 판정·영양 추론(FR-021)·주간 집계(SC-002)의 유일한 원천.

### InventoryItem (재고 항목)

| 필드 | 타입 | 제약 |
|------|------|------|
| ingredientId | string | 필수 |
| purchasedAt | ISO date | 구매(또는 최초 인지) 일자 — 추정 허용 (FR-016) |
| roughAmount | `"enough" \| "some" \| "little"` | 대략 양 — 정밀 수량 관리 안 함 |

**파생 값**: `expiresAt = purchasedAt + ingredient.shelfLifeDays` (저장하지 않고 계산). 만료 항목은 추천 근거·동점자 처리에서 제외 (엣지 케이스). 신선도 등급 없음 — 근거 문구는 항상 확인형 (FR-006).

**상태 전이**:

```text
(없음) → 등록: 요리 완료 시 사용 재료 중 구매 단위가 1끼 소요량보다 큰 재료를
             잔량 추정으로 자동 등록 (purchasedAt = 완료일). 별도 구매 입력 흐름은 없다.
등록 → 갱신: 확인 질문 "예" 응답 (purchasedAt 유지), 요리 완료 자동 차감
등록 → 제거: 확인 질문 "아니오"(소진), 차감 결과 소진, 또는 추정 유통기한 경과
```

### RecommendationLog (추천 기록)

| 필드 | 타입 | 제약 |
|------|------|------|
| date | `"YYYY-MM-DD"` | 로컬 자정 기준 — 하루 고정의 키 (FR-002a) |
| currentRecipeId | string | 오늘 화면에 고정된 추천 |
| tiredMode | boolean | 지침 모드 — 당일만 유효, 날짜가 바뀌면 무시 (FR-017) |
| rejections | { recipeId, at }[] | "다른 메뉴 보기" 거절 이력 — 취향 학습 입력 (FR-002) |
| reasonParts | string[] | 근거 문구를 만든 상위 기여 요소 (FR-004, 관측 가능성) |
| accepted | boolean | 요리 완료 원탭 시 true — 수용 판정의 유일 기준 (FR-014, SC-002) |
| videoOpenedAt | ISO datetime (optional) | 원본 영상 링크 탭 시각 — SC-008 재생률·전환율 산출 입력 |

**상태 전이**:

```text
(오늘 기록 없음) --앱 실행--> 생성(엔진 계산, currentRecipeId 고정)
생성 --"다른 메뉴 보기"--> currentRecipeId 교체 + rejections 추가
생성 --"오늘 지쳤어요"--> tiredMode=true, currentRecipeId 재계산(15분·1구·설거지 최소 필터)
생성 --"요리 완료"--> accepted=true (+ MealRecord 생성, 재고 차감)
어떤 상태든 --자정 경과--> 새 date의 기록을 새로 생성 (이전 기록은 보존, tiredMode 자동 소멸)
```

### SavingsLedger (절약 집계)

| 필드 | 타입 | 제약 |
|------|------|------|
| entries | { weekStart, recipeId, saved }[] | `saved = DELIVERY_BASELINE − 끼당 재료비`, 요리 완료마다 1건 (FR-020) |

**상수**: `DELIVERY_BASELINE` — 15,000원 이하 고정 상수, 화면에 기준값 명시 (Clarification Q4).

## 관계 요약

```text
Recipe ⟶ (n) Ingredient        : ingredients[].ingredientId
InventoryItem ⟶ Ingredient     : ingredientId (shelfLifeDays로 expiresAt 파생)
MealRecord ⟶ Recipe            : recipeId
RecommendationLog ⟶ Recipe     : currentRecipeId, rejections[].recipeId
SavingsLedger.entries ⟶ Recipe : recipeId (estimatedCost 참조)
TasteProfile.learned ⟶ Recipe  : recipeId 키
```

엔진은 정적 데이터 + 사용자 상태 전부를 입력으로 받아 추천을 출력하는 순수 함수 — 시그니처는 [contracts/engine.md](./contracts/engine.md).
