import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { GET } from "@/app/api/auth/login/route";

const AUTHORIZE_URL =
  "https://example.supabase.co/auth/v1/authorize?provider=google&code_challenge=abc";

/** BFF가 쓰는 supabase 서버 클라이언트의 네트워크 경계 모킹 */
function makeSupabase({ error = null as Error | null } = {}) {
  const signInWithOAuth = vi.fn(async () => ({
    data: { url: error ? null : AUTHORIZE_URL },
    error,
  }));
  return { client: { auth: { signInWithOAuth } }, spies: { signInWithOAuth } };
}

function loginRequest(query: string, headers?: Record<string, string>) {
  return new Request(`http://localhost:3000/api/auth/login${query}`, { headers });
}

beforeEach(() => {
  mocks.createClient.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/auth/login — 소셜 로그인 시작", () => {
  test("성공: 공급자 인증 URL로 303 리다이렉트, redirectTo는 콜백+next", async () => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    const res = await GET(loginRequest("?provider=google&next=%2Fmy"));

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(AUTHORIZE_URL);
    expect(spies.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback?next=%2Fmy" },
    });
  });

  test("next 생략 시 '/'로 보낸다", async () => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    await GET(loginRequest("?provider=google"));

    expect(spies.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback?next=%2F" },
    });
  });

  test.each([
    ["절대 URL", "https%3A%2F%2Fevil.com"],
    ["프로토콜 상대 URL", "%2F%2Fevil.com"],
  ])("외부로 나가는 next(%s)는 '/'로 강제한다 — 오픈 리다이렉트 방지", async (_label, next) => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    await GET(loginRequest(`?provider=google&next=${next}`));

    expect(spies.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback?next=%2F" },
    });
  });

  test("허용 목록에 없는 공급자면 /login?error=auth로 보내고 supabase를 호출하지 않는다", async () => {
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    const res = await GET(loginRequest("?provider=facebook"));

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=auth");
    expect(spies.signInWithOAuth).not.toHaveBeenCalled();
  });

  test("provider 누락이면 /login?error=auth", async () => {
    const { client } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    const res = await GET(loginRequest(""));

    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=auth");
  });

  test("signInWithOAuth 실패면 /login?error=auth", async () => {
    const { client } = makeSupabase({ error: new Error("provider not enabled") });
    mocks.createClient.mockResolvedValue(client);

    const res = await GET(loginRequest("?provider=google"));

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=auth");
  });

  test("프로덕션 + x-forwarded-host면 외부 호스트 기준으로 redirectTo를 만든다", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { client, spies } = makeSupabase();
    mocks.createClient.mockResolvedValue(client);

    await GET(loginRequest("?provider=google", { "x-forwarded-host": "app.example.com" }));

    expect(spies.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "https://app.example.com/auth/callback?next=%2F" },
    });
  });
});
