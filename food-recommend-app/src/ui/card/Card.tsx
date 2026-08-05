import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export type CardVariant = "default" | "inverse" | "success" | "warning";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** 상단 이미지 영역(높이 160). 제외 가능. */
  media?: ReactNode;
  /** 미디어 래퍼 클래스 오버라이드 — 하이파이 페이지의 88/190px 등 높이·비율 변형용 */
  mediaClassName?: string;
  /** 본문 래퍼 클래스 오버라이드(패딩·flex 등) */
  bodyClassName?: string;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: "border-border-default bg-background-surface",
  inverse: "border-border-transparent bg-background-inverse",
  success: "border-border-success-subtle bg-background-success-subtle",
  warning: "border-border-warning-subtle bg-background-warning-subtle",
};

/** D/Card — radius-card(18px) 컨테이너 + 이미지 영역(선택) + 본문(패딩 16, 갭 10). */
export function Card({
  variant = "default",
  media,
  mediaClassName,
  bodyClassName,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-card border shadow-[0_6px_20px_var(--color-shadow-default)]",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {media && (
        <div
          data-slot="media"
          className={cn(
            "h-40 w-full shrink-0 overflow-hidden [&_img]:size-full [&_img]:object-cover",
            mediaClassName,
          )}
        >
          {media}
        </div>
      )}
      <div className={cn("flex w-full flex-col gap-2.5 p-4", bodyClassName)}>{children}</div>
    </div>
  );
}

export interface CardPillProps {
  /** 좌측 아이콘(16px) */
  icon?: IconName;
  /** inverse 카드 위에서는 트랙 배경 + 인버스 텍스트 */
  inverse?: boolean;
  children: ReactNode;
  className?: string;
}

/** D/Card 메타 필 — 시간·화구·설거지 개수 등 요약 정보. */
export function CardPill({ icon, inverse = false, children, className }: CardPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 typo-label-lg",
        inverse ? "bg-background-track-inverse text-text-inverse" : "bg-background-muted text-text-subtle",
        className,
      )}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
}
