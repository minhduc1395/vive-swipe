import { laySupabase } from "./client";
import { layTraLoiLocal, type TraLoiCauHoi } from "@/lib/khao-sat";
import { layHoSoLocal } from "@/lib/kho-luu-tru";
import type { HoSoKhach } from "@/lib/goi-y/ho-so";

export const KHOA_KHACH_ID = "vive_khach_id";
export const KHOA_HO_SO_CAN_DONG_BO = "vive_ho_so_can_dong_bo";

let dangDangNhapPromise: Promise<string | null> | null = null;

/**
 * Lấy id khách ẩn danh từ localStorage nếu có.
 */
export function layKhachIdLocal(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KHOA_KHACH_ID);
  } catch {
    return null;
  }
}

/**
 * Lưu id khách ẩn danh vào localStorage.
 */
function luuKhachIdLocal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KHOA_KHACH_ID, id);
  } catch {
    // bỏ qua lỗi storage
  }
}

/**
 * Đảm bảo khách đã được đăng nhập ẩn danh (anonymous sign-in)
 * và có một bản ghi trong bảng `khach`.
 * Hàm này an toàn trước race condition (dùng chung promise nếu đang gọi).
 */
export async function damBaoKhachAnDanh(): Promise<string | null> {
  const supabase = laySupabase();
  if (!supabase) return null;

  // Nếu đã có id trong localStorage thì dùng luôn, không gọi auth lặp lại
  const localId = layKhachIdLocal();
  if (localId) {
    return localId;
  }

  if (dangDangNhapPromise) {
    return dangDangNhapPromise;
  }

  dangDangNhapPromise = (async () => {
    try {
      // 1. Kiểm tra session hiện có
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let userId = session?.user?.id ?? null;

      // 2. Nếu chưa có session, đăng nhập ẩn danh
      if (!userId) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.warn("[Supabase] Lỗi signInAnonymously:", error.message);
          const fallbackId =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-anon-client`;
          luuKhachIdLocal(fallbackId);
          return fallbackId;
        }
        userId = data.user?.id ?? null;
      }

      if (!userId) {
        return null;
      }

      luuKhachIdLocal(userId);

      // 3. Đảm bảo bản ghi trong bảng `khach` tồn tại (chỉ gọi khi có session auth thật)
      if (session?.user?.id || (userId && !userId.includes("-anon-client"))) {
        const traLoi = layTraLoiLocal();
        const hoSo = layHoSoLocal();

        const { error: upsertError } = await supabase.from("khach").upsert(
          {
            id: userId,
            ...(traLoi ? { tra_loi: traLoi } : {}),
            ...(hoSo && Object.keys(hoSo).length > 0 ? { ho_so: hoSo } : {}),
          },
          { onConflict: "id" }
        );

        if (upsertError) {
          console.warn("[Supabase] Lỗi upsert khach:", upsertError.message);
        }
      }

      return userId;
    } catch (err) {
      console.warn("[Supabase] Ngoại lệ khi đăng nhập ẩn danh:", err);
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
 * Đồng bộ hồ sơ trọng số sở thích lên bảng `khach`.
 */
export async function dongBoHoSo(hoSo: HoSoKhach): Promise<boolean> {
  const supabase = laySupabase();
  if (!supabase) return false;

  const userId = await damBaoKhachAnDanh();
  if (!userId) {
    // Đánh dấu cần đồng bộ sau khi online
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(KHOA_HO_SO_CAN_DONG_BO, "true");
      } catch {
        // bỏ qua
      }
    }
    return false;
  }

  try {
    const { error } = await supabase
      .from("khach")
      .update({ ho_so: hoSo })
      .eq("id", userId);

    if (error) {
      console.warn("[Supabase] Lỗi dongBoHoSo:", error.message);
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
    return false;
  }
}
