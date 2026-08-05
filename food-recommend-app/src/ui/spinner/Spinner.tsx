import { cn } from "@/lib/cn";

export interface SpinnerProps {
  /** 디자인 기본 24. 버튼 내부에서는 아이콘 사이즈(16/20)를 따른다. */
  size?: 16 | 20 | 24;
  /** brand: 단독 사용 기본색. current: 부모 텍스트 컬러 상속(버튼 loading 등). */
  color?: "brand" | "current";
  className?: string;
  /** 지정 시 role="status"로 노출된다. 장식용이면 생략. */
  "aria-label"?: string;
}

/** S/Spinner — 270° 링. 색은 background-brand, 두께는 지름의 16%(24px 기준 3.8px). */
export function Spinner({ size = 24, color = "brand", className, "aria-label": ariaLabel }: SpinnerProps) {
  const a11yProps = ariaLabel
    ? ({ role: "status", "aria-label": ariaLabel } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      data-slot="spinner"
      className={cn("animate-spin", color === "brand" && "text-background-brand", className)}
      {...a11yProps}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3.8"
        pathLength={100}
        strokeDasharray="75 25"
      />
    </svg>
  );
}
