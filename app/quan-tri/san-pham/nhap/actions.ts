"use server";

import { revalidatePath } from "next/cache";
import { xacThucKhoHoacQuanTri } from "@/lib/nhan-vien/xac-thuc-server";
import {
  apDungLoExcelServer,
  layDanhSachLoNhapLieuServer,
  taoBufferFileExcelMauServer,
  taoLoXemTruocExcelServer,
  xuatBufferFileExcelSanPhamServer,
  type LoNhapLieuItem,
} from "@/lib/admin/kho-quan-tri";

export async function actionTaiFileExcelMau(token: string | null): Promise<{
  tenFile: string;
  base64: string;
}> {
  await xacThucKhoHoacQuanTri(token);
  const buffer = await taoBufferFileExcelMauServer();
  return {
    tenFile: "vive-san-pham-mau.xlsx",
    base64: buffer.toString("base64"),
  };
}

export async function actionXuatFileExcelHienTai(
  token: string | null,
): Promise<{
  tenFile: string;
  base64: string;
  soSanPham: number;
}> {
  await xacThucKhoHoacQuanTri(token);
  const { buffer, soSanPham } = await xuatBufferFileExcelSanPhamServer();
  const ngay = new Date().toISOString().slice(0, 10);
  return {
    tenFile: `vive-san-pham-${ngay}.xlsx`,
    base64: buffer.toString("base64"),
    soSanPham,
  };
}

export async function actionTaiLenXemTruocExcel(
  token: string | null,
  input: { tenFile: string; base64: string },
): Promise<LoNhapLieuItem> {
  const nv = await xacThucKhoHoacQuanTri(token);
  const vaiTro: "kho" | "quan_tri" =
    nv.vaiTro === "quan_tri" ? "quan_tri" : "kho";

  const buffer = Buffer.from(input.base64, "base64");
  const lo = await taoLoXemTruocExcelServer({
    tenFile: input.tenFile,
    buffer,
    boi: nv.ten,
    vaiTro,
  });

  revalidatePath("/quan-tri/san-pham/nhap");
  return lo;
}

export async function actionApDungLoExcel(
  token: string | null,
  maLo: string,
): Promise<{
  lo: LoNhapLieuItem;
  soMaDaGhi: number;
}> {
  const nv = await xacThucKhoHoacQuanTri(token);
  const vaiTro: "kho" | "quan_tri" =
    nv.vaiTro === "quan_tri" ? "quan_tri" : "kho";

  const kq = await apDungLoExcelServer({
    maLo,
    boi: nv.ten,
    vaiTro,
  });

  revalidatePath("/quan-tri/san-pham");
  revalidatePath("/quan-tri/san-pham/nhap");
  revalidatePath("/danh-muc");
  revalidatePath("/quet");
  return kq;
}

export async function actionLayDanhSachLoNhapLieu(
  token: string | null,
): Promise<LoNhapLieuItem[]> {
  await xacThucKhoHoacQuanTri(token);
  return layDanhSachLoNhapLieuServer();
}
