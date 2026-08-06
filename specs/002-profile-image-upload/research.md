# Research: 프로필 이미지 업로드 및 변경

**Date**: 2026-08-06 | **Plan**: [plan.md](./plan.md)

사전 확인: Supabase 변경 로그(2026년분)를 스캔한 결과 Storage(버킷·업로드
API·`storage.objects` RLS·공개 URL), supabase-js storage 메서드, `@supabase/ssr`
관련 breaking change 없음. 현행 문서 기준으로 아래 결정을 확정한다.

## R1. UUID v4 파일명 생성

- **Decision**: 브라우저 내장 `crypto.randomUUID()` 사용.
- **Rationale**: UUID v4를 표준으로 생성하며 모든 대상 브라우저(secure
  context)에서 지원. 신규 의존성 0개(헌법 IV).
- **Alternatives considered**: `uuid` npm 패키지 — 동일 결과에 의존성만 추가라
  기각.

## R2. 버킷 생성·서버측 제약

- **Decision**: 원격 마이그레이션 SQL로 `storage.buckets`에 insert:
  `public = true`, `file_size_limit = 5MB`, `allowed_mime_types =
  {image/jpeg, image/png, image/webp}`. 클라이언트 검증(FR-002)과 별개로
  서버에서도 형식·용량을 이중 강제.
- **Rationale**: 공식 문서(Creating Buckets — Restricting uploads)가 버킷
  수준 제약을 권장. SQL 방식은 대시보드 수동 생성과 달리 재현 가능하고,
  이 프로젝트의 기존 패턴(원격 전용 마이그레이션, MCP `apply_migration`)과
  일치.
- **Alternatives considered**: 대시보드 수동 생성(재현성 없음 — 기각),
  런타임 `storage.createBucket()`(admin 권한이 앱에 없음 — 기각).

## R3. 스토리지 RLS 정책 (소유권 강제)

- **Decision**: `storage.objects`에 `authenticated` 대상 정책 3개 —
  INSERT(`with check`), SELECT(`using`), DELETE(`using`) — 모두 조건은
  `bucket_id = 'profile-image' AND (storage.foldername(name))[1] =
  (select auth.uid())::text`. UPDATE 정책은 만들지 않는다(업서트 미사용 —
  교체는 새 UUID로 INSERT 후 이전 파일 DELETE).
- **Rationale**: 공식 헬퍼 `storage.foldername(name)[1]`이 첫 폴더명을
  반환하므로 폴더명=사용자ID 패턴으로 소유권을 DB 수준에서 강제(스펙
  Clarification 1, FR-010). supabase 스킬 체크리스트 준수: `TO authenticated`
  + 소유권 조건 결합, `auth.uid()`는 `(select ...)` 래핑. 공개 버킷의 공개
  URL 읽기는 RLS를 타지 않으므로 anon SELECT 정책은 불필요; authenticated
  SELECT는 클라이언트의 remove/list 경로가 대상 행을 읽을 수 있게 하기 위해
  추가.
- **Alternatives considered**: `owner` 컬럼 기반 정책(경로 기반보다 이전
  파일 정리·검증이 불투명 — 기각), UPDATE 포함 업서트 방식(이전 파일
  삭제가 어차피 필요해 이점 없음 — 기각).

## R4. URL 분리 저장·조합

- **Decision**: 환경변수 `NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL`에 공개 URL
  앞부분(`https://<프로젝트>.supabase.co/storage/v1/object/public/profile-image`,
  끝 슬래시 없음)을 저장. `profiles.image_path`에는 뒷부분
  (`<사용자ID>/<uuid>.<확장자>`)만 저장. 표시 URL은
  `${BASE_URL}/${image_path}`로 조합.
- **Rationale**: 사용자 명시 요구. 클라이언트 컴포넌트에서 쓰므로
  `NEXT_PUBLIC_` 접두사 필수. 값은 사용자가 `.env.local`에 기입(FR-005).
- **Alternatives considered**: `NEXT_PUBLIC_SUPABASE_URL`에서 파생 조합 —
  환경변수 1개를 아끼지만 사용자가 앞부분의 독립 관리(추후 CDN·커스텀
  도메인 교체 여지)를 명시 요구해 기각. 런타임 `getPublicUrl()` 호출 —
  동일 이유로 기각.

