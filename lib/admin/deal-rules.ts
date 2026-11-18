import type { Deal } from "@/lib/data/types";

export interface KetQuaBatTatDeal {
  hopLe: boolean;
  loi?: string;
}

/**
 * Kiểm tra xem một deal có được phép bật hiển thị cho khách hay không.
 * Quy tắc cứng: Không cho bật deal may rủi khi da_dang_ky = false (docs/01 mục 2.10 & tasks/W017).
 */
export function kiemTraBatDeal(deal: Deal, trangThaiMoi: boolean): KetQuaBatTatDeal {
  if (trangThaiMoi) {
    if ((deal.may_rui || deal.loai === "may_rui") && !deal.da_dang_ky) {
      return {
        hopLe: false,
        loi: "Khuyến mại may rủi bị khóa cho đến khi chủ dự án xác nhận đã đăng ký với Sở Công Thương.",
      };
    }
  }

  return { hopLe: true };
}

/**
 * Cập nhật trạng thái hiển thị deal với kiểm tra an toàn.
 */
export function capNhatTrangThaiDeal(
  deal: Deal,
  trangThaiMoi: boolean
): Deal {
  const kiemTra = kiemTraBatDeal(deal, trangThaiMoi);
  if (!kiemTra.hopLe) {
    throw new Error(kiemTra.loi);
  }

  return {
    ...deal,
    hien_thi: trangThaiMoi,
  };
}

/**
 * Đánh dấu hết quà hoặc còn quà cho deal.
 */
export function capNhatHetQuaDeal(
  deal: Deal,
  hetQua: boolean
): Deal {
  return {
    ...deal,
    het_qua: hetQua,
  };
}
