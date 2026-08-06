import { uploadProfileImage } from "@/lib/profile-image";
import { createClient } from "@/lib/supabase/server";

/** 실패 사유 → HTTP 상태코드. type·size는 요청 문제, upload·update는 Supabase 쪽 실패. */
const FAILURE_STATUS = { type: 400, size: 400, upload: 500, update: 500 } as const;

/** BFF: 세션 사용자의 프로필 이미지 업로드. 이전 경로는 클라이언트를 믿지 않고 DB에서 읽는다. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "file" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("image_path")
    .eq("user_id", userId)
    .single();

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
    { userId, file, previousImagePath: profile?.image_path ?? null },
  );

  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: FAILURE_STATUS[result.reason] });
  }
  return Response.json({ imagePath: result.imagePath });
}
