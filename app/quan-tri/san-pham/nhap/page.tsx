import type { Metadata } from "next";
import { NhapExcelClient } from "./NhapExcelClient";

export const metadata: Metadata = {
  title: "Nhập & xuất Excel sản phẩm — VIVE Pop-up",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function NhapExcelSanPhamPage() {
  return (
    <main className="min-h-dvh bg-trang">
      <NhapExcelClient />
    </main>
  );
}
