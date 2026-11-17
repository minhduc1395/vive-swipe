import type { Deal, SanPham } from "@/lib/data/types";
import { dinhDangTien } from "@/lib/dinh-dang";
import { layDealHienThi } from "./hien-thi";

/**
 * Lấy danh sách các deal đang hiển thị có chứa hoặc áp dụng cho sản phẩm này.
 */
export function layCacDealCuaSanPham(
  sanPham: SanPham,
  deals: Deal[],
  ngay: string | Date = new Date()
): Deal[] {
  const dealsHienThi = layDealHienThi(deals, ngay);
  return dealsHienThi.filter((deal) => {
    // 1. Áp dụng cho danh sách ID cụ thể (ví dụ: LOPOE-25)
    if (deal.ap_dung_cho && deal.ap_dung_cho.includes(sanPham.id)) {
      return true;
    }
    // 2. Combo chứa sản phẩm
    if (deal.loai === "combo" && deal.thanh_phan) {
      if (deal.thanh_phan.some((tp) => tp.id === sanPham.id)) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Lấy ghi chú ngắn về deal cho thẻ deck, danh mục và đã thích (docs/01 mục 2.3).
 * Trả về undefined nếu không có deal nào đang chạy áp dụng cho sản phẩm.
 */
export function layGhiChuDeal(
  sanPham: SanPham,
  deals: Deal[],
  ngay: string | Date = new Date()
): string | undefined {
  const dealsLienQuan = layCacDealCuaSanPham(sanPham, deals, ngay);
  if (dealsLienQuan.length === 0) return undefined;

  // Ưu tiên 1: Deal giảm giá khi mua kèm (ví dụ: LOPOE-25)
  const dealMuaKem = dealsLienQuan.find((d) => d.loai === "giam_khi_mua_kem");
  if (dealMuaKem && dealMuaKem.gia_uu_dai && dealMuaKem.gia_uu_dai[sanPham.id]) {
    const giaGiam = dealMuaKem.gia_uu_dai[sanPham.id];
    return `Mua kèm: còn ${dinhDangTien(giaGiam)}`;
  }

  // Ưu tiên 2: Combo chứa sản phẩm (ví dụ: COMBO PINK)
  const dealCombo = dealsLienQuan.find((d) => d.loai === "combo");
  if (dealCombo) {
    if (dealCombo.gia_combo) {
      return `Có trong ${dealCombo.ten} ${dinhDangTien(dealCombo.gia_combo)}`;
    }
    return `Có trong ${dealCombo.ten}`;
  }

  // Ưu tiên 3: Deal đầu tiên liên quan
  return dealsLienQuan[0].ten;
}
