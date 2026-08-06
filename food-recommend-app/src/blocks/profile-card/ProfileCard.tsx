"use client";

import { useState } from "react";
import { Icon } from "@/foundation/icon/Icon";
import { Button } from "@/ui/button/Button";
import { IconButton } from "@/ui/icon-button/IconButton";
import { Modal } from "@/ui/modal/Modal";
import { TextField } from "@/ui/text-field/TextField";

export interface ProfileCardProps {
  name: string;
  subtitle: string;
  /** 지정 시 이름 수정 버튼 노출. reject되면 모달에 에러 문구가 표시된다. */
  onSave?: (name: string) => Promise<void>;
}

/** B/ProfileCard — 마이페이지 프로필 카드. 이름 표시 + 모달로 이름 수정. */
export function ProfileCard({ name, subtitle, onSave }: ProfileCardProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string>();

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

  return (
    <div className="flex items-center gap-3.5 rounded-card border border-border-default bg-background-surface p-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background-brand-subtle text-text-brand">
        <Icon name="chef-hat" size={24} />
      </span>
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
    </div>
  );
}
