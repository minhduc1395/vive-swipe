import { preconnect } from "react-dom";
import { DuLieuProvider } from "@/lib/du-lieu-context";

/** Gốc Supabase (auth, REST, ảnh Storage), lấy từ biến công khai lúc dựng. */
function gocSupabase(): string | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
}

export default function DuLieuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // #128: mở sẵn kết nối tới Supabase ngay khi đọc HTML. Hai kênh: có crossorigin (fetch auth/REST)
  // và không crossorigin (thẻ <img> ảnh sản phẩm), vì trình duyệt tách pool kết nối theo hai chế độ này.
  const goc = gocSupabase();
  if (goc) {
    preconnect(goc, { crossOrigin: "anonymous" });
    preconnect(goc);
  }
  return <DuLieuProvider>{children}</DuLieuProvider>;
}
