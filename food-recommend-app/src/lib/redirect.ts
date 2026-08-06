/**
 * 로그인 후 이동(next) 경로는 같은 오리진 경로만 허용한다.
 * "//host"·"/\host"는 브라우저가 외부 URL로 해석하므로(오픈 리다이렉트) 차단.
 */
export function sanitizeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}

/** 프록시 뒤에서는 x-forwarded-host가 실제 외부 호스트다. 개발 환경은 요청 origin 그대로. */
export function externalOrigin(request: Request, origin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  return !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin;
}
