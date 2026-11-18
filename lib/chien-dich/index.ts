import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import chienDichJson from "@/lib/data/chien-dich.json";
import { ChienDichSchema } from "./schema";
import type { ChienDich } from "./types";

export * from "./types";
export * from "./schema";
export {
  layVatTheTheoCheDo,
  datVaoVung,
  type VungVatThe,
  type KetQuaDatVung,
} from "./vat-the";

export const CHIEN_DICH_MAC_DINH_LIST = (chienDichJson as unknown as ChienDich[]).map((cd) =>
  ChienDichSchema.parse(cd)
);

/**
 * Phân tích cú pháp chuỗi YAML chiến dịch và kiểm tra bằng Zod.
 */
export function parseChienDichYaml(yamlText: string): ChienDich {
  const parsed = yaml.load(yamlText);
  return ChienDichSchema.parse(parsed);
}

/**
 * Đọc tất cả các file .yaml trong thư mục data/chien-dich.
 */
export function docDanhSachChienDichTuDisk(
  dirPath = path.join(process.cwd(), "data", "chien-dich")
): ChienDich[] {
  if (
    typeof window !== "undefined" ||
    process.env.NODE_ENV === "production" ||
    !fs.existsSync ||
    !fs.existsSync(dirPath)
  ) {
    return CHIEN_DICH_MAC_DINH_LIST;
  }
  const files = fs.readdirSync(dirPath);
  const danhSach: ChienDich[] = [];

  for (const file of files) {
    if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      const fullPath = path.join(dirPath, file);
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        const cd = parseChienDichYaml(content);
        danhSach.push(cd);
      } catch (err) {
        console.error(`Lỗi đọc chiến dịch từ file ${file}:`, err);
      }
    }
  }

  if (danhSach.length === 0) {
    return CHIEN_DICH_MAC_DINH_LIST;
  }

  // Sắp xếp theo ưu tiên giảm dần
  danhSach.sort((a, b) => b.uu_tien - a.uu_tien);
  return danhSach;
}

/**
 * Chọn đợt chiến dịch đang chạy theo ngày và ưu tiên cao nhất.
 * Nếu không có đợt nào đang chạy thì trả về đợt mặc định hoặc đợt đầu tiên.
 */
export function layChienDichHienTai(
  ngayChon: string | Date = new Date(),
  danhSach: ChienDich[] = []
): ChienDich | null {
  const list = danhSach.length > 0 ? danhSach : docDanhSachChienDichTuDisk();
  if (list.length === 0) {
    return null;
  }

  const ngayStr =
    typeof ngayChon === "string"
      ? ngayChon.slice(0, 10)
      : ngayChon.toISOString().slice(0, 10);

  // Tìm các đợt đang trong thời gian chạy
  const dangChay = list.filter(
    (cd) => cd.bat_dau <= ngayStr && ngayStr <= cd.ket_thuc
  );

  if (dangChay.length > 0) {
    // Sắp xếp theo ưu tiên giảm dần
    dangChay.sort((a, b) => b.uu_tien - a.uu_tien);
    return dangChay[0];
  }

  // Nếu không có đợt nào đang chạy, tìm đợt có mã 'mac-dinh'
  const macDinh = list.find((cd) => cd.ma === "mac-dinh");
  if (macDinh) {
    return macDinh;
  }

  // Fallback: trả về đợt có ưu tiên cao nhất
  return list[0];
}
