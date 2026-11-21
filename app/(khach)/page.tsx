import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEALS, DOANH_NGHIEP } from "@/lib/data";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import { TRANG_CHU_CONFIG } from "@/lib/trang-chu";
import { TrangChuClient } from "@/components/trang-chu/TrangChuClient";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trang-chu.trangChu");
  return {
    title: t("tieuDe"),
    description: t("moTa"),
    openGraph: {
      title: t("tieuDe"),
      description: t("moTaMangXaHoi"),
      images: [
        {
          url: "/brand/og-image.png",
          width: 1200,
          height: 630,
          alt: t("tieuDe"),
        },
      ],
    },
  };
}

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
        // W063: điện thoại chạy chuỗi ảnh (CĐT giữ cách này 21/11), máy tính chạy three.js
        lopoe3D={docCauHinhLopoe3D()}
        deals={dealsTrangChu}
        doanhNghiep={DOANH_NGHIEP}
        gioMoCua={CAU_HINH_BOOTH.gioMoCua}
      />
    </>
  );
}
