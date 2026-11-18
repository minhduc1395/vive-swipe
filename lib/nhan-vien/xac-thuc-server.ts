import { layAdmin, choPhepKhoTam } from "@/lib/supabase/admin";

export interface NhanVienDaXacThuc {
  id: string;
  ten: string;
  vaiTro: "nhan_vien" | "quan_tri";
}

/**
 * Kiểm tra người gọi Server Action là nhân viên thật: token phiên Supabase hợp lệ và có dòng trong bảng nhan_vien.
 * Máy dev/e2e không có khóa service role thì cho qua bằng tài khoản thử.
 */
export async function xacThucNhanVien(
  token: string | null | undefined,
): Promise<NhanVienDaXacThuc> {
  const admin = layAdmin();
  if (!admin) {
    if (choPhepKhoTam())
      return { id: "dev", ten: "Quầy VIVE (thử)", vaiTro: "quan_tri" };
    throw new Error("Chưa cấu hình xác thực nhân viên");
  }
  if (!token) throw new Error("Chưa đăng nhập");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("Phiên đăng nhập không hợp lệ");
  const { data: nv } = await admin
    .from("nhan_vien")
    .select("ten, vai_tro")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!nv) throw new Error("Tài khoản không có quyền nhân viên");
  return { id: data.user.id, ten: nv.ten, vaiTro: nv.vai_tro };
}
