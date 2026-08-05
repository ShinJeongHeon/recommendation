import { Icon } from "@/foundation/icon/Icon";
import { cn } from "@/lib/cn";

export interface StatusBarProps {
  time?: string;
  className?: string;
}

/** C/StatusBar — 디바이스 상태바(목업·프리뷰용). 높이 62. */
export function StatusBar({ time = "12:45", className }: StatusBarProps) {
  return (
    <div
      className={cn(
        "flex h-[62px] w-full items-center justify-between px-5 text-text-default",
        className,
      )}
    >
      <span className="typo-label-lg">{time}</span>
      <div className="flex items-center gap-1.5">
        <Icon name="signal" size={16} />
        <Icon name="wifi" size={16} />
        <Icon name="battery-full" size={16} />
      </div>
    </div>
  );
}
