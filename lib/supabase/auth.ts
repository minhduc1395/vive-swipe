import { laySupabase } from "./client";
import { layTraLoiLocal, type TraLoiCauHoi } from "@/lib/khao-sat";
import { layHoSoLocal } from "@/lib/kho-luu-tru";
import type { HoSoKhach } from "@/lib/goi-y/ho-so";

export const KHOA_HO_SO_CAN_DONG_BO = "vive_ho_so_can_dong_bo";

let dangDangNhapPromise: Promise<string | null> | null = null;
let timerDongBoHoSo: ReturnType<typeof setTimeout> | null = null;

/**
 * Đảm bảo khách đã có session đăng nhập ẩn danh (anonymous sign-in)
 * và có một bản ghi trong bảng `khach`.
 * - Không lưu id giả hay UUID tự sinh khi lỗi.
 * - Luôn kiểm tra session qua `getSession()`.
 * - Khi chưa có session thì gọi `signInAnonymously()`. Nếu lỗi (offline, 429...) trả về null để thử lại sau.
 * - Chỉ upsert vào bảng `khach` khi có session thật.
 */
export async function damBaoKhachAnDanh(): Promise<string | null> {
  const supabase = laySupabase();
  if (!supabase) return null;

  if (dangDangNhapPromise) {
    return dangDangNhapPromise;
  }

  dangDangNhapPromise = (async () => {
    try {
      // 1. Kiểm tra session hiện có
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn("[Supabase] Lỗi getSession:", sessionError.message);
      }

      let user = session?.user;

      // 2. Nếu chưa có session, đăng nhập ẩn danh
      if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.warn("[Supabase] Lỗi signInAnonymously:", error.message);
          return null;
        }
        user = data.user ?? undefined;
      }

      if (!user?.id) {
        return null;
      }

      // 3. Upsert vào bảng `khach` khi đã có session thật
      const traLoi = layTraLoiLocal();
      const hoSo = layHoSoLocal();

      const { error: upsertError } = await supabase.from("khach").upsert(
        {
          id: user.id,
          ...(traLoi ? { tra_loi: traLoi } : {}),
          ...(hoSo && Object.keys(hoSo).length > 0 ? { ho_so: hoSo } : {}),
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        console.warn("[Supabase] Lỗi upsert khach:", upsertError.message);
      }

      return user.id;
    } catch (err) {
      console.warn("[Supabase] Ngoại lệ khi damBaoKhachAnDanh:", err);
      return null;
    } finally {
      dangDangNhapPromise = null;
    }
  })();

  return dangDangNhapPromise;
}

/**
 * Đồng bộ câu trả lời 3 câu hỏi lên bảng `khach`.
 */
export async function dongBoTraLoi(traLoi: TraLoiCauHoi): Promise<boolean> {
  const supabase = laySupabase();
  if (!supabase) return false;

  const userId = await damBaoKhachAnDanh();
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from("khach")
      .update({ tra_loi: traLoi })
      .eq("id", userId);

    if (error) {
      console.warn("[Supabase] Lỗi dongBoTraLoi:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ dongBoTraLoi:", err);
    return false;
  }
}

/**
 * Đánh dấu cần đồng bộ hồ sơ sau 5 giây (throttle theo nhịp hàng đợi).
 */
export function danhDauCanDongBoHoSo(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KHOA_HO_SO_CAN_DONG_BO, "true");
    } catch {
      // bỏ qua
    }
  }

  if (!timerDongBoHoSo) {
    timerDongBoHoSo = setTimeout(() => {
      timerDongBoHoSo = null;
      void dongBoHoSo(layHoSoLocal());
    }, 5000);
  }
}

/**
 * Đồng bộ hồ sơ trọng số sở thích lên bảng `khach`.
 */
export async function dongBoHoSo(hoSo: HoSoKhach): Promise<boolean> {
  const supabase = laySupabase();
  if (!supabase) return false;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    danhDauCanDongBoHoSo();
    return false;
  }

  try {
    const { error } = await supabase
      .from("khach")
      .update({ ho_so: hoSo })
      .eq("id", userId);

    if (error) {
      console.warn("[Supabase] Lỗi dongBoHoSo:", error.message);
      danhDauCanDongBoHoSo();
      return false;
    }

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(KHOA_HO_SO_CAN_DONG_BO);
      } catch {
        // bỏ qua
      }
    }
    return true;
  } catch (err) {
    console.warn("[Supabase] Ngoại lệ dongBoHoSo:", err);
    danhDauCanDongBoHoSo();
    return false;
  }
}
