import type { Metadata } from "next";
import { DEALS, DOANH_NGHIEP } from "@/lib/data";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import { TRANG_CHU_CONFIG } from "@/lib/trang-chu";
import { TrangChuClient } from "@/components/trang-chu/TrangChuClient";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";

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
  const dealIdsCanDung = new Set(
    [
      TRANG_CHU_CONFIG.dai_thong_bao.deal_id,
      TRANG_CHU_CONFIG.qua_lopoe.deal_id,
      ...TRANG_CHU_CONFIG.luoi_doi.map((o) => o.deal_id).filter(Boolean),
      ...TRANG_CHU_CONFIG.truot_combo.the.map((t) => t.deal_id),
    ].filter((id): id is string => Boolean(id))
  );
  const dealsTrangChu = DEALS.filter((d) => dealIdsCanDung.has(d.id));

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/trang-chu/mt/0-mobile.webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={TRANG_CHU_CONFIG.cua_hang.anh_mat_tien[0]}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <TrangChuClient
        cauHinh={TRANG_CHU_CONFIG}
        lopoe3D={docCauHinhLopoe3D()}
        deals={dealsTrangChu}
        doanhNghiep={DOANH_NGHIEP}
        gioMoCua={CAU_HINH_BOOTH.gioMoCua}
      />
    </>
  );
}
