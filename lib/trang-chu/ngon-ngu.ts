/**
 * W044: chọn bản tiếng Anh cho dữ liệu yaml của module trang-chu.
 * Quy ước: trường `<tên>_en` đứng cạnh `<tên>`. Ngôn ngữ en: giá trị `<tên>_en` thay cho `<tên>`
 * (ở mọi cấp, kể cả trong mảng); không có bản en thì giữ bản vi. Ngôn ngữ khác: bỏ các trường `_en`.
 */
export function chonBanNgonNgu<T>(du_lieu: T, ngonNgu: string): T {
  return duyet(du_lieu, ngonNgu === "en") as T;
}

function duyet(v: unknown, en: boolean): unknown {
  if (Array.isArray(v)) return v.map((x) => duyet(x, en));
  if (v === null || typeof v !== "object") return v;
  const goc = v as Record<string, unknown>;
  const kq: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(goc)) {
    // `<tên>_en` đã gộp vào `<tên>`; trường `_en` không có bản vi đi kèm (vd `qua_en` của thẻ combo) giữ nguyên
    if (k.endsWith("_en") && k.slice(0, -3) in goc) continue;
    const banEn = en ? goc[`${k}_en`] : undefined;
    kq[k] = duyet(banEn !== undefined && banEn !== null ? banEn : x, en);
  }
  return kq;
}

/**
 * Chữ của deal/sản phẩm theo ngôn ngữ: ở en dùng trường `<tên>_en` nếu dữ liệu có, không thì giữ bản vi.
 * (Schema deal dùng chung chưa khai báo `*_en`; khi WEB thêm vào thì hàm này tự dùng được.)
 */
export function chuTheoNgonNgu(
  doiTuong: object | null | undefined,
  truong: string,
  ngonNgu: string,
): string | undefined {
  const o = doiTuong as Record<string, unknown> | null | undefined;
  if (!o) return undefined;
  if (ngonNgu === "en") {
    const en = o[`${truong}_en`];
    if (typeof en === "string" && en) return en;
  }
  const vi = o[truong];
  return typeof vi === "string" ? vi : undefined;
}
