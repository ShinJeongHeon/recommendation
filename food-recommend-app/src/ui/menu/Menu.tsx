"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export interface MenuProps {
  children: ReactNode;
  className?: string;
}

/**
 * D/Menu — 메뉴아이템을 담는 플로팅 컨테이너 (데스크톱: 메뉴 버튼 아래,
 * 모바일: BottomSheet 안에 MenuItem을 직접 배치).
 */
export function Menu({ children, className }: MenuProps) {
  return (
    <div
      role="menu"
      className={cn(
        "flex w-fit flex-col gap-0.5 rounded-[14px] border border-border-default bg-background-surface p-1.5 shadow-[0_8px_24px_var(--color-shadow-strong)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type MenuItemVariant = "default" | "destructive" | "inverse" | "success" | "warning";
export type MenuItemSize = "sm" | "md" | "lg";

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 좌측 아이콘. 제외 가능. */
  icon?: IconName;
  variant?: MenuItemVariant;
  /** 참조하는 메뉴의 사이즈를 따른다 — sm(32)·md(40)·lg(48). */
  size?: MenuItemSize;
}

const SIZE_CLASSES: Record<MenuItemSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-2.5",
  md: "h-10 gap-2 rounded-[10px] px-3",
  lg: "h-12 gap-2.5 rounded-xl px-3.5",
};

const MENU_ICON_SIZES: Record<MenuItemSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

const VARIANT_CLASSES: Record<MenuItemVariant, { container: string; icon: string; label: string }> = {
  default: { container: "bg-background-transparent", icon: "text-text-subtle", label: "text-text-default" },
  destructive: { container: "bg-background-transparent", icon: "text-text-error", label: "text-text-error" },
  inverse: { container: "bg-background-inverse", icon: "text-text-inverse", label: "text-text-inverse" },
  success: { container: "bg-background-success-subtle", icon: "text-text-success", label: "text-text-default" },
  warning: { container: "bg-background-warning-subtle", icon: "text-text-warning", label: "text-text-default" },
};

/** D/MenuItem — default·destructive(× disabled) + inverse·success·warning 톤. */
export function MenuItem({
  icon,
  variant = "default",
  size = "md",
  disabled,
  className,
  children,
  ...rest
}: MenuItemProps) {
  const colors = VARIANT_CLASSES[variant];
  const iconColor = disabled ? "text-text-muted" : colors.icon;
  const labelColor = disabled ? "text-text-muted" : colors.label;

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        "flex w-full items-center text-left transition-colors",
        SIZE_CLASSES[size],
        colors.container,
        disabled && "cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={MENU_ICON_SIZES[size]} className={cn("shrink-0", iconColor)} />}
      <span className={cn("min-w-0 flex-1 truncate typo-body-lg", labelColor)}>{children}</span>
    </button>
  );
}
