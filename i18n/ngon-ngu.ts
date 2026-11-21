/** W044: hai ngôn ngữ của web. Mặc định tiếng Việt; không đổi URL (không có /en). */
export const NGON_NGU = ["vi", "en"] as const;
export type NgonNgu = (typeof NGON_NGU)[number];
export const NGON_NGU_MAC_DINH: NgonNgu = "vi";
/** Cookie lưu lựa chọn của khách (1 năm). `?lang=en` trên URL cũng đặt cookie này (proxy.ts). */
export const COOKIE_NGON_NGU = "vive_lang";

export function laNgonNgu(x: unknown): x is NgonNgu {
  return x === "vi" || x === "en";
}

/** Chọn ngôn ngữ từ cookie, rồi header Accept-Language (trình duyệt tiếng Anh → en), mặc định vi. */
export function chonNgonNgu(cookie: string | undefined, acceptLanguage: string | null): NgonNgu {
  if (laNgonNgu(cookie)) return cookie;
  const dau = (acceptLanguage ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  if (dau.startsWith("en")) return "en";
  return NGON_NGU_MAC_DINH;
}
