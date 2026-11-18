"use server";

import { revalidatePath } from "next/cache";
import { xacThucQuanTri } from "@/lib/nhan-vien/xac-thuc-server";
import {
  capNhatDealServer,
  capNhatSanPhamServer,
  ghiNhanGuiEmailQuanTriServer,
  layDuLieuKhachDevNeuDaSua,
  layDuLieuQuanTriServer,
  xacNhanNhapTonKiotVietServer,
  xemTruocCsvKiotVietServer,
  type DuLieuQuanTri,
} from "@/lib/admin/kho-quan-tri";
import type { ConHang, Deal, SanPham, TrangThaiDeal } from "@/lib/data/types";
import type { KiotVietImportResult } from "@/lib/admin/kiotviet";

export async function actionTaiDuLieuQuanTri(
  token: string | null,
): Promise<DuLieuQuanTri> {
  await xacThucQuanTri(token);
  return layDuLieuQuanTriServer();
}

export async function actionCapNhatDeal(
  token: string | null,
  input: {
    id: string;
    hienThi?: boolean;
    hetQua?: boolean;
    trangThai?: TrangThaiDeal;
  },
): Promise<Deal> {
  const qt = await xacThucQuanTri(token);
  const kq = await capNhatDealServer({
    ...input,
    nguoiThucHien: qt.ten,
  });
  revalidatePath("/deal");
  revalidatePath("/quet");
  revalidatePath("/danh-muc");
  return kq;
}

export async function actionCapNhatSanPham(
  token: string | null,
  input: {
    id: string;
    hienThi?: boolean;
    giaBan?: number;
    ton?: number;
    conHang?: ConHang;
  },
): Promise<SanPham> {
  const qt = await xacThucQuanTri(token);
  const kq = await capNhatSanPhamServer({
    ...input,
    nguoiThucHien: qt.ten,
  });
  revalidatePath("/danh-muc");
  revalidatePath("/quet");
  revalidatePath("/gio");
  return kq;
}

export async function actionXemTruocCsvKiotViet(
  token: string | null,
  csvContent: string,
): Promise<KiotVietImportResult> {
  await xacThucQuanTri(token);
  return xemTruocCsvKiotVietServer(csvContent);
}

export async function actionXacNhanNhapTonKiotViet(
  token: string | null,
  csvContent: string,
): Promise<{ ketQua: KiotVietImportResult; sanPham: SanPham[] }> {
  const qt = await xacThucQuanTri(token);
  const kq = await xacNhanNhapTonKiotVietServer(csvContent, qt.ten);
  revalidatePath("/danh-muc");
  revalidatePath("/quet");
  return kq;
}

export async function actionGuiEmailThuQuanTri(
  token: string | null,
  payload: {
    tieuDe: string;
    noiDung: string;
    emailNhan: string;
    guiThat: boolean;
  },
): Promise<{ ok: true; thongBao: string }> {
  const qt = await xacThucQuanTri(token);
  return ghiNhanGuiEmailQuanTriServer({
    ...payload,
    nguoiThucHien: qt.ten,
  });
}

/**
 * Dùng cho web khách khi chạy ở chế độ dev/e2e không có Supabase thật,
 * giúp đọc thay đổi vừa lưu từ bộ nhớ server thay vì localStorage.
 */
export async function actionLayDuLieuKhachDev(): Promise<{
  sanPham: SanPham[];
  deals: Deal[];
} | null> {
  return layDuLieuKhachDevNeuDaSua();
}
