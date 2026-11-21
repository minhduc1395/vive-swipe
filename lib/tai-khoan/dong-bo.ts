"use client";

/**
 * Job #66: đồng bộ đã thích và giỏ hàng của khách đã đăng nhập email lên tài khoản.
 *
 * - Bảng `yeu_thich` (khach_id, san_pham_id, tao_luc) và `gio_hang_luu` (khach_id, du_lieu jsonb).
 * - Gộp 3 chiều: local (máy này), server (tài khoản), gốc (bản đã khớp với server lần cuối trên máy này,
 *   lưu ở localStorage `vive_dong_bo_tai_khoan`). Máy mới chưa có gốc: đã thích lấy hợp, giỏ cộng số lượng
 *   theo món, combo giữ nguyên (không cộng dồn). Nhờ có gốc, đăng nhập lại trên cùng máy không nhân đôi giỏ.
 * - Ghi local chỉ qua hàm có sẵn trong `lib/kho-luu-tru.ts`; nghe sự kiện `vive_storage_update` để ghi server
 *   (chờ 400ms, dưới 2 giây). Lỗi mạng thì thử lại (2s, 4s, 8s... tối đa 60s) và khi có mạng lại.
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { laySupabase } from "@/lib/supabase/client";
import {
  KHOA_DA_THICH,
  KHOA_GIO_HANG,
  layDanhSachDaThich,
  layGioHang,
  themComboVaoGio,
  themDaThich,
  themVaoGio,
  xoaDaThich,
  xoaToanBoGio,
  type ItemGioHang,
} from "@/lib/kho-luu-tru";
import { laDaDangNhap } from "./dang-nhap";

export const KHOA_GOC_DONG_BO = "vive_dong_bo_tai_khoan";
export const MS_CHO_GHI = 400;
const MS_THU_LAI_DAU = 2000;
const MS_THU_LAI_TOI_DA = 60000;

export interface BanGoc {
  khachId: string;
  daThich: string[];
  gioHang: ItemGioHang[];
}

// ---------------------------------------------------------------------------
// Hàm gộp (thuần, có unit test)
// ---------------------------------------------------------------------------

function laCombo(item: ItemGioHang): boolean {
  return item.loai === "combo";
}

function khoaMuc(item: ItemGioHang): string | null {
  if (laCombo(item)) return item.dealId ? `c:${item.dealId}` : null;
  return item.sanPhamId ? `p:${item.sanPhamId}` : null;
}

function soLuongHopLe(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** Bỏ mục hỏng, gộp mục trùng khóa (cộng số lượng). Giữ thứ tự xuất hiện đầu tiên. */
export function chuanHoaGio(gio: unknown): ItemGioHang[] {
  if (!Array.isArray(gio)) return [];
  const thuTu: string[] = [];
  const theoKhoa = new Map<string, ItemGioHang>();
  for (const raw of gio as ItemGioHang[]) {
    if (!raw || typeof raw !== "object") continue;
    const so = soLuongHopLe(raw.soLuong);
    const khoa = khoaMuc(raw);
    if (!khoa || so <= 0) continue;
    const co = theoKhoa.get(khoa);
    if (co) {
      co.soLuong += so;
    } else {
      thuTu.push(khoa);
      theoKhoa.set(
        khoa,
        laCombo(raw)
          ? { loai: "combo", dealId: raw.dealId, soLuong: so }
          : { loai: "san_pham", sanPhamId: raw.sanPhamId, soLuong: so }
      );
    }
  }
  return thuTu.map((k) => theoKhoa.get(k)!);
}

function chuanHoaThich(ds: unknown): string[] {
  if (!Array.isArray(ds)) return [];
  return Array.from(new Set(ds.filter((x): x is string => typeof x === "string" && x.length > 0)));
}

/**
 * Gộp đã thích. Không có gốc: hợp local ∪ server (local trước).
 * Có gốc: server + món máy này mới thích − món máy này đã bỏ thích (so với gốc).
 */
