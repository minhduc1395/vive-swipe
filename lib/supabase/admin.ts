import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase dùng khóa service role. CHỈ dùng ở server (Server Action, route handler).
 * Trả null khi chưa cấu hình (máy dev, e2e); production bắt buộc có khóa.
 */
let admin: SupabaseClient | null = null;

export function layAdmin(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("layAdmin() chỉ được gọi ở server");
  }
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !url ||
    !key ||
    url.includes("e2e.test") ||
    url.includes("localhost.invalid")
  )
    return null;
  admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}

/** Máy dev/e2e không có khóa thì được dùng kho tạm trong bộ nhớ; production thì không. */
export function choPhepKhoTam(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.VIVE_CHO_PHEP_KHO_TAM === "1"
  );
}
