import type { Deal } from "@/lib/data/types";
import { dinhDangGia, dinhDangTien } from "@/lib/dinh-dang";
import viDeal from "@/messages/vi/deal.json";

/**
 * W044: chữ hiển thị của module deal.
 * Hàm trong lib/deals không gõ cứng chữ: nhận `t` (useTranslations("deal") hoặc getTranslations("deal")),
 * không truyền thì dùng bản vi trong messages/vi/deal.json (hành vi cũ).
 */
export type Dich = (khoa: string, giaTri?: Record<string, string | number>) => string;
type Cay = { [k: string]: string | Cay };

export function taoDich(goc: Cay): Dich {
  return (khoa, giaTri) => {
    let v: string | Cay | undefined = goc;
    for (const p of khoa.split(".")) v = typeof v === "object" ? v[p] : undefined;
    if (typeof v !== "string") return khoa;
    return v.replace(/\{(\w+)\}/g, (m, k: string) => (giaTri && k in giaTri ? String(giaTri[k]) : m));
  };
}

export const dichVi: Dich = taoDich(viDeal as Cay);

/** Trường tiếng Anh của deal (data/deals.yaml). Thiếu thì hiện bản vi. */
type DealEn = Deal & { ten_en?: string; dieu_kien_en?: string; hook_en?: string; qua_en?: string };
const en = (ngonNgu: string) => ngonNgu === "en";

export const tenDeal = (d: Deal, nn: string): string => (en(nn) && (d as DealEn).ten_en) || d.ten;
export const hookDeal = (d: Deal, nn: string): string | undefined => (en(nn) && (d as DealEn).hook_en) || d.hook;
export const dieuKienDeal = (d: Deal, nn: string): string | undefined => (en(nn) && (d as DealEn).dieu_kien_en) || d.dieu_kien;
export const quaDeal = (d: Deal, nn: string): string | null | undefined => (en(nn) && (d as DealEn).qua_en) || d.qua;
export const quaMoc = (m: { qua: string; qua_en?: string }, nn: string): string => (en(nn) && m.qua_en) || m.qua;
export const tenBoGoiY = (b: { ten: string; ten_en?: string }, nn: string): string => (en(nn) && b.ten_en) || b.ten;

/** Số tiền trên thẻ: vi giữ dạng cũ (349.000, không "đ"), en: 349,000 VND. */
export const tienThe = (soTien: number, nn: string): string => (en(nn) ? dinhDangGia(soTien, nn) : dinhDangTien(soTien));

/** 700000 → "700K", 1100000 → "1,1 triệu" (vi) / "1.1M" (en) */
export function tienNgan(n: number, nn = "vi", t: Dich = dichVi): string {
  if (n >= 1_000_000) {
    const so = (n / 1_000_000).toLocaleString(en(nn) ? "en-US" : "vi-VN", { maximumFractionDigits: 1 });
    return t("tien.trieu", { so });
  }
  return t("tien.nghin", { so: Math.round(n / 1000) });
}

const TU_KHOA_SP = ["suaRuaMat", "ampoule", "kemDuong", "kem"] as const;

/** Tên ngắn của món trong deal giảm khi mua kèm: giữ từ khóa loại hàng ("Sữa rửa mặt" → "Cleanser" ở en). */
export function tenNganSanPham(ten: string, nn = "vi", t: Dich = dichVi): string {
  const tu = TU_KHOA_SP.map((k) => dichVi(`tuKhoaSp.${k}`));
  const m = new RegExp(`^.*?(${tu.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}).*$`, "i").exec(ten);
  if (!m) return ten;
  if (!en(nn)) return m[1];
  const i = tu.findIndex((x) => x.toLowerCase() === m[1].toLowerCase());
  return i >= 0 ? t(`tuKhoaSp.${TU_KHOA_SP[i]}`) : m[1];
}
