import { laySupabase } from "./client";
import { SAN_PHAM, DEALS } from "@/lib/data";
import {
  SanPhamSchema,
  DealSchema,
  type SanPham,
  type Deal,
} from "@/lib/data/types";

/** Gộp dòng bảng `deal` (cột + jsonb du_lieu) thành Deal; dùng chung client và server. */
export function hopNhatDongDeal(row: Record<string, unknown>): Record<string, unknown> {
  const dealGoc = (row.du_lieu || {}) as Record<string, unknown>;
  return {
    ...dealGoc,
    id: row.id,
    trang_thai: row.trang_thai || dealGoc.trang_thai,
    may_rui: typeof row.may_rui === "boolean" ? row.may_rui : (dealGoc.may_rui ?? false),
    da_dang_ky:
      typeof row.da_dang_ky === "boolean" ? row.da_dang_ky : (dealGoc.da_dang_ky ?? false),
    hien_thi:
      typeof row.hien_thi === "boolean" ? row.hien_thi : (dealGoc.hien_thi ?? true),
    het_qua: typeof row.het_qua === "boolean" ? row.het_qua : (dealGoc.het_qua ?? false),
    bat_dau: row.bat_dau || dealGoc.bat_dau,
    ket_thuc: row.ket_thuc || dealGoc.ket_thuc,
  };
}

let cacheSanPham: SanPham[] | null = null;
let cacheDeals: Deal[] | null = null;

// #132: request đang chạy được dùng chung. Gọi lần 2 khi lần 1 chưa xong (tải sớm của /quet và
// DuLieuProvider) nhận lại đúng promise đó, không gửi request thứ hai. `doiCache` tăng khi xóa cache,
// để request cũ về muộn không ghi đè cache mới.
let dangTaiSanPham: Promise<SanPham[]> | null = null;
let dangTaiDeals: Promise<Deal[]> | null = null;
let doiCache = 0;

/**
 * Tải danh sách sản phẩm từ Supabase (bảng `san_pham`).
 * Dữ liệu trả về được kiểm tra kỹ lưỡng qua `SanPhamSchema` (Zod).
 * Nếu không kết nối được hoặc lỗi, tự động dùng danh sách tĩnh trong `data/products.json`.
 */
export function taiSanPhamTuSupabase(): Promise<SanPham[]> {
  if (cacheSanPham && cacheSanPham.length > 0) {
    return Promise.resolve(cacheSanPham);
  }
  if (dangTaiSanPham) return dangTaiSanPham;
  const doi = doiCache;
  const lanTai = taiSanPhamMoi(doi).finally(() => {
    if (dangTaiSanPham === lanTai) dangTaiSanPham = null;
  });
  dangTaiSanPham = lanTai;
  return lanTai;
}

async function taiSanPhamMoi(doi: number): Promise<SanPham[]> {

  const supabase = laySupabase();
  if (!supabase) {
    return SAN_PHAM;
  }

  try {
    const { data, error } = await supabase
      .from("san_pham")
      .select("*")
      .order("id");

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("[Supabase] Lỗi tải san_pham, dùng dữ liệu tĩnh:", error.message);
      }
      return SAN_PHAM;
    }

    const danhSachHopLe: SanPham[] = [];
    for (const row of data) {
      const parsed = SanPhamSchema.safeParse(row);
      if (parsed.success) {
        danhSachHopLe.push(parsed.data);
      } else {
        console.warn(
          `[Supabase] Dòng sản phẩm ${row?.id} không hợp lệ, bỏ qua:`,
          parsed.error.message
        );
      }
    }

    if (danhSachHopLe.length === 0) {
      return SAN_PHAM;
    }

    if (doi === doiCache) cacheSanPham = danhSachHopLe;
    return danhSachHopLe;
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ tải san_pham, dùng dữ liệu tĩnh:", err);
    return SAN_PHAM;
  }
}

/**
 * Tải danh sách deal từ Supabase (bảng `deal`).
 * Dữ liệu trả về được kiểm tra qua `DealSchema` (Zod).
 * Nếu không kết nối được hoặc lỗi, tự động dùng danh sách tĩnh trong `data/deals.json`.
 */
export function taiDealsTuSupabase(): Promise<Deal[]> {
  if (cacheDeals && cacheDeals.length > 0) {
    return Promise.resolve(cacheDeals);
  }
  if (dangTaiDeals) return dangTaiDeals;
  const doi = doiCache;
  const lanTai = taiDealsMoi(doi).finally(() => {
    if (dangTaiDeals === lanTai) dangTaiDeals = null;
  });
  dangTaiDeals = lanTai;
  return lanTai;
}

async function taiDealsMoi(doi: number): Promise<Deal[]> {

  const supabase = laySupabase();
  if (!supabase) {
    return DEALS;
  }

  try {
    const { data, error } = await supabase
      .from("deal")
      .select("*")
      .order("id");

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("[Supabase] Lỗi tải deal, dùng dữ liệu tĩnh:", error.message);
      }
      return DEALS;
    }

    const danhSachHopLe: Deal[] = [];
    for (const row of data) {
      const parsed = DealSchema.safeParse(hopNhatDongDeal(row));
      if (parsed.success) {
        danhSachHopLe.push(parsed.data);
      } else {
        console.warn(
          `[Supabase] Dòng deal ${row?.id} không hợp lệ, bỏ qua:`,
          parsed.error.message
        );
      }
    }

    if (danhSachHopLe.length === 0) {
      return DEALS;
    }

    if (doi === doiCache) cacheDeals = danhSachHopLe;
    return danhSachHopLe;
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ tải deal, dùng dữ liệu tĩnh:", err);
    return DEALS;
  }
}

/**
 * Xóa cache trong bộ nhớ (dùng khi cần nạp lại hoặc trong test).
 */
export function xoaCacheDuLieu(): void {
  cacheSanPham = null;
  cacheDeals = null;
  dangTaiSanPham = null;
  dangTaiDeals = null;
  doiCache++;
}
