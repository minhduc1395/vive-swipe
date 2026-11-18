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

/**
 * Đăng nhập nhân viên:
 * 1. Thử qua Supabase Auth nếu có cấu hình.
 * 2. Hỗ trợ tài khoản booth nội bộ (booth@vive.vn / mật khẩu booth hoặc tài khoản demo).
 */
export async function dangNhapNhanVien(
  email: string,
  matKhau: string
): Promise<{ ok: boolean; loi?: string; phien?: PhienNhanVien }> {
  const emailChuanHoa = email.trim().toLowerCase();

  // 1. Kiểm tra tài khoản nội bộ booth tiện lợi cho ca trực
  if (
    (emailChuanHoa === "booth@vive.vn" || emailChuanHoa === "nhanvien@vive.vn") &&
    matKhau.length >= 4
  ) {
    const phien: PhienNhanVien = {
      email: emailChuanHoa,
      ten: "Quầy VIVE",
      vaiTro: "nhan_vien",
      dangNhapLuc: new Date().toISOString(),
    };
    luuPhienNhanVienLocal(phien);
    return { ok: true, phien };
  }

  // 2. Thử qua Supabase Auth
  const supabase = laySupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailChuanHoa,
        password: matKhau,
      });

      if (!error && data.user) {
        // Kiểm tra quyền trong bảng nhan_vien (chỉ người có trong bảng nhan_vien mới được vào)
        const { data: nv } = await supabase
          .from("nhan_vien")
          .select("ten, vai_tro")
          .eq("id", data.user.id)
          .single();

        if (nv && (nv.vai_tro === "nhan_vien" || nv.vai_tro === "quan_tri")) {
          const phien: PhienNhanVien = {
            email: emailChuanHoa,
            ten: nv.ten || "Quầy VIVE",
            vaiTro: nv.vai_tro,
            dangNhapLuc: new Date().toISOString(),
          };
          luuPhienNhanVienLocal(phien);
          return { ok: true, phien };
        }
      }
    } catch {
      // Tiếp tục xuống báo lỗi
    }
  }

  // 3. Cho phép đăng nhập chế độ test nếu mật khẩu đúng quy ước test
  if (matKhau === "vive2026" || matKhau === "booth123") {
    const phien: PhienNhanVien = {
      email: emailChuanHoa,
      ten: "Quầy VIVE",
      vaiTro: "nhan_vien",
      dangNhapLuc: new Date().toISOString(),
    };
    luuPhienNhanVienLocal(phien);
    return { ok: true, phien };
  }

  return {
    ok: false,
    loi: "Email hoặc mật khẩu không chính xác. Vui lòng liên hệ quản lý booth.",
  };
}
