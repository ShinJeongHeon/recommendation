import { externalOrigin, sanitizeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

/** 대시보드에 등록된 OAuth 공급자만 허용한다. 새 공급자는 대시보드 설정 후 여기 추가. */
const ALLOWED_PROVIDERS = ["google"] as const;
type Provider = (typeof ALLOWED_PROVIDERS)[number];

/**
 * BFF: 소셜 로그인 시작 — 서버 클라이언트가 PKCE 검증 쿠키를 심고
 * 공급자 인증 URL(data.url)로 303 리다이렉트한다. 실패하면 /login?error=auth.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (!ALLOWED_PROVIDERS.includes(provider as Provider)) {
    return Response.redirect(new URL("/login?error=auth", origin), 303);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: `${externalOrigin(request, origin)}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    return Response.redirect(new URL("/login?error=auth", origin), 303);
  }
  return Response.redirect(data.url, 303);
}
