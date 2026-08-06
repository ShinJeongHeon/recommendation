"use client";

import { useRouter } from "next/navigation";
import { ProfileCard } from "@/blocks/profile-card/ProfileCard";
import { validateProfileImageFile } from "@/lib/profile-image";

interface MyProfileCardProps {
  name: string;
  subtitle: string;
  /** 표시용 공개 URL — null이면 기본 아이콘 */
  imageUrl: string | null;
}

/** 실패 사유 코드 → 한국어 안내문 (contracts/profile-image-module.md §3) */
const UPLOAD_ERROR_MESSAGES: Record<string, string> = {
  type: "JPG·PNG·WebP 이미지만 올릴 수 있어요.",
  size: "5MB 이하 이미지만 올릴 수 있어요.",
};
const GENERIC_UPLOAD_ERROR = "업로드에 실패했어요. 잠시 후 다시 시도해 주세요.";

/** ProfileCard를 BFF(/api/profile*)에 연결 — 저장 후 서버 렌더 데이터를 새로고침한다. */
export function MyProfileCard({ name, subtitle, imageUrl }: MyProfileCardProps) {
  const router = useRouter();

  async function saveName(nextName: string) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName }),
    });
    if (!res.ok) throw new Error("이름 저장에 실패했어요.");
    router.refresh();
  }

  async function selectImage(file: File) {
    // 서버 왕복 전에 형식·용량을 먼저 걸러 빠르게 안내한다 — 서버가 동일 규칙으로 재검증
    const valid = validateProfileImageFile(file.type, file.size);
    if (!valid.ok) throw new Error(UPLOAD_ERROR_MESSAGES[valid.reason]);

    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/profile/image", { method: "POST", body: form });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(UPLOAD_ERROR_MESSAGES[body?.error] ?? GENERIC_UPLOAD_ERROR);
    }
    router.refresh();
  }

  return (
    <ProfileCard
      name={name}
      subtitle={subtitle}
      onSave={saveName}
      imageUrl={imageUrl}
      onImageSelect={selectImage}
    />
  );
}
