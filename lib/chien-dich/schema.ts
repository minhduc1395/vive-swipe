import { z } from "zod";

export const NutBamSchema = z.object({
  chu: z.string().min(1),
  den: z.string().min(1),
});

export const VatPham3DSchema = z.object({
  id: z.string().min(1),
  anh: z.string().min(1),
  nap_anh: z.string().min(1).optional(),
  ten: z.string().optional(),
  ty_le_khung: z.number().positive().default(2.5).optional(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  co: z.number().min(0).max(1.5),
  xoay: z.number().optional(),
  ry: z.number().optional(),
  rz: z.number().optional(),
  z: z.number().optional(),
  mo: z.number().min(0).max(1).optional(),
  an: z.number().min(0).max(1).optional(),
});

export const VatThe3DSchema = z.object({
  ngang: z.array(VatPham3DSchema).min(1),
  doc: z.array(VatPham3DSchema).min(1).optional(),
});

export const VideoMediaSchema = z
  .object({
    mp4: z.string().optional(),
    webm: z.string().optional(),
    anh_bia: z.string().optional(),
  })
  .nullable();

export const KhoiHeroSchema = z.object({
  loai: z.literal("hero"),
  kieu: z.enum(["san-pham-3d", "video", "anh-lon", "cuon-ke"]),
  nhan_tren: z.string().optional(),
  tieu_de: z.array(z.string()).min(1),
  mo_ta: z.string().optional(),
  san_pham: z.array(z.string()).optional(),
  nut: z.array(NutBamSchema).optional(),
  video: VideoMediaSchema.optional(),
  mo_hinh: z.string().nullable().optional(),
  anh_tinh: z.string().nullable().optional(),
  hieu_ung: z.string().optional(),
  anh: z.array(z.string().min(1)).optional(),
  vat_the: VatThe3DSchema.optional(),
});

export const KhoiTieuDiemSchema = z.object({
  loai: z.literal("tieu-diem"),
  id: z.string().optional(),
  nhan_phu: z.string().optional(),
  tieu_de: z.array(z.string()).min(1),
  mo_ta: z.string().optional(),
  san_pham_id: z.string().optional(),
  deal_id: z.string().optional(),
  cta_chinh: NutBamSchema.optional(),
  anh: z.array(z.string().min(1)).optional(),
  vat_the: VatThe3DSchema.optional(),
});

export const KhoiBangChuSchema = z.object({
  loai: z.literal("bang-chu"),
  chu: z.string().min(1),
  mau_nen: z.string().optional(),
});

export const KhoiRaMatSchema = z.object({
  loai: z.literal("ra-mat"),
  tieu_de: z.string().min(1),
  mo_ta: z.string().optional(),
  deal: z.array(z.string()).optional(),
  san_pham: z.array(z.string()).optional(),
  anh_san_pham: z.record(z.string().min(1)).optional(),
  anh: z.array(z.string().min(1)).optional(),
  vat_the: VatThe3DSchema.optional(),
});

export const KhoiChuongTrinhSchema = z.object({
  loai: z.literal("chuong-trinh"),
  tieu_de: z.string().min(1),
  tieu_de_en: z.string().optional(),
  /** W048: logo VIVE đứng sau tiêu đề ("Đang có tại [logo]") */
  logo_sau_tieu_de: z.boolean().optional(),
  deal: z.array(z.string()),
  o_to: z.string().optional(),
});

export const KhoiDemNguocSchema = z.object({
  loai: z.literal("dem-nguoc"),
  tieu_de: z.string().optional(),
  thoi_gian_chot: z.string().min(1),
  cau_chu: z.string().optional(),
});

export const KhoiDoiTacSchema = z.object({
  loai: z.literal("doi-tac"),
  doi_tac: z.string().min(1),
  tieu_de: z.string().optional(),
  mo_ta: z.string().optional(),
  gia_goi: z.number().optional(),
  link: z.string().optional(),
});

export const KhoiVideoSchema = z.object({
  loai: z.literal("video"),
  tieu_de: z.string().optional(),
  mp4: z.string().optional(),
  webm: z.string().optional(),
  anh_bia: z.string().optional(),
  dinh_dang: z.enum(["ngang", "doc"]).optional(),
});

export const KhoiBoothSchema = z.object({
  loai: z.literal("booth"),
  tieu_de: z.string().optional(),
  dia_chi: z.string().optional(),
  gio: z.string().optional(),
  ngay_cuoi: z.string().optional(),
});

export const KhoiLandingSchema = z.discriminatedUnion("loai", [
  KhoiHeroSchema,
  KhoiTieuDiemSchema,
  KhoiBangChuSchema,
  KhoiRaMatSchema,
  KhoiChuongTrinhSchema,
  KhoiDemNguocSchema,
  KhoiDoiTacSchema,
  KhoiVideoSchema,
  KhoiBoothSchema,
]);

export const ChienDichSchema = z.object({
  ma: z.string().min(1),
  ten: z.string().min(1),
  bat_dau: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ket_thuc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  uu_tien: z.number().default(0),
  mau: z.object({
    nen: z.string(),
    nhan: z.string(),
    chu: z.string(),
  }),
  khoi: z.array(KhoiLandingSchema),
});
