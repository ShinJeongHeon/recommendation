import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TopNavProps {
  title: string;
  /** 좌측 아이콘 버튼 슬롯 (IconButton ghost, 내부 아이콘 24px) */
  leading?: ReactNode;
  /** 우측 아이콘 버튼 슬롯 */
  trailing?: ReactNode;
  className?: string;
}

/** C/TopNav — 높이 56, 하단 보더, 제목 heading-sm. */
export function TopNav({ title, leading, trailing, className }: TopNavProps) {
  return (
    <header
      className={cn(
        "flex h-14 w-full items-center gap-2.5 border-b border-border-default bg-background-surface px-4",
        className,
      )}
    >
      {leading && <div className="flex size-12 shrink-0 items-center justify-center">{leading}</div>}
      <div className="flex h-full min-w-0 flex-1 items-center">
        <h1 className="truncate typo-heading-sm text-text-default">{title}</h1>
      </div>
      {trailing && <div className="flex size-12 shrink-0 items-center justify-center">{trailing}</div>}
    </header>
  );
}
