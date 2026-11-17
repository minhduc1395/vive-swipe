import type { Deal } from "@/lib/data/types";

const TRANG_THAI_CHO_PHEP = new Set(["DANG_CHAY", "DA_DUYET"]);

/**
 * Chuẩn hóa ngày về dạng YYYY-MM-DD theo múi giờ Việt Nam (Asia/Ho_Chi_Minh).
 */
export function chuanHoaNgay(homNay: string | Date = new Date()): string {
  if (typeof homNay === "string") {
    const sach = homNay.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(sach)) {
      return sach;
    }
    const parsed = new Date(sach);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Ngày không hợp lệ: "${homNay}"`);
    }
    return dinhDangNgayVN(parsed);
  }
  if (Number.isNaN(homNay.getTime())) {
    throw new Error("Đối tượng Date không hợp lệ");
  }
  return dinhDangNgayVN(homNay);
}

function dinhDangNgayVN(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const nam = parts.find((p) => p.type === "year")?.value;
  const thang = parts.find((p) => p.type === "month")?.value;
  const ngay = parts.find((p) => p.type === "day")?.value;
  return `${nam}-${thang}-${ngay}`;
}

/**
 * Quy tắc hiển thị deal theo docs/02 mục 4.1:
 * hienThi(deal, homNay) = trang_thai in {DANG_CHAY, DA_DUYET}
 *   AND hien_thi
 *   AND (not may_rui OR da_dang_ky)
 *   AND bat_dau <= homNay <= ket_thuc
 */
export function hienThi(deal: Deal, homNay: string | Date = new Date()): boolean {
  if (!TRANG_THAI_CHO_PHEP.has(deal.trang_thai)) {
    return false;
  }
  if (!deal.hien_thi) {
    return false;
  }
  if ((deal.may_rui || deal.loai === "may_rui") && !deal.da_dang_ky) {
    return false;
  }

  const ngay = chuanHoaNgay(homNay);
  if (deal.bat_dau && deal.bat_dau > ngay) {
    return false;
  }
  if (deal.ket_thuc && deal.ket_thuc < ngay) {
    return false;
  }

  return true;
}

/**
 * Lọc danh sách deal đang được phép hiển thị vào ngày homNay.
 */
export function layDealHienThi(
  deals: Deal[],
  homNay: string | Date = new Date()
): Deal[] {
  const ngay = chuanHoaNgay(homNay);
  return deals.filter((deal) => hienThi(deal, ngay));
}
