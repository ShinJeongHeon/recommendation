/** 허용 MIME → 확장자 매핑. 이 모듈이 단일 진실 원천. */
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** 5MB — 버킷 file_size_limit과 동일 값 (FR-002) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** FR-002. 실패 시 사유 코드 반환 — UI가 한국어 안내문으로 변환한다. */
export function validateProfileImageFile(
  mimeType: string,
  size: number,
): { ok: true } | { ok: false; reason: "type" | "size" } {
  if (!(mimeType in ALLOWED_MIME_TYPES)) return { ok: false, reason: "type" };
  if (size > MAX_FILE_SIZE) return { ok: false, reason: "size" };
  return { ok: true };
}

/** FR-003. `<userId>/<uuid>.<확장자>` — uuid는 인자로 주입(테스트 가능성). */
export function buildProfileImagePath(userId: string, uuid: string, mimeType: string): string {
  return `${userId}/${uuid}.${ALLOWED_MIME_TYPES[mimeType]}`;
}

/** FR-004·FR-006. imagePath가 null/빈 값이면 null 반환(기본 아이콘 표시). */
export function profileImageUrl(baseUrl: string, imagePath: string | null): string | null {
  if (!imagePath) return null;
  return `${baseUrl}/${imagePath}`;
}

/** 업로드 오케스트레이터가 주입받는 네트워크 경계 (Supabase storage·DB). */
export interface UploadDeps {
  upload(path: string, file: Blob): Promise<{ error: Error | null }>;
  updateImagePath(path: string): Promise<{ error: Error | null }>;
  removeOld(path: string): Promise<{ error: Error | null }>;
  randomUUID(): string;
}

export interface UploadInput {
  userId: string;
  file: File;
  previousImagePath: string | null;
}

export type UploadResult =
  | { ok: true; imagePath: string }
  | { ok: false; reason: "type" | "size" | "upload" | "update" };

/**
 * 흐름(R5): 검증 → upload → updateImagePath → (성공 시) removeOld(이전 경로).
 * - 검증 실패: upload 호출 없이 reason 반환 (FR-002)
 * - upload/update 실패: 에러 반환, 상태 불변 (FR-009)
 * - removeOld 실패: 무시하고 성공 반환 — 고아 파일 허용 (FR-011)
 */
export async function uploadProfileImage(
  deps: UploadDeps,
  input: UploadInput,
): Promise<UploadResult> {
  const valid = validateProfileImageFile(input.file.type, input.file.size);
  if (!valid.ok) return valid;

  const imagePath = buildProfileImagePath(input.userId, deps.randomUUID(), input.file.type);

  const uploaded = await deps.upload(imagePath, input.file);
  if (uploaded.error) return { ok: false, reason: "upload" };

  const updated = await deps.updateImagePath(imagePath);
  if (updated.error) return { ok: false, reason: "update" };

  if (input.previousImagePath) {
    await deps.removeOld(input.previousImagePath);
  }

  return { ok: true, imagePath };
}
