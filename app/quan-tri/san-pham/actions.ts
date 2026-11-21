"use server";

import { revalidatePath } from "next/cache";
import { xacThucKhoHoacQuanTri } from "@/lib/nhan-vien/xac-thuc-server";
import {
  layDanhSachSanPhamKhoServer,
  layLichSuSanPhamServer,
  suaSanPhamKhoServer,
} from "@/lib/admin/kho-quan-tri";
import type {
  LichSuSanPhamItem,
  SanPhamKho,
  ThayDoiSanPhamInput,
} from "@/lib/admin/san-pham-kho";

export async function actionTaiSanPhamKho(token: string | null): Promise<{
  sanPham: SanPhamKho[];
  lichSu: LichSuSanPhamItem[];
  cheDoDatabase: "supabase" | "dev_memory";
}> {
  await xacThucKhoHoacQuanTri(token);
  return layDanhSachSanPhamKhoServer();
}

export async function actionSuaSanPhamKho(
  token: string | null,
  input: {
    id: string;
    thayDoi: ThayDoiSanPhamInput;
  },
): Promise<{
  sanPham: SanPhamKho;
  lichSu: LichSuSanPhamItem[];
}> {
  const nv = await xacThucKhoHoacQuanTri(token);
  const vaiTro: "kho" | "quan_tri" =
    nv.vaiTro === "quan_tri" ? "quan_tri" : "kho";

  const kq = await suaSanPhamKhoServer({
    id: input.id,
    thayDoi: input.thayDoi,
    nguon: "nguoi",
    boi: nv.ten,
    vaiTro,
  });

  revalidatePath("/quan-tri/san-pham");
  revalidatePath("/danh-muc");
  revalidatePath("/quet");
  return kq;
}

export async function actionDanhDauDaXemAi(
  token: string | null,
  input: {
    id: string;
    cacTruong: string[];
  },
): Promise<{
  sanPham: SanPhamKho;
  lichSu: LichSuSanPhamItem[];
}> {
  const nv = await xacThucKhoHoacQuanTri(token);
  if (!Array.isArray(input.cacTruong) || input.cacTruong.length === 0) {
    throw new Error("Không có trường nào được chọn để đánh dấu đã xem");
  }
  const vaiTro: "kho" | "quan_tri" =
    nv.vaiTro === "quan_tri" ? "quan_tri" : "kho";

  const kq = await suaSanPhamKhoServer({
    id: input.id,
    thayDoi: { da_xem: input.cacTruong },
    nguon: "nguoi",
    boi: nv.ten,
    vaiTro,
  });

  revalidatePath("/quan-tri/san-pham");
  return kq;
}

export async function actionLayLichSuSanPham(
  token: string | null,
  sanPhamId: string,
): Promise<LichSuSanPhamItem[]> {
  await xacThucKhoHoacQuanTri(token);
  return layLichSuSanPhamServer(sanPhamId);
}
