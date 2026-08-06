# Contract: profile-image 모듈 · UI

**Plan**: [../plan.md](../plan.md) | **Storage 계약**: [storage.md](./storage.md)

## 1. `src/lib/profile-image.ts` (신규 모듈)

순수 함수 — 노드 Vitest로 실제 실행 테스트(헌법 II):

```ts
/** 허용 MIME·확장자 매핑. 이 모듈이 단일 진실 원천. */
ALLOWED_MIME_TYPES: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
MAX_FILE_SIZE: 5 * 1024 * 1024  // 5MB

/** FR-002. 실패 시 사유 코드 반환 — UI가 한국어 안내문으로 변환. */
validateProfileImageFile(mimeType: string, size: number):
  { ok: true } | { ok: false; reason: "type" | "size" }

/** FR-003. `<userId>/<uuid>.<확장자>` — uuid는 인자로 주입(테스트 가능성). */
buildProfileImagePath(userId: string, uuid: string, mimeType: string): string

/** FR-004·FR-006. imagePath가 null/빈 값이면 null 반환(기본 아이콘 표시). */
profileImageUrl(baseUrl: string, imagePath: string | null): string | null
```

업로드 오케스트레이터 — storage·db 경계를 주입받아 순서·실패 처리를 검증:

```ts
interface UploadDeps {
  upload(path: string, file: Blob): Promise<{ error: Error | null }>
  updateImagePath(path: string): Promise<{ error: Error | null }>
  removeOld(path: string): Promise<{ error: Error | null }>  // 실패 무시 대상
  randomUUID(): string
}

/**
 * 흐름(R5): 검증 → upload → updateImagePath → (성공 시) removeOld(이전 경로).
 * - 검증 실패: upload 호출 없이 reason 반환 (FR-002)
 * - upload/update 실패: 에러 반환, 상태 불변 (FR-009)
 * - removeOld 실패: 무시하고 성공 반환 (FR-011)
 */
uploadProfileImage(deps: UploadDeps, input: {
  userId: string; file: File; previousImagePath: string | null
}): Promise<{ ok: true; imagePath: string } | { ok: false; reason: "type" | "size" | "upload" | "update" }>
```

## 2. UI 계약

### ProfileCard (`src/blocks/profile-card/ProfileCard.tsx` — 확장)

| Prop (추가) | 타입 | 동작 |
|-------------|------|------|
| `imageUrl?` | `string \| null` | 있으면 아바타에 `<img>` 표시, 로드 실패 시 기본 아이콘 폴백(FR-006). 없으면 기존 셰프 모자 아이콘 |
| `onImageSelect?` | `(file: File) => Promise<void>` | 지정 시 아바타에 업로드 진입점 노출. reject되면 모달에 에러 문구 표시 |

동작(R7): 아바타 클릭 → "프로필 사진" 모달(`Modal` + `FileUploader`,
`accept="image/jpeg,image/png,image/webp"`) → 파일 선택 즉시 `onImageSelect`
호출 → 진행 중 로딩 표시·중복 차단(FR-008) → 성공 시 모달 닫힘, 실패 시
에러 문구·기존 상태 유지(FR-009). 기존 이름 수정 모달 동작은 불변.

스토리 추가(디자인 SSOT): 이미지 없음 / 이미지 있음 / 업로드 중 / 검증 에러
/ 업로드 실패.

### MyProfileCard · page.tsx (`src/app/(tabs)/my/` — 연결)

- `page.tsx`: `profiles` select에 `image_path` 추가, `profileImageUrl()`로
  조합한 URL을 `MyPageView` → `MyProfileCard`에 전달.
- `MyProfileCard`: `uploadProfileImage`에 브라우저 Supabase 클라이언트로
  만든 실제 deps(storage.upload / from("profiles").update / storage.remove /
  crypto.randomUUID)를 주입하고, 성공 시 `router.refresh()` (FR-007 — 기존
  이름 저장 패턴과 동일).

## 3. 에러 문구 (UI 표시 규약)

| reason | 문구 |
|--------|------|
| `type` | "JPG·PNG·WebP 이미지만 올릴 수 있어요." |
| `size` | "5MB 이하 이미지만 올릴 수 있어요." |
| `upload` / `update` | "업로드에 실패했어요. 잠시 후 다시 시도해 주세요." |
