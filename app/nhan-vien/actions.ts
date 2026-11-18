"use server";

import {
  layDanhSachDonGiuHangHomNay,
  capNhatTrangThaiDon,
} from "@/lib/giu-hang/kho-giu-hang";
import type { DonGiuHangChiTiet, TrangThaiGiuHang } from "@/lib/giu-hang/types";

export async function actionLayDanhSachDon(): Promise<DonGiuHangChiTiet[]> {
  return layDanhSachDonGiuHangHomNay();
}

export async function actionCapNhatTrangThai(
  ma: string,
  trangThai: TrangThaiGiuHang,
  nguoiCapNhat?: string
): Promise<boolean> {
  return capNhatTrangThaiDon(ma, trangThai, nguoiCapNhat);
}
