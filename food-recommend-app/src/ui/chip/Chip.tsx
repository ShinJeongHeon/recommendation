"use client";

import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export type ChipSize = "sm" | "md";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** sm(24) · md(32) */
  size?: ChipSize;
  /** 좌측 아이콘(16px). 있으면 좌측 패딩이 절반으로 줄어든다. */
  icon?: IconName;
}

/** F/Chip — unselected·selected × default·disabled. */
export function Chip({
  selected = false,
  size = "md",
  icon,
  disabled,
  className,
  children,
  ...rest
}: ChipProps) {
  const sizeClasses =
    size === "sm"
      ? cn("h-6 gap-1.5 rounded-xl", icon ? "pl-1.5 pr-3" : "px-3")
      : cn("h-8 gap-1.5 rounded-2xl", icon ? "pl-2 pr-4" : "px-4");

  const colorClasses = selected
    ? disabled
      ? "border-border-strong bg-background-strong text-text-default"
      : "border-border-brand bg-background-brand text-text-on-brand"
    : disabled
      ? "border-border-default bg-background-disabled text-text-muted"
      : "border-border-default bg-background-surface text-text-subtle";

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap border transition-colors typo-label-lg",
        sizeClasses,
        colorClasses,
        disabled && "cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}
