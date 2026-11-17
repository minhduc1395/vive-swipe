import { laySupabase } from "./client";

export type HanhDongQuet =
  | "thich"
  | "bo_qua"
  | "gio"
  | "xem_chi_tiet"
  | "hoan_tac"
  | "bo_thich";

export type NguonQuet = "goi_y" | "kham_pha" | "pho_bien" | "danh_muc";

export interface MucLuotQuetHangDoi {
  localId: string;
  san_pham_id: string;
  hanh_dong: HanhDongQuet;
  thoi_gian_xem_ms?: number;
  nguon?: NguonQuet;
  vi_tri?: number;
  tao_luc: string;
}

export const KHOA_HANG_DOI_LUOT_QUET = "vive_hang_doi_luot_quet";
const KHOANG_THOI_GIAN_DAY_MS = 5000; // Tối đa 5 giây một lần (docs/02 mục 5)
const NGUONG_DAY_NGAY_LAP_TUC = 10; // Đủ 10 lượt quẹt thì đẩy ngay

let timerDayHangDoi: ReturnType<typeof setTimeout> | null = null;
let dangDayDuLieu = false;
let daKhoiTaoLangNghe = false;

/**
 * Đọc danh sách lượt quẹt đang chờ gửi từ localStorage.
 */
export function layHangDoiLuotQuet(): MucLuotQuetHangDoi[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KHOA_HANG_DOI_LUOT_QUET);
    return raw ? (JSON.parse(raw) as MucLuotQuetHangDoi[]) : [];
  } catch {
    return [];
  }
}

/**
 * Lưu danh sách lượt quẹt đang chờ vào localStorage.
 */
function luuHangDoiLuotQuet(danhSach: MucLuotQuetHangDoi[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KHOA_HANG_DOI_LUOT_QUET,
      JSON.stringify(danhSach)
    );
  } catch {
    // bỏ qua lỗi storage
  }
}

/**
 * Tạo id ngẫu nhiên duy nhất cho từng mục trong hàng đợi nội bộ.
 */
function taoLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Ghi 1 lượt quẹt vào hàng đợi (lưu ngay vào localStorage).
 * Tự động đặt lịch gửi sau tối đa 5 giây, hoặc đẩy ngay nếu hàng đợi đầy.
 */
export function ghiLuotQuet(params: {
  san_pham_id: string;
  hanh_dong: HanhDongQuet;
  thoi_gian_xem_ms?: number;
  nguon?: NguonQuet;
  vi_tri?: number;
}): void {
  khoiTaoLangNgheMang();

  const mucMoi: MucLuotQuetHangDoi = {
    localId: taoLocalId(),
    san_pham_id: params.san_pham_id,
    hanh_dong: params.hanh_dong,
    thoi_gian_xem_ms: params.thoi_gian_xem_ms,
    nguon: params.nguon,
    vi_tri: params.vi_tri,
    tao_luc: new Date().toISOString(),
  };

  const hangDoiHienTai = layHangDoiLuotQuet();
  const hangDoiMoi = [...hangDoiHienTai, mucMoi];
  luuHangDoiLuotQuet(hangDoiMoi);

  if (hangDoiMoi.length >= NGUONG_DAY_NGAY_LAP_TUC) {
    void dayHangDoiLuotQuet();
  } else if (!timerDayHangDoi) {
    timerDayHangDoi = setTimeout(() => {
      timerDayHangDoi = null;
      void dayHangDoiLuotQuet();
    }, KHOANG_THOI_GIAN_DAY_MS);
  }
}

/**
 * Đẩy toàn bộ hàng đợi lượt quẹt lên Supabase.
 * Nếu mất mạng hoặc gửi thất bại, giữ nguyên hàng đợi để gửi lại sau.
 */
export async function dayHangDoiLuotQuet(): Promise<{
  soLuongGui: number;
  thanhCong: boolean;
}> {
  if (dangDayDuLieu) {
    return { soLuongGui: 0, thanhCong: false };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    // Đang ngoại tuyến, giữ nguyên hàng đợi
    return { soLuongGui: 0, thanhCong: false };
  }

  const supabase = laySupabase();
  if (!supabase) {
    return { soLuongGui: 0, thanhCong: false };
  }

  const hangDoi = layHangDoiLuotQuet();
  if (hangDoi.length === 0) {
    return { soLuongGui: 0, thanhCong: true };
  }

  dangDayDuLieu = true;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      // Chưa có session auth hợp lệ -> giữ nguyên hàng đợi để gửi sau
      return { soLuongGui: 0, thanhCong: false };
    }

    // Lấy tối đa 50 lượt một lần gửi
    const banGui = hangDoi.slice(0, 50);
    const cacLocalId = new Set(banGui.map((m) => m.localId));

    const duLieuDb = banGui.map((item) => ({
      khach_id: userId,
      san_pham_id: item.san_pham_id,
      hanh_dong: item.hanh_dong,
      thoi_gian_xem_ms: item.thoi_gian_xem_ms ?? null,
      nguon: item.nguon ?? null,
      vi_tri: item.vi_tri ?? null,
      tao_luc: item.tao_luc,
    }));

    const { error } = await supabase.from("luot_quet").insert(duLieuDb);

    if (error) {
      console.warn("[Supabase] Lỗi chèn luot_quet:", error.message);
      return { soLuongGui: 0, thanhCong: false };
    }

    // Xóa các mục vừa gửi thành công khỏi localStorage (giữ lại các mục vừa thêm mới)
    const hangDoiMoiNhat = layHangDoiLuotQuet();
    const hangDoiConLai = hangDoiMoiNhat.filter((m) => !cacLocalId.has(m.localId));
    luuHangDoiLuotQuet(hangDoiConLai);

    // Nếu vẫn còn mục chưa gửi, đặt lịch gửi tiếp
    if (hangDoiConLai.length > 0) {
      if (!timerDayHangDoi) {
        timerDayHangDoi = setTimeout(() => {
          timerDayHangDoi = null;
          void dayHangDoiLuotQuet();
        }, 1000);
      }
    }

    return { soLuongGui: banGui.length, thanhCong: true };
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ khi gửi luot_quet:", err);
    return { soLuongGui: 0, thanhCong: false };
  } finally {
    dangDayDuLieu = false;
  }
}

/**
 * Đăng ký lắng nghe sự kiện mạng (online/offline) và trang đóng/ẩn.
 */
export function khoiTaoLangNgheMang(): void {
  if (daKhoiTaoLangNghe || typeof window === "undefined") return;
  daKhoiTaoLangNghe = true;

  // Khi có mạng trở lại -> đẩy hàng đợi ngay lập tức
  window.addEventListener("online", () => {
    void dayHangDoiLuotQuet();
  });

  // Khi người dùng chuyển tab hoặc đóng trang -> cố gắng đẩy hàng đợi
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void dayHangDoiLuotQuet();
    }
  });

  window.addEventListener("beforeunload", () => {
    void dayHangDoiLuotQuet();
  });
}
