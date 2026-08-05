"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface BottomSheetProps {
  children: ReactNode;
  /** 스크림 탭 시 선택 없이 닫힘 */
  onClose?: () => void;
  /** 접근성 레이블 */
  "aria-label"?: string;
  className?: string;
}

/**
 * D/BottomSheet — 스크림 + 하단 시트(상단 드래그 핸들). 프레젠테이션 컴포넌트로,
 * 열림 상태 관리·포털·제스처는 사용처에서 처리한다.
 */
export function BottomSheet({ children, onClose, "aria-label": ariaLabel, className }: BottomSheetProps) {
  return (
    <div
      data-slot="scrim"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-background-scrim"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
        className={cn("flex w-full flex-col rounded-t-[20px] bg-background-surface", className)}
      >
        <div className="flex w-full items-center justify-center pb-1.5 pt-2.5">
          <div data-slot="handle" className="h-1 w-10 rounded-xs bg-border-strong" />
        </div>
        <div className="flex w-full flex-col gap-0.5 px-2 pb-5 pt-1.5">{children}</div>
      </div>
    </div>
  );
}
