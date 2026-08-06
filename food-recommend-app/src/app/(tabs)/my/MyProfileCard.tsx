"use client";

import { useRouter } from "next/navigation";
import { ProfileCard } from "@/blocks/profile-card/ProfileCard";
import { uploadProfileImage } from "@/lib/profile-image";
import { createClient } from "@/lib/supabase/client";

interface MyProfileCardProps {
  userId: string;
  name: string;
  subtitle: string;
  /** profiles.image_path 원본 — 교체 성공 시 이전 파일 삭제 대상 */
  imagePath: string | null;
  /** 표시용 공개 URL — null이면 기본 아이콘 */
  imageUrl: string | null;
}

/** 실패 사유 코드 → 한국어 안내문 (contracts/profile-image-module.md §3) */
const UPLOAD_ERROR_MESSAGES = {
  type: "JPG·PNG·WebP 이미지만 올릴 수 있어요.",
  size: "5MB 이하 이미지만 올릴 수 있어요.",
  upload: "업로드에 실패했어요. 잠시 후 다시 시도해 주세요.",
  update: "업로드에 실패했어요. 잠시 후 다시 시도해 주세요.",
} as const;

/** ProfileCard를 Supabase profiles·storage에 연결 — 저장 후 서버 렌더 데이터를 새로고침한다. */
export function MyProfileCard({ userId, name, subtitle, imagePath, imageUrl }: MyProfileCardProps) {
  const router = useRouter();

  async function saveName(nextName: string) {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ name: nextName }).eq("user_id", userId);
    if (error) throw error;
    router.refresh();
  }

  async function selectImage(file: File) {
    const supabase = createClient();
    const result = await uploadProfileImage(
      {
        upload: async (path, blob) => {
          const { error } = await supabase.storage.from("profile-image").upload(path, blob);
          return { error };
        },
        updateImagePath: async (path) => {
          const { error } = await supabase
            .from("profiles")
            .update({ image_path: path })
            .eq("user_id", userId);
          return { error };
        },
        removeOld: async (path) => {
          const { error } = await supabase.storage.from("profile-image").remove([path]);
          return { error };
        },
        randomUUID: () => crypto.randomUUID(),
      },
      { userId, file, previousImagePath: imagePath },
    );
    if (!result.ok) throw new Error(UPLOAD_ERROR_MESSAGES[result.reason]);
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
