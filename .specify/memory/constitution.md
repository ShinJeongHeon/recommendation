<!--
Sync Impact Report
==================
Version change: (template) → 1.0.0 (initial ratification)
Modified principles: n/a (initial adoption — all 5 principles newly defined)
Added sections:
  - Core Principles (I~V)
  - 기술 및 테스트 환경 제약 (Technology & Test Environment Constraints)
  - 개발 워크플로 및 품질 게이트 (Development Workflow & Quality Gates)
  - Governance
Removed sections: none (template placeholders replaced)
Templates requiring updates: none checked in this pass — plan/spec/tasks
  templates read the constitution at runtime
Follow-up TODOs: none
-->

# food-recommend Constitution

집밥 요리 추천 서비스 (1인 가구 저녁 메뉴 추천 — PRD: `08-prd.md`) 프로젝트의
개발 헌법이다. 이 문서는 모든 명세·계획·구현 작업에 우선 적용된다.

## Core Principles

### I. 테스트 주도 개발 — TDD (NON-NEGOTIABLE)

모든 프로덕션 코드는 superpowers의 `/test-driven-development` 스킬
(`superpowers:test-driven-development`)을 **먼저 호출하고 그 절차를 그대로 따라**
작성해야 한다 (MUST). 이 스킬의 규칙이 곧 본 원칙의 규칙이다:

- **Iron Law: 실패하는 테스트 없이 프로덕션 코드를 작성하지 않는다.**
  테스트보다 먼저 작성된 코드는 참고용으로도 남기지 않고 삭제한 뒤 다시 시작한다.
- **Red-Green-Refactor 사이클을 엄격히 지킨다**:
  RED(실패 테스트 1개 작성) → **실패를 직접 실행으로 확인(필수, 생략 금지)** →
  GREEN(통과시키는 최소한의 코드) → **통과와 전체 테스트 그린을 확인(필수)** →
  REFACTOR(그린 유지하며 정리) → 반복.
- 테스트가 즉시 통과하면 기존 동작을 테스트한 것이다 — 테스트를 수정한다.
  실패 사유를 설명할 수 없으면 진행하지 않는다.
- 버그 수정은 반드시 버그를 재현하는 실패 테스트부터 시작한다.
- 예외(일회용 프로토타입·생성 코드·설정 파일)는 사용자의 명시적 승인이 있을 때만
  허용된다.
- 작업 완료 판정 전 스킬의 Verification Checklist 전 항목을 확인한다.

**근거**: 실패를 목격하지 않은 테스트는 올바른 것을 검증하는지 증명할 수 없다.
규칙의 문구를 어기는 것은 규칙의 정신을 어기는 것이다.

### II. 정직한 테스트와 모킹 규율

테스트 작성·수정과 모킹은 `/test-driven-development`의 참조 문서
`writing-good-tests.md`의 규칙을 그대로 따른다 (MUST):

- **모든 테스트는 자신이 잡아낼 "깨짐"을 명명할 수 있어야 한다.** 명명할 수
  없으면 관찰 가능한 동작 중심으로 재설계한다. 변경 감지기(상수 값·문구·내부
  구조 단언)는 금지한다.
- **기대값은 손으로 도출한 리터럴로 작성한다.** 테스트 대상 코드나 그 헬퍼로
  기대값을 계산하는 거울 단언은 금지한다.
- **실제 코드를 실행한다.** 모킹은 느리거나 외부인 수준(네트워크, 외부 API,
  시계 등)에서만 허용된다. 모킹 전에 실제 메서드의 부수효과를 파악하고,
  테스트가 의존하는 부수효과는 실제로 유지한다.
- **모의 객체 자체에 대한 단언은 금지한다.** 모의 응답은 실제 구조 전체를
  반영해야 한다 (부분 모킹 금지).
- **모킹 도구는 Vitest 내장 기능만 사용한다** (`vi.fn`, `vi.mock`,
  `vi.useFakeTimers`). 별도 모킹 라이브러리는 도입하지 않는다 — 내장 기능으로
  불가능한 사례가 실제로 발생할 때만 헌법 개정으로 재론한다.
- 테스트 전용 코드는 테스트 유틸리티에 둔다. 프로덕션 클래스에 테스트만 쓰는
  메서드를 추가하지 않는다.
- 테스트 파일 완성 시 mutation check(현실적 변이마다 최소 1개 테스트가 실패하는지)를
  수행한다.

**근거**: 모의 동작을 검증하는 테스트는 모의가 있으면 통과하고 없으면 실패할
뿐, 제품 코드에 대해 아무것도 말해주지 않는다.

### III. 검증이 빌드에 앞선다 (Validation Before Build)

