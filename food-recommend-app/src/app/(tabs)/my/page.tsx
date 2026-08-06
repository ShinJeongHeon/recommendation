import { redirect } from "next/navigation";
import { profileImageUrl } from "@/lib/profile-image";
import { createClient } from "@/lib/supabase/server";
import { MyPageView } from "./MyPageView";

export default async function MyPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, image_path")
    .eq("user_id", claims.sub)
    .single();

  const baseUrl = process.env.NEXT_PUBLIC_PROFILE_IMAGE_BASE_URL;
  const imagePath = profile?.image_path ?? null;

  return (
    <MyPageView
      userId={claims.sub}
      profileName={profile?.name ?? "집밥러"}
      profileImagePath={imagePath}
      profileImageUrl={baseUrl ? profileImageUrl(baseUrl, imagePath) : null}
    />
  );
}
