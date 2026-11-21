import type { Metadata } from "next";
import { CuonKhungAnh } from "@/components/cuon-khung/CuonKhungAnh";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "LOPOE · thử cuộn bằng chuỗi ảnh",
  robots: { index: false, follow: false },
};

/** W063: thử nghiệm thay khối 3D (three.js) bằng 150 khung ảnh dựng sẵn để so độ mượt trên điện thoại. */
export default function TrangLopoeKhung() {
  return (
    <main>
      <p className="px-5 py-6 text-sm text-neutral-600">Bản thử: khối LOPOE dùng chuỗi 150 ảnh dựng sẵn (không dùng 3D). Cuộn xuống để so với trang chủ.</p>
      <CuonKhungAnh thuMuc="/thu-nghiem/lopoe-khung" soKhung={150} rong={780} cao={1688} chieuCaoVh={1600} />
      <p className="px-5 py-10 text-sm text-neutral-600">Hết khối thử.</p>
    </main>
  );
}
