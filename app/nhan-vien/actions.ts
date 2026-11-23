"use server";

import {
  layDanhSachDonGiuHangHomNay,
  capNhatTrangThaiDon,
} from "@/lib/giu-hang/kho-giu-hang";
import { xacThucNhanVien } from "@/lib/nhan-vien/xac-thuc-server";
import { cheSdt } from "@/lib/nhan-vien/che-sdt";
import type { DonGiuHangChiTiet, TrangThaiGiuHang } from "@/lib/giu-hang/types";

const TRANG_THAI_NHAN_VIEN_DUOC_DAT: TrangThaiGiuHang[] = [
  "moi",
  "da_soan",
  "da_lay",
  "huy",
];

export async function actionLayDanhSachDon(
  token: string | null,
): Promise<DonGiuHangChiTiet[]> {
  await xacThucNhanVien(token);
  // SĐT đầy đủ không được rời server: chỉ trả 4 số cuối (LEG L1).
  const ds = await layDanhSachDonGiuHangHomNay();
  return ds.map((d) => ({ ...d, sdt: cheSdt(d.sdt) }));
}

export async function actionCapNhatTrangThai(
  token: string | null,
  ma: string,
  trangThai: TrangThaiGiuHang,
): Promise<boolean> {
  const nv = await xacThucNhanVien(token);
  if (!TRANG_THAI_NHAN_VIEN_DUOC_DAT.includes(trangThai))
    throw new Error("Trạng thái không hợp lệ");
  return capNhatTrangThaiDon(
    ma,
    trangThai,
    nv.ten,
    nv.id === "dev" ? null : nv.id,
  );
}
