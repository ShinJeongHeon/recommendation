"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/ui/button/Button";
import { createClient } from "@/lib/supabase/client";

/* 구글 브랜드 로고 — 4색은 tokens의 --color-logo-google-*와 동일값(SVG fill 특성상 인라인) */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#4285f4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.2z"
      />
      <path
        fill="#34a853"
        d="M24 46c6 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.2 15.5 46 24 46z"
      />
      <path
        fill="#fbbc05"
        d="M11.8 28.3c-.5-1.3-.7-2.8-.7-4.3s.3-3 .7-4.3V14H4.5C3 17 2 20.4 2 24s1 7 2.5 10l7.3-5.7z"
      />
      <path
        fill="#ea4335"
        d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.5 2 8.1 6.8 4.5 14l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"
      />
    </svg>
  );
}

/** Supabase Auth 구글 OAuth 시작 버튼. 실패 시 /login?error=auth로 돌아와 에러 문구를 띄운다. */
export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const searchParams = useSearchParams();
  const showError = failed || searchParams.get("error") === "auth";

  async function handleLogin() {
    setLoading(true);
    setFailed(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/`,
      },
    });
    // 성공하면 구글로 리다이렉트되므로 여기 도달하는 건 실패했을 때뿐
    if (error) {
      setLoading(false);
      setFailed(true);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" size="lg" fullWidth loading={loading} onClick={handleLogin}>
        {!loading && <GoogleLogo />}
        Google로 계속하기
      </Button>
      {showError && (
        <p role="alert" className="text-center typo-label-md text-text-error">
          로그인에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
