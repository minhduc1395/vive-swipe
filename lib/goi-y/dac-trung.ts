import type { SanPham } from "@/lib/data/types";

export interface DacTrungKhoa {
  khoa: string;
  trongSo: number;
}

export const TRONG_SO_DAC_TRUNG = {
  danh_muc: 1.0,
  van_de: 1.0,
  thanh_phan: 0.8,
  thuong_hieu: 0.6,
  loai_da: 0.5,
  gia: 0.5,
} as const;

/**
 * Quy đổi giá bán thành khóa khoảng giá theo docs/02 mục 5.1.
 */
export function layKhoaGia(giaBan: number): string {
  if (giaBan < 200_000) return "gia:duoi-200k";
  if (giaBan <= 500_000) return "gia:200-500k";
  return "gia:tren-500k";
}

/**
 * Trích xuất tập khóa đặc trưng có trọng số cho một sản phẩm (docs/02 mục 5.1).
 */
export function trichXuatDacTrung(sanPham: SanPham): DacTrungKhoa[] {
  const map = new Map<string, number>();

  const them = (khoa: string, trongSo: number) => {
    const sach = khoa.trim();
    if (!sach) return;
    if (!map.has(sach)) {
      map.set(sach, trongSo);
    }
  };

  them(`dm:${sanPham.danh_muc}`, TRONG_SO_DAC_TRUNG.danh_muc);

  for (const vd of sanPham.van_de) {
    them(`vd:${vd}`, TRONG_SO_DAC_TRUNG.van_de);
  }
  for (const tp of sanPham.thanh_phan) {
    them(`tp:${tp}`, TRONG_SO_DAC_TRUNG.thanh_phan);
  }

  them(`th:${sanPham.thuong_hieu}`, TRONG_SO_DAC_TRUNG.thuong_hieu);

  for (const ld of sanPham.loai_da) {
    them(`ld:${ld}`, TRONG_SO_DAC_TRUNG.loai_da);
  }

  them(layKhoaGia(sanPham.gia_ban), TRONG_SO_DAC_TRUNG.gia);

  return Array.from(map.entries()).map(([khoa, trongSo]) => ({
    khoa,
    trongSo,
  }));
}
