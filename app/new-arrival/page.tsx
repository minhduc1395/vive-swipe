import type { Metadata } from "next";
import { layChienDichHienTai } from "@/lib/chien-dich";
import { LandingClient } from "@/components/landing/LandingClient";

export async function generateMetadata(): Promise<Metadata> {
  const chienDich = layChienDichHienTai();
  const title = chienDich
    ? `${chienDich.ten} · VIVE New Arrival`
    : "VIVE New Arrival · K-Beauty Experience";
  const description =
    chienDich?.khoi.find((k) => k.loai === "hero")?.mo_ta ||
    "Giới thiệu các dòng sản phẩm mới và chương trình ưu đãi K-Beauty tại VIVE Tầng LL2 Union Square.";

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

export default function TrangNewArrival() {
  const chienDich = layChienDichHienTai();

  if (!chienDich) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hong-nhat text-den">
        <p>Chưa có chiến dịch nào được cấu hình.</p>
      </div>
    );
  }

  return <LandingClient chienDich={chienDich} />;
}
