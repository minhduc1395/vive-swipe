import { laySupabase } from "./client";
import { damBaoKhachAnDanh } from "./auth";

export type TenSuKien =
  | "mo_web"
  | "xong_cau_hoi"
  | "bo_qua_cau_hoi"
  | "quet_10"
  | "xem_deal"
  | "them_combo"
  | "bat_dau_giu_hang"
  | "giu_hang_xong"
  | "dang_ky_email"
  | "xac_nhan_email"
  | "huy_email"
  | "bam_kenh"
  | "loi";

export interface MucSuKienHangDoi {
  localId: string;
  ten: TenSuKien;
  du_lieu?: Record<string, unknown>;
  tao_luc: string;
}

export const KHOA_NGUON_VAO = "vive_nguon_vao";
export const KHOA_HANG_DOI_SU_KIEN = "vive_hang_doi_su_kien";
const KHOANG_THOI_GIAN_DAY_MS = 5000;

let timerDaySuKien: ReturnType<typeof setTimeout> | null = null;
let dangDaySuKien = false;

/**
 * Trích xuất tham số ?src= từ URL hiện tại và lưu vào localStorage.
 */
export function luuNguonVaoTuUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const src = urlParams.get("src");
    if (src) {
      window.localStorage.setItem(KHOA_NGUON_VAO, src);
      return src;
    }
    return window.localStorage.getItem(KHOA_NGUON_VAO);
  } catch {
    return null;
  }
}

/**
 * Lấy nguồn vào hiện tại (qr-ban, ig-bio, tiktok-bio, fb, ads, v.v.).
 */
export function layNguonVao(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KHOA_NGUON_VAO);
  } catch {
    return null;
  }
}

/**
 * Đọc hàng đợi sự kiện từ localStorage.
 */
export function layHangDoiSuKien(): MucSuKienHangDoi[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KHOA_HANG_DOI_SU_KIEN);
    return raw ? (JSON.parse(raw) as MucSuKienHangDoi[]) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu hàng đợi sự kiện vào localStorage.
 */
function luuHangDoiSuKien(danhSach: MucSuKienHangDoi[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KHOA_HANG_DOI_SU_KIEN,
      JSON.stringify(danhSach)
    );
  } catch {
    // bỏ qua lỗi storage
  }
}

function taoLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Ghi 1 sự kiện đo lường vào hàng đợi. Tự động gắn kèm nguồn vào `?src=`.
 */
export function ghiSuKien(
  ten: TenSuKien,
  duLieu?: Record<string, unknown>
): void {
  const nguonVao = layNguonVao();
  const duLieuHopNhat = {
    ...duLieu,
    ...(nguonVao ? { nguon_vao: nguonVao } : {}),
  };

  const mucMoi: MucSuKienHangDoi = {
    localId: taoLocalId(),
    ten,
    du_lieu: duLieuHopNhat,
    tao_luc: new Date().toISOString(),
  };

  const hangDoi = layHangDoiSuKien();
  const hangDoiMoi = [...hangDoi, mucMoi];
  luuHangDoiSuKien(hangDoiMoi);

  if (!timerDaySuKien) {
    timerDaySuKien = setTimeout(() => {
      timerDaySuKien = null;
      void dayHangDoiSuKien();
    }, KHOANG_THOI_GIAN_DAY_MS);
  }
}

/**
 * Đẩy toàn bộ sự kiện trong hàng đợi lên Supabase (bảng `su_kien`).
 */
export async function dayHangDoiSuKien(): Promise<{
  soLuongGui: number;
  thanhCong: boolean;
}> {
  if (dangDaySuKien) {
    return { soLuongGui: 0, thanhCong: false };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { soLuongGui: 0, thanhCong: false };
  }

  const supabase = laySupabase();
  if (!supabase) {
    return { soLuongGui: 0, thanhCong: false };
  }

  const hangDoi = layHangDoiSuKien();
  if (hangDoi.length === 0) {
    return { soLuongGui: 0, thanhCong: true };
  }

  dangDaySuKien = true;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    let userId = session?.user?.id;
    if (!userId) {
      userId = (await damBaoKhachAnDanh()) ?? undefined;
    }
    if (!userId) {
      // Chưa có session auth hợp lệ -> giữ nguyên hàng đợi để gửi sau
      return { soLuongGui: 0, thanhCong: false };
    }

    const banGui = hangDoi.slice(0, 50);
    const cacLocalId = new Set(banGui.map((m) => m.localId));

    const duLieuDb = banGui.map((item) => ({
      khach_id: userId,
      ten: item.ten,
      du_lieu: item.du_lieu ?? null,
      tao_luc: item.tao_luc,
    }));

    const { error } = await supabase.from("su_kien").insert(duLieuDb);

    if (error) {
      console.warn("[Supabase] Lỗi chèn su_kien:", error.message);
      return { soLuongGui: 0, thanhCong: false };
    }

    const hangDoiMoiNhat = layHangDoiSuKien();
    const hangDoiConLai = hangDoiMoiNhat.filter((m) => !cacLocalId.has(m.localId));
    luuHangDoiSuKien(hangDoiConLai);

    if (hangDoiConLai.length > 0) {
      if (!timerDaySuKien) {
        timerDaySuKien = setTimeout(() => {
          timerDaySuKien = null;
          void dayHangDoiSuKien();
        }, 1000);
      }
    }

    return { soLuongGui: banGui.length, thanhCong: true };
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ khi gửi su_kien:", err);
    return { soLuongGui: 0, thanhCong: false };
  } finally {
    dangDaySuKien = false;
  }
}
