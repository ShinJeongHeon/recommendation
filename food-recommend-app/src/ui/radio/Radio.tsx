"use client";

import { useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type RadioSize = "sm" | "md";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: string;
  /** sm(16) · md(20) */
  size?: RadioSize;
}

const CIRCLE_SIZE_CLASSES: Record<RadioSize, string> = {
  sm: "size-4",
  md: "size-5",
};

const DOT_SIZE_CLASSES: Record<RadioSize, string> = {
  sm: "size-2",
  md: "size-2.5",
};

/**
 * F/Radio — unselected·selected × default·disabled. 단독 사용 금지(그룹 전용).
 * 그룹에서는 checked를 컨트롤드로 관리할 것 — 네이티브 그룹 해제는 형제 컴포넌트에 전파되지 않는다.
 */
export function Radio({
  label,
  size = "md",
  checked,
  defaultChecked,
  disabled,
  onChange,
  className,
  ...rest
}: RadioProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isChecked = checked ?? internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  const circleColor = disabled
    ? "border-border-default bg-background-disabled"
    : isChecked
      ? "border-border-brand bg-background-surface"
      : "border-border-strong bg-background-surface";

  const dotColor = disabled ? "bg-text-muted" : "bg-background-brand";

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="radio"
        className="peer sr-only"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        {...rest}
      />
      <span
        aria-hidden
        data-slot="circle"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-brand",
          CIRCLE_SIZE_CLASSES[size],
          circleColor,
        )}
      >
        {isChecked && <span data-slot="dot" className={cn("rounded-full", DOT_SIZE_CLASSES[size], dotColor)} />}
      </span>
      {label && (
        <span className={cn("typo-body-md", disabled ? "text-text-muted" : "text-text-default")}>
          {label}
        </span>
      )}
    </label>
  );
}
