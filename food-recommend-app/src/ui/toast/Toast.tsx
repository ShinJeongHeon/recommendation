"use client";

import type { ReactNode } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  variant?: ToastVariant;
  children: ReactNode;
  /** 지정 시 우측에 닫기 아이콘(20px) 표시 */
  onClose?: () => void;
  className?: string;
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "bg-background-success text-text-on-success",
  error: "bg-background-error text-text-on-error",
  info: "bg-background-info text-text-on-info",
  warning: "bg-background-warning text-text-on-warning",
};

const VARIANT_ICONS: Record<ToastVariant, IconName> = {
  success: "circle-check",
  error: "error",
  info: "info",
  warning: "warning",
};

/** S/Toast — success·error·info·warning. 모바일: 화면 너비-마진, 데스크톱: 400px 고정은 사용처에서. */
export function Toast({ variant = "info", children, onClose, className }: ToastProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 shadow-[0_4px_16px_var(--color-shadow-strong)]",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <Icon name={VARIANT_ICONS[variant]} size={20} className="shrink-0" />
      <p className="min-w-0 flex-1 typo-body-md">{children}</p>
      {onClose && (
        <button type="button" aria-label="닫기" onClick={onClose} className="shrink-0">
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
