"use client";

import { useRef, useState, type DragEvent } from "react";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";
import { IconButton } from "@/ui/icon-button/IconButton";
import { Spinner } from "@/ui/spinner/Spinner";
import { cn } from "@/lib/cn";

export interface FileUploaderProps {
  /** 상단 파일 형식·용량 제한 안내 */
  hint?: string;
  /** 드롭존 안내문구 */
  description?: string;
  /** 드래그오버 중 안내문구 */
  dragDescription?: string;
  buttonLabel?: string;
  disabled?: boolean;
  errorText?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: FileList) => void;
  className?: string;
}

/** F/FileUploader — 드롭존 + 파일선택버튼 결합 단일형. 상태: default·dragover·disabled·error. */
export function FileUploader({
  hint = "JPG · PNG · 최대 10MB",
  description = "여기로 파일을 끌어다 놓으세요",
  dragDescription = "놓으면 업로드돼요",
  buttonLabel = "파일 선택",
  disabled = false,
  errorText,
  accept,
  multiple = false,
  onFilesSelected,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const hasError = Boolean(errorText) && !disabled;
  const isDragOver = dragOver && !disabled;

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (!disabled && event.dataTransfer.files.length > 0) {
      onFilesSelected?.(event.dataTransfer.files);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <p className="typo-label-md text-text-muted">{hint}</p>
      <div
        data-slot="dropzone"
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex h-[150px] w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] p-5 transition-colors",
          disabled ? "bg-background-disabled" : "bg-background-surface",
          isDragOver
            ? "border-border-brand"
            : hasError
              ? "border-border-error"
              : "border-border-default",
        )}
      >
        <Icon
          name="image"
          size={24}
          className={cn(
            disabled ? "text-text-muted" : isDragOver ? "text-text-brand" : "text-text-placeholder",
          )}
        />
        <p
          className={cn(
            "text-center typo-body-md",
            disabled ? "text-text-muted" : isDragOver ? "text-text-brand" : "text-text-subtle",
          )}
        >
          {isDragOver ? dragDescription : description}
        </p>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {buttonLabel}
        </Button>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              onFilesSelected?.(event.target.files);
            }
          }}
        />
      </div>
      {hasError && <p className="typo-label-md text-text-error">{errorText}</p>}
    </div>
  );
}

export type FileUploaderItemStatus = "uploading" | "complete" | "error";

export interface FileUploaderItemProps {
  status: FileUploaderItemStatus;
  name: string;
  /** 상태 줄 텍스트 (예: "업로드 중 · 64%", "업로드 완료 · 1.2MB") */
  statusText?: string;
  onDelete?: () => void;
  className?: string;
}

const STATUS_TEXT_COLORS: Record<FileUploaderItemStatus, string> = {
  uploading: "text-text-muted",
  complete: "text-text-success",
  error: "text-text-error",
};

/** F/FileUploader 파일 아이템 — uploading(스피너)·complete(체크)·error(에러 아이콘). */
export function FileUploaderItem({ status, name, statusText, onDelete, className }: FileUploaderItemProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border bg-background-surface px-3 py-2.5",
        status === "error" ? "border-border-error" : "border-border-default",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-muted">
        <Icon name="image" size={20} className="text-text-muted" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate typo-body-md text-text-default">{name}</p>
        {statusText && (
          <p className={cn("truncate typo-label-md", STATUS_TEXT_COLORS[status])}>{statusText}</p>
        )}
      </div>
      {status === "uploading" && (
        <span className="shrink-0 text-text-muted">
          <Spinner size={20} color="current" aria-label="업로드 중" />
        </span>
      )}
      {status === "complete" && <Icon name="check" size={20} className="shrink-0 text-text-success" />}
      {status === "error" && <Icon name="error" size={20} className="shrink-0 text-text-error" />}
      {onDelete && (
        <IconButton
          icon="close"
          size="sm"
          aria-label={`${name} 삭제`}
          onClick={onDelete}
          className="shrink-0 text-text-subtle"
        />
      )}
    </div>
  );
}
