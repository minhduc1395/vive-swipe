import { SanPhamKhoClient } from "./SanPhamKhoClient";

export const dynamic = "force-dynamic";

export default function TrangKhoSanPham() {
  return (
    <div className="min-h-dvh bg-trang text-den flex flex-col">
      <SanPhamKhoClient />
    </div>
  );
}
