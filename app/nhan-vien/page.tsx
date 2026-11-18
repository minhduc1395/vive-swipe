import { AppShell } from "@/components/AppShell";
import { NhanVienClient } from "./NhanVienClient";

export const dynamic = "force-dynamic";

export default function TrangNhanVien() {
  return (
    <AppShell hienDieuHuong={false}>
      <div className="w-full px-2 md:px-6 py-4">
        <NhanVienClient />
      </div>
    </AppShell>
  );
}
