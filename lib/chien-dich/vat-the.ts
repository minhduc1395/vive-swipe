import type { MocManHinh3D, MocVatThe3D, VatThe3D } from "./types";

/**
 * Lấy mốc vị trí/kích thước 3D theo cỡ màn hình (chạy được cả trên trình duyệt và server).
 * Nếu thiếu mốc nhỏ hơn (`dien_thoai` hoặc `may_tinh_bang`), tự lấy từ mốc lớn hơn gần nhất rồi thu gọn hợp lý.
 */
export function layMocVatTheTheoManHinh(
  vatThe: VatThe3D,
  moc: MocManHinh3D
): MocVatThe3D {
  const mayTinh = vatThe.may_tinh;
  const mayTinhBang: MocVatThe3D = vatThe.may_tinh_bang ?? {
    x: Math.min(Math.max(mayTinh.x, 22), 78),
    y: Math.min(mayTinh.y, 25),
    co: Math.round(mayTinh.co * 0.82 * 10) / 10,
    xoay: mayTinh.xoay ?? 0,
    mo: mayTinh.mo ?? 0,
    vat_pham: mayTinh.vat_pham?.map((vp) => ({
      ...vp,
      dx: vp.dx !== undefined ? Math.round(vp.dx * 0.78 * 10) / 10 : 0,
      dy: vp.dy !== undefined ? Math.round(vp.dy * 0.75 * 10) / 10 : 0,
    })),
  };

  if (moc === "may_tinh") return mayTinh;
  if (moc === "may_tinh_bang") {
    return {
      ...mayTinhBang,
      vat_pham: mayTinhBang.vat_pham ?? mayTinh.vat_pham,
    };
  }

  // Điện thoại (< 768px): mặc định nửa trên, lệch ngang trong ±15% tâm
  const nguon = vatThe.may_tinh_bang ?? mayTinh;
  const baseVatPham = vatThe.dien_thoai?.vat_pham ?? nguon.vat_pham;
  if (vatThe.dien_thoai) {
    return {
      ...vatThe.dien_thoai,
      x: Math.min(Math.max(vatThe.dien_thoai.x, 35), 65),
      vat_pham: baseVatPham,
    };
  }

  return {
    x: Math.min(Math.max(nguon.x, 35), 65),
    y: Math.min(nguon.y, 24),
    co: Math.min(Math.round(nguon.co * 0.85 * 10) / 10, 44),
    xoay: nguon.xoay ?? 0,
    mo: nguon.mo ?? 0,
    vat_pham: baseVatPham?.map((vp) => ({
      ...vp,
      dx: vp.dx !== undefined ? Math.min(Math.max(vp.dx * 0.65, -14), 14) : 0,
      dy: vp.dy !== undefined ? Math.round(vp.dy * 0.65 * 10) / 10 : 0,
    })),
  };
}
