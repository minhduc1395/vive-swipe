/**
 * Định dạng tiền ngắn kiểu K cho tiêu đề / thẻ trang chủ (ví dụ 999000 -> "999K").
 */
export function dinhDangNgan(soTien: number): string {
  if (!Number.isFinite(soTien) || soTien <= 0) return "";
  if (soTien >= 1000 && soTien % 1000 === 0) {
    return `${soTien / 1000}K`;
  }
  return `${Math.round(soTien / 1000)}K`;
}

/**
 * Định dạng giờ mở cửa từ CAU_HINH_BOOTH ("10:00-21:00" -> "10:00 – 21:00").
 */
export function dinhDangGioV3(gioMoCua: string): string {
  return gioMoCua.replace(/\s*[-–]\s*/g, " – ").trim();
}
