import { createBrowserClient } from "@supabase/ssr";

/** 브라우저(Client Component)용 Supabase 클라이언트. 내부적으로 싱글턴이라 매번 호출해도 안전하다. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
