import { describe, expect, test, vi } from "vitest";
import {
  buildProfileImagePath,
  profileImageUrl,
  uploadProfileImage,
  validateProfileImageFile,
} from "../../src/lib/profile-image";

const USER_ID = "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b";
const UUID = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

describe("validateProfileImageFile", () => {
  test.each(["image/jpeg", "image/png", "image/webp"])(
    "허용 형식 %s 은 통과한다 (FR-002)",
    (mimeType) => {
      expect(validateProfileImageFile(mimeType, 1024)).toEqual({ ok: true });
    },
  );

  test("PDF는 type 사유로 거부한다", () => {
    expect(validateProfileImageFile("application/pdf", 1024)).toEqual({
      ok: false,
      reason: "type",
    });
  });

  test("허용 목록 밖의 이미지(GIF)도 type 사유로 거부한다", () => {
    expect(validateProfileImageFile("image/gif", 1024)).toEqual({
      ok: false,
      reason: "type",
    });
  });

  test("정확히 5MB(5,242,880바이트)는 허용한다 — 경계값", () => {
    expect(validateProfileImageFile("image/jpeg", 5242880)).toEqual({ ok: true });
  });

  test("5MB를 1바이트라도 넘으면 size 사유로 거부한다", () => {
    expect(validateProfileImageFile("image/jpeg", 5242881)).toEqual({
      ok: false,
      reason: "size",
    });
  });
});

describe("buildProfileImagePath", () => {
  test("JPEG는 <userId>/<uuid>.jpg 를 만든다 (FR-003)", () => {
    expect(buildProfileImagePath(USER_ID, UUID, "image/jpeg")).toBe(
      "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.jpg",
    );
  });

  test("PNG는 .png 확장자를 쓴다", () => {
    expect(buildProfileImagePath(USER_ID, UUID, "image/png")).toBe(
      "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.png",
    );
  });

  test("WebP는 .webp 확장자를 쓴다", () => {
    expect(buildProfileImagePath(USER_ID, UUID, "image/webp")).toBe(
      "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.webp",
    );
  });
});

describe("profileImageUrl", () => {
  const BASE = "https://example.supabase.co/storage/v1/object/public/profile-image";

  test("base와 path를 슬래시 하나로 잇는다 (FR-004)", () => {
    expect(profileImageUrl(BASE, "user-a/file-1.jpg")).toBe(
      "https://example.supabase.co/storage/v1/object/public/profile-image/user-a/file-1.jpg",
    );
  });

  test("imagePath가 null이면 null — 기본 아이콘 표시 (FR-006)", () => {
    expect(profileImageUrl(BASE, null)).toBeNull();
  });

  test("imagePath가 빈 문자열이어도 null", () => {
    expect(profileImageUrl(BASE, "")).toBeNull();
  });
});

// deps는 전부 네트워크 경계(Supabase storage·DB) — vi.fn 모킹 허용 범위
function makeDeps() {
  return {
    upload: vi.fn(async (): Promise<{ error: Error | null }> => ({ error: null })),
    updateImagePath: vi.fn(async (): Promise<{ error: Error | null }> => ({ error: null })),
    removeOld: vi.fn(async (): Promise<{ error: Error | null }> => ({ error: null })),
    randomUUID: vi.fn(() => UUID),
  };
}

const jpegFile = new File([new Uint8Array(3)], "photo.jpg", { type: "image/jpeg" });

