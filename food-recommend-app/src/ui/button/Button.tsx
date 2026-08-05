"use client";

import type { ButtonHTMLAttributes } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { Spinner } from "@/ui/spinner/Spinner";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 좌측 아이콘을 스피너로 대체하고 레이블은 유지한다. 색상은 default 상태를 따른다. */
  loading?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-[10px] px-3",
  md: "h-10 gap-2 rounded-xl px-4",
  lg: "h-12 gap-2 rounded-[14px] px-5",
};

const ICON_SIZES: Record<ButtonSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

const VARIANT_CLASSES: Record<ButtonVariant, { enabled: string; disabled: string }> = {
  primary: {
    enabled: "bg-background-brand text-text-on-brand",
    disabled: "bg-background-disabled text-text-muted",
  },
  secondary: {
    enabled: "border border-border-default bg-background-surface text-text-default",
    disabled: "border border-border-default bg-background-disabled text-text-muted",
  },
  destructive: {
    enabled: "bg-background-error text-text-on-error",
    disabled: "bg-background-disabled text-text-muted",
  },
};

/** B/Button — primary·secondary·destructive × default·disabled·loading, sm(32)/md(40)/lg(48). */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const iconSize = ICON_SIZES[size];
  const colors = disabled ? VARIANT_CLASSES[variant].disabled : VARIANT_CLASSES[variant].enabled;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors typo-label-lg",
        disabled && "cursor-not-allowed",
        SIZE_CLASSES[size],
        colors,
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={iconSize} color="current" />
      ) : (
        leadingIcon && <Icon name={leadingIcon} size={iconSize} />
      )}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
    </button>
  );
}
