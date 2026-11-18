import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { ThanhTren } from "./ThanhTren";

interface KhungUngDungProps {
  children: ReactNode;
  hienThanhTren?: boolean;
  hienTab?: boolean;
  soLuongThich?: number;
  soLuongGio?: number;
  className?: string;
}

/**
 * Khung giao diện chuẩn cho các trang khách dùng thanh điều hướng 3 mốc (AppShell).
 */
export function KhungUngDung({
  children,
  hienThanhTren = false,
  hienTab = true,
  soLuongThich = 0,
  soLuongGio = 0,
  className = "",
}: KhungUngDungProps) {
  return (
    <AppShell
      hienDieuHuong={hienTab}
      soLuongThich={soLuongThich}
      soLuongGio={soLuongGio}
      className={className}
    >
      {hienThanhTren && (
        <div className="lg:hidden">
          <ThanhTren soLuongGio={soLuongGio} />
        </div>
      )}
      <main className="flex-1 min-h-0 flex flex-col">{children}</main>
    </AppShell>
  );
}