export function gopDaThich(local: string[], server: string[], goc: string[] = []): string[] {
  const l = chuanHoaThich(local);
  const s = chuanHoaThich(server);
  const g = new Set(chuanHoaThich(goc));
  const lSet = new Set(l);
  const daBo = new Set([...g].filter((id) => !lSet.has(id)));
  const ketQua: string[] = [];
  const them = (id: string) => {
    if (!daBo.has(id) && !ketQua.includes(id)) ketQua.push(id);
  };
  // Thứ tự: món local (mới nhất ở đầu như themDaThich), rồi món chỉ có trên server.
  for (const id of l) {
    if (!g.has(id) || s.includes(id)) them(id);
  }
  for (const id of s) them(id);
  return ketQua;
}

/**
 * Gộp giỏ theo khóa món (`sanPhamId`) hoặc combo (`dealId`).
 * - Sản phẩm: server + (local − gốc). Không có gốc thì cộng số lượng local + server.
 * - Combo: có trong gốc thì áp thay đổi như sản phẩm; không có trong gốc thì giữ nguyên (lấy số lớn hơn,
 *   không cộng dồn).
 */
export function gopGioHang(
  local: ItemGioHang[],
  server: ItemGioHang[],
  goc: ItemGioHang[] = []
): ItemGioHang[] {
  const l = chuanHoaGio(local);
  const s = chuanHoaGio(server);
  const g = chuanHoaGio(goc);
  const mapL = new Map(l.map((i) => [khoaMuc(i)!, i]));
  const mapS = new Map(s.map((i) => [khoaMuc(i)!, i]));
  const mapG = new Map(g.map((i) => [khoaMuc(i)!, i]));

  const thuTu: string[] = [];
  for (const i of [...l, ...s]) {
    const k = khoaMuc(i)!;
    if (!thuTu.includes(k)) thuTu.push(k);
  }
  // Món có ở gốc nhưng đã mất ở cả local và server: bỏ.

  const ketQua: ItemGioHang[] = [];
  for (const k of thuTu) {
    const mau = (mapL.get(k) ?? mapS.get(k))!;
    const soL = mapL.get(k)?.soLuong ?? 0;
    const soS = mapS.get(k)?.soLuong ?? 0;
    const soG = mapG.get(k)?.soLuong ?? 0;
    let so: number;
    if (laCombo(mau) && !mapG.has(k)) {
      so = Math.max(soL, soS);
    } else {
      so = soS + (soL - soG);
    }
    if (so > 0) ketQua.push({ ...mau, soLuong: so });
  }
  return ketQua;
}

function giongNhau(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Bản gốc trên máy
// ---------------------------------------------------------------------------

export function docBanGoc(khachId: string): BanGoc | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KHOA_GOC_DONG_BO);
    if (!raw) return null;
    const goc = JSON.parse(raw) as BanGoc;
    if (goc?.khachId !== khachId) return null;
    return { khachId, daThich: chuanHoaThich(goc.daThich), gioHang: chuanHoaGio(goc.gioHang) };
  } catch {
    return null;
  }
}

function ghiBanGoc(goc: BanGoc): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KHOA_GOC_DONG_BO, JSON.stringify(goc));
  } catch {
    // bỏ qua lỗi storage
  }
}

// ---------------------------------------------------------------------------
// Ghi local qua hàm có sẵn
// ---------------------------------------------------------------------------

let dangApDungLocal = false;

