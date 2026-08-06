import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 만료된 Auth 토큰을 갱신해 요청·응답 쿠키에 다시 써 주는 proxy 헬퍼.
 * Server Component는 쿠키를 쓸 수 없으므로 세션 갱신은 여기서만 일어난다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          // 세션이 담긴 응답이 CDN에 캐시되지 않도록 Cache-Control 등을 그대로 반영
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // 주의: createServerClient와 getClaims() 사이에 다른 로직을 넣으면
  // 토큰 갱신 경합으로 사용자가 무작위로 로그아웃될 수 있다.
  const { data } = await supabase.auth.getClaims();

  // 이미 로그인한 사용자가 /login에 오면 홈으로 보낸다
  if (data?.claims && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
