import type { ReactNode } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export type EmptyVariant = "default" | "inverse" | "success" | "warning";

export interface EmptyProps {
  variant?: EmptyVariant;
  /** 비주얼 아이콘(72 원형 안 32px). visual과 함께 주면 visual이 우선. */
  icon?: IconName;
  /** 아이콘 대신 쓸 커스텀 비주얼(그림 등) */
  visual?: ReactNode;
  title: string;
  description?: string;
  /** 버튼 primary 타입 1개 권장 */
  primaryAction?: ReactNode;
  /** 버튼 secondary 타입 1개 권장 */
  secondaryAction?: ReactNode;
  className?: string;
}

const CONTAINER_CLASSES: Record<EmptyVariant, string> = {
  default: "",
  inverse: "rounded-card bg-background-inverse",
  success: "rounded-card border border-border-success-subtle bg-background-success-subtle",
  warning: "rounded-card border border-border-warning-subtle bg-background-warning-subtle",
};

/** D/Empty — 비주얼·제목·설명·액션의 중앙 정렬 빈 상태. */
export function Empty({
  variant = "default",
  icon,
  visual,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyProps) {
  const inverse = variant === "inverse";

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3.5 px-6 py-12",
        CONTAINER_CLASSES[variant],
        className,
      )}
    >
      {(visual || icon) && (
        <div
          data-slot="visual"
          className={cn(
            "flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full",
            inverse ? "bg-background-track-inverse" : "bg-background-muted",
          )}
        >
          {visual ??
            (icon && (
              <Icon name={icon} size={32} className={inverse ? "text-text-inverse" : "text-text-muted"} />
            ))}
        </div>
      )}
      <h2 className={cn("text-center typo-heading-sm", inverse ? "text-text-inverse" : "text-text-default")}>
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-[280px] text-center typo-body-md",
            inverse ? "text-text-placeholder" : "text-text-subtle",
          )}
        >
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
