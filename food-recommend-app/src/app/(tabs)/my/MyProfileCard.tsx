"use client";

import { useRouter } from "next/navigation";
import { ProfileCard } from "@/blocks/profile-card/ProfileCard";
import { createClient } from "@/lib/supabase/client";

interface MyProfileCardProps {
  userId: string;
  name: string;
  subtitle: string;
}

/** ProfileCard를 Supabase profiles 테이블에 연결 — 이름 저장 후 서버 렌더 데이터를 새로고침한다. */
export function MyProfileCard({ userId, name, subtitle }: MyProfileCardProps) {
  const router = useRouter();

  async function saveName(nextName: string) {
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ name: nextName }).eq("user_id", userId);
    if (error) throw error;
    router.refresh();
  }

  return <ProfileCard name={name} subtitle={subtitle} onSave={saveName} />;
}
