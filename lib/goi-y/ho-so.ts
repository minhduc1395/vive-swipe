import type { SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import { trichXuatDacTrung } from "./dac-trung";

export type HoSoKhach = Record<string, number>;

export type HanhDongHoSo =
  | "thich"
  | "gio"
  | "giu_hang"
  | "xem_chi_tiet"
  | "bo_qua"
  | "bo_thich";

export interface TraLoiCauHoi {
  loai_da?: string | null;
  van_de?: string[];
  ngan_sach?: string | null;
}

const HO_SO_TRUOC_SYMBOL = Symbol("VIVE_HO_SO_TRUOC");

type HoSoCoSnapshot = HoSoKhach & {
  [HO_SO_TRUOC_SYMBOL]?: HoSoKhach;
};

const TRONG_SO_TOI_THIEU = -3;
const TRONG_SO_TOI_DA = 5;

const MAP_LOAI_DA: Record<string, string | null> = {
  "da dau": "da-dau",
  "da-dau": "da-dau",
  "da kho": "da-kho",
  "da-kho": "da-kho",
  "da hon hop": "da-hon-hop",
  "da-hon-hop": "da-hon-hop",
  "da nhay cam": "da-nhay-cam",
  "da-nhay-cam": "da-nhay-cam",
  "da thuong": "moi-loai-da",
  "da-thuong": "moi-loai-da",
  "chua ro": null,
  "chua-ro": null,
};

const MAP_MOI_QUAN_TAM: Record<string, string> = {
  mun: "vd:mun",
  "lo chan long": "vd:lo-chan-long",
  "lo-chan-long": "vd:lo-chan-long",
  "tham, sang da": "vd:sang-da",
  "tham sang da": "vd:sang-da",
  "sang da": "vd:sang-da",
  "sang-da": "vd:sang-da",
  "cap am": "vd:cap-am",
  "cap-am": "vd:cap-am",
  "lam diu": "vd:lam-diu",
  "lam-diu": "vd:lam-diu",
  "chong lao hoa": "vd:chong-lao-hoa",
  "chong-lao-hoa": "vd:chong-lao-hoa",
  "chong nang": "vd:chong-nang",
  "chong-nang": "vd:chong-nang",
  "trang diem": "dm:trang-diem",
  "trang-diem": "dm:trang-diem",
  "cham soc co the": "dm:duong-the",
  "cham-soc-co-the": "dm:duong-the",
  "duong-the": "dm:duong-the",
  "thiet bi": "dm:thiet-bi",
  "thiet bi lam dep": "dm:thiet-bi",
  "thiet-bi": "dm:thiet-bi",
};

const MAP_NGAN_SACH: Record<string, string | null> = {
  "duoi 200k": "gia:duoi-200k",
  "duoi-200k": "gia:duoi-200k",
  "200k-500k": "gia:200-500k",
  "200k–500k": "gia:200-500k",
  "200-500k": "gia:200-500k",
  "tren 500k": "gia:tren-500k",
  "tren-500k": "gia:tren-500k",
  "khong quan trong": null,
  "khong-quan-trong": null,
};

function kepTrongSo(giaTri: number): number {
  return Math.max(TRONG_SO_TOI_THIEU, Math.min(TRONG_SO_TOI_DA, giaTri));
}

function saoChepHoSo(hoSo: HoSoKhach): HoSoKhach {
  const banSao: HoSoKhach = {};
  for (const [k, v] of Object.entries(hoSo)) {
    if (Number.isFinite(v) && v !== 0) {
      banSao[k] = v;
    }
  }
  return banSao;
}

function ganSnapshot(
  hoSoMoi: HoSoKhach,
  hoSoTruoc: HoSoKhach
): HoSoKhach {
  Object.defineProperty(hoSoMoi, HO_SO_TRUOC_SYMBOL, {
    value: hoSoTruoc,
    enumerable: false,
    configurable: true,
  });
  return hoSoMoi;
}

/**
 * Khởi tạo hồ sơ từ 3 câu hỏi đầu vào (docs/02 mục 5.2).
 */
export function khoiTaoHoSo(traLoi?: TraLoiCauHoi | null): HoSoKhach {
  const hoSo: HoSoKhach = {};
  if (!traLoi) return hoSo;

  if (traLoi.loai_da) {
    const chuan = chuanHoaTimKiem(traLoi.loai_da);
    const slug =
      chuan in MAP_LOAI_DA ? MAP_LOAI_DA[chuan] : chuan.replace(/\s+/g, "-");
    if (slug) {
      hoSo[`ld:${slug}`] = kepTrongSo((hoSo[`ld:${slug}`] ?? 0) + 1.5);
      if (slug === "da-nhay-cam") {
        hoSo["vd:lam-diu"] = kepTrongSo((hoSo["vd:lam-diu"] ?? 0) + 0.5);
      }
    }
  }

  if (traLoi.van_de && traLoi.van_de.length > 0) {
    for (const muc of traLoi.van_de) {
      const chuan = chuanHoaTimKiem(muc).replace(/–/g, "-");
      const khoa = MAP_MOI_QUAN_TAM[chuan] ?? `vd:${chuan.replace(/\s+/g, "-")}`;
      hoSo[khoa] = kepTrongSo((hoSo[khoa] ?? 0) + 1.5);
    }
  }

  if (traLoi.ngan_sach) {
    const chuan = chuanHoaTimKiem(traLoi.ngan_sach).replace(/–/g, "-");
    const khoaGia =
      chuan in MAP_NGAN_SACH ? MAP_NGAN_SACH[chuan] : `gia:${chuan}`;
    if (khoaGia) {
      hoSo[khoaGia] = kepTrongSo((hoSo[khoaGia] ?? 0) + 1.0);
    }
  }

  return hoSo;
}

/**
 * Hệ số học η = max(0.3, 1 / (1 + 0.05 * n)).
 */
export function tinhEta(soLuotDaQuet: number): number {
  const n = Math.max(0, soLuotDaQuet);
  return Math.max(0.3, 1 / (1 + 0.05 * n));
}

function layHeSoHanhDong(hanhDong: HanhDongHoSo, khoa: string): number {
  switch (hanhDong) {
    case "thich":
      return 1.0;
    case "gio":
      return 2.0;
    case "giu_hang":
      return 3.0;
    case "xem_chi_tiet":
      return 0.3;
    case "bo_thich":
      return -1.0;
    case "bo_qua":
      if (khoa.startsWith("gia:")) return -0.6;
      if (khoa.startsWith("th:")) return -0.3;
      return -0.4;
  }
}

/**
 * Cập nhật hồ sơ khách sau một hành động và lưu snapshot để hoàn tác chính xác.
 */
export function capNhatHoSo(
  hoSo: HoSoKhach,
  sanPham: SanPham,
  hanhDong: HanhDongHoSo,
  soLuotDaQuet: number
): HoSoKhach {
  const eta = tinhEta(soLuotDaQuet);
  const dacTrung = trichXuatDacTrung(sanPham);
  const hoSoMoi = saoChepHoSo(hoSo);

  for (const { khoa, trongSo } of dacTrung) {
    const h = layHeSoHanhDong(hanhDong, khoa);
    const giaTriMoi = kepTrongSo((hoSoMoi[khoa] ?? 0) + eta * h * trongSo);
    if (giaTriMoi === 0) {
      delete hoSoMoi[khoa];
    } else {
      hoSoMoi[khoa] = giaTriMoi;
    }
  }

  return ganSnapshot(hoSoMoi, hoSo);
}

/**
 * Hoàn tác về đúng trạng thái hồ sơ trước đó (kể cả khi trước đó chạm ngưỡng [-3, 5]).
 */
export function hoanTacHoSo(
  hoSo: HoSoKhach,
  sanPham?: SanPham,
  hanhDongTruoc?: HanhDongHoSo,
  soLuotDaQuetTruoc?: number
): HoSoKhach {
  const snapshot = (hoSo as HoSoCoSnapshot)[HO_SO_TRUOC_SYMBOL];
  if (snapshot) {
    return snapshot;
  }

  if (!sanPham || !hanhDongTruoc || soLuotDaQuetTruoc === undefined) {
    return saoChepHoSo(hoSo);
  }

  const eta = tinhEta(soLuotDaQuetTruoc);
  const dacTrung = trichXuatDacTrung(sanPham);
  const hoSoPhucHoi = saoChepHoSo(hoSo);

  for (const { khoa, trongSo } of dacTrung) {
    const h = layHeSoHanhDong(hanhDongTruoc, khoa);
    const giaTriCu = kepTrongSo((hoSoPhucHoi[khoa] ?? 0) - eta * h * trongSo);
    if (Math.abs(giaTriCu) < 1e-12) {
      delete hoSoPhucHoi[khoa];
    } else {
      hoSoPhucHoi[khoa] = giaTriCu;
    }
  }

  return hoSoPhucHoi;
}
