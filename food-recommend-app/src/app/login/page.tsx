import Link from "next/link";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";

const FEATURES = [
  { icon: "timer", title: "1분 안에 오늘 저녁 확정", desc: "열면 추천 6개가 이미 와 있어요" },
  { icon: "scale", title: "1인분 현실 계량", desc: "밥숟갈·종이컵으로 알려드려요" },
  { icon: "wallet", title: "배달 대비 절약 기록", desc: "이번 달 얼마 아꼈는지 보여요" },
] as const;

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

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-background-brand text-text-on-brand">
          <Icon name="chef-hat" size={32} />
        </span>
        <span className="typo-label-lg text-text-brand">오늘의 집밥</span>
        <h1 className="typo-display-sm text-text-default">묻기 전에 먼저 고를게요</h1>
        <p className="typo-body-md text-text-subtle">
          냉장고 사정과 오늘 기력에 맞는 저녁 6개를 근거와 함께 보여드려요.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-center gap-3.5 rounded-card border border-border-default bg-background-surface p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background-brand-subtle text-text-brand">
              <Icon name={icon} size={20} />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="typo-label-lg text-text-default">{title}</span>
              <span className="typo-body-md text-text-subtle">{desc}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Link href="/">
          <Button variant="secondary" size="lg" fullWidth tabIndex={-1}>
            <GoogleLogo />
            Google로 계속하기
          </Button>
        </Link>
        <p className="text-center typo-label-md text-text-muted">
          계속하면 이용약관과 개인정보 처리방침에 동의하는 것으로 봅니다.
        </p>
      </div>
    </main>
  );
}
