import { createClient } from "@/lib/supabase/server";

/** BFF: 세션 사용자의 profiles.name 수정. 이름 규칙은 ProfileCard 모달과 동일(trim 후 1~100자). */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 100) return Response.json({ error: "name" }, { status: 400 });

  const { error } = await supabase.from("profiles").update({ name }).eq("user_id", userId);
  if (error) return Response.json({ error: "update_failed" }, { status: 500 });

  return new Response(null, { status: 204 });
}
