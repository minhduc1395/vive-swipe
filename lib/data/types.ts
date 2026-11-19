import { z } from "zod";

export const DANH_MUC_HOP_LE = [
  "sua-rua-mat",
  "nuoc-can-bang",
  "toner-pad",
  "tinh-chat",
  "kem-duong",
  "mat-na",
  "chong-nang",
  "trang-diem",
  "duong-the",
  "duong-moi",
  "mieng-dan",
  "thiet-bi",
  "dich-vu",
] as const;

export const DanhMucSchema = z.enum(DANH_MUC_HOP_LE);
export type DanhMuc = z.infer<typeof DanhMucSchema>;

export const ConHangSchema = z.enum(["true", "false", "chua-ro"]);
export type ConHang = z.infer<typeof ConHangSchema>;

export const SanPhamSchema = z.object({
  id: z.string().min(1, "Thiếu mã sản phẩm id"),
  barcode: z.string().nullable(),
  thuong_hieu: z.string().min(1, "Thiếu thương hiệu"),
  ten_goc: z.string().min(1, "Thiếu ten_goc"),
  ten_hien_thi: z.string().min(1, "Thiếu ten_hien_thi"),
  quy_cach: z.string().nullable(),
  gia_goc: z.number().int().positive().nullable(),
  gia_ban: z.number().int().positive("gia_ban phải là số nguyên dương"),
  giam_tren_tag: z.string().nullable(),
  danh_muc: DanhMucSchema,
  van_de: z.array(z.string()),
  thanh_phan: z.array(z.string()),
  loai_da: z.array(z.string()),
  mo_ta: z.string().nullable().default(null),
  con_hang: ConHangSchema,
  ton: z.number().int().nonnegative().nullable(),
  hien_thi: z.boolean(),
  anh: z.string().nullable(),
  pho_bien: z.number().min(0).max(1).default(0.5),
  ghi_chu: z.string().nullable(),
});

export type SanPham = z.infer<typeof SanPhamSchema>;

export const LoaiDealSchema = z.enum([
  "giam_khi_mua_kem",
  "combo",
  "qua_theo_nguong_nhan",
  "qua_theo_nguong_don",
  "qua_khi_mua",
  "mua_x_tang_y",
  "khong_can_mua",
  "may_rui",
]);
export type LoaiDeal = z.infer<typeof LoaiDealSchema>;

export const TrangThaiDealSchema = z.enum([
  "DANG_CHAY",
  "DA_DUYET",
  "DE_XUAT",
  "HUY",
]);
export type TrangThaiDeal = z.infer<typeof TrangThaiDealSchema>;

export const ThanhPhanComboSchema = z.object({
  id: z.string().min(1),
  so_luong: z.number().int().positive(),
});

export const KhiHetQuaSchema = z.object({
  gia_combo: z.number().int().positive().optional(),
  qua: z.string().nullable().optional(),
  uu_dai: z.string().optional(),
});

export const BangQuaItemSchema = z.object({
  id: z.string().min(1),
  gia_tra: z.number().int().nonnegative(),
  qua: z.string().nullable(),
});

export const MocQuaSchema = z
  .object({
    tu: z.number().int().positive().optional(),
    tren: z.number().int().positive().optional(),
    qua: z.string().min(1),
    gioi_han: z.number().int().positive().optional(),
  })
  .refine((m) => m.tu !== undefined || m.tren !== undefined, {
    message: "Mốc quà phải có 'tu' hoặc 'tren'",
  });

export const GoiYBoSchema = z.object({
  id: z.string().min(1),
  ten: z.string().min(1),
  san_pham: z.array(z.string().min(1)).min(1),
  gia: z.number().int().positive(),
  moc: z.number().int().positive(),
  ghi_chu: z.string().optional(),
});

const NgayISOSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD");

export const DealSchema = z.object({
  id: z.string().min(1, "Thiếu id deal"),
  ten: z.string().min(1, "Thiếu tên deal"),
  loai: LoaiDealSchema,
  nhom_qua: z.enum(["hoa_don", "cong_them"]).optional(),
  trang_thai: TrangThaiDealSchema,
  may_rui: z.boolean(),
  da_dang_ky: z.boolean().default(false),
  hien_thi: z.boolean(),
  het_qua: z.boolean().default(false),
  bat_dau: NgayISOSchema.nullable().optional().default(null),
  ket_thuc: NgayISOSchema.nullable().optional().default(null),
  ap_dung_cho: z.array(z.string().min(1)).optional(),
  /** W048: mã sản phẩm có ảnh hiện trên thẻ deal (ưu tiên hơn thanh_phan, ap_dung_cho) */
  anh_san_pham: z.array(z.string().min(1)).optional(),
  dieu_kien: z.string().optional(),
  gia_uu_dai: z.record(z.string(), z.number().int().positive()).optional(),
  khong_cong_voi: z.array(z.string().min(1)).optional(),
  hook: z.string().optional(),
  thanh_phan: z.array(ThanhPhanComboSchema).optional(),
  gia_combo: z.number().int().positive().optional(),
  qua: z.string().nullable().optional(),
  gioi_han_qua: z.number().int().positive().optional(),
  khi_het_qua: KhiHetQuaSchema.optional(),
  gioi_han: z.number().int().positive().optional(),
  ghi_chu_noi_dung: z.string().optional(),
  bang_qua: z.array(BangQuaItemSchema).optional(),
  nhan_tinh: z.array(z.string().min(1)).optional(),
  moc: z.array(MocQuaSchema).optional(),
  goi_y: z.array(GoiYBoSchema).optional(),
  can_xac_nhan: z.string().optional(),
});

export type Deal = z.infer<typeof DealSchema>;

export const MangXaHoiSchema = z.object({
  ten: z.string().min(1),
  tai_khoan: z.string().min(1),
  url: z.string().url(),
});

export type MangXaHoi = z.infer<typeof MangXaHoiSchema>;

export const DoanhNghiepSchema = z.object({
  ten_cong_ty: z.string().min(1, "Thiếu ten_cong_ty"),
  dia_chi: z.string().min(1, "Thiếu dia_chi"),
  ma_so_thue: z.string().min(1, "Thiếu ma_so_thue"),
  email: z.string().email("Email doanh nghiệp không hợp lệ"),
  so_dien_thoai: z.string().nullable().optional().default(null),
  ten_cua_hang: z.string().min(1, "Thiếu ten_cua_hang"),
  dia_diem_booth: z.string().min(1, "Thiếu dia_diem_booth"),
  dia_chi_booth: z.string().optional(),
  dia_chi_booth_en: z.string().optional(),
  ban_do: z.string().url().optional(),
  mang_xa_hoi: z.array(MangXaHoiSchema).optional().default([]),
});

export type DoanhNghiep = z.infer<typeof DoanhNghiepSchema>;
