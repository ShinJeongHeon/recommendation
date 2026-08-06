import { redirect } from "next/navigation";
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
    .select("name")
    .eq("user_id", claims.sub)
    .single();

  return <MyPageView userId={claims.sub} profileName={profile?.name ?? "집밥러"} />;
}
