import type { Metadata } from "next";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { CuonLopoe3D } from "@/components/cuon-3d/CuonLopoe3D";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "LOPOE Better Balance · thử nghiệm cuộn 3D",
  robots: { index: false, follow: false },
};

/** W054: trang thử nghiệm, chưa gắn landing, không có trên menu. */
export default function TrangLopoe3D() {
  const cfg = docCauHinhLopoe3D();
  return <CuonLopoe3D cfg={cfg} />;
}