describe("uploadProfileImage (US1)", () => {
  test("성공: 새 경로로 upload → updateImagePath 후 imagePath를 반환한다", async () => {
    const deps = makeDeps();
    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: jpegFile,
      previousImagePath: null,
    });

    expect(result).toEqual({
      ok: true,
      imagePath: "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.jpg",
    });
    expect(deps.upload).toHaveBeenCalledWith(
      "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.jpg",
      jpegFile,
    );
    expect(deps.updateImagePath).toHaveBeenCalledWith(
      "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.jpg",
    );
  });

  test("검증 실패(type): upload를 호출하지 않고 reason을 반환한다 (FR-002)", async () => {
    const deps = makeDeps();
    const pdfFile = new File([new Uint8Array(3)], "doc.pdf", { type: "application/pdf" });

    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: pdfFile,
      previousImagePath: null,
    });

    expect(result).toEqual({ ok: false, reason: "type" });
    expect(deps.upload).not.toHaveBeenCalled();
  });

  test("검증 실패(size): upload를 호출하지 않고 reason을 반환한다 (FR-002)", async () => {
    const deps = makeDeps();
    const bigFile = new File([new Uint8Array(5242881)], "big.jpg", { type: "image/jpeg" });

    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: bigFile,
      previousImagePath: null,
    });

    expect(result).toEqual({ ok: false, reason: "size" });
    expect(deps.upload).not.toHaveBeenCalled();
  });

  test("upload 실패: reason 'upload' 반환, updateImagePath 미호출 (FR-009)", async () => {
    const deps = makeDeps();
    deps.upload = vi.fn(async () => ({ error: new Error("network down") }));

    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: jpegFile,
      previousImagePath: null,
    });

    expect(result).toEqual({ ok: false, reason: "upload" });
    expect(deps.updateImagePath).not.toHaveBeenCalled();
  });

  test("updateImagePath 실패: reason 'update' 반환 (FR-009)", async () => {
    const deps = makeDeps();
    deps.updateImagePath = vi.fn(async () => ({ error: new Error("rls denied") }));

    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: jpegFile,
      previousImagePath: null,
    });

    expect(result).toEqual({ ok: false, reason: "update" });
  });

  test("previousImagePath가 null이면 removeOld를 호출하지 않는다", async () => {
    const deps = makeDeps();
    await uploadProfileImage(deps, {
      userId: USER_ID,
      file: jpegFile,
      previousImagePath: null,
    });

    expect(deps.removeOld).not.toHaveBeenCalled();
  });
});

describe("uploadProfileImage — 교체 (US2)", () => {
  const PREVIOUS_PATH = "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/99998888-7777-4666-8555-444433332222.png";

  test("previousImagePath가 있으면 updateImagePath 성공 후 removeOld(이전 경로)를 호출한다 (FR-011)", async () => {
    const deps = makeDeps();
    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: jpegFile,
      previousImagePath: PREVIOUS_PATH,
    });

    expect(result).toEqual({
      ok: true,
      imagePath: "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.jpg",
    });
    expect(deps.removeOld).toHaveBeenCalledWith(PREVIOUS_PATH);
    // 호출 순서: DB 갱신이 성공한 뒤에만 이전 파일을 지운다 (R5)
    expect(deps.updateImagePath.mock.invocationCallOrder[0]).toBeLessThan(
      deps.removeOld.mock.invocationCallOrder[0],
    );
  });

  test("removeOld가 실패해도 성공을 반환한다 — 고아 파일 허용 (FR-011)", async () => {
    const deps = makeDeps();
    deps.removeOld = vi.fn(async (): Promise<{ error: Error | null }> => ({
      error: new Error("object not found"),
    }));

    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: jpegFile,
      previousImagePath: PREVIOUS_PATH,
    });

    expect(result).toEqual({
      ok: true,
      imagePath: "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d.jpg",
    });
  });

  test("updateImagePath 실패 시 removeOld를 호출하지 않는다 — 기존 이미지 유지 (FR-009)", async () => {
    const deps = makeDeps();
    deps.updateImagePath = vi.fn(async (): Promise<{ error: Error | null }> => ({
      error: new Error("rls denied"),
    }));

    const result = await uploadProfileImage(deps, {
      userId: USER_ID,
      file: jpegFile,
      previousImagePath: PREVIOUS_PATH,
    });

    expect(result).toEqual({ ok: false, reason: "update" });
    expect(deps.removeOld).not.toHaveBeenCalled();
  });
});
