"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "@/ui/tab-bar/TabBar";

const TABS = [
  { label: "홈", icon: "home", href: "/" },
  { label: "냉장고", icon: "refrigerator", href: "/fridge" },
  { label: "기록", icon: "calendar", href: null },
  { label: "마이", icon: "user", href: "/my" },
] as const;

/** 라우팅 연결된 하단 탭바. 기록 탭은 미구현 화면이라 비활성. */
export function AppTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = TABS.findIndex(({ href }) => href === pathname);

  return (
    <TabBar
      items={TABS.map(({ label, icon }) => ({ label, icon }))}
      activeIndex={activeIndex === -1 ? 0 : activeIndex}
      onSelect={(index) => {
        const href = TABS[index].href;
        if (href) router.push(href);
      }}
    />
  );
}
