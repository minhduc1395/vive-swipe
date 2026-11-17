import type { Deal, SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import { trichXuatDacTrung } from "./dac-trung";
import type { HoSoKhach } from "./ho-so";

/**
 * Kiểm tra hồ sơ có đang rỗng (khách chưa trả lời câu hỏi và chưa có lượt quẹt nào).
 */
export function laHoSoRong(hoSo: HoSoKhach): boolean {
  return Object.values(hoSo).every((v) => !Number.isFinite(v) || v === 0);
}

/**
 * Điểm phù hợp hop(p) = Σ ho_so[k] * w_k / √(Σ w_k²) trên các khóa của p.
 */
export function tinhHop(sanPham: SanPham, hoSo: HoSoKhach): number {
  const dacTrung = trichXuatDacTrung(sanPham);
  if (dacTrung.length === 0) return 0;

  let tuSo = 0;
  let tongBinhPhuong = 0;

  for (const { khoa, trongSo } of dacTrung) {
    tuSo += (hoSo[khoa] ?? 0) * trongSo;
    tongBinhPhuong += trongSo * trongSo;
  }

  if (tongBinhPhuong === 0) return 0;
  return tuSo / Math.sqrt(tongBinhPhuong);
}

function sanPhamNamTrongDeal(sanPham: SanPham, dealsHienThi: Deal[]): boolean {
  const nhanSp = chuanHoaTimKiem(sanPham.thuong_hieu);

  for (const deal of dealsHienThi) {
    if (deal.loai === "combo") {
      if (deal.thanh_phan?.some((tp) => tp.id === sanPham.id)) {
        return true;
      }
      if (deal.id.startsWith("LOPOE-COMBO") && nhanSp === "lopoe") {
        return true;
      }
      if (deal.id === "KM-11" && nhanSp === "skinfood") {
        return true;
      }
    }

    if (deal.id === "KM-08" && deal.nhan_tinh) {
      if (deal.nhan_tinh.some((n) => chuanHoaTimKiem(n) === nhanSp)) {
        return true;
      }
    }

    if (deal.id === "LOPOE-25" && deal.ap_dung_cho?.includes(sanPham.id)) {
      return true;
    }

    if (deal.ap_dung_cho?.includes(sanPham.id)) {
      return true;
    }
  }

  return false;
}

/**
 * Điểm deal(p) trong [0, 1] theo docs/02 mục 5.3:
 * min(1, %giảm / 50) + (0.3 nếu nằm trong deal đang hiện), kẹp trong [0, 1].
 */
export function tinhDealDiem(
  sanPham: SanPham,
  dealsHienThi: Deal[]
): number {
  let phanTramGiam = 0;
  if (sanPham.gia_goc && sanPham.gia_goc > sanPham.gia_ban) {
    phanTramGiam =
      ((sanPham.gia_goc - sanPham.gia_ban) / sanPham.gia_goc) * 100;
  }

  let diem = Math.min(1, phanTramGiam / 50);
  if (sanPhamNamTrongDeal(sanPham, dealsHienThi)) {
    diem += 0.3;
  }
  return Math.min(1, Math.max(0, diem));
}

/**
 * Phạt chống lặp theo 2 thẻ ngay trước:
 * +0.5 nếu cùng thương hiệu; +0.3 nếu cùng danh mục.
 */
export function tinhPhat(
  sanPham: SanPham,
  haiTheTruoc: SanPham[]
): number {
  if (haiTheTruoc.length === 0) return 0;

  let phat = 0;
  if (haiTheTruoc.some((t) => t.thuong_hieu === sanPham.thuong_hieu)) {
    phat += 0.5;
  }
  if (haiTheTruoc.some((t) => t.danh_muc === sanPham.danh_muc)) {
    phat += 0.3;
  }
  return phat;
}

/**
 * Tổng điểm xếp deck theo docs/02 mục 5.3:
 * - Có hồ sơ: hop(p) + 0.6 * deal(p) + 0.3 * (pho_bien(p) - 0.5) - phat(p)
 * - Chưa trả lời (hồ sơ rỗng): 0.6 * deal(p) + pho_bien(p) - phat(p)
 */
export function tinhDiemSanPham(
  sanPham: SanPham,
  thamSo: {
    hoSo: HoSoKhach;
    dealsHienThi: Deal[];
    haiTheTruoc?: SanPham[];
  }
): number {
  const { hoSo, dealsHienThi, haiTheTruoc = [] } = thamSo;
  const deal = tinhDealDiem(sanPham, dealsHienThi);
  const phat = tinhPhat(sanPham, haiTheTruoc);
  const phoBien = sanPham.pho_bien ?? 0.5;

  if (laHoSoRong(hoSo)) {
    return 0.6 * deal + phoBien - phat;
  }

  const hop = tinhHop(sanPham, hoSo);
  return hop + 0.6 * deal + 0.3 * (phoBien - 0.5) - phat;
}
