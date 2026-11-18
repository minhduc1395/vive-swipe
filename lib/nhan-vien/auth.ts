import { laySupabase } from "@/lib/supabase/client";

export const KHOA_NHAN_VIEN_SESSION = "vive_nhan_vien_session";

export interface PhienNhanVien {
  email: string;
  ten: string;
  vaiTro: "nhan_vien" | "quan_tri";
  dangNhapLuc: string;
}

export function layPhienNhanVienLocal(): PhienNhanVien | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KHOA_NHAN_VIEN_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as PhienNhanVien;
  } catch {
    return null;
  }
}

export function luuPhienNhanVienLocal(phien: PhienNhanVien): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KHOA_NHAN_VIEN_SESSION, JSON.stringify(phien));
  window.dispatchEvent(new Event("vive_staff_auth_changed"));
}

export function dangXuatNhanVienLocal(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KHOA_NHAN_VIEN_SESSION);
  const supabase = laySupabase();
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
  window.dispatchEvent(new Event("vive_staff_auth_changed"));
}

/** Máy dev/e2e chưa có Supabase thật thì cho đăng nhập bằng tài khoản thử. */
export function cheDoThu(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return !url || url.includes("e2e.test") || url.includes("localhost.invalid");
}

/** Token phiên Supabase gửi kèm mỗi Server Action để server kiểm quyền. */
export async function layTokenNhanVien(): Promise<string | null> {
  if (cheDoThu()) return "thu";
  const supabase = laySupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Đăng nhập nhân viên bằng Supabase Auth (email + mật khẩu do quản trị tạo, có dòng trong bảng nhan_vien).
 * Chế độ thử (dev/e2e): booth@vive.vn, mật khẩu bất kỳ từ 4 ký tự.
 */
export async function dangNhapNhanVien(
  email: string,
  matKhau: string,
): Promise<{ ok: boolean; loi?: string; phien?: PhienNhanVien }> {
  const emailChuanHoa = email.trim().toLowerCase();
  const sai = {
    ok: false,
    loi: "Email hoặc mật khẩu không chính xác. Vui lòng liên hệ quản lý booth.",
  };

  if (cheDoThu()) {
    if (emailChuanHoa === "booth@vive.vn" && matKhau.length >= 4) {
      const phien: PhienNhanVien = {
        email: emailChuanHoa,
        ten: "Quầy VIVE",
        vaiTro: "nhan_vien",
        dangNhapLuc: new Date().toISOString(),
      };
      luuPhienNhanVienLocal(phien);
      return { ok: true, phien };
    }
    return sai;
  }

  const supabase = laySupabase();
  if (!supabase) return sai;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailChuanHoa,
    password: matKhau,
  });
  if (error || !data.user) return sai;
  const { data: nv } = await supabase
    .from("nhan_vien")
    .select("ten, vai_tro")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!nv) {
    await supabase.auth.signOut();
    // Đăng nhập lại khách ẩn danh để web khách vẫn chạy
    await supabase.auth.signInAnonymously().catch(() => {});
    return { ok: false, loi: "Tài khoản này chưa được cấp quyền nhân viên." };
  }
  const phien: PhienNhanVien = {
    email: emailChuanHoa,
    ten: nv.ten || "Quầy VIVE",
    vaiTro: nv.vai_tro,
    dangNhapLuc: new Date().toISOString(),
  };
  luuPhienNhanVienLocal(phien);
  return { ok: true, phien };
}
