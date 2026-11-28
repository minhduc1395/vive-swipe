import type { Metadata } from "next";
import {
  AmpouleGlbScroll,
  type MucCanhAmpoule,
} from "@/components/thu-nghiem-glb/AmpouleGlbScroll";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "LOPOE Better Balance Ampoule · 3D GLB Preview",
  robots: { index: false, follow: false },
};

const CAC_CANH: MucCanhAmpoule[] = [
  {
    nhan: "Cảnh 1 / 3 · Tỷ lệ thật",
    tieuDe: "LOPOE Better Balance Ampoule",
    moTa: "Mô hình thủy tinh 3D xoay 180° theo nhịp cuộn tay.",
  },
  {
    nhan: "Cảnh 2 / 3 · Nhỏ giọt",
    tieuDe: "4 hoạt chất, phục hồi & khóa ẩm",
    moTa: "Nhấc nắp nhỏ giọt và thả giọt tinh chất dưỡng ẩm.",
  },
  {
    nhan: "Cảnh 3 / 3 · Ghi nhận",
    tieuDe: "Hwahae Awards 2025 · No.1",
    moTa: "Đóng nắp, xoay về mặt trước và thu gọn sang trái.",
  },
];

export default function TrangThuNghiemAmpoule3D() {
  return (
    <AmpouleGlbScroll
      canhList={CAC_CANH}
      nhanTaiFallback="LOPOE Better Balance Ampoule"
    />
  );
}
