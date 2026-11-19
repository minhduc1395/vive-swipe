import type { Metadata } from "next";
import { DEALS, DOANH_NGHIEP } from "@/lib/data";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import { TRANG_CHU_CONFIG } from "@/lib/trang-chu";
import { TrangChuClient } from "@/components/trang-chu/TrangChuClient";

export const metadata: Metadata = {
  title: "VIVE · K-Beauty Experience",
  description:
    "Mỹ phẩm nội địa Hàn tại VIVE Tầng LL2 Union Square, 171 Đồng Khởi, Phường Sài Gòn.",
  openGraph: {
    title: "VIVE · K-Beauty Experience",
    description:
      "Mỹ phẩm nội địa Hàn tại VIVE Tầng LL2 Union Square, TP Hồ Chí Minh.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "VIVE · K-Beauty Experience",
      },
    ],
  },
};

export default function TrangChu() {
  return (
    <TrangChuClient
      cauHinh={TRANG_CHU_CONFIG}
      deals={DEALS}
      doanhNghiep={DOANH_NGHIEP}
      gioMoCua={CAU_HINH_BOOTH.gioMoCua}
    />
  );
}
