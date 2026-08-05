import { cn } from "@/lib/cn";

export type SkeletonVariant = "text" | "rect" | "circle";

export interface SkeletonProps {
  /** text: 행 높이(20) · rect: 너비×높이(160) · circle: 지름(64). 대상 요소 크기는 className으로 덮어쓴다. */
  variant?: SkeletonVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  text: "h-5 w-full rounded-sm",
  rect: "h-40 w-full rounded-xl",
  circle: "size-16 rounded-full",
};

/** S/Skeleton — 뉴트럴(muted) 배경의 로딩 플레이스홀더. */
export function Skeleton({ variant = "text", className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      data-slot="skeleton"
      className={cn("animate-pulse bg-background-muted", VARIANT_CLASSES[variant], className)}
    />
  );
}
