"use client";

import { useId, type ButtonHTMLAttributes, type MouseEventHandler } from "react";
import { Icon } from "@/foundation/icon/Icon";
import { cn } from "@/lib/cn";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps {
  label: string;
  placeholder?: string;
  /** 선택된 값의 표시 텍스트. 없으면 플레이스홀더를 보여준다. */
  value?: string;
  /** sm(32) · md(40) · lg(48) */
  size?: SelectSize;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  /** 패널이 열려 있는 동안 focused 상태를 유지한다. */
  open?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  id?: string;
  className?: string;
}

const TRIGGER_SIZE_CLASSES: Record<SelectSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

const SELECT_ICON_SIZES: Record<SelectSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

/**
 * F/Select — default·focused(open)·disabled·error 트리거.
 * 패널은 모바일에서 BottomSheet, 데스크톱에서 SelectItem 목록을 연결해 사용한다.
 */
export function Select({
  label,
  placeholder = "선택하세요",
  value,
  size = "md",
  helperText,
  errorText,
  disabled,
  open = false,
  onClick,
  id,
  className,
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const helperId = `${triggerId}-helper`;
  const hasError = Boolean(errorText) && !disabled;
  const iconSize = SELECT_ICON_SIZES[size];
  const message = hasError ? errorText : helperText;

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <label
        htmlFor={triggerId}
        className={cn("typo-label-lg", disabled ? "text-text-muted" : "text-text-default")}
      >
        {label}
      </label>
      <button
        type="button"
        id={triggerId}
        disabled={disabled}
        onClick={onClick}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={message ? helperId : undefined}
        data-slot="trigger"
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border px-3 text-left transition-colors",
          TRIGGER_SIZE_CLASSES[size],
          disabled ? "bg-background-disabled" : "bg-background-surface",
          hasError
            ? "border-border-error shadow-[inset_0_0_0_0.5px_var(--color-border-error)]"
            : open
              ? "border-border-brand shadow-[inset_0_0_0_0.5px_var(--color-border-brand)]"
              : "border-border-default focus-visible:border-border-brand focus-visible:shadow-[inset_0_0_0_0.5px_var(--color-border-brand)] focus-visible:outline-none",
        )}
      >
        <span
          className={cn(
            "w-full min-w-0 truncate typo-body-lg",
            disabled ? "text-text-muted" : value ? "text-text-default" : "text-text-placeholder",
          )}
        >
          {value ?? placeholder}
        </span>
        <Icon
          name="chevron-down"
          size={iconSize}
          className={cn("shrink-0", disabled ? "text-text-muted" : "text-text-subtle")}
        />
      </button>
      {message && (
        <p id={helperId} className={cn("typo-label-md", hasError ? "text-text-error" : "text-text-muted")}>
          {message}
        </p>
      )}
    </div>
  );
}

export interface SelectItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** 참조하는 셀렉트의 사이즈를 따른다. */
  size?: SelectSize;
}

/** F/SelectItem — default·selected·disabled. 선택 시 우측에 체크 아이콘. */
export function SelectItem({
  selected = false,
  size = "md",
  disabled,
  className,
  children,
  ...rest
}: SelectItemProps) {
  const iconSize = SELECT_ICON_SIZES[size];

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 text-left transition-colors",
        TRIGGER_SIZE_CLASSES[size],
        selected ? "bg-background-muted" : "bg-background-surface",
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          "w-full min-w-0 truncate typo-body-lg",
          disabled ? "text-text-muted" : "text-text-default",
        )}
      >
        {children}
      </span>
      {selected && <Icon name="check" size={iconSize} className="shrink-0 text-text-brand" />}
    </button>
  );
}
