# Tasks: 프로필 이미지 업로드 및 변경

**Input**: Design documents from `/specs/002-profile-image-upload/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 필수 — 헌법 원칙 I(TDD, NON-NEGOTIABLE). 모든 구현 작업은
`superpowers:test-driven-development` 스킬을 먼저 호출하고 RED(실패 테스트 작성
→ **실패 직접 확인**) → GREEN(최소 구현 → 통과 확인) → REFACTOR 순서로
수행한다. RED 작업의 완료 조건은 "테스트가 예상한 사유로 실패하는 출력을
확인했다"이다.

**Organization**: 유저 스토리별 그룹 — 각 스토리는 독립적으로 구현·테스트 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능(다른 파일, 미완료 작업에 대한 의존 없음)
- **[Story]**: 소속 유저 스토리(US1, US2, US3)
- 모든 경로는 저장소 루트 기준. 앱 코드는 `food-recommend-app/` 하위.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 검증 명령·환경변수 준비

- [X] T001 [P] `food-recommend-app/package.json` scripts에 `"test": "vitest run"`, `"typecheck": "tsc --noEmit"` 추가 후 두 명령이 실제 실행되는지 확인 (research.md R8)
- [X] T002 [P] `food-recommend-app/.env.example`에 `NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL=` 키와 주석(형식: `…/storage/v1/object/public/profile-image`, 끝 슬래시 없음) 추가 (contracts/storage.md §4, FR-005) — 완료 후 사용자에게 `.env.local` 기입 요청을 보고

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 원격 스토리지 인프라 — 모든 스토리의 업로드가 이것에 의존

**⚠️ CRITICAL**: 이 페이즈 완료 전에는 어떤 유저 스토리의 실제 업로드도 동작하지 않는다

- [X] T003 원격 마이그레이션 `profile_image_bucket` 적용 — contracts/storage.md §1·§2의 버킷 insert(public·5MB·MIME 제약) + `storage.objects` RLS 정책 3개(INSERT/SELECT/DELETE, 본인 폴더 한정)를 MCP `apply_migration`으로 적용
- [X] T004 적용 확인 — MCP `list_migrations`에 항목 존재, MCP `get_advisors`(security) 신규 경고 없음. 경고 발생 시 즉시 수정 (quickstart.md 사전 조건 1)

**Checkpoint**: 버킷·정책 준비 완료 — 유저 스토리 구현 시작 가능

---

## Phase 3: User Story 1 - 프로필 이미지 최초 업로드 (Priority: P1) 🎯 MVP

**Goal**: 이미지가 없는 사용자가 마이페이지에서 사진을 올리면 아바타에 표시된다

**Independent Test**: 이미지 없는 계정으로 업로드 → 아바타 표시 + 스토리지·`image_path` 저장 형태 확인 (quickstart.md 시나리오 1·2·5·6)

### 라이브러리 모듈 (TDD 사이클 — 같은 테스트 파일이므로 순차)

- [X] T005 [US1] RED: `food-recommend-app/tests/unit/profile-image.test.ts` 신규 — `validateProfileImageFile` 실패 테스트(JPEG/PNG/WebP 허용, 그 외 `reason:"type"`, 5MB 초과 `reason:"size"`, 경계값 5MB 정확히 허용 — 기대값은 손으로 쓴 리터럴). `npm test` 실행해 "모듈 없음/함수 없음" 사유의 실패 확인
- [X] T006 [US1] GREEN: `food-recommend-app/src/lib/profile-image.ts` 신규 — `ALLOWED_MIME_TYPES`·`MAX_FILE_SIZE`·`validateProfileImageFile` 최소 구현 (contracts/profile-image-module.md §1) → 통과·전체 그린 확인
- [X] T007 [US1] RED: 같은 테스트 파일에 `buildProfileImagePath`(userId·uuid·MIME→`<userId>/<uuid>.<jpg|png|webp>`)·`profileImageUrl`(base+path 조합, path가 null/빈 값이면 null) 실패 테스트 추가 → 실패 확인
- [X] T008 [US1] GREEN: 두 함수 최소 구현 → 통과 확인
- [X] T009 [US1] RED: `uploadProfileImage` 오케스트레이터 실패 테스트 추가 — US1 범위: 검증 실패 시 `upload` 미호출·reason 반환, `upload` 실패 시 `{ok:false,reason:"upload"}`, `updateImagePath` 실패 시 `{ok:false,reason:"update"}`, 성공 시 `{ok:true,imagePath}`, `previousImagePath:null`이면 `removeOld` 미호출. deps는 `vi.fn`(네트워크 경계만 모킹, 헌법 II) → 실패 확인
- [X] T010 [US1] GREEN: `uploadProfileImage` 최소 구현(검증→upload→update 순서, removeOld는 이번 테스트가 요구하는 만큼만) → 통과·전체 그린 확인

### UI (디자인 SSOT — 스토리 먼저)

- [X] T011 [P] [US1] RED: `food-recommend-app/src/blocks/profile-card/ProfileCard.stories.tsx`에 신규 스토리 5종 추가 — 이미지 없음(기본 아이콘)/이미지 있음/업로드 중/검증 에러/업로드 실패 (contracts/profile-image-module.md §2) — 신규 prop 부재로 `npm run typecheck` 실패 확인
- [X] T012 [US1] GREEN: `food-recommend-app/src/blocks/profile-card/ProfileCard.tsx` 확장 — `imageUrl`·`onImageSelect` props, 아바타 클릭→"프로필 사진" `Modal`+`FileUploader`(accept=JPEG·PNG·WebP), 업로드 중 로딩·중복 차단(FR-008), 실패 시 에러 문구·기존 상태 유지(FR-009, 문구는 contracts §3) → typecheck·스토리북 테스트 그린 확인

### 페이지 연결

- [X] T013 [US1] `food-recommend-app/src/app/(tabs)/my/page.tsx`의 profiles select에 `image_path` 추가, `profileImageUrl()`로 조합한 값을 `MyPageView.tsx` 경유 `MyProfileCard`까지 전달 (props 확장)
- [X] T014 [US1] `food-recommend-app/src/app/(tabs)/my/MyProfileCard.tsx` — 브라우저 Supabase 클라이언트로 실제 deps(storage.upload / profiles.update / storage.remove / crypto.randomUUID) 구성해 `uploadProfileImage` 연결, 성공 시 `router.refresh()`(FR-007), `ProfileCard`에 `imageUrl`·`onImageSelect` 전달
- [ ] T015 [US1] 검증: `cd food-recommend-app && npm test && npm run typecheck` 그린 + quickstart.md 시나리오 1·2·5·6 수동 확인 (헌법 V — 출력 확인 후 완료 판정)

**Checkpoint**: US1 단독으로 완전 동작 — MVP

---

## Phase 4: User Story 2 - 프로필 이미지 변경 (Priority: P2)

**Goal**: 기존 사진이 있는 사용자가 새 사진으로 교체하면 즉시 반영되고 이전 파일은 정리된다

**Independent Test**: 이미지 있는 계정으로 교체 → 새 사진 표시·`image_path` 갱신·이전 오브젝트 삭제 (quickstart.md 시나리오 3)

- [X] T016 [US2] RED: `food-recommend-app/tests/unit/profile-image.test.ts`에 교체 케이스 실패 테스트 추가 — `previousImagePath` 있으면 `updateImagePath` **성공 후** `removeOld(이전 경로)` 호출(호출 순서 검증), `removeOld` 실패해도 `{ok:true}` 반환(FR-011), `updateImagePath` 실패 시 `removeOld` 미호출 → 실패 확인
- [X] T017 [US2] GREEN: `food-recommend-app/src/lib/profile-image.ts`의 `uploadProfileImage`에 이전 파일 삭제 로직 최소 구현 → 통과·전체 그린 확인
- [ ] T018 [US2] 검증: `npm test`·`npm run typecheck` 그린 + quickstart.md 시나리오 3 수동 확인(대시보드에서 이전 오브젝트 삭제 확인)

**Checkpoint**: US1·US2 모두 독립 동작

---

## Phase 5: User Story 3 - 저장된 이미지의 지속 표시 (Priority: P3)

**Goal**: 새로고침·재로그인 후에도 사진이 유지되고, 불러올 수 없으면 기본 아이콘으로 폴백한다

**Independent Test**: 업로드 계정으로 재방문 시 동일 사진, 깨진 `image_path` 계정에서 기본 아이콘 (quickstart.md 시나리오 4·8)

- [X] T019 [US3] RED: `food-recommend-app/src/blocks/profile-card/ProfileCard.stories.tsx`에 "이미지 로드 실패(깨진 URL) → 기본 아이콘 폴백" 스토리 추가(play 함수로 폴백 렌더 단언) → 스토리북 테스트 실패 확인
- [X] T020 [US3] GREEN: `food-recommend-app/src/blocks/profile-card/ProfileCard.tsx`의 `<img>`에 로드 실패 폴백(onError → 기본 아이콘) 최소 구현(FR-006) → 스토리북 테스트 그린 확인
- [ ] T021 [US3] 검증: `npm test`·`npm run typecheck` 그린 + quickstart.md 시나리오 4·8 수동 확인

**Checkpoint**: 모든 유저 스토리 독립 동작

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T022 quickstart.md 전체 재실행 — 시나리오 1~9(RLS 소유권 거부 포함)와 SC-001~SC-004 확인, 결과 기록
- [X] T023 리팩터(그린 유지): `food-recommend-app/src/lib/profile-image.ts`·`ProfileCard.tsx` 중복 제거·이름 정리, mutation check(현실적 변이마다 실패 테스트 존재 — 헌법 II) 수행, MCP `get_advisors` 재확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 의존 없음 — 즉시 시작
- **Phase 2 (Foundational)**: 독립 (Setup과 병렬 가능하나 T004는 T003 이후) — 실업로드가 있는 T015 이전에 완료 필요
- **Phase 3 (US1)**: 라이브러리·UI 작업은 T001만 선행하면 시작 가능; T015(실업로드 검증)는 Phase 2 완료 필요
- **Phase 4 (US2)**: T010(오케스트레이터 존재) 이후 시작 가능
- **Phase 5 (US3)**: T012(ProfileCard 확장) 이후 시작 가능
- **Phase 6 (Polish)**: 모든 스토리 완료 후

### 세부 의존

- T004 ← T003 · T006 ← T005 · T008 ← T007 · T010 ← T009 · T012 ← T011
- T013 ← T008 · T014 ← T010, T012, T013 · T015 ← T014, T004
- T016 ← T010 · T017 ← T016 · T019 ← T012 · T020 ← T019

### Parallel Opportunities

- T001 ∥ T002 ∥ T003 (서로 다른 파일·시스템)
- T011(스토리, UI 트랙) ∥ T005~T010(테스트+lib 트랙) — 파일이 겹치지 않음
- US2(T016~)와 US3(T019~)는 서로 다른 파일이라 병렬 가능

## Parallel Example: User Story 1

```bash
# 트랙 A (lib, TDD 순차): T005 → T006 → T007 → T008 → T009 → T010
# 트랙 B (UI, 병렬 시작 가능): T011 → T012
# 합류: T013 → T014 → T015
```

## Implementation Strategy

**MVP first**: Phase 1 → Phase 2 → Phase 3(US1)까지 완료하면 배포 가능한
증분(사진 업로드·표시). 여기서 멈추고 quickstart 시나리오 1·2로 검증한 뒤
US2(교체·정리) → US3(폴백 강화)를 순서대로 얹는다. 각 스토리 완료 시점마다
`npm test`·`npm run typecheck` 그린을 확인하고 논리 단위로 커밋한다.

## Notes

- 모든 GREEN 작업은 "테스트를 통과시키는 최소한"만 구현(헌법 IV) — 다음
  스토리의 동작을 미리 만들지 않는다 (예: T010에서 removeOld 완전 구현 금지,
  US2의 T016이 요구할 때 구현).
- RED에서 테스트가 즉시 통과하면 기존 동작을 테스트한 것 — 테스트를 수정한다.
- 실패 사유를 설명할 수 없으면 진행하지 않는다.