## R5. 업로드 실행 위치·흐름

- **Decision**: 클라이언트 컴포넌트에서 브라우저 Supabase 클라이언트로
  직접 업로드. 흐름: 파일 검증(순수 함수) → `storage.upload(newPath, file)`
  → `profiles.update({ image_path })` → 이전 파일 `storage.remove([oldPath])`
  (실패 무시, FR-011) → `router.refresh()`.
- **Rationale**: 기존 `MyProfileCard`의 이름 저장 패턴(클라이언트 직접
  update + refresh)과 일치. 파일을 Next 서버로 경유시키지 않아 단순하고
  빠름(SC-002). RLS가 서버측 안전망(R3).
- **순서 근거**: DB 갱신 성공 후에만 이전 파일을 지운다 — 갱신 실패 시
  기존 이미지가 유지되어야 하므로(에지 케이스: 업로드 성공+갱신 실패 →
  고아 파일 허용, 사용자 상태는 불변).
- **Alternatives considered**: Server Action 경유 업로드(파일 전송 2회,
  이점 없음 — 기각), Edge Function(범위 과잉 — 기각).

## R6. 검증·조합 로직의 테스트 가능 설계

- **Decision**: `src/lib/profile-image.ts`에 순수 함수
  `validateProfileImageFile(type, size)`, `buildProfileImagePath(userId,
  uuid, mimeType)`, `profileImageUrl(baseUrl, imagePath)`를 두고, 업로드
  오케스트레이터 `uploadProfileImage(deps, input)`는 storage·db 경계를
  인자로 주입받는다.
- **Rationale**: 헌법 II — 실제 코드를 실행하는 노드 테스트가 가능해지고,
  모킹은 주입된 경계(네트워크)에서만 `vi.fn`으로 수행. 난수(uuid)도 주입
  가능해 기대값을 리터럴로 단언할 수 있다.
- **Alternatives considered**: 컴포넌트 내 인라인 로직 — 브라우저 테스트
  없이는 검증 불가, 헌법 II 위반 소지로 기각.

## R7. UI 구성 (디자인 SSOT 준수)

- **Decision**: `ProfileCard`를 확장 — 아바타 영역이 `imageUrl` 있으면
  `<img>`(로드 실패 시 기본 아이콘 폴백, FR-006), 없으면 기존 셰프 모자
  아이콘. 아바타 클릭(또는 카메라 오버레이 버튼) → 모달에 기존
  `FileUploader`(DS 컴포넌트, `accept="image/jpeg,image/png,image/webp"`)
  배치 → 선택 즉시 업로드. 업로드 중 `Spinner`/로딩 상태·중복 방지(FR-008),
  실패 시 모달 내 에러 문구(FR-009). 새 상태는 스토리로 먼저 추가.
- **Rationale**: 스토리북 SSOT 규칙 — `FileUploader`·`Modal`·`Spinner`가
  이미 DS에 존재하므로 재사용. 이름 수정 모달과 동일한 상호작용 패턴이라
  일관성 유지. SC-001(3회 이하 인터랙션: 아바타 클릭 → 파일 선택 → 완료)
  충족.
- **Alternatives considered**: 모달 없이 아바타 클릭 즉시 파일 선택 창 —
  인터랙션은 1회 줄지만 에러·로딩 상태를 보여줄 자리가 없어 기각(FR-008·
  FR-009 표시 요구).

## R8. 테스트·검증 명령 정비

- **Decision**: `food-recommend-app/package.json`에 `"test": "vitest run"`,
  `"typecheck": "tsc --noEmit"` 스크립트 추가. 노드 테스트는
  `tests/unit/profile-image.test.ts`(vitest.config의 기존 include 패턴에
  부합), UI 상태는 스토리북 스토리(기존 storybook 브라우저 프로젝트가
  자동 수행).
- **Rationale**: 헌법 V의 표준 명령(`npm test`, `npm run typecheck`)이 앱
  워크스페이스에 없으면 완료 판정 증거를 만들 수 없다.
- **Alternatives considered**: 루트 프로젝트 테스트에 편입 — 앱 전용
  tsconfig·경로 별칭과 충돌, 기각.
