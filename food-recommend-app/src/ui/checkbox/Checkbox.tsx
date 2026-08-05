"use client";

import { useEffect, useRef, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CheckboxSize = "sm" | "md";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: string;
  /** sm(16) · md(20) */
  size?: CheckboxSize;
  indeterminate?: boolean;
  /** 그룹 사용 시 에러 메시지는 폼 아래에 1번만 표시하고, 각 체크박스에는 error만 전달한다. */
  error?: boolean;
}

const BOX_SIZE_CLASSES: Record<CheckboxSize, string> = {
  sm: "size-4 rounded-[5px]",
  md: "size-5 rounded-md",
};

const MARK_SIZES: Record<CheckboxSize, number> = { sm: 11, md: 14 };

/* 디자인 Mark 패스 그대로 (viewBox 24) */
const CHECK_PATH = "M9.55 17.6l-5.55-5.55 1.4-1.4 4.15 4.15 9.05-9.05 1.4 1.4z";
const DASH_PATH = "M5 11h14v2H5z";

/** F/Checkbox — unchecked·checked·indeterminate × default·disabled·error. */
export function Checkbox({
  label,
  size = "md",
  indeterminate = false,
  error = false,
  checked,
  defaultChecked,
  disabled,
  onChange,
  className,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isChecked = checked ?? internalChecked;
  const marked = indeterminate || isChecked;

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  const boxColor = disabled
    ? "border-border-default bg-background-disabled"
    : error
      ? marked
        ? "border-border-error bg-background-error"
        : "border-border-error bg-background-surface"
      : marked
        ? "border-transparent bg-background-brand"
        : "border-border-strong bg-background-surface";

  const markColor = disabled ? "text-text-muted" : error ? "text-text-on-error" : "text-text-on-brand";

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className="peer sr-only"
        checked={isChecked}
        disabled={disabled}
        aria-invalid={error || undefined}
        onChange={handleChange}
        {...rest}
      />
      <span
        aria-hidden
        data-slot="box"
        className={cn(
          "flex shrink-0 items-center justify-center border-[1.5px] transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-brand",
          BOX_SIZE_CLASSES[size],
          boxColor,
        )}
      >
        {marked && (
          <svg
            viewBox="0 0 24 24"
            width={MARK_SIZES[size]}
            height={MARK_SIZES[size]}
            fill="currentColor"
            className={markColor}
          >
            <path d={indeterminate ? DASH_PATH : CHECK_PATH} />
          </svg>
        )}
      </span>
      {label && (
        <span className={cn("typo-body-md", disabled ? "text-text-muted" : "text-text-default")}>
          {label}
        </span>
      )}
    </label>
  );
}
