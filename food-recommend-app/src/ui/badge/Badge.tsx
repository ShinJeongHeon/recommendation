import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "success" | "error" | "info" | "warning";
export type BadgeSize = "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** md(20) · lg(24), 좌우 패딩 8px */
  size?: BadgeSize;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-background-muted text-text-default",
  success: "bg-background-success text-text-on-success",
  error: "bg-background-error text-text-on-error",
  info: "bg-background-info text-text-on-info",
  warning: "bg-background-warning text-text-on-warning",
};

/** D/Badge — neutral·success·error·info·warning, 레이블 label-md 가운데 정렬. */
export function Badge({ variant = "neutral", size = "md", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 typo-label-md",
        size === "md" ? "h-5" : "h-6",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
