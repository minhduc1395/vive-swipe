import type { Metadata } from "next";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { CuonLopoe3D } from "@/components/cuon-3d/CuonLopoe3D";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "LOPOE · Frame Sequence Preview",
  robots: { index: false, follow: false },
};

/** W063: khối LOPOE thật, trên điện thoại vẽ bằng 300 khung ảnh dựng sẵn (chữ và nhãn vẫn là chữ thật). Máy tính vẫn dùng 3D. */
export default function TrangLopoeKhung() {
  return <CuonLopoe3D cfg={docCauHinhLopoe3D()} id="lopoe" />;
}
