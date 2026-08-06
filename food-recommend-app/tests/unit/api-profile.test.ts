import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { PATCH } from "@/app/api/profile/route";

const USER_ID = "5f0b2a1c-3d4e-4f60-8a7b-9c0d1e2f3a4b";

/** BFF가 쓰는 supabase 서버 클라이언트의 네트워크 경계 모킹 */
function makeSupabase({ session = true, updateError = null as Error | null } = {}) {
  const eq = vi.fn(async () => ({ error: updateError }));
  const update = vi.fn(() => ({ eq }));
  return {
    client: {
      auth: {
        getClaims: vi.fn(async () => ({
          data: session ? { claims: { sub: USER_ID } } : null,
        })),
      },
      from: vi.fn(() => ({ update })),
    },
    spies: { update, eq },
  };
}

function patchRequest(body: string) {
  return new Request("http://localhost/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

beforeEach(() => {
  mocks.createClient.mockReset();
});

describe("PATCH /api/profile — 이름 수정", () => {
  test("미로그인이면 401, DB를 호출하지 않는다", async () => {
    const { client } = makeSupabase({ session: false });
    mocks.createClient.mockResolvedValue(client);

    const res = await PATCH(patchRequest(JSON.stringify({ name: "소진" })));

    expect(res.status).toBe(401);
    expect(client.from).not.toHaveBeenCalled();
  });

  test("성공: trim된 이름으로 세션 사용자의 profiles.name을 갱신하고 204", async () => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    const res = await PATCH(patchRequest(JSON.stringify({ name: "  소진  " })));

    expect(res.status).toBe(204);
    expect(client.from).toHaveBeenCalledWith("profiles");
    expect(spies.update).toHaveBeenCalledWith({ name: "소진" });
    expect(spies.eq).toHaveBeenCalledWith("user_id", USER_ID);
  });

  test.each([
    ["name 누락", JSON.stringify({})],
    ["문자열이 아님", JSON.stringify({ name: 42 })],
    ["공백뿐", JSON.stringify({ name: "   " })],
    ["100자 초과", JSON.stringify({ name: "가".repeat(101) })],
    ["JSON 아님", "not-json"],
  ])("잘못된 입력(%s)이면 400, DB를 호출하지 않는다", async (_label, body) => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    const res = await PATCH(patchRequest(body));

    expect(res.status).toBe(400);
    expect(spies.update).not.toHaveBeenCalled();
  });

  test("Supabase 에러면 500, 원본 에러 메시지를 노출하지 않는다", async () => {
    const { client } = makeSupabase({ updateError: new Error("rls denied: secret detail") });
    mocks.createClient.mockResolvedValue(client);

    const res = await PATCH(patchRequest(JSON.stringify({ name: "소진" })));

    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("secret detail");
  });
});