/** Đặt local = danh sách mới, chỉ qua hàm của `kho-luu-tru` (giữ sự kiện cho giao diện). */
function apDungLocal(daThich: string[], gioHang: ItemGioHang[]): void {
  dangApDungLocal = true;
  try {
    if (!giongNhau(chuanHoaThich(layDanhSachDaThich()), daThich)) {
      for (const id of layDanhSachDaThich()) xoaDaThich(id);
      // themDaThich thêm vào đầu: thêm ngược để giữ thứ tự.
      for (const id of [...daThich].reverse()) themDaThich(id);
    }
    if (!giongNhau(chuanHoaGio(layGioHang()), gioHang)) {
      xoaToanBoGio();
      for (const item of [...gioHang].reverse()) {
        if (laCombo(item)) themComboVaoGio(item.dealId!, item.soLuong);
        else themVaoGio(item.sanPhamId!, item.soLuong);
      }
    }
  } finally {
    dangApDungLocal = false;
  }
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

async function docServer(
  supabase: SupabaseClient,
  khachId: string
): Promise<{ daThich: string[]; gioHang: ItemGioHang[] }> {
  const [thich, gio] = await Promise.all([
    supabase
      .from("yeu_thich")
      .select("san_pham_id, tao_luc")
      .eq("khach_id", khachId)
      .order("tao_luc", { ascending: false }),
    supabase.from("gio_hang_luu").select("du_lieu").eq("khach_id", khachId).limit(1),
  ]);
  if (thich.error) throw new Error(thich.error.message);
  if (gio.error) throw new Error(gio.error.message);
  const dongThich = (thich.data ?? []) as Array<{ san_pham_id: string }>;
  const dongGio = (gio.data ?? []) as Array<{ du_lieu: unknown }>;
  return {
    daThich: chuanHoaThich(dongThich.map((d) => d.san_pham_id)),
    gioHang: chuanHoaGio(dongGio[0]?.du_lieu),
  };
}

async function ghiServer(
  supabase: SupabaseClient,
  khachId: string,
  server: { daThich: string[]; gioHang: ItemGioHang[] },
  moi: { daThich: string[]; gioHang: ItemGioHang[] }
): Promise<void> {
  const sSet = new Set(server.daThich);
  const mSet = new Set(moi.daThich);
  const them = moi.daThich.filter((id) => !sSet.has(id));
  const bo = server.daThich.filter((id) => !mSet.has(id));

  if (them.length > 0) {
    // Thêm theo thứ tự cũ → mới để tao_luc giữ được thứ tự hiển thị.
    const bayGio = Date.now();
    const dong = [...them].reverse().map((id, i) => ({
      khach_id: khachId,
      san_pham_id: id,
      tao_luc: new Date(bayGio + i).toISOString(),
    }));
    const { error } = await supabase
      .from("yeu_thich")
      .upsert(dong, { onConflict: "khach_id,san_pham_id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
  if (bo.length > 0) {
    const { error } = await supabase
      .from("yeu_thich")
      .delete()
      .eq("khach_id", khachId)
      .in("san_pham_id", bo);
    if (error) throw new Error(error.message);
  }
  if (!giongNhau(server.gioHang, moi.gioHang)) {
    const { error } = await supabase.from("gio_hang_luu").upsert(
      { khach_id: khachId, du_lieu: moi.gioHang, cap_nhat_luc: new Date().toISOString() },
      { onConflict: "khach_id" }
    );
    if (error) throw new Error(error.message);
  }
}

type DuLieu = { daThich: string[]; gioHang: ItemGioHang[] };

function docLocal(): DuLieu {
  return { daThich: chuanHoaThich(layDanhSachDaThich()), gioHang: chuanHoaGio(layGioHang()) };
}

/**
 * Một lượt đồng bộ: đọc server, gộp 3 chiều với local và gốc, ghi server trước, rồi mới ghi local và gốc.
 * Lỗi mạng ném ra ngoài và không đụng local/gốc, nên lần thử lại gộp vẫn đúng (không cộng 2 lần).
 * Trả `true` nếu local đã đổi trong lúc chờ mạng (cần chạy thêm một lượt).
 */
export async function dongBoMotLan(supabase: SupabaseClient, khachId: string): Promise<boolean> {
  const localTruoc = docLocal();
  const server = await docServer(supabase, khachId);
  const goc = docBanGoc(khachId);
  const moi: DuLieu = {
    daThich: gopDaThich(localTruoc.daThich, server.daThich, goc?.daThich),
    gioHang: gopGioHang(localTruoc.gioHang, server.gioHang, goc?.gioHang),
  };
  await ghiServer(supabase, khachId, server, moi);
  ghiBanGoc({ khachId, ...moi });

  // Khách có thể vừa bấm thích / thêm giỏ trong lúc chờ mạng: giữ thay đổi đó.
  const localSau = docLocal();
  const cuoi: DuLieu = {
    daThich: gopDaThich(localSau.daThich, moi.daThich, localTruoc.daThich),
    gioHang: gopGioHang(localSau.gioHang, moi.gioHang, localTruoc.gioHang),
  };
  apDungLocal(cuoi.daThich, cuoi.gioHang);
  return !giongNhau(cuoi, moi);
}

// ---------------------------------------------------------------------------
// Bộ chạy nền (một bản cho cả trang)
// ---------------------------------------------------------------------------

let soNoiDung = 0;
let dungBoChay: (() => void) | null = null;

/**
 * Bắt đầu đồng bộ nền cho trang. Gọi nhiều lần an toàn (đếm số nơi dùng); trả hàm dừng.
 * Không chặn giao diện: mọi việc chạy bất đồng bộ, lỗi chỉ ghi cảnh báo và hẹn thử lại.
 */
export function batDauDongBo(): () => void {
  soNoiDung += 1;
  if (soNoiDung === 1) dungBoChay = khoiChay();
  let daDung = false;
  return () => {
    if (daDung) return;
    daDung = true;
    soNoiDung -= 1;
    if (soNoiDung === 0 && dungBoChay) {
      dungBoChay();
      dungBoChay = null;
    }
  };
}

function khoiChay(): () => void {
  const supabase = laySupabase();
  if (!supabase || typeof window === "undefined") return () => {};

  let khachId: string | null = null;
  let hen: ReturnType<typeof setTimeout> | null = null;
  let dangChay = false;
  let canChayLai = false;
  let msThuLai = MS_THU_LAI_DAU;
  let daDung = false;

  const huyHen = () => {
    if (hen) clearTimeout(hen);
    hen = null;
  };

  const chay = async () => {
    hen = null;
    if (daDung || !khachId) return;
    if (dangChay) {
      canChayLai = true;
      return;
    }
    dangChay = true;
    const id = khachId;
    try {
      if (await dongBoMotLan(supabase, id)) canChayLai = true;
      msThuLai = MS_THU_LAI_DAU;
    } catch (err) {
      console.warn("[tai-khoan] Đồng bộ chưa được, sẽ thử lại:", (err as Error)?.message);
      if (!daDung && khachId === id && !hen) {
        hen = setTimeout(() => void chay(), msThuLai);
        msThuLai = Math.min(msThuLai * 2, MS_THU_LAI_TOI_DA);
      }
    } finally {
      dangChay = false;
      if (canChayLai && !daDung) {
        canChayLai = false;
        huyHen();
        void chay();
      }
    }
  };

  const henChay = (ms: number) => {
    if (!khachId || daDung) return;
    huyHen();
    hen = setTimeout(() => void chay(), ms);
  };

  const theoSession = (user: User | null | undefined) => {
    const moi = laDaDangNhap(user) && user?.id ? user.id : null;
    if (moi === khachId) return;
    khachId = moi;
    huyHen();
    msThuLai = MS_THU_LAI_DAU;
    // Chạy sau callback onAuthStateChange (gọi Supabase ngay trong callback dễ kẹt khóa auth).
    if (khachId) henChay(0);
  };

  const khiDoiLocal = (e: Event) => {
    if (dangApDungLocal) return;
    const khoa = (e as CustomEvent<{ khoa?: string }>).detail?.khoa;
    if (khoa === KHOA_DA_THICH || khoa === KHOA_GIO_HANG) henChay(MS_CHO_GHI);
  };
  // Tab khác cùng máy đổi localStorage.
  const khiStorage = (e: StorageEvent) => {
    if (e.key === KHOA_DA_THICH || e.key === KHOA_GIO_HANG) henChay(MS_CHO_GHI);
  };
  const khiCoMang = () => henChay(0);
  const khiHienLai = () => {
    if (document.visibilityState === "visible") henChay(0);
  };

  window.addEventListener("vive_storage_update", khiDoiLocal);
  window.addEventListener("storage", khiStorage);
  window.addEventListener("online", khiCoMang);
  document.addEventListener("visibilitychange", khiHienLai);

  void supabase.auth.getSession().then(({ data }) => {
    if (!daDung) theoSession(data.session?.user);
  });
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_suKien, session) => {
    if (!daDung) theoSession(session?.user);
  });

  return () => {
    daDung = true;
    huyHen();
    subscription.unsubscribe();
    window.removeEventListener("vive_storage_update", khiDoiLocal);
    window.removeEventListener("storage", khiStorage);
    window.removeEventListener("online", khiCoMang);
    document.removeEventListener("visibilitychange", khiHienLai);
  };
}
