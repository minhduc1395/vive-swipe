export type KieuHero = "san-pham-3d" | "video" | "anh-lon" | "cuon-ke";

export interface NutBam {
  chu: string;
  den: string;
}

export interface VatPham3D {
  id: string;
  anh: string;
  nap_anh?: string;
  ten?: string;
  dx?: number; // % lệch ngang so với tâm cụm
  dy?: number; // % lệch dọc so với tâm cụm
  ty_le?: number; // tỉ lệ kích thước so với co của cụm (mặc định 1)
  ty_le_khung?: number; // height/width aspect ratio thực của ảnh
  xoay?: number;
  mo?: number;
  an?: boolean;
}

export interface MocVatThe3D {
  x: number; // % tâm ngang khung nhìn (0..100)
  y: number; // % tâm dọc khung nhìn (0..100)
  co: number; // % cạnh ngắn khung nhìn min(100vw, 100dvh)
  xoay?: number;
  mo?: number;
  vat_pham?: VatPham3D[];
}

export interface VatThe3D {
  dien_thoai?: MocVatThe3D;
  may_tinh_bang?: MocVatThe3D;
  may_tinh: MocVatThe3D;
}

export type MocManHinh3D = "dien_thoai" | "may_tinh_bang" | "may_tinh";

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
  vat_the?: VatThe3D;
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
  vat_the?: VatThe3D;
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
  vat_the?: VatThe3D;
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
