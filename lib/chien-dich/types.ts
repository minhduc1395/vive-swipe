export type KieuHero = "san-pham-3d" | "video" | "anh-lon" | "cuon-ke";

export interface NutBam {
  chu: string;
  den: string;
}

export interface VatThe3D {
  id: string;
  anh: string;
  nap_anh?: string;
  ten?: string;
  rong_px?: number;
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale: number;
  mo?: number;
}

export interface VideoMedia {
  mp4?: string;
  webm?: string;
  anh_bia?: string;
}

export interface KhoiHero {
  loai: "hero";
  kieu: KieuHero;
  nhan_tren?: string;
  tieu_de: string[];
  mo_ta?: string;
  san_pham?: string[];
  nut?: NutBam[];
  video?: VideoMedia | null;
  mo_hinh?: string | null;
  anh_tinh?: string | null;
  hieu_ung?: string;
  anh?: string[];
  vat_the?: VatThe3D[];
}

export interface KhoiTieuDiem {
  loai: "tieu-diem";
  id?: string;
  nhan_phu?: string;
  tieu_de: string[];
  mo_ta?: string;
  san_pham_id?: string;
  deal_id?: string;
  cta_chinh?: NutBam;
  anh?: string[];
  vat_the?: VatThe3D[];
}

export interface KhoiBangChu {
  loai: "bang-chu";
  chu: string;
  mau_nen?: string;
}

export interface KhoiRaMat {
  loai: "ra-mat";
  tieu_de: string;
  mo_ta?: string;
  deal?: string[];
  san_pham?: string[];
  anh_san_pham?: Record<string, string>;
  anh?: string[];
  vat_the?: VatThe3D[];
}

export interface KhoiChuongTrinh {
  loai: "chuong-trinh";
  tieu_de: string;
  deal: string[];
  o_to?: string;
}

export interface KhoiDemNguoc {
  loai: "dem-nguoc";
  tieu_de?: string;
  thoi_gian_chot: string;
  cau_chu?: string;
}

export interface KhoiDoiTac {
  loai: "doi-tac";
  doi_tac: string;
  tieu_de?: string;
  mo_ta?: string;
  gia_goi?: number;
  link?: string;
}

export interface KhoiVideo {
  loai: "video";
  tieu_de?: string;
  mp4?: string;
  webm?: string;
  anh_bia?: string;
  dinh_dang?: "ngang" | "doc";
}

export interface KhoiBooth {
  loai: "booth";
  tieu_de?: string;
  dia_chi?: string;
  gio?: string;
  ngay_cuoi?: string;
}

export type KhoiLanding =
  | KhoiHero
  | KhoiTieuDiem
  | KhoiBangChu
  | KhoiRaMat
  | KhoiChuongTrinh
  | KhoiDemNguoc
  | KhoiDoiTac
  | KhoiVideo
  | KhoiBooth;

export interface ChienDich {
  ma: string;
  ten: string;
  bat_dau: string;
  ket_thuc: string;
  uu_tien: number;
  mau: {
    nen: string;
    nhan: string;
    chu: string;
  };
  khoi: KhoiLanding[];
}
