import { laySupabase } from "./client";
import { SAN_PHAM, DEALS } from "@/lib/data";
import type { SanPham, Deal } from "@/lib/data/types";

let cacheSanPham: SanPham[] | null = null;
let cacheDeals: Deal[] | null = null;

/**
 * Tải danh sách sản phẩm từ Supabase (bảng `san_pham`).
 * Nếu không kết nối được hoặc lỗi, tự động dùng danh sách tĩnh trong `data/products.json`.
 */
export async function taiSanPhamTuSupabase(): Promise<SanPham[]> {
  if (cacheSanPham && cacheSanPham.length > 0) {
    return cacheSanPham;
  }

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

    cacheSanPham = data as SanPham[];
    return cacheSanPham;
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ tải san_pham, dùng dữ liệu tĩnh:", err);
    return SAN_PHAM;
  }
}

/**
 * Tải danh sách deal từ Supabase (bảng `deal`).
 * Nếu không kết nối được hoặc lỗi, tự động dùng danh sách tĩnh trong `data/deals.json`.
 */
export async function taiDealsTuSupabase(): Promise<Deal[]> {
  if (cacheDeals && cacheDeals.length > 0) {
    return cacheDeals;
  }

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

    // du_lieu chứa nguyên khối dữ liệu cấu hình deal; ghi đè `het_qua` từ cột bảng nếu có
    const danhSach = data.map((row) => {
      const dealGoc = (row.du_lieu || {}) as Deal;
      return {
        ...dealGoc,
        id: row.id,
        het_qua: typeof row.het_qua === "boolean" ? row.het_qua : dealGoc.het_qua,
        bat_dau: row.bat_dau || dealGoc.bat_dau,
        ket_thuc: row.ket_thuc || dealGoc.ket_thuc,
      };
    });

    cacheDeals = danhSach;
    return cacheDeals;
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ tải deal, dùng dữ liệu tĩnh:", err);
    return DEALS;
  }
}

/**
 * Xóa cache trong bộ nhớ (dùng khi cần nạp lại).
 */
export function xoaCacheDuLieu(): void {
  cacheSanPham = null;
  cacheDeals = null;
}
