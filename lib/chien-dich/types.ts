export type KieuHero = "san-pham-3d" | "video" | "anh-lon" | "cuon-ke";

export interface NutBam {
  chu: string;
  chu_en?: string;
  den: string;
}

export interface VatPham3D {
  id: string; // vd: "ampoule", "srm", "kem"
  anh: string;
  nap_anh?: string;
  ten?: string;
  ty_le_khung?: number; // natural height/width aspect ratio
  x: number; // 0..1 tâm ngang trong vùng vật thể V
  y: number; // 0..1 tâm dọc trong vùng vật thể V
  co: number; // chiều cao vật thể / chiều cao vùng V
  xoay?: number; // độ (deg)
  ry?: number; // radian
  rz?: number; // radian
  z?: number;
  mo?: number; // 0..1 độ nhấc bóp/nắp
  an?: number; // 0..1 độ ẩn mờ (1 = ẩn hoàn toàn)
}

export interface VatThe3D {
  ngang: VatPham3D[];
  doc?: VatPham3D[];
}

export type CheDoVung3D = "ngang" | "doc";

export interface VideoMedia {
  mp4?: string;
  webm?: string;
  anh_bia?: string;
}

export interface KhoiHero {
  loai: "hero";
  kieu: KieuHero;
  nhan_tren?: string;
  nhan_tren_en?: string;
  tieu_de: string[];
  tieu_de_en?: string[];
  mo_ta?: string;
  mo_ta_en?: string;
  san_pham?: string[];
  nut?: NutBam[];
  video?: VideoMedia | null;
  mo_hinh?: string | null;
  anh_tinh?: string | null;
  hieu_ung?: string;
  anh?: string[];
  vat_the?: VatThe3D;
}

export interface KhoiTieuDiem {
  loai: "tieu-diem";
  id?: string;
  nhan_phu?: string;
  nhan_phu_en?: string;
  tieu_de: string[];
  tieu_de_en?: string[];
  mo_ta?: string;
  mo_ta_en?: string;
  san_pham_id?: string;
  deal_id?: string;
  cta_chinh?: NutBam;
  anh?: string[];
  vat_the?: VatThe3D;
}

export interface KhoiBangChu {
  loai: "bang-chu";
  chu: string;
  chu_en?: string;
  mau_nen?: string;
}

export interface KhoiRaMat {
  loai: "ra-mat";
  tieu_de: string;
  tieu_de_en?: string;
  mo_ta?: string;
  mo_ta_en?: string;
  deal?: string[];
  san_pham?: string[];
  anh_san_pham?: Record<string, string>;
  anh?: string[];
  vat_the?: VatThe3D;
}

export interface KhoiChuongTrinh {
  loai: "chuong-trinh";
  tieu_de: string;
  tieu_de_en?: string;
  logo_sau_tieu_de?: boolean;
  deal: string[];
  o_to?: string;
}

export interface KhoiDemNguoc {
  loai: "dem-nguoc";
  tieu_de?: string;
  tieu_de_en?: string;
  thoi_gian_chot: string;
  cau_chu?: string;
  cau_chu_en?: string;
}

export interface KhoiDoiTac {
  loai: "doi-tac";
  doi_tac: string;
  tieu_de?: string;
  tieu_de_en?: string;
  mo_ta?: string;
  mo_ta_en?: string;
  gia_goi?: number;
  link?: string;
}

export interface KhoiVideo {
  loai: "video";
  tieu_de?: string;
  tieu_de_en?: string;
  mp4?: string;
  webm?: string;
  anh_bia?: string;
  dinh_dang?: "ngang" | "doc";
}

export interface KhoiBooth {
  loai: "booth";
  tieu_de?: string;
  tieu_de_en?: string;
  dia_chi?: string;
  dia_chi_en?: string;
  gio?: string;
  gio_en?: string;
  ngay_cuoi?: string;
  ngay_cuoi_en?: string;
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
  /** W064: phần đầu landing dùng khối cuộn 3D như trang chủ */
  cuon_3d?: "lopoe";
  khoi: KhoiLanding[];
}
