"use client";

import { useId, type InputHTMLAttributes } from "react";
import { Icon } from "@/foundation/icon/Icon";
import type { IconName } from "@/foundation/icon/icons";
import { cn } from "@/lib/cn";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  /** sm(32) · md(40) · lg(48) */
  size?: TextFieldSize;
  helperText?: string;
  /** 지정 시 error 상태 — 헬퍼텍스트를 대체하고 보더·트레일링 아이콘이 에러 컬러가 된다. */
  errorText?: string;
  leadingIcon?: IconName;
  /** error 상태에서는 에러 아이콘이 우선한다. */
  trailingIcon?: IconName;
}

const BOX_SIZE_CLASSES: Record<TextFieldSize, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
};

const FIELD_ICON_SIZES: Record<TextFieldSize, 16 | 20> = { sm: 16, md: 20, lg: 20 };

/** F/TextField — text·password × default·focused·disabled·error. focused는 focus-within으로 표현. */
export function TextField({
  label,
  size = "md",
  helperText,
  errorText,
  leadingIcon,
  trailingIcon,
  disabled,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const hasError = Boolean(errorText) && !disabled;
  const iconSize = FIELD_ICON_SIZES[size];
  const message = hasError ? errorText : helperText;
  const sideIconColor = disabled ? "text-text-muted" : "text-text-subtle";

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <label
        htmlFor={inputId}
        className={cn("typo-label-lg", disabled ? "text-text-muted" : "text-text-default")}
      >
        {label}
      </label>
      <div
        data-slot="field"
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 transition-colors",
          BOX_SIZE_CLASSES[size],
          disabled ? "bg-background-disabled" : "bg-background-surface",
          hasError
            ? "border-border-error shadow-[inset_0_0_0_0.5px_var(--color-border-error)]"
            : "border-border-default focus-within:border-border-brand focus-within:shadow-[inset_0_0_0_0.5px_var(--color-border-brand)]",
        )}
      >
        {leadingIcon && <Icon name={leadingIcon} size={iconSize} className={cn("shrink-0", sideIconColor)} />}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? helperId : undefined}
          className={cn(
            "w-full min-w-0 bg-transparent outline-none typo-body-lg placeholder:text-text-placeholder",
            disabled ? "text-text-muted" : "text-text-default",
          )}
          {...rest}
        />
        {hasError ? (
          <Icon name="error" size={iconSize} className="shrink-0 text-text-error" />
        ) : (
          trailingIcon && <Icon name={trailingIcon} size={iconSize} className={cn("shrink-0", sideIconColor)} />
        )}
      </div>
      {message && (
        <p id={helperId} className={cn("typo-label-md", hasError ? "text-text-error" : "text-text-muted")}>
          {message}
        </p>
      )}
    </div>
  );
}
