import type { Deal } from "@/lib/data/types";
import { chuanHoaNgay, hienThi } from "@/lib/deals/hien-thi";

export interface ThuongGiuHang {
  /** Chữ quà lấy từ data, ví dụ "Thêm 1 lượt quay vòng quay may mắn". */
  qua: string;
  /** Ngày bắt đầu áp thưởng, YYYY-MM-DD. */
  tuNgay: string;
  /** Đã tới ngày áp thưởng chưa (so theo giờ Việt Nam). */
  daTuNgay: boolean;
}

/**
 * Thưởng thêm khi giữ hàng trên web rồi nhận tại booth.
 * Chỉ lấy từ deal đang được hiện (hàm `hienThi`) và đang chạy.
 */
export function layThuongGiuHang(
  deals: Deal[],
  ngayNhanHoacHomNay: string | Date = new Date()
): ThuongGiuHang | null {
  const ngay = chuanHoaNgay(ngayNhanHoacHomNay);
  for (const deal of deals) {
    const thuong = deal.thuong_giu_hang;
    if (!thuong) continue;
    if (deal.trang_thai !== "DANG_CHAY") continue;
    if (!hienThi(deal, ngay)) continue;
    return {
      qua: thuong.qua,
      tuNgay: thuong.tu_ngay,
      daTuNgay: thuong.tu_ngay <= ngay,
    };
  }
  return null;
}

/** Chữ quà thưởng giữ hàng, hoặc null nếu không áp. */
export function thuongGiuHang(
  deals: Deal[],
  ngayNhanHoacHomNay: string | Date = new Date()
): string | null {
  return layThuongGiuHang(deals, ngayNhanHoacHomNay)?.qua ?? null;
}

/** "2026-11-27" -> "27/11". */
function ngayNganVN(iso: string): string {
  const [, thang, ngay] = iso.split("-");
  return `${Number(ngay)}/${Number(thang)}`;
}

/**
 * Dòng hiện trên form và trang mã giữ hàng.
 * Trước ngày áp: "Nhận tại booth từ 27/11: <quà>". Từ ngày áp: "Nhận tại booth: <quà>".
 */
export function dongThuongGiuHang(
  deals: Deal[],
  ngayNhanHoacHomNay: string | Date = new Date()
): string | null {
  const thuong = layThuongGiuHang(deals, ngayNhanHoacHomNay);
  if (!thuong) return null;
  return thuong.daTuNgay
    ? `Nhận tại booth: ${thuong.qua}`
    : `Nhận tại booth từ ${ngayNganVN(thuong.tuNgay)}: ${thuong.qua}`;
}
