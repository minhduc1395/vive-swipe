import dealsJson from "./deals.json";
import doanhNghiepJson from "./doanh-nghiep.json";
import productsJson from "./products.json";
import type { Deal, DoanhNghiep, SanPham } from "./types";
import { hienThi, layDealHienThi } from "@/lib/deals/hien-thi";

export const SAN_PHAM: SanPham[] = productsJson as SanPham[];
export const DEALS: Deal[] = dealsJson as Deal[];
export const DOANH_NGHIEP: DoanhNghiep = doanhNghiepJson as DoanhNghiep;

/**
 * Lọc sản phẩm đủ điều kiện hiển thị trên web:
 * hien_thi = true, con_hang khác "false", và có đường dẫn ảnh.
 */
export function laySanPhamHienThi(
  danhSach: SanPham[] = SAN_PHAM
): SanPham[] {
  return danhSach.filter(
    (sp) =>
      sp.hien_thi &&
      sp.con_hang !== "false" &&
      Boolean(sp.anh && sp.anh.trim().length > 0)
  );
}

/**
 * Tìm sản phẩm theo mã id (hoặc barcode).
 */
export function timSanPhamTheoId(
  id: string,
  danhSach: SanPham[] = SAN_PHAM
): SanPham | undefined {
  return danhSach.find((sp) => sp.id === id);
}

/**
 * Tìm deal theo mã id.
 */
export function timDealTheoId(
  id: string,
  danhSach: Deal[] = DEALS
): Deal | undefined {
  return danhSach.find((d) => d.id === id);
}

export * from "./types";
export {
  parseDealsYaml,
  parseDoanhNghiepYaml,
  parseProductsCsv,
} from "./parse";
export { hienThi, layDealHienThi };
