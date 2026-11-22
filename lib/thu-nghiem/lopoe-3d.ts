import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

const NutSchema = z.object({ chu: z.string().min(1), chu_en: z.string().optional(), den: z.string().min(1).nullable() });
export const KhoiChu3DSchema = z.object({
  id: z.string().min(1),
  a: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  vi_tri: z.enum(["phai", "trai", "tren-trai", "cot", "duoi-giua", "trai-duoi", "tren-giua"]),
  tu: z.enum(["phai", "trai", "tren", "duoi"]),
  ten_nho: z.string().optional(),
  ten_nho_en: z.string().optional(),
  tu_khoa: z.string().optional(),
  tu_khoa_en: z.string().optional(),
  nhan_tu: z.number().int().nonnegative().optional(),
  nhan_dau: z.number().int().nonnegative().optional(),
  co: z.enum(["lon", "vua"]).default("vua"),
  lon_nghieng: z.string().optional(),
  lon_nghieng_en: z.string().optional(),
  cau: z.string().optional(),
  cau_en: z.string().optional(),
  cau_lon: z.boolean().optional(),
  chips: z.array(z.string()).default([]),
  chips_en: z.array(z.string()).optional(),
  /** Huy hiệu gốc của nhãn (bằng chứng cho câu cho_duyet). Chỉ gắn vào đúng sản phẩm được trao. */
  huy_hieu: z.object({ anh: z.string().min(1), mo_ta: z.string().min(1), mo_ta_en: z.string().optional() }).optional(),
  nut: z.array(NutSchema).default([]),
  cho_duyet: z.boolean().default(false),
});
const ThanhPhanSchema = z.object({
  loai: z.enum(["thua", "sen", "phan-tu", "rau-ma", "xoan"]),
  ten: z.string().min(1),
  ten_en: z.string().optional(),
  loi: z.string().min(1),
  loi_en: z.string().optional(),
});
const Cap = z.tuple([z.number(), z.number()]);
/**
 * W072: bố cục "bọt nước" cho đoạn 4 hoạt chất ampoule (sau công tắc). Bật khi `bat: true` hoặc URL có `?bot-nuoc=1`.
 * Máy tính: 4 bọt xếp vòng cung quanh tâm `tam` (% khung nhìn), bán kính min(ban_kinh[0]vw, ban_kinh[1]vh), góc theo `goc` (độ);
 * cỡ bọt min(co[0]vw, co[1]vh). Điện thoại: lưới 2×2 từ `tren` (% chiều cao) tới cách đáy `duoi` px, cỡ bọt min(co[0]vw, co[1]vh).
 */
export const BotNuocSchema = z.object({
  bat: z.boolean().default(false),
  anh: z.object({ thua: z.string(), sen: z.string(), "phan-tu": z.string(), "rau-ma": z.string(), xoan: z.string() }).partial(),
  may_tinh: z.object({ tam: Cap, ban_kinh: Cap, goc: z.array(z.number()).length(4), co: Cap }),
  dien_thoai: z.object({ tren: z.number().min(0).max(100), duoi: z.number().min(0), co: Cap }),
});
export type BotNuoc = z.infer<typeof BotNuocSchema>;
export const CauHinhLopoe3DSchema = z.object({
  hien_cho_duyet: z.boolean().default(false),
  tai_san: z.object({ ampoule_than: z.string(), ampoule_nap: z.string(), ampoule_co: z.string(), giot: z.string(), sua_rua_mat: z.string(), kem_duong: z.string() }),
  mo_dau: z.object({ nho: z.string(), nho_en: z.string().optional(), tieu_de: z.string(), tieu_de_en: z.string().optional(), cau: z.string(), cau_en: z.string().optional(), nut: z.array(NutSchema).default([]) }),
  khoi: z.array(KhoiChu3DSchema).min(1),
  thanh_phan: z.object({ sua_rua_mat: z.array(ThanhPhanSchema).length(4), ampoule: z.array(ThanhPhanSchema).length(4) }),
  /** DES-004: ảnh thành phần thật (BOD duyệt QD-DES-001) thay biểu tượng 3D trừu tượng; loại không có ảnh giữ 3D. */
  anh_thanh_phan: z.object({ thua: z.string(), sen: z.string(), "phan-tu": z.string(), "rau-ma": z.string() }).partial().default({}),
  so_1: z.string().default("No.1"),
  so_1_en: z.string().optional(),
  bot_nuoc: BotNuocSchema.optional(),
  /** W063: điện thoại dùng chuỗi ảnh dựng sẵn thay three.js (mượt, không nóng máy). Ảnh chỉ có sản phẩm + nền; chữ và nhãn vẫn là DOM. */
  khung_dien_thoai: z.object({
    thu_muc: z.string(), so: z.number().int().min(2), rong: z.number(), cao: z.number(),
    vp_rong: z.number(), vp_cao: z.number(), nhan: z.string(),
  }).optional(),
});
export type KhoiChu3D = z.infer<typeof KhoiChu3DSchema>;
export type CauHinhLopoe3D = z.infer<typeof CauHinhLopoe3DSchema>;

export function parseCauHinhLopoe3D(text: string): CauHinhLopoe3D {
  return CauHinhLopoe3DSchema.parse(yaml.load(text));
}

/** Khối được hiện: câu cần bằng chứng chỉ hiện khi có huy hiệu (bằng chứng) hoặc đang ở chế độ duyệt. */
export function locKhoiDuocHien(cfg: CauHinhLopoe3D, cheDoDuyet = false): CauHinhLopoe3D {
  const hien = cheDoDuyet || cfg.hien_cho_duyet;
  return { ...cfg, khoi: cfg.khoi.filter((k) => !k.cho_duyet || hien || Boolean(k.huy_hieu)) };
}

/** Đọc data/thu-nghiem/lopoe-3d.yaml (để ngoài data/chien-dich cho bộ đọc chiến dịch không đọc nhầm) (chạy lúc build, trang tĩnh). */
export function docCauHinhLopoe3D(cheDoDuyet = false): CauHinhLopoe3D {
  const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data", "thu-nghiem", "lopoe-3d.yaml"), "utf8"));
  return locKhoiDuocHien(cfg, cheDoDuyet);
}