- `08-prd.md`의 게이트(A1, A3', B1, B2, B3, C1)를 통과한 기능만 빌드한다 (MUST).
  게이트 표가 기능 착수 여부의 단일 진실 원천이다.
- 킬 기준이 발동하면 해당 기능의 빌드를 취소하고 PRD와 관련 명세를 갱신한다.
- Tier 3 명시적 제외 항목(홈 화면 내 확인형 질문, 가격의 홈 노출)은 게이트
  통과와 무관하게 제외를 유지한다.

**근거**: 이 프로젝트의 최대 리스크(B1)는 해자와 같은 곳에 있다. 증명되지 않은
가정 위에 쌓은 코드는 부채다.

### IV. 단순성 (Simplicity / YAGNI)

- 테스트를 통과시키는 최소한의 코드만 작성한다. 요구되지 않은 옵션·설정·추상화를
  선제 도입하지 않는다 (MUST NOT).
- MVP 범위를 지킨다: 1인분만 다룬다. 2인분 환산·장보기 리스트 등 이후 버전
  항목을 미리 만들지 않는다.
- 데이터 테이블(KAMIS 시세, 재료별 보관 기간, 제철 식재료)은 주입 가능한 순수
  데이터 + 순수 함수로 구현해, 외부 데이터 없이 테스트할 수 있어야 한다.

**근거**: 검증 전 단계의 프로젝트에서 과잉 구현은 곧 폐기 비용이다.

### V. 완료 전 증거 (Verification Before Completion)

- "완료·통과·수정됨"을 주장하기 전에 `npm test`와 `npm run typecheck`를 실제로
  실행하고 출력을 확인해야 한다 (MUST). 주장보다 증거가 먼저다.
- 테스트 출력은 깨끗해야 한다 — 에러·경고가 없어야 하며, 다른 테스트가 깨졌으면
  지금 고친다.
- 실패한 테스트가 있는 상태로 작업을 완료로 표시하지 않는다.

**근거**: 실행하지 않은 검증은 검증이 아니다.

## 기술 및 테스트 환경 제약

- **언어**: TypeScript (strict 모드, `noUncheckedIndexedAccess` 포함).
- **런타임**: Node.js 24+, ESM (`"type": "module"`).
- **테스트 프레임워크**: Vitest 4 (환경: node). 이 선택은 로직 중심 추천 엔진과
  웹 MVP 확장을 함께 감당하기 위한 것이다.
- **테스트 위치**: `tests/**/*.test.ts` 및 `src/**/*.test.ts`.
- **표준 명령**:
  - `npm test` — 전체 1회 실행 (완료 판정용)
  - `npm run test:watch` — TDD 사이클 중 감시 실행
  - `npm run typecheck` — 타입 검사 (`tsc --noEmit`)
- **모킹 정책**: 원칙 II를 따른다. 시간·난수·외부 API에 의존하는 코드는 의존성
  주입으로 설계해 실제 코드를 그대로 테스트할 수 있게 한다.

## 개발 워크플로 및 품질 게이트

- **Spec Kit 흐름을 따른다**: `/speckit-specify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement`. 구현 단계의 모든 작업은 원칙 I의
  TDD 사이클로 수행한다.
- **작업 단위 완료 조건**: 해당 동작의 테스트가 먼저 실패했고, 최소 구현으로
  통과했으며, 전체 테스트와 타입 검사가 그린이다 (원칙 V).
- **Red Flags 발견 시 즉시 중단·재시작**: 테스트보다 먼저 작성된 코드, 즉시
  통과하는 새 테스트, "이번만 건너뛰자"는 합리화, "이미 수동으로 테스트했다"
  등 — `/test-driven-development`의 Red Flags 목록 전체가 적용된다. 해당 코드는
  삭제하고 TDD로 다시 시작한다.
- **리뷰 게이트**: 코드 리뷰는 원칙 준수(특히 I·II) 위반을 차단 사유로 다룬다.

## Governance

- 이 헌법은 프로젝트의 다른 모든 관행·문서보다 우선한다. 충돌 시 헌법이 이긴다.
- **개정 절차**: 개정은 이 문서를 수정하고 상단 Sync Impact Report를 갱신하는
  방식으로만 이루어진다. 개정 사유를 기록한다.
- **버전 정책 (semver)**:
  - MAJOR: 원칙의 제거 또는 하위 호환을 깨는 재정의
  - MINOR: 원칙·섹션의 추가 또는 실질적 확장
  - PATCH: 문구 명료화·오타 등 비의미적 수정
- **준수 검토**: 모든 PR·리뷰·작업 완료 판정에서 헌법 준수를 확인한다. 복잡성
  추가는 정당화가 필요하다. 런타임 개발 지침은 superpowers 스킬 문서
  (`test-driven-development`, `verification-before-completion`)를 참조한다.

**Version**: 1.0.0 | **Ratified**: 2026-08-04 | **Last Amended**: 2026-08-04
