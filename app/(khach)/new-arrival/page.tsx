import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { layChienDichHienTai } from "@/lib/chien-dich";
import { LandingClient } from "@/components/landing/LandingClient";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { truongTheoNgonNgu } from "@/components/deck/ngon-ngu-quet";

export async function generateMetadata(): Promise<Metadata> {
  const chienDich = layChienDichHienTai();
  const ngonNgu = await getLocale();
  const t = await getTranslations("quet.newArrival");
  const hero = chienDich?.khoi.find((k) => k.loai === "hero");
  const title = chienDich
    ? `${truongTheoNgonNgu(chienDich, "ten", ngonNgu)} · VIVE New Arrival`
    : "VIVE New Arrival · K-Beauty Experience";
  const description = (hero && truongTheoNgonNgu(hero, "mo_ta", ngonNgu)) || t("moTaTrang");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "/brand/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function TrangNewArrival() {
  const t = await getTranslations("quet.newArrival");
  const chienDich = layChienDichHienTai();

  if (!chienDich) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kem text-den">
        <p>{t("chuaCoChienDich")}</p>
      </div>
    );
  }

  const lopoe3D = chienDich.cuon_3d === "lopoe" ? docCauHinhLopoe3D() : undefined;
  // W069 (#124): hai ảnh lớn nhất ở màn đầu của khối LOPOE là <img loading="lazy"> trong CuonLopoe3D
  // (không sửa được ở job này). Preload ưu tiên cao (chỉ 2 ảnh lớn, ảnh nhỏ hơn để tải thường kẻo tranh băng thông 4G) để trình duyệt tải ngay khi đọc HTML,
  // không chờ JS chạy và không chờ bố cục (LCP trên /new-arrival là ảnh này).
  const anhDauMan = lopoe3D
    ? [lopoe3D.tai_san.sua_rua_mat, lopoe3D.tai_san.kem_duong]
    : [];

  return (
    <>
      {anhDauMan.map((href) => (
        <link key={href} rel="preload" as="image" href={href} fetchPriority="high" />
      ))}
      <LandingClient chienDich={chienDich} lopoe3D={lopoe3D} />
    </>
  );
}
