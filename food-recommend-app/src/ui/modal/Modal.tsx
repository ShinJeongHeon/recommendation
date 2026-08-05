"use client";

import type { ReactNode } from "react";
import { Icon } from "@/foundation/icon/Icon";
import { cn } from "@/lib/cn";

export interface ModalProps {
  title: string;
  children: ReactNode;
  /** 버튼 secondary·primary 순 배치 권장 */
  footer?: ReactNode;
  /** 스크림 탭·닫기 아이콘 클릭 시 호출 */
  onClose?: () => void;
  className?: string;
}

/**
 * D/Modal — 스크림 + 다이얼로그 패널. 프레젠테이션 컴포넌트로,
 * 열림 상태 관리·포털·포커스 트랩은 사용처에서 처리한다.
 */
export function Modal({ title, children, footer, onClose, className }: ModalProps) {
  return (
    <div
      data-slot="scrim"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background-scrim p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "flex w-[340px] max-w-full flex-col overflow-hidden rounded-[20px] bg-background-surface shadow-[0_12px_32px_var(--color-shadow-strong)]",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-[18px]">
          <h2 className="typo-heading-sm text-text-default">{title}</h2>
          {onClose && (
            <button type="button" aria-label="닫기" onClick={onClose} className="shrink-0 text-text-subtle">
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
        <div className="px-5 typo-body-md text-text-subtle">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-4">{footer}</div>}
      </div>
    </div>
  );
}
