"use client";

import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export interface BottomNavItem {
  label: string;
  /** 미선택 아이콘 — 아웃라인 타입, 뉴트럴 컬러 */
  icon: IconName;
  /** 선택 아이콘 — 필 타입, 브랜드 컬러. 없으면 icon을 그대로 쓴다. */
  activeIcon?: IconName;
}

export interface BottomNavProps {
  /** 2~5개 균등 분배 */
  items: BottomNavItem[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  /** 아이콘 아래 레이블 표시 여부 */
  showLabels?: boolean;
  className?: string;
}

/** C/BottomNav — 높이 56, 상단 보더, 아이템 균등 분배. */
export function BottomNav({
  items,
  activeIndex = 0,
  onSelect,
  showLabels = true,
  className,
}: BottomNavProps) {
  return (
    <nav
      className={cn(
        "flex h-14 w-full items-center border-t border-border-default bg-background-surface",
        className,
      )}
    >
      {items.map(({ label, icon, activeIcon }, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={label}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect?.(index)}
            className={cn(
              "flex h-full flex-1 flex-col items-center justify-center gap-0.5",
              active ? "text-text-brand" : "text-text-subtle",
            )}
          >
            <Icon name={active ? (activeIcon ?? icon) : icon} size={24} />
            {showLabels && <span className="typo-label-md">{label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
