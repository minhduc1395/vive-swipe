import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

const NutSchema = z.object({ chu: z.string().min(1), den: z.string().min(1) });
export const KhoiChu3DSchema = z.object({
  id: z.string().min(1),
  a: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  vi_tri: z.enum(["phai", "trai", "tren-trai", "cot", "duoi-giua", "trai-duoi"]),
  tu: z.enum(["phai", "trai", "tren", "duoi"]),
  ten_nho: z.string().optional(),
  tu_khoa: z.string().optional(),
  nhan_tu: z.number().int().nonnegative().optional(),
  nhan_dau: z.number().int().nonnegative().optional(),
  co: z.enum(["lon", "vua"]).default("vua"),
  lon_nghieng: z.string().optional(),
  cau: z.string().optional(),
  cau_lon: z.boolean().optional(),
  chips: z.array(z.string()).default([]),
  cho_duyet: z.boolean().default(false),
});
const ThanhPhanSchema = z.object({
  loai: z.enum(["thua", "sen", "phan-tu", "rau-ma", "xoan"]),
  ten: z.string().min(1),
  loi: z.string().min(1),
});
export const CauHinhLopoe3DSchema = z.object({
  hien_cho_duyet: z.boolean().default(false),
  tai_san: z.object({ ampoule_glb: z.string(), sua_rua_mat: z.string(), kem_duong: z.string() }),
  mo_dau: z.object({ nho: z.string(), tieu_de: z.string(), cau: z.string(), nut: z.array(NutSchema).default([]) }),
  khoi: z.array(KhoiChu3DSchema).min(1),
  thanh_phan: z.object({ sua_rua_mat: z.array(ThanhPhanSchema).length(4), ampoule: z.array(ThanhPhanSchema).length(4) }),
  so_1: z.string().default("No.1"),
});
export type KhoiChu3D = z.infer<typeof KhoiChu3DSchema>;
export type CauHinhLopoe3D = z.infer<typeof CauHinhLopoe3DSchema>;

export function parseCauHinhLopoe3D(text: string): CauHinhLopoe3D {
  return CauHinhLopoe3DSchema.parse(yaml.load(text));
}

/** Đọc data/thu-nghiem/lopoe-3d.yaml (chạy lúc build, trang tĩnh). Ẩn khối cho_duyet khi hien_cho_duyet = false. */
export function docCauHinhLopoe3D(): CauHinhLopoe3D {
  const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data", "thu-nghiem", "lopoe-3d.yaml"), "utf8"));
  return cfg.hien_cho_duyet ? cfg : { ...cfg, khoi: cfg.khoi.filter((k) => !k.cho_duyet) };
}
