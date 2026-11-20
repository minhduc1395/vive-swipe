import yaml from "js-yaml";
import { z } from "zod";

export const NutTrangChuSchema = z
  .object({
    chu: z.string().min(1, "Nút trang chủ phải có chữ hiển thị"),
    den: z.string().nullable().optional(),
    sap_co: z.boolean().optional(),
    nguon_den: z.enum(["doanh_nghiep.ban_do"]).optional(),
    mo_tab_moi: z.boolean().optional(),
    kieu: z.enum(["chinh", "phu"]).default("chinh"),
  })
  .refine(
    (n) =>
      n.sap_co === true ||
      n.den === null ||
      n.nguon_den !== undefined ||
      (typeof n.den === "string" && n.den.length > 0),
    {
      message: "Nút chưa có đích cần đặt den: null hoặc sap_co: true",
    }
  );

export type NutTrangChu = z.infer<typeof NutTrangChuSchema>;

export const DaiThongBaoSchema = z.object({
  deal_id: z.string().min(1),
  mac_dinh_chu: z.string().min(1),
  nut: NutTrangChuSchema,
});

export const CuaHangKhoiSchema = z.object({
  phu_de: z.string().min(1),
  mo_ta_anh: z.string().min(1),
  cot: z.number().int().positive().default(6),
  hang: z.number().int().positive().default(4),
  anh_mat_tien: z.array(z.string().min(1)).min(1),
  nut: z.array(NutTrangChuSchema).min(1),
});

export const ThuongHieuLogoSchema = z.object({
  ten: z.string().min(1),
  den: z.string().min(1),
  logo_slug: z.string().min(1).optional(),
  logo: z.string().min(1).nullable().optional(),
});

export type ThuongHieuLogo = z.infer<typeof ThuongHieuLogoSchema>;

export const ThuongHieuKhoiSchema = z.object({
  tieu_de: z.string().min(1),
  dong_logo_hau: z.string().min(1),
  nhan_aria: z.string().min(1),
  danh_sach: z.array(ThuongHieuLogoSchema).min(1),
});

export const OTrongLuoiSchema = z.object({
  id: z.string().min(1),
  /**
   * Màu nền ô theo bảng màu nội thất cửa hàng (USQ_LL1_VIVE rev14, Option 1 Natural–Modern–Warm):
   * kem #F8F4EA (Ivory), be #E6D7C3 (Beige), cat #D2BBA3 (Sand), oliu-nhat (Olive pha trắng), oliu-vua (Olive nhạt), trang.
   * Không nền đen/tối (CĐT 20/11). Đổi mã màu ở trang-chu.css, không đổi tên ở đây.
   */
  mau_nen: z.enum(["kem", "be", "cat", "oliu-nhat", "oliu-vua", "trang"]),
  /** W056: cỡ ô trong lưới 6 cột: vua = 1/2, rong = 2/3, nho = 1/3 */
  co: z.enum(["vua", "rong", "nho"]).default("vua"),
  tieu_de: z.string().min(1),
  phu_de_truoc: z.string().optional(),
  phu_de_nghieng: z.string().optional(),
  phu_de_sau: z.string().optional(),
  co_logo: z.boolean().optional(),
  deal_id: z.string().optional(),
  nhan_thuong_hieu: z.string().optional(),
  anh: z.string().min(1).optional(),
  anh_sp: z.boolean().optional(),
  /** W055: nhiều ảnh sản phẩm đứng cạnh nhau (combo), ảnh nền trong suốt */
  anh_bo: z.array(z.string().min(1)).min(1).optional(),
  /** W056: ảnh sản phẩm từ kho media theo mã (bảng san_pham), 1–3 mã */
  san_pham: z.array(z.string().min(1)).min(1).max(3).optional(),
  mo_ta_anh: z.string().optional(),
  so_lon: z.string().optional(),
  /** W055: dòng nhỏ dưới phụ đề, lấy quà của deal_id ("Tặng ... Số lượng có hạn.") */
  hien_qua: z.boolean().optional(),
  nut: z.array(NutTrangChuSchema).min(1),
});

export type OTrongLuoi = z.infer<typeof OTrongLuoiSchema>;

export const QuaLopoeKhoiSchema = z.object({
  phu_de: z.string().optional(),
  deal_id: z.string().min(1),
  tien_to_tieu_de: z.string().min(1),
  hau_to_tieu_de: z.string().min(1),
  anh: z.string().min(1),
  mo_ta_anh: z.string().min(1),
  nut: z.array(NutTrangChuSchema).min(1),
});

/** W055: thẻ combo trong hàng trượt ngang. Giá, quà lấy từ deal_id trong data/deals.yaml. */
export const TheComboSchema = z.object({
  deal_id: z.string().min(1),
  mau_nen: z.enum(["kem", "be", "cat", "oliu-nhat", "oliu-vua", "trang"]),
  nhan: z.string().min(1),
  ten: z.string().min(1),
  anh_bo: z.array(z.string().min(1)).optional(),
  san_pham: z.array(z.string().min(1)).min(1).max(3).optional(),
  so_lon: z.string().optional(),
});

export type TheCombo = z.infer<typeof TheComboSchema>;

export const TruotComboSchema = z.object({
  tieu_de: z.string().min(1),
  phu_de: z.string().optional(),
  nut: NutTrangChuSchema,
  the: z.array(TheComboSchema).min(3),
});

export const GheViveKhoiSchema = z.object({
  tien_to_tieu_de: z.string().min(1),
  dia_diem_ngan: z.string().min(1),
  chu_lon: z.string().min(1),
  nut: z.array(NutTrangChuSchema).min(1),
});

export const TrangChuConfigSchema = z.object({
  dai_thong_bao: DaiThongBaoSchema,
  cua_hang: CuaHangKhoiSchema,
  thuong_hieu: ThuongHieuKhoiSchema,
  luoi_doi: z.array(OTrongLuoiSchema).min(1),
  qua_lopoe: QuaLopoeKhoiSchema,
  truot_combo: TruotComboSchema,
  ghe_vive: GheViveKhoiSchema,
});

export type TrangChuConfig = z.infer<typeof TrangChuConfigSchema>;

/**
 * Phân tích và kiểm tra cấu hình trang chủ `/` từ YAML.
 */
export function parseTrangChuYaml(yamlText: string): TrangChuConfig {
  let taiLieu: unknown;
  try {
    taiLieu = yaml.load(yamlText, { schema: yaml.JSON_SCHEMA });
  } catch (err) {
    const chiTiet = err instanceof Error ? err.message : String(err);
    throw new Error(`YAML trang-chu sai cú pháp: ${chiTiet}`);
  }
  return TrangChuConfigSchema.parse(taiLieu);
}
