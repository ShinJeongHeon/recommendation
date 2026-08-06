import { NextResponse } from "next/server";
import { externalOrigin, sanitizeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

/** 구글 OAuth 콜백 — PKCE code를 세션으로 교환한 뒤 원래 가려던 곳으로 보낸다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${externalOrigin(request, origin)}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
