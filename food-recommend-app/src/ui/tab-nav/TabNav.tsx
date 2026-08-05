"use client";

import { cn } from "@/lib/cn";

export interface TabNavProps {
  /** 2개 이상 균등 분배 */
  tabs: string[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
}

/** C/TabNav — 높이 48, 선택 탭 하단 2px 인디케이터. */
export function TabNav({ tabs, activeIndex = 0, onSelect, className }: TabNavProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex h-12 w-full border-b border-border-default bg-background-surface",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect?.(index)}
            className="flex h-full flex-1 flex-col"
          >
            <span
              className={cn(
                "flex w-full flex-1 items-center justify-center typo-label-lg",
                active ? "text-text-brand" : "text-text-subtle",
              )}
            >
              {tab}
            </span>
            <span
              data-slot="indicator"
              className={cn("h-0.5 w-full", active ? "bg-background-brand" : "bg-transparent")}
            />
          </button>
        );
      })}
    </div>
  );
}
