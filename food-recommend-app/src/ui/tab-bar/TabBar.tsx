"use client";

import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export interface TabBarItem {
  label: string;
  /** 아이콘 20px — 선택 시에도 아웃라인 유지, 컬러만 브랜드로 */
  icon: IconName;
}

export interface TabBarProps {
  items: TabBarItem[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
}

/** C/TabBar — 화면 하단 플로팅 필 내비게이션(반투명 서피스 + 그림자). */
export function TabBar({ items, activeIndex = 0, onSelect, className }: TabBarProps) {
  return (
    <div className={cn("w-full px-4 pb-3", className)}>
      <nav
        className="flex h-14 w-full items-center gap-0.5 rounded-[28px] border border-border-default bg-background-surface-translucent-subtle p-1.5 shadow-[0_4px_16px_var(--color-shadow-strong)]"
      >
        {items.map(({ label, icon }, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={label}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onSelect?.(index)}
              className={cn(
                "flex h-full flex-1 flex-col items-center justify-center gap-[3px] rounded-[22px]",
                active ? "bg-background-brand-subtle text-text-brand" : "text-text-placeholder",
              )}
            >
              <Icon name={icon} size={20} />
              <span className="typo-label-lg">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
