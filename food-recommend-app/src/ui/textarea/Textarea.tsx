"use client";

import { useId, useState, type ChangeEvent, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  /** 지정 시 error 상태 — 헬퍼텍스트를 대체하고 보더·카운터가 에러 컬러가 된다. */
  errorText?: string;
  /** 지정 시 우측 하단에 글자수 카운터(N/max)를 표시한다. */
  maxLength?: number;
}

/** F/Textarea — 고정 3줄 높이, 내용 초과 시 스크롤. */
export function Textarea({
  label,
  helperText,
  errorText,
  maxLength,
  disabled,
  id,
  className,
  value,
  defaultValue,
  onChange,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const helperId = `${textareaId}-helper`;
  const hasError = Boolean(errorText) && !disabled;
  const message = hasError ? errorText : helperText;

  const [internalLength, setInternalLength] = useState(() => String(defaultValue ?? "").length);
  const length = value != null ? String(value).length : internalLength;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInternalLength(event.target.value.length);
    onChange?.(event);
  };

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <label
        htmlFor={textareaId}
        className={cn("typo-label-lg", disabled ? "text-text-muted" : "text-text-default")}
      >
        {label}
      </label>
      <div
        data-slot="field"
        className={cn(
          "flex h-[92px] rounded-xl border px-3.5 py-3 transition-colors",
          disabled ? "bg-background-disabled" : "bg-background-surface",
          hasError
            ? "border-border-error shadow-[inset_0_0_0_0.5px_var(--color-border-error)]"
            : "border-border-default focus-within:border-border-brand focus-within:shadow-[inset_0_0_0_0.5px_var(--color-border-brand)]",
        )}
      >
        <textarea
          id={textareaId}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? helperId : undefined}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            "size-full resize-none bg-transparent outline-none typo-body-lg placeholder:text-text-placeholder",
            disabled ? "text-text-muted" : "text-text-default",
          )}
          {...rest}
        />
      </div>
      {(message || maxLength != null) && (
        <div className="flex w-full items-start justify-between gap-3">
          <p
            id={helperId}
            className={cn("flex-1 typo-label-md", hasError ? "text-text-error" : "text-text-muted")}
          >
            {message}
          </p>
          {maxLength != null && (
            <span className={cn("shrink-0 typo-label-md", hasError ? "text-text-error" : "text-text-muted")}>
              {length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
