import type { Metadata } from "next";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { CuonLopoe3D } from "@/components/cuon-3d/CuonLopoe3D";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "LOPOE Better Balance · thử nghiệm cuộn 3D",
  robots: { index: false, follow: false },
};

/** W054: trang thử để duyệt chữ (hiện cả câu chờ bằng chứng). Bản thật ở khối 2 trang chủ (W055). */
export default function TrangLopoe3D() {
  const cfg = docCauHinhLopoe3D(true);
  return <CuonLopoe3D cfg={cfg} />;
}
