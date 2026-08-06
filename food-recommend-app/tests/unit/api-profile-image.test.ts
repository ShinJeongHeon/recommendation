import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { POST } from "@/app/api/profile/image/route";

const USER_ID = "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b";
const PREVIOUS_PATH = `${USER_ID}/99998888-7777-4666-8555-444433332222.png`;

/** BFF가 쓰는 supabase 서버 클라이언트의 네트워크 경계 모킹 */
function makeSupabase({
  session = true,
  previousImagePath = null as string | null,
  uploadError = null as Error | null,
  updateError = null as Error | null,
} = {}) {
  const single = vi.fn(async () => ({
    data: { image_path: previousImagePath },
    error: null,
  }));
  const selectEq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq: selectEq }));
  const updateEq = vi.fn(async () => ({ error: updateError }));
  const update = vi.fn(() => ({ eq: updateEq }));
  const upload = vi.fn(async () => ({ error: uploadError }));
  const remove = vi.fn(async () => ({ error: null }));
  return {
    client: {
      auth: {
        getClaims: vi.fn(async () => ({
          data: session ? { claims: { sub: USER_ID } } : null,
        })),
      },
      from: vi.fn(() => ({ select, update })),
      storage: { from: vi.fn(() => ({ upload, remove })) },
    },
    spies: { update, updateEq, upload, remove },
  };
}

function imageRequest(file?: File) {
  const form = new FormData();
  if (file) form.append("file", file);
  return new Request("http://localhost/api/profile/image", { method: "POST", body: form });
}

const jpegFile = new File([new Uint8Array(3)], "photo.jpg", { type: "image/jpeg" });

beforeEach(() => {
  mocks.createClient.mockReset();
});

describe("POST /api/profile/image — 이미지 업로드", () => {
  test("미로그인이면 401, storage를 호출하지 않는다", async () => {
    const { client } = makeSupabase({ session: false });
    mocks.createClient.mockResolvedValue(client);

    const res = await POST(imageRequest(jpegFile));

    expect(res.status).toBe(401);
    expect(client.storage.from).not.toHaveBeenCalled();
  });

  test("file 필드가 없으면 400", async () => {
    const { client } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    const res = await POST(imageRequest());

    expect(res.status).toBe(400);
  });

  test("허용 형식이 아니면 400 { error: 'type' }, upload 미호출", async () => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);
    const pdf = new File([new Uint8Array(3)], "doc.pdf", { type: "application/pdf" });

    const res = await POST(imageRequest(pdf));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "type" });
    expect(spies.upload).not.toHaveBeenCalled();
  });

  test("5MB 초과면 400 { error: 'size' }", async () => {
    const { client } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);
    const big = new File([new Uint8Array(5242881)], "big.jpg", { type: "image/jpeg" });

    const res = await POST(imageRequest(big));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "size" });
  });

  test("성공(기존 이미지 없음): 200 { imagePath }, 세션 사용자 경로로 업로드·갱신, remove 미호출", async () => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    const res = await POST(imageRequest(jpegFile));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.imagePath).toMatch(new RegExp(`^${USER_ID}/[0-9a-f-]{36}\\.jpg$`));
    expect(spies.upload).toHaveBeenCalledWith(body.imagePath, expect.any(File));
    expect(spies.update).toHaveBeenCalledWith({ image_path: body.imagePath });
    expect(spies.updateEq).toHaveBeenCalledWith("user_id", USER_ID);
    expect(spies.remove).not.toHaveBeenCalled();
  });

  test("성공(기존 이미지 있음): DB에서 읽은 이전 경로를 remove한다", async () => {
    const { client, spies } = makeSupabase({ previousImagePath: PREVIOUS_PATH });
    mocks.createClient.mockResolvedValue(client);

    const res = await POST(imageRequest(jpegFile));

    expect(res.status).toBe(200);
    expect(spies.remove).toHaveBeenCalledWith([PREVIOUS_PATH]);
  });

  test("storage 업로드 실패면 500 { error: 'upload' }", async () => {
    const { client } = makeSupabase({ uploadError: new Error("network down") });
    mocks.createClient.mockResolvedValue(client);

    const res = await POST(imageRequest(jpegFile));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "upload" });
  });

  test("image_path 갱신 실패면 500 { error: 'update' }, 원본 에러 미노출", async () => {
    const { client } = makeSupabase({ updateError: new Error("rls denied: secret detail") });
    mocks.createClient.mockResolvedValue(client);

    const res = await POST(imageRequest(jpegFile));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "update" });
  });
});
