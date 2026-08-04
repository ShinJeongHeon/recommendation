# Tasks: 집밥 요리 추천 서비스 MVP

**Input**: Design documents from `/specs/001-meal-recommend-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (모두 존재)

**Tests**: 포함 — TDD 요청됨. 각 스토리에서 테스트 작업(RED)을 먼저 수행하고 **실패를 확인한 뒤** 구현(GREEN)으로 넘어간다. 테스트를 먼저 통과 상태로 만들었다면 잘못된 것이다.

**Organization**: 스토리별 독립 구현·독립 테스트 가능하도록 구성. 게이트 실패 시 US4~US7은 페이즈 단위로 드랍 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능 (다른 파일, 미완료 작업에 의존 없음)
- **[Story]**: 스토리 라벨 (US1~US7)

## Path Conventions

단일 프로젝트 — `src/`, `tests/` 리포 루트 기준 (plan.md 구조 참조).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: React + Vite + PWA 툴체인을 기존 TS/Vitest 리포에 추가

- [X] T001 package.json에 의존성 추가(react, react-dom, vite, @vitejs/plugin-react, vite-plugin-pwa, @types/react, @types/react-dom) 및 `dev`/`build`/`preview` 스크립트 등록, `npm install` 실행
- [X] T002 vite.config.ts 생성(react 플러그인 + vite-plugin-pwa 매니페스트·오프라인 캐시), index.html·src/main.tsx·src/app.tsx 최소 셸 작성, tsconfig.json에 jsx 설정 추가 — `npm run dev` 기동 확인
- [X] T003 [P] plan.md의 디렉터리 골격 생성: src/domain/{engine,measurement,savings,nutrition,inventory}, src/data, src/storage, src/ui/{screens,components}, tests/{unit,integration}

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 스토리가 의존하는 타입·데이터·저장소·날짜 유틸. **이 페이즈 완료 전 스토리 착수 금지**

- [X] T004 [P] data-model.md의 엔티티를 src/domain/types.ts에 정의 (Recipe, RecipeIngredient, Ingredient, InventoryItem, TasteProfile, MealRecord, RecommendationLog, SavingsLedger, ReasonPart)
- [X] T005 [P] RED: 날짜 유틸 테스트 tests/unit/dates.test.ts — 로컬 날짜 키(`YYYY-MM-DD`), 자정 경계, 최근 7일 창, 가입 첫 주 판정 (vi.useFakeTimers) — 실패 확인
- [X] T006 GREEN: 날짜 유틸 구현 src/domain/dates.ts (T005 통과)
- [X] T007 [P] RED: 카탈로그 로더 검증 테스트 tests/unit/catalog-loader.test.ts — contracts/catalog-schema.md 검증 6종(참조 무결성·1구·15분 비중 50%·출처·지침모드 공급·콜드스타트 공급) 각각 위반 픽스처로 실패 확인
- [X] T008 [P] 샘플 데이터 작성: src/data/ingredients.json(재료 15종+, shelfLifeDays·seasonalMonths·priceRef), src/data/catalog.json(계약 준수 레시피 5개 — staple 포함), src/data/prices.json(asOf 필드) — contracts/catalog-schema.md 예시 형식 준수
- [X] T009 GREEN: 카탈로그 로더 구현 src/data/loader.ts — 스키마 검증 실패 시 throw, 개발 모드(레시피 5개)/운영 모드(30개) 임계 플래그 (T007 통과)
- [X] T010 [P] RED: 저장소 어댑터 테스트 tests/unit/storage.test.ts — contracts/storage-schema.md 계약: 파싱 불가→기본값, loadTodayLog 자정 경계(어제 로그→null), 쓰기 실패 전파, v1 키 접두사 — 실패 확인
- [X] T011 GREEN: 저장소 어댑터 구현 src/storage/local.ts (`fr.v1.*` 키, Storage 인터페이스) (T010 통과)

**Checkpoint**: 타입·데이터·저장소·날짜 기반 완성 — 스토리 병렬 착수 가능

---

## Phase 3: User Story 1 - 오늘의 추천 홈 (Priority: P1) 🎯 MVP

**Goal**: 앱을 열면 질문 없이 추천 1개 + 근거 한 줄 (하루 고정, 거절 시 대안, 재고 없이도 성립)

**Independent Test**: 픽스처 취향 프로필 + 샘플 카탈로그만으로 — 홈 진입 시 추천·근거 즉시 표시, 새로고침 후 동일 추천, 거절 시 대안 2~3개, 재고 0에서도 성립

### Tests for User Story 1 (RED — 먼저 작성, 실패 확인)

- [X] T012 [P] [US1] RED: 엔진 필터 테스트 tests/unit/engine-filters.test.ts — 7일 중복 제외, 조리 환경·시간 적합, 부족 재료 0~2개, 재고 정보 없으면 필터3 통과 (contracts/engine.md 보장 4)
- [X] T013 [P] [US1] RED: 가중치·동점자 테스트 tests/unit/engine-weights.test.ts — 취향(상)>영양=제철(중)>재료비(하), 동점자는 유통기한 임박 소진, 만료 재고 항목 제외 (보장 5)
- [X] T014 [P] [US1] RED: 완화 순서 테스트 tests/unit/engine-relaxation.test.ts — 후보 0→7일→5일→부족재료 3개→거절 순환 누적 적용, 항상 1개 이상 반환, `excludedIngredients` 불변식은 임의 조합 반복 입력으로 검증 (보장 2·3)
- [X] T015 [P] [US1] RED: 영양 추론 테스트 tests/unit/nutrition.test.ts — 최근 이력 태그 분포에서 부족 태그 산출, 이력 없으면 빈 결과 (FR-021)
- [X] T016 [P] [US1] RED: 근거 문구 테스트 tests/unit/reason.test.ts — 재고 조각은 **항상 확인형**("~ 아직 있죠?"), 재고 정보 없으면 제철·취향·가격 조각만 (FR-006)
- [X] T017 [P] [US1] RED: 통합 테스트 tests/integration/us1-home.test.ts — spec.md US1 수용 시나리오 1~6: 하루 고정 복원(같은 날 재호출 → 재계산 없이 동일), 거절→대안 2~3+거절 기록, 자정 경과→새 추천 (fake timer)

### Implementation for User Story 1 (GREEN)

- [X] T018 [US1] 엔진 필터·가중치·완화 구현 src/domain/engine/filters.ts, weights.ts, relax.ts, recommend.ts — contracts/engine.md `recommend` 시그니처 (T012·T013·T014 통과)
- [X] T019 [US1] 영양 추론 구현 src/domain/nutrition/gap.ts — `deriveNutritionGap` (T015 통과)
- [X] T020 [US1] 근거 문구 구현 src/domain/engine/reason.ts — `reasonText` (T016 통과)
- [X] T021 [US1] 하루 고정 오케스트레이션 src/domain/engine/today.ts — getTodayRecommendation(저장소 복원→없으면 계산·저장), selectAlternative(사용자가 대안 1개를 선택하면 교체 + 대체된 기존 추천만 거절 기록 + learned −1 갱신) (T017 통과)
- [X] T022 [US1] 홈 화면 src/ui/screens/Home.tsx + src/ui/components/RecommendCard.tsx — 요소 3개 제한(추천 카드·근거 한 줄·"오늘 지쳤어요" 버튼 자리), "다른 메뉴 보기" 동작 (FR-001·002)

**Checkpoint**: US1 단독으로 완전 동작 — MVP 데모 가능

---

## Phase 4: User Story 2 - 레시피 상세와 1인분 현실 계량 (Priority: P2)

**Goal**: 확정 메뉴의 1인분 보정 계량·자체 절차·원본 출처·태그 표시

**Independent Test**: 샘플 레시피 1건을 열어 계량 표기(소수점 개수 없음)·출처 3필드·시간/난이도/설거지/재료비/영양 태그 확인

### Tests for User Story 2 (RED)

- [X] T023 [P] [US2] RED: 계량 표기 규칙 테스트 tests/unit/measurement.test.ts — display 문자열 검사기: 소수점 개수 금지("1.5개" 불합격), 밥숟가락·종이컵 단위 허용 목록 (FR-011)
- [X] T024 [P] [US2] RED: 통합 테스트 tests/integration/us2-recipe.test.ts — US2 수용 시나리오 1~3: 상세 데이터 조립에 보정 계량·재작성 절차·출처(채널명·영상 제목·링크)·태그·재료비 포함

### Implementation for User Story 2 (GREEN)

- [X] T025 [US2] 계량 규칙 검사기 구현 src/domain/measurement/rules.ts + 카탈로그 로더(src/data/loader.ts)에 검증 연결 (T023 통과)
- [X] T026 [US2] 레시피 상세 화면 src/ui/screens/RecipeDetail.tsx — 계량표·절차·원본 영상 링크(출처 병기)·태그 뱃지·예상 재료비 (T024 통과, FR-012·013)

**Checkpoint**: US1+US2 — 추천에서 레시피 실행까지 이어짐

---

## Phase 5: User Story 3 - 온보딩 콜드스타트 (Priority: P2)

**Goal**: 문항 최대 3개 응답 즉시 첫 추천, 첫 주 국민 메뉴 풀, 못 먹는 재료 절대 제외

**Independent Test**: 저장소 비운 신규 상태에서 시작 → 3문항 이하 → 즉시 첫 추천(국민 메뉴), 못 먹는 재료 등록 시 절대 비노출

### Tests for User Story 3 (RED)

- [X] T027 [P] [US3] RED: 콜드스타트 엔진 테스트 tests/unit/coldstart.test.ts — 가입 후 7일 이내 `isStaple` 우선, 8일째 일반 가중치 복귀(fake timer), excludedIngredients 절대 제외 유지 (FR-009·010)
- [X] T028 [P] [US3] RED: 통합 테스트 tests/integration/us3-onboarding.test.ts — US3 수용 시나리오 1~3: 프로필 null→온보딩 진입, 문항 ≤3, 응답 저장 직후 첫 추천 산출

### Implementation for User Story 3 (GREEN)

- [X] T029 [US3] 콜드스타트 가중 구현 src/domain/engine/coldstart.ts + recommend.ts 통합 (T027 통과)
- [X] T030 [US3] 온보딩 화면 src/ui/screens/Onboarding.tsx — 못 먹는 것·매운맛·기본 취향 3문항, 완료 즉시 홈 이동, app.tsx에 프로필 유무 라우팅 (T028 통과, FR-008)

**Checkpoint**: 신규 사용자 경로 완성 — US1~US3이 MVP 코어 (게이트 A1 대응 범위)

---

## Phase 6: User Story 4 - 요리 완료와 자동 이력·재고 갱신 (Priority: P3) [게이트 B1 — 실패 시 **확인형 질문만 제거**(T035의 질문 UI·관련 테스트 케이스), 완료 원탭·이력·차감은 유지]

**Goal**: 완료 원탭 → 이력·재고 자동 갱신 + 완료 후 화면의 확인형 재고 질문

**Independent Test**: 완료 원탭 후 이력 기록·재고 차감 확인, 확인 질문 응답이 재고 반영, 이 페이즈 전체를 제거해도 US1~US3 정상

### Tests for User Story 4 (RED)

- [X] T031 [P] [US4] RED: 재고 도메인 테스트 tests/unit/inventory.test.ts — 완료 시 차감, `expiresAt = purchasedAt + shelfLifeDays` 파생, 만료 항목 추천 근거 제외, 상태 전이(등록/갱신/제거) (FR-016, data-model.md)
- [X] T032 [P] [US4] RED: 통합 테스트 tests/integration/us4-complete.test.ts — US4 수용 시나리오 1~3 + 엣지: 완료 원탭→MealRecord 추가+RecommendationLog.accepted=true+재고 차감, 확인 질문 예/아니오→재고 반영, 같은 날 복수 완료 기록 허용, 수용 집계는 완료 원탭만 (SC-002)

### Implementation for User Story 4 (GREEN)

- [X] T033 [US4] 재고 도메인 구현 src/domain/inventory/index.ts (T031 통과)
- [X] T034 [US4] 완료 플로우 서비스 src/domain/complete.ts — 이력 추가·accepted 마킹·차감·잔량 재고 자동 등록(purchasedAt=완료일)·확인 질문 후보 산출·learned +2 갱신 (T032 통과)
- [X] T035 [US4] 완료 후 화면 src/ui/screens/CookComplete.tsx — RecipeDetail에 "요리 완료" 원탭 버튼 추가, 완료 후 화면에서만 확인형 질문 예/아니오 (홈 배치 금지 — FR-015)

**Checkpoint**: 지속 상태(이력·재고) 동작 — 확인형 UX는 독립 제거 가능

---

## Phase 7: User Story 5 - "오늘 지쳤어요" 컨디션 분기 (Priority: P3) [게이트 B2 — 실패 시 이 페이즈 드랍]

**Goal**: 원탭으로 15분·1구·설거지 최소 메뉴 전환, 당일만 유지·자정 해제

**Independent Test**: 버튼 원탭 → 조건 만족 메뉴로 전환·추가 질문 없음, 새로고침 유지, 자정 후 자동 해제

### Tests for User Story 5 (RED)

- [X] T036 [P] [US5] RED: 지침 모드 엔진 테스트 tests/unit/tired.test.ts — tiredMode 시 15분·설거지 최소 필터, 후보 없으면 20분 완화 + `tiredOverrunMinutes` 반환(화면 정직 표기용 — 일반 `relaxations`는 비노출) (엣지 케이스, contracts/engine.md)
- [X] T037 [P] [US5] RED: 통합 테스트 tests/integration/us5-tired.test.ts — US5 수용 시나리오 1~2: 원탭 전환(추가 질문 없음), 같은 날 재방문 유지, 자정 경과 시 일반 추천 복귀 (fake timer, FR-017)

### Implementation for User Story 5 (GREEN)

- [X] T038 [US5] tiredMode 필터·완화 구현 src/domain/engine/filters.ts·relax.ts 확장 + today.ts에 토글 저장(RecommendationLog.tiredMode) (T036·T037 통과)
- [X] T039 [US5] 홈의 "오늘 지쳤어요" 버튼 연결 src/ui/screens/Home.tsx — 원탭 즉시 추천 전환

**Checkpoint**: 실행 장벽 응답 완성 — 독립 제거 가능

---

## Phase 8: User Story 6 - 가격 이중 표시와 절약 누적 (Priority: P4) [게이트 A3' — 실패 시 표시 방식 재설계]

**Goal**: "이번 장보기 ○○원 → 이걸로 N끼" + 끼당 환산가 + 주간 배달 대비 절약 누적, 홈 비노출

**Independent Test**: 레시피 상세에 총액·N끼·끼당 환산가·"평균 시세 기준 추정(기준 연월)" 표시, 홈에 가격 없음, 완료 시 절약 누적

### Tests for User Story 6 (RED)

- [X] T040 [P] [US6] RED: 절약 계산 테스트 tests/unit/savings.test.ts — 총액→N끼 산출, 끼당 환산, `(DELIVERY_BASELINE − 끼당 재료비) × 완료 끼니` 주간 누적, 기준가 상수 ≤ 15,000 검증 (FR-018·020)
- [X] T041 [P] [US6] RED: 통합 테스트 tests/integration/us6-price.test.ts — US6 수용 시나리오 1~3: 상세 노출 데이터 조립, prices.json `asOf` 문구 포함, 홈 데이터에 가격 필드 부재

### Implementation for User Story 6 (GREEN)

- [X] T042 [US6] 절약 도메인 구현 src/domain/savings/index.ts — DELIVERY_BASELINE 상수(≤15,000원, 화면 명시용 export) (T040 통과)
- [X] T043 [US6] 가격 UI — src/ui/screens/RecipeDetail.tsx 가격 블록 + 절약 현황 화면 src/ui/screens/Savings.tsx (T041 통과, FR-019)

**Checkpoint**: 정직한 절약 회계 완성 — 독립 제거 가능

---

## Phase 9: User Story 7 - 연계 메뉴 제안 (Priority: P5) [게이트 A/B·V3 — 실패 시 이 페이즈 드랍]

**Goal**: 남은 재료를 취향 적합 후보 안에서 다음 끼니로 연결, 근거 문구 반영

**Independent Test**: 완료 후 남은 재료가 있는 상태에서 다음 추천이 취향 필터 통과 후보 중 그 재료 활용 메뉴를 우선하는지

### Tests for User Story 7 (RED)

- [X] T044 [P] [US7] RED: 연계 테스트 tests/unit/leftover.test.ts — 남은 재료 활용 메뉴가 취향 후보 내에서만 우선(취향 상위 원칙 유지), 근거 문구에 연계 이유 포함 (FR-022)

### Implementation for User Story 7 (GREEN)

- [X] T045 [US7] 연계 가중 구현 src/domain/engine/leftover.ts + recommend.ts·reason.ts 통합 (T044 통과)

**Checkpoint**: 전 스토리 완성

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T046 [P] PWA 오프라인 동작 확인(네트워크 차단 후 홈·레시피 열람) 및 모바일 성능 점검 — 홈 첫 표시 < 1초 (plan.md Performance Goals)
- [ ] T047 quickstart.md 수동 스모크 시나리오 8건 수행, 결과를 quickstart.md 하단에 기록
- [X] T048 [P] 전체 게이트 확인: `npm run typecheck` + `npm test` 전부 통과 + `npm run build` 정적 산출 확인 (출력 무결 — 경고 0)
- [X] T049 카탈로그 30개 투입 준비 — src/data/loader.ts 운영 모드 임계(30개·15분 비중·staple ≥7) 활성 전환 및 큐레이션 산출물 수용 절차를 contracts/catalog-schema.md에 추가 기록
- [X] T050 [P] SC-008 측정 가능성 — RED: tests/unit/metrics.test.ts(영상 재생률·완료 전환율 산출) → GREEN: 원본 영상 링크 탭 시 RecommendationLog.videoOpenedAt 기록(src/ui/screens/RecipeDetail.tsx → src/storage 경유) + 산출 함수 src/domain/metrics.ts

> SC-006(소진율)·SC-007(가드레일 지표)은 MVP에서 컨시어지 수동 측정으로 확정 — 앱 내 산출 로직은 범위 외 (spec.md SC-006 기준선 문구와 일치)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 즉시 시작 가능
- **Phase 2 (Foundational)**: Phase 1 완료 후 — **모든 스토리를 블록**
- **Phase 3~9 (US1~US7)**: Phase 2 완료 후. US2·US3은 US1과 병렬 가능. US4는 US1 완료 후(RecipeDetail·today.ts 접점), US5는 US1 완료 후(engine·Home 접점), US6은 US2·US4 완료 후(상세 화면·완료 이벤트 접점), US7은 US1·US4 완료 후(엔진·재고 접점)
- **Phase 10 (Polish)**: 원하는 스토리 완료 후

### User Story Dependencies

```text
Foundational ─┬─ US1 (P1) ─┬─ US5 (P3)
              │            ├─ US4 (P3) ─┬─ US6 (P4, US2도 필요)
              │            │            └─ US7 (P5)
              ├─ US2 (P2) ─┘ (US6에 합류)
              └─ US3 (P2)   (독립)
