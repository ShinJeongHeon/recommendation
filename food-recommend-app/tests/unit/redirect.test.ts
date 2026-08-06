import { afterEach, describe, expect, test, vi } from "vitest";
import { externalOrigin, sanitizeNextPath } from "@/lib/redirect";

describe("sanitizeNextPath — 로그인 후 이동 경로는 같은 오리진 경로만 허용", () => {
  test.each([
    ["일반 경로", "/my", "/my"],
    ["루트", "/", "/"],
    ["쿼리 포함", "/recipes/1?tab=a", "/recipes/1?tab=a"],
  ])("%s는 그대로 통과한다", (_label, input, expected) => {
    expect(sanitizeNextPath(input)).toBe(expected);
  });

  test.each([
    ["null", null],
    ["빈 문자열", ""],
    ["절대 URL", "https://evil.com"],
    ["프로토콜 상대 URL", "//evil.com"],
    ["백슬래시 변형", "/\\evil.com"],
    ["슬래시 없이 시작", "my"],
  ])("%s는 '/'로 강제한다", (_label, input) => {
    expect(sanitizeNextPath(input)).toBe("/");
  });
});

describe("externalOrigin — 프록시 뒤 실제 외부 호스트 계산", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function requestWith(headers?: Record<string, string>) {
    return new Request("http://localhost:3000/api/auth/login", { headers });
  }

  test("개발 환경에서는 x-forwarded-host를 무시하고 요청 origin을 쓴다", () => {
    vi.stubEnv("NODE_ENV", "development");
    const req = requestWith({ "x-forwarded-host": "evil.example.com" });
    expect(externalOrigin(req, "http://localhost:3000")).toBe("http://localhost:3000");
  });

  test("프로덕션 + x-forwarded-host면 https://<호스트>를 쓴다", () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = requestWith({ "x-forwarded-host": "app.example.com" });
    expect(externalOrigin(req, "http://internal:3000")).toBe("https://app.example.com");
  });

  test("헤더가 없으면 요청 origin을 그대로 쓴다", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(externalOrigin(requestWith(), "https://app.example.com")).toBe(
      "https://app.example.com",
    );
  });
});
