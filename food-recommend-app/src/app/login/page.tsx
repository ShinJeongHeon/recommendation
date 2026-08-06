import { Suspense } from "react";
import { Icon } from "@/foundation/icon/Icon";
import { GoogleLoginButton } from "./GoogleLoginButton";

const FEATURES = [
  { icon: "timer", title: "1분 안에 오늘 저녁 확정", desc: "열면 추천 6개가 이미 와 있어요" },
  { icon: "scale", title: "1인분 현실 계량", desc: "밥숟갈·종이컵으로 알려드려요" },
  { icon: "wallet", title: "배달 대비 절약 기록", desc: "이번 달 얼마 아꼈는지 보여요" },
] as const;

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
        <Suspense>
          <GoogleLoginButton />
        </Suspense>
        <p className="text-center typo-label-md text-text-muted">
          계속하면 이용약관과 개인정보 처리방침에 동의하는 것으로 봅니다.
        </p>
      </div>
    </main>
  );
}
