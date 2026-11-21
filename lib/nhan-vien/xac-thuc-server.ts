import { layAdmin, choPhepKhoTam } from "@/lib/supabase/admin";
import type { VaiTroNhanVien } from "./auth";

export interface NhanVienDaXacThuc {
  id: string;
  ten: string;
  vaiTro: VaiTroNhanVien;
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
    if (choPhepKhoTam()) {
      if (token === "thu:nhan_vien") {
        return { id: "dev-nv", ten: "Quầy VIVE (thử)", vaiTro: "nhan_vien" };
      }
      if (token === "thu:kho") {
        return { id: "dev-kho", ten: "Kho VIVE (thử)", vaiTro: "kho" };
      }
      if (!token || token === "thu" || token === "thu:quan_tri") {
        return { id: "dev", ten: "Quản trị VIVE (thử)", vaiTro: "quan_tri" };
      }
      throw new Error("Phiên đăng nhập không hợp lệ");
    }
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
  return { id: data.user.id, ten: nv.ten, vaiTro: nv.vai_tro as VaiTroNhanVien };
}

/**
 * Kiểm tra người gọi Server Action có vai trò quản trị (`quan_tri`) hay không.
 * Chặn cả khách chưa đăng nhập lẫn tài khoản nhân viên thường (`nhan_vien`) và `kho`.
 */
export async function xacThucQuanTri(
  token: string | null | undefined,
): Promise<NhanVienDaXacThuc> {
  if (!token) throw new Error("Chưa đăng nhập quản trị");
  const nv = await xacThucNhanVien(token);
  if (nv.vaiTro !== "quan_tri") {
    throw new Error("Chỉ tài khoản quản trị mới có quyền thực hiện thao tác này");
  }
  return nv;
}

/**
 * Kiểm tra người gọi Server Action có vai trò kho (`kho`) hoặc quản trị (`quan_tri`) hay không.
 * Chặn khách chưa đăng nhập và nhân viên quầy (`nhan_vien`).
 */
export async function xacThucKhoHoacQuanTri(
  token: string | null | undefined,
): Promise<NhanVienDaXacThuc> {
  if (!token) throw new Error("Chưa đăng nhập kho hoặc quản trị");
  const nv = await xacThucNhanVien(token);
  if (nv.vaiTro !== "kho" && nv.vaiTro !== "quan_tri") {
    throw new Error("Chỉ tài khoản kho hoặc quản trị mới có quyền sửa thông tin sản phẩm");
  }
  return nv;
}
