# Implementation Plan: 프로필 이미지 업로드 및 변경

**Branch**: `002-profile-image-upload` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-profile-image-upload/spec.md`

## Summary

마이페이지 프로필 카드의 아바타 영역을 이미지 표시·업로드 진입점으로 확장한다.
사진은 Supabase Storage의 `profile-image` 버킷에 `<사용자ID>/<uuid v4>.<확장자>`
경로로 저장하고, 공개 URL의 앞부분(스토리지 주소~버킷)은 환경변수
`NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL`로, 뒷부분(버킷 이후 경로)은 기존
`profiles.image_path` 컬럼에 저장한다. 업로드·검증 로직은 순수 함수 +
주입 가능한 경계로 분리해 TDD로 구현한다(헌법 I·II).

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16.3 (App Router)

**Primary Dependencies**: `@supabase/supabase-js` 2.112.1, `@supabase/ssr` 0.12.4
(기존 `src/lib/supabase/{client,server}.ts` 재사용), Tailwind 4, 디자인 시스템
컴포넌트(`ProfileCard`, `FileUploader`, `Modal`, `Spinner` — 스토리북 SSOT)

**Storage**: Supabase Postgres `profiles.image_path`(기존 컬럼, nullable text) +
Supabase Storage `profile-image` 버킷(신규 — public, 5MB·이미지 MIME 제한)

**Testing**: Vitest 4 — `food-recommend-app/vitest.config.mts`의 node 프로젝트
(`tests/**/*.test.ts`, `src/**/*.test.ts`) + 스토리북 브라우저 테스트(UI 상태).
앱 `package.json`에 `test`·`typecheck` 스크립트 추가(헌법 V의 표준 명령 충족)

**Target Platform**: 웹(모던 브라우저), Next.js 서버 렌더 + 클라이언트 업로드

**Project Type**: web app — 기존 `food-recommend-app/` Next.js 앱에 기능 추가

**Performance Goals**: 5MB 이하 이미지 업로드~화면 반영 10초 이내(SC-002),
클라이언트에서 스토리지로 직접 업로드(서버 경유 없음)

**Constraints**: 이미지 축소·변환 없음(원본 그대로), 공개 버킷(서명 URL 없음),
소유권은 스토리지 RLS로 강제(`<사용자ID>/` 폴더 밖 쓰기·삭제 불가),
파일명은 `crypto.randomUUID()`(UUID v4, 추가 의존성 없음)

**Scale/Scope**: 사용자당 이미지 1장(교체 시 이전 파일 삭제), 화면 1곳(마이페이지),
새 테이블·새 페이지 없음

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 판정 | 근거 |
|------|------|------|
| I. TDD (NON-NEGOTIABLE) | PASS | 검증·경로 조합·URL 조합을 순수 함수로, 업로드 오케스트레이션을 주입 가능한 경계로 설계해 Red-Green-Refactor 사이클로 구현 가능. 구현 단계에서 `superpowers:test-driven-development` 스킬을 먼저 호출한다. |
| II. 정직한 테스트·모킹 규율 | PASS | 모킹은 네트워크 경계(Supabase storage·from 호출)에서만 `vi.fn`으로 수행. 순수 함수는 실제 실행하고 기대값은 손으로 도출한 리터럴 사용. |
| III. 검증이 빌드에 앞선다 | PASS (비적용) | PRD 게이트 표(A1·A3'·B1~B3·C1)는 추천 엔진 검증 대상 기능에 적용된다. 본 기능은 사용자가 명시적으로 지시한 계정 기본 기능으로 게이트 대상이 아니다. |
| IV. 단순성 (YAGNI) | PASS | 이미지 축소·크롭·삭제 기능 제외(스펙 확정). UUID는 내장 `crypto.randomUUID()` 사용 — 신규 의존성 0개. 요구된 환경변수 1개만 추가. |
| V. 완료 전 증거 | PASS | 앱에 `test`·`typecheck` 스크립트를 추가하고, 완료 판정 전 실제 실행·출력 확인. |

**Post-Phase 1 재확인**: 설계 산출물(연구·데이터 모델·계약)에 원칙 위반 요소
없음 — 신규 추상화는 `profile-image` 모듈 1개(순수 함수 + 경계 주입)로 최소.

## Project Structure

### Documentation (this feature)

```text
specs/002-profile-image-upload/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── storage.md       # 버킷·RLS 정책·경로·URL·환경변수 계약
│   └── profile-image-module.md  # 클라이언트 모듈·UI 계약
└── tasks.md             # Phase 2 output (/speckit-tasks — 이 명령에서 생성 안 함)
```

### Source Code (repository root)

```text
food-recommend-app/
├── .env.example                          # [수정] NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL 추가
├── package.json                          # [수정] test·typecheck 스크립트 추가
├── src/
│   ├── lib/
│   │   ├── supabase/{client,server}.ts   # [재사용] 기존 클라이언트
│   │   └── profile-image.ts              # [신규] 검증·경로·URL 순수 함수 + 업로드 오케스트레이터
│   ├── blocks/profile-card/
│   │   ├── ProfileCard.tsx               # [수정] 아바타 이미지 표시 + 업로드 진입점·모달
│   │   └── ProfileCard.stories.tsx       # [수정] 이미지 유무·업로드 중·에러 상태 스토리
│   └── app/(tabs)/my/
│       ├── page.tsx                      # [수정] profiles select에 image_path 추가
│       └── MyProfileCard.tsx             # [수정] 업로드 핸들러 연결(Supabase 경계 주입)
└── tests/
    └── unit/profile-image.test.ts        # [신규] 순수 함수·오케스트레이터 노드 테스트

supabase (원격 전용 마이그레이션 — MCP apply_migration)
└── profile_image_bucket                  # [신규] 버킷 생성 + storage.objects RLS 정책
```

**Structure Decision**: 기존 Next.js 앱(`food-recommend-app/`) 안에서 파일
수정·추가만으로 구현한다. 새 페이지·새 패키지 없음. DB 변경은 원격 전용
마이그레이션 1건(버킷 + 정책)이며 `profiles` 스키마는 변경하지 않는다.

## Complexity Tracking

위반 없음 — 해당 없음.