```

### Within Each User Story

- RED 테스트 작성 → **실패 확인** → GREEN 구현 → 전체 테스트 그린 유지 → 리팩터
- 도메인(순수 함수) → 서비스(저장소 배선) → UI 순서

### Parallel Opportunities

- Phase 2: T004·T005·T007·T008·T010 동시 착수 가능 (구현 T006·T009·T011은 각 RED 후)
- US1 RED 6건(T012~T017) 전부 병렬
- Foundational 완료 후 US1·US2(T023·T025)·US3(T027) 병렬 착수 가능
- 각 스토리의 [P] RED 테스트들은 항상 병렬

## Parallel Example: User Story 1

```bash
# US1의 RED 테스트를 동시에 작성:
Task: "엔진 필터 테스트 tests/unit/engine-filters.test.ts"
Task: "가중치·동점자 테스트 tests/unit/engine-weights.test.ts"
Task: "완화 순서 테스트 tests/unit/engine-relaxation.test.ts"
Task: "영양 추론 테스트 tests/unit/nutrition.test.ts"
Task: "근거 문구 테스트 tests/unit/reason.test.ts"
Task: "통합 테스트 tests/integration/us1-home.test.ts"
# 전부 실패 확인 후 T018~T022 구현 착수
```

## Implementation Strategy

### MVP First

1. Phase 1 → Phase 2 → Phase 3 (US1) 완료
2. **STOP & VALIDATE**: 픽스처 프로필로 US1 독립 검증 — 이 시점이 데모 가능한 MVP
3. US2 → US3 순서로 코어 완성 (게이트 A1 검증 대상 범위)

### Incremental Delivery

- US1~US3 = MVP 코어 — 단, 게이트 A1은 US1의 홈 모델 자체("추천 1개+대안"의 충분성)를 검증하므로 A1 실패 시 홈 UI만 "3택 1"로 전환한다 (엔진·온보딩은 재사용)
- US5·US6·US7은 게이트 판정 결과에 따라 페이즈 단위로 추가 또는 드랍. US4는 B1 실패 시 확인형 질문만 제거하고 완료 원탭·이력·차감은 유지한다 (수용 판정·절약 누적의 원천이므로) — 각 경계는 독립 제거 가능하도록 설계됨 (spec.md Assumptions)

## Notes

- 모든 구현 작업은 대응 RED 테스트의 실패를 먼저 확인한다 — 테스트가 즉시 통과하면 테스트를 의심할 것
- 커밋은 작업(또는 RED+GREEN 쌍) 단위
- 시간 의존 로직(자정·첫 주·7일 창)은 반드시 `now` 주입 + fake timer로 검증
