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
