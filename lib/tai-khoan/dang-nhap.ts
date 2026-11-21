import type { User } from "@supabase/supabase-js";
import { laySupabase } from "@/lib/supabase/client";
import { damBaoKhachAnDanh } from "@/lib/supabase/auth";
import { chuanHoaEmail, laEmailHopLe, laMaHopLe } from "./kiem-tra";
import { LOI, dichLoi, laLoiEmailDaCo, type LoiAuth } from "./loi";

/**
 * - `email_change`: khách đang ẩn danh, gắn email vào chính tài khoản đó (giữ nguyên auth.uid()).
 * - `email`: email đã có tài khoản khác, đăng nhập vào tài khoản đó.
 */
export type NhanhDangNhap = "email_change" | "email";

export type KetQuaGuiMa = { ok: true; nhanh: NhanhDangNhap } | { ok: false; loi: string };
export type KetQua = { ok: true } | { ok: false; loi: string };

/** Đã đăng nhập bằng email (không phải khách ẩn danh). */
export function laDaDangNhap(user: Pick<User, "is_anonymous" | "email"> | null | undefined): boolean {
  return Boolean(user && !user.is_anonymous && user.email);
}

/** Bước 1: gửi mã 6 số tới email. Tự chọn nhánh theo trạng thái khách. */
export async function guiMa(emailNhap: string): Promise<KetQuaGuiMa> {
  const email = chuanHoaEmail(emailNhap);
  if (!laEmailHopLe(email)) return { ok: false, loi: LOI.emailSai };

  const supabase = laySupabase();
  if (!supabase) return { ok: false, loi: LOI.matMang };

  try {
    await damBaoKhachAnDanh();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (user?.is_anonymous) {
      const { error } = await supabase.auth.updateUser({ email });
      if (!error) return { ok: true, nhanh: "email_change" };
      if (!laLoiEmailDaCo(error)) return { ok: false, loi: dichLoi(error) };
      // Email đã có tài khoản: chuyển sang đăng nhập bằng mã.
    } else if (!user) {
      return { ok: false, loi: LOI.matMang };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (error) return { ok: false, loi: dichLoi(error) };
    return { ok: true, nhanh: "email" };
  } catch (err) {
    return { ok: false, loi: dichLoi(err as LoiAuth) };
  }
}

/** Bước 2: xác nhận mã. Xong thì ghi email vào dòng `khach` của chính mình. */
export async function xacNhanMa(
  emailNhap: string,
  ma: string,
  nhanh: NhanhDangNhap,
  giayTuLucGui = 0
): Promise<KetQua> {
  const email = chuanHoaEmail(emailNhap);
  const token = ma.trim();
  if (!laMaHopLe(token)) return { ok: false, loi: LOI.maSai };

  const supabase = laySupabase();
  if (!supabase) return { ok: false, loi: LOI.matMang };

  try {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: nhanh });
    if (error) return { ok: false, loi: dichLoi(error, { giayTuLucGui }) };

    let user = data.session?.user ?? data.user ?? null;
    if (!data.session) {
      // Đổi email có thể chỉ trả user: làm mới session để JWT hết cờ ẩn danh.
      const { data: lamMoi } = await supabase.auth.refreshSession();
      user = lamMoi.session?.user ?? user;
    }

    if (user?.id) {
      const { error: loiGhi } = await supabase
        .from("khach")
        .upsert({ id: user.id, email }, { onConflict: "id" });
      if (loiGhi) console.warn("[tai-khoan] Không ghi được email vào khach:", loiGhi.message);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, loi: dichLoi(err as LoiAuth, { giayTuLucGui }) };
  }
}

/** Đăng xuất rồi tạo lại khách ẩn danh. Đã thích, giỏ trên máy giữ nguyên (localStorage). */
export async function dangXuat(): Promise<void> {
  const supabase = laySupabase();
  if (!supabase) return;
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (err) {
    console.warn("[tai-khoan] Lỗi đăng xuất:", (err as Error)?.message);
  }
  await damBaoKhachAnDanh();
}
