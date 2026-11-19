export type CoAnh = "the" | "nho" | "the-nho";

/**
 * Chuyển đổi đường dẫn ảnh sản phẩm (`san_pham.anh`) sang kích thước phù hợp.
 * Hỗ trợ cả URL đầy đủ từ kho media Supabase (`.../the.webp?v=2`) và đường dẫn `/products/...` cũ.
 */
export function duongDanAnh(
  nguon: string | null | undefined,
  co: CoAnh = "the"
): string | null {
  if (!nguon) return null;
  const sach = nguon.trim();
  if (!sach) return null;

  const dungBanNho = co === "nho" || co === "the-nho";

  if (!/^https?:\/\//i.test(sach)) {
    return sach;
  }

  try {
    const url = new URL(sach);
    if (dungBanNho && url.pathname.endsWith("/the.webp")) {
      url.pathname = `${url.pathname.slice(0, -"/the.webp".length)}/the-nho.webp`;
      return url.toString();
    }
    if (!dungBanNho && url.pathname.endsWith("/the-nho.webp")) {
      url.pathname = `${url.pathname.slice(0, -"/the-nho.webp".length)}/the.webp`;
      return url.toString();
    }
    return url.toString();
  } catch {
    if (dungBanNho) {
      return sach.replace(/\/the\.webp(?=$|[?#])/i, "/the-nho.webp");
    }
    return sach.replace(/\/the-nho\.webp(?=$|[?#])/i, "/the.webp");
  }
}

/**
 * Ảnh thẻ (1000×1000, nền trong) của một sản phẩm trong kho media Supabase (W005), theo mã.
 * Cho phép "<mã>?v=2" để phá cache. Không có NEXT_PUBLIC_SUPABASE_URL thì trả về null (bản dựng thử).
 */
export function anhKhoMediaTheoMa(ma: string): string | null {
  const goc = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!goc) return null;
  const [id, query] = ma.split("?");
  if (!id) return null;
  return `${goc.replace(/\/$/, "")}/storage/v1/object/public/media/san-pham/${id}/the.webp${query ? `?${query}` : ""}`;
}
