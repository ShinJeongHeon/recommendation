"use client";

import { useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type SwitchSize = "sm" | "md";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: string;
  /** sm(16×32) · md(20×40) */
  size?: SwitchSize;
}

const TRACK_SIZE_CLASSES: Record<SwitchSize, string> = {
  sm: "h-4 w-8",
  md: "h-5 w-10",
};

const KNOB_SIZE_CLASSES: Record<SwitchSize, string> = {
  sm: "size-3",
  md: "size-4",
};

/* 이동 거리 = 트랙 너비 - 좌우 패딩(2×2) - 노브 지름 */
const KNOB_ON_CLASSES: Record<SwitchSize, string> = {
  sm: "translate-x-4",
  md: "translate-x-5",
};

/** F/Switch(토글) — off·on × default·disabled. 단독 사용 전용. */
export function Switch({
  label,
  size = "md",
  checked,
  defaultChecked,
  disabled,
  onChange,
  className,
  ...rest
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isOn = checked ?? internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={isOn}
        disabled={disabled}
        onChange={handleChange}
        {...rest}
      />
      <span
        aria-hidden
        data-slot="track"
        className={cn(
          "flex shrink-0 items-center rounded-full px-0.5 transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-brand",
          TRACK_SIZE_CLASSES[size],
          disabled ? "bg-background-disabled" : isOn ? "bg-background-brand" : "bg-background-strong",
        )}
      >
        <span
          data-slot="knob"
          className={cn(
            "rounded-full transition-transform",
            KNOB_SIZE_CLASSES[size],
            disabled ? "bg-background-strong" : "bg-background-surface",
            isOn && KNOB_ON_CLASSES[size],
          )}
        />
      </span>
      {label && (
        <span className={cn("typo-body-md", disabled ? "text-text-muted" : "text-text-default")}>
          {label}
        </span>
      )}
    </label>
  );
}
