/**
 * Định dạng số tiền VNĐ theo docs/02 mục 8: dùng dấu chấm ngăn cách hàng nghìn, không có "đ".
 */
export function dinhDangTien(soTien: number): string {
  const soNguyen = Math.round(Number.isFinite(soTien) ? soTien : 0);
  const dau = soNguyen < 0 ? "-" : "";
  const chuoi = Math.abs(soNguyen).toString();
  const ketQua = chuoi.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${dau}${ketQua}`;
}

/**
 * Định dạng số tiền dùng trong giỏ và màn giữ hàng (có hậu tố "đ").
 */
export function dinhDangTienGio(soTien: number): string {
  return `${dinhDangTien(soTien)}đ`;
}

/**
 * Chuẩn hóa chuỗi tiếng Việt (bỏ dấu, chữ thường) phục vụ tìm kiếm không dấu.
 */
export function chuanHoaTimKiem(chuoi: string): string {
  return chuoi
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * W044: giá theo ngôn ngữ. vi: 349.000đ · en: 349,000 VND.
 * Component lấy ngôn ngữ bằng useLocale() (client) hoặc getLocale() (server).
 */
export function dinhDangGia(soTien: number, ngonNgu: string): string {
  if (ngonNgu === "en") {
    const so = Math.round(Number.isFinite(soTien) ? soTien : 0);
    return `${so.toLocaleString("en-US")} VND`;
  }
  return dinhDangTienGio(soTien);
}

/** W044: ngày ngắn theo ngôn ngữ (giờ Việt Nam). vi: 27/11 · en: Nov 27. */
export function dinhDangNgayNgan(ngay: Date | string, ngonNgu: string): string {
  const d = typeof ngay === "string" ? new Date(ngay) : ngay;
  if (ngonNgu === "en") {
    return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Ho_Chi_Minh", month: "short", day: "numeric" }).format(d);
  }
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit" })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}/${p.month}`;
}
