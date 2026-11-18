import { AppShell } from "@/components/AppShell";
import { layDanhSachDonGiuHangHomNay } from "@/lib/giu-hang/kho-giu-hang";
import { NhanVienClient } from "./NhanVienClient";

export const dynamic = "force-dynamic";

export default async function TrangNhanVien() {
  const danhSachBanDau = await layDanhSachDonGiuHangHomNay();

  return (
    <AppShell>
      <div className="w-full px-2 md:px-6 py-4">
        <NhanVienClient danhSachBanDau={danhSachBanDau} />
      </div>
    </AppShell>
  );
}
