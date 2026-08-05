"use client";

import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export type IconButtonVariant = "ghost" | "circle-brand" | "circle-neutral";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  variant?: IconButtonVariant;
  /** sm(32) · md(40) · lg(48, 디자인 기본). */
  size?: IconButtonSize;
  /** 아이콘 전용 버튼이므로 접근성 레이블 필수. */
  "aria-label": string;
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const ICON_SIZES: Record<IconButtonSize, 20 | 24> = { sm: 20, md: 20, lg: 24 };

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: "text-text-default",
  "circle-brand": "bg-background-brand text-text-on-brand",
  "circle-neutral": "bg-background-inverse text-text-inverse",
};

/** B/IconButton — ghost·circle-brand·circle-neutral 원형 아이콘 버튼. */
export function IconButton({
  icon,
  variant = "ghost",
  size = "lg",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={ICON_SIZES[size]} />
    </button>
  );
}
