"use client";

import { useState } from "react";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";
import { FileUploader } from "@/ui/file-uploader/FileUploader";
import { IconButton } from "@/ui/icon-button/IconButton";
import { Modal } from "@/ui/modal/Modal";
import { Spinner } from "@/ui/spinner/Spinner";
import { TextField } from "@/ui/text-field/TextField";

const UPLOAD_FALLBACK_ERROR = "업로드에 실패했어요. 잠시 후 다시 시도해 주세요.";

export interface ProfileCardProps {
  name: string;
  subtitle: string;
  /** 지정 시 이름 수정 버튼 노출. reject되면 모달에 에러 문구가 표시된다. */
  onSave?: (name: string) => Promise<void>;
  /** 있으면 아바타에 사진 표시. 없으면 기본 셰프 모자 아이콘. */
  imageUrl?: string | null;
  /** 지정 시 아바타에 업로드 진입점 노출. reject되면 모달에 에러 문구가 표시된다. */
  onImageSelect?: (file: File) => Promise<void>;
}

/** B/ProfileCard — 마이페이지 프로필 카드. 이름 표시 + 모달로 이름 수정, 아바타 사진 표시 + 모달로 업로드. */
export function ProfileCard({ name, subtitle, onSave, imageUrl, onImageSelect }: ProfileCardProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string>();

  const [imageOpen, setImageOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageErrorText, setImageErrorText] = useState<string>();
  // 로드에 실패한 URL을 기억해 기본 아이콘으로 폴백 — 새 URL이 오면 자동으로 다시 시도 (FR-006)
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const trimmed = draft.trim();
  const invalid = trimmed.length === 0 || trimmed.length > 100;

  function openModal() {
    setDraft(name);
    setErrorText(undefined);
    setOpen(true);
  }

  async function handleSave() {
    if (!onSave || invalid || saving) return;
    setSaving(true);
    setErrorText(undefined);
    try {
      await onSave(trimmed);
      setOpen(false);
    } catch {
      setErrorText("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  function openImageModal() {
    setImageErrorText(undefined);
    setImageOpen(true);
  }

  async function handleImageSelect(files: FileList) {
    const file = files.item(0);
    if (!file || !onImageSelect || uploading) return;
    setUploading(true);
    setImageErrorText(undefined);
    try {
      await onImageSelect(file);
      setImageOpen(false);
    } catch (error) {
      setImageErrorText(
        error instanceof Error && error.message ? error.message : UPLOAD_FALLBACK_ERROR,
      );
    } finally {
      setUploading(false);
    }
  }

  const avatarContent =
    imageUrl && imageUrl !== failedImageUrl ? (
      <img
        src={imageUrl}
        alt="프로필 사진"
        className="size-full rounded-full object-cover"
        onError={() => setFailedImageUrl(imageUrl)}
      />
    ) : (
      <Icon name="chef-hat" size={24} />
    );
  const avatarClass =
    "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-brand-subtle text-text-brand";

  return (
    <div className="flex items-center gap-3.5 rounded-card border border-border-default bg-background-surface p-4">
      {onImageSelect ? (
        <button type="button" aria-label="프로필 사진 변경" className={avatarClass} onClick={openImageModal}>
          {avatarContent}
        </button>
      ) : (
        <span className={avatarClass}>{avatarContent}</span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="typo-heading-sm text-text-default">{name}님</span>
        <span className="typo-label-md text-text-muted">{subtitle}</span>
      </div>
      {onSave && (
        <IconButton
          icon="edit"
          variant="ghost"
          size="sm"
          aria-label="이름 수정"
          className="shrink-0 text-text-subtle"
          onClick={openModal}
        />
      )}

      {open && (
        <Modal
          title="이름 수정"
          onClose={saving ? undefined : () => setOpen(false)}
          footer={
            <>
              <Button variant="secondary" size="md" disabled={saving} onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={saving}
                disabled={invalid}
                onClick={handleSave}
              >
                저장
              </Button>
            </>
          }
        >
          <TextField
            label="이름"
            value={draft}
            maxLength={100}
            autoFocus
            errorText={errorText}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSave();
            }}
          />
        </Modal>
      )}

      {imageOpen && (
        <Modal title="프로필 사진" onClose={uploading ? undefined : () => setImageOpen(false)}>
          <div className="flex flex-col gap-3 pb-5">
            <FileUploader
              hint="JPG · PNG · WebP · 최대 5MB"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              errorText={imageErrorText}
              onFilesSelected={handleImageSelect}
            />
            {uploading && (
              <div className="flex items-center gap-2 text-text-muted">
                <Spinner size={20} color="current" aria-label="업로드 중" />
                <span className="typo-label-md">업로드 중…</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
