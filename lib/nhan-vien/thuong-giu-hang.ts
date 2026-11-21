import type { Deal } from "@/lib/data/types";
import { layThuongGiuHang } from "@/lib/giu-hang/thuong";

/**
 * Chữ nhắc thưởng thêm cho nhân viên khi xác nhận khách đã nhận đơn giữ hàng web.
 * Chỉ hiện từ ngày bắt đầu áp thưởng (`daTuNgay === true`) và khi deal đang bật.
 */
export function tinhThuongNhanDon(
  deals: Deal[],
  ngayNhan: string | Date = new Date(),
): string | null {
  const thuong = layThuongGiuHang(deals, ngayNhan);
  if (!thuong || !thuong.daTuNgay) return null;
  return `Tặng thêm: ${thuong.qua}`;
}
