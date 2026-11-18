export type CoAnh = "the" | "nho" | "the-nho";

export const ANH_CO_SAN_LOCAL = new Set([
  "/products/8809369850248.webp",
  "/products/8809369850262.webp",
  "/products/8809369850354.webp",
  "/products/8809369850521.webp",
]);

/**
 * Kiểm tra đường dẫn ảnh có thể render an toàn không (tránh 404 cho /products/<ma>.webp thiếu file).
 */
export function laAnhHopLe(nguon: string | null | undefined): boolean {
  if (!nguon) return false;
  const sach = nguon.trim();
  if (!sach) return false;
  if (/^https?:\/\//i.test(sach)) return true;
  if (sach.startsWith("/brand/") || sach.startsWith("/chien-dich/")) return true;
  if (sach.startsWith("/products/")) {
    return ANH_CO_SAN_LOCAL.has(sach);
  }
  return true;
}

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
