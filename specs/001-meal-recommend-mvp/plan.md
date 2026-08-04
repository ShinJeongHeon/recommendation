# Implementation Plan: 집밥 요리 추천 서비스 MVP

**Branch**: `001-meal-recommend-mvp` | **Date**: 2026-08-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-meal-recommend-mvp/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

1인 가구용 저녁 메뉴 추천 서비스의 MVP. 앱을 열면 질문 없이 오늘의 추천 1개 + 근거 한 줄을 보여주고(하루 고정), 1인분 현실 계량 레시피로 요리하게 한 뒤, 요리 완료 원탭으로 이력·재고를 자동 갱신한다. 기술 접근: **백엔드 없는 모바일 우선 PWA(TypeScript + React + Vite)**. 추천 엔진은 순수 함수 도메인 코어로 구현하고, 카탈로그 30개·제철·시세·보관기간 데이터는 정적 JSON으로 번들, 사용자 상태(취향·이력·재고)는 브라우저 로컬 저장소에 보관한다. 상세 근거는 [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 7.x (strict), 기존 리포 툴체인 유지 (`tsconfig.json`, `typecheck` 스크립트 존재)

**Primary Dependencies**: React 19, Vite 7 (개발 서버·번들), vite-plugin-pwa (설치형·오프라인). 그 외 런타임 의존성 최소화 — 추천 엔진·계산 로직은 의존성 없는 순수 TS

**Storage**: 브라우저 localStorage (버전 태그가 있는 JSON 스키마, 어댑터 계층으로 격리 — 데이터가 커지면 IndexedDB로 교체 가능). 서버·DB 없음

**Testing**: Vitest 4 (기존 설정 유지) — 도메인 코어 단위 테스트 + 시나리오(수용 기준) 통합 테스트, 자정 경계는 fake timer로 검증

**Target Platform**: 모바일 브라우저 우선(설치형 PWA), 데스크톱 브라우저 겸용

**Project Type**: single project — 클라이언트 단독 웹 앱 (백엔드 없음)

**Performance Goals**: 홈 첫 표시 < 1초(중저가 모바일 기준), 추천 계산 < 100ms(카탈로그 30~100개 규모에서 여유), 오프라인에서도 홈·레시피 열람 가능

**Constraints**: 서버 비용 0(정적 호스팅), 사용자 데이터는 기기 밖으로 나가지 않음(개인정보 이슈 최소화), 시세·제철 데이터는 월 단위 정적 갱신, 홈 화면 요소 3개 제한(추천 카드·근거·지쳤어요 버튼)

**Scale/Scope**: 단일 사용자 로컬 프로필, 레시피 30개(최대 100개), 화면 5개(온보딩·홈·레시피 상세·완료 후·절약 현황), FR 25개

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` 미작성 (템플릿만 존재) — 프로젝트 고유 게이트 없음. spec-kit 기본 원칙으로 대체 평가:

| 기본 게이트 | 판정 | 근거 |
|------------|------|------|
| 단순성 (최소 프로젝트 수) | PASS | 단일 프로젝트, 백엔드 없음, 런타임 의존성 3개 이내 |
| 테스트 우선 가능성 | PASS | 엔진·계산 로직을 순수 함수로 분리 — UI 없이 전 FR 검증 가능 |
| 관측 가능성 | PASS | 추천 기록 엔티티가 추천의 입력·기여 요소를 보존 — 지표(SC-001~008) 산출 가능 |
| 불필요한 추상화 금지 | PASS | 스토리지 어댑터 1겹만 허용(교체 대비), 그 외 직접 호출 |

**Post-Phase 1 재평가**: PASS 유지 — 설계 산출물이 추가 프로젝트·서버·외부 서비스를 도입하지 않음.

## Project Structure

### Documentation (this feature)

```text
specs/001-meal-recommend-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── catalog-schema.md    # 레시피 카탈로그 JSON 계약 (콘텐츠 큐레이션 파이프라인과의 접점)
│   ├── engine.md            # 추천 엔진 순수 함수 계약
│   └── storage-schema.md    # 로컬 저장소 키·스키마 계약
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── domain/              # 순수 TS 도메인 코어 (React·브라우저 API 의존 금지)
│   ├── engine/          # 추천 엔진: 필터 1~3, 가중치, 동점자, 완화 순서, 하루 고정
│   ├── measurement/     # 1인분 현실 계량 표기 규칙 (데이터 렌더링 보조)
│   ├── savings/         # 가격 이중 표시·배달 대비 절약 계산
│   ├── nutrition/       # 이력 기반 부족 영양소 추론
│   └── inventory/       # 재고 차감·유통기한 추정·소진율
├── data/                # 정적 JSON: catalog, seasonal, prices, storage-life + 로더·검증
├── storage/             # localStorage 어댑터 (프로필·이력·재고·추천 기록·절약 집계)
├── ui/                  # React 컴포넌트
│   ├── screens/         # Onboarding, Home, RecipeDetail, CookComplete, Savings
│   └── components/      # 추천 카드, 근거 한 줄, 태그 뱃지 등
└── app.tsx              # 라우팅·전역 상태 배선

tests/
├── unit/                # domain/* 단위 테스트 (필터·가중치·경계·계산식)
└── integration/         # 수용 시나리오 테스트 (US1~US7, 스토리지 포함)

public/                  # PWA 매니페스트·아이콘
```

**Structure Decision**: 단일 프로젝트 구조를 선택. 핵심은 `src/domain/`을 React·브라우저 API에서 완전히 격리된 순수 TS로 유지하는 것 — 게이트 실패 시 스토리 단위 제거(US4·US5·US6·US7)가 디렉터리 단위 삭제로 가능하도록 도메인 모듈을 스토리 경계에 맞춰 나눈다. 기존 리포의 `tsconfig.json`·`vitest.config.ts`·빈 `tests/`를 그대로 확장한다.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

위반 없음 — 해당 없음.
