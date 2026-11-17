import type { ReactNode } from "react";
import { KhungDienThoai } from "./KhungDienThoai";
import { ThanhTren } from "./ThanhTren";
import { ThanhTab } from "./ThanhTab";

interface KhungUngDungProps {
  children: ReactNode;
  hienThanhTren?: boolean;
  hienTab?: boolean;
  soLuongThich?: number;
  soLuongGio?: number;
}

/**
 * Khung giao diện chuẩn cho các trang khách dùng thanh tab 5 mục.
 */
export function KhungUngDung({
  children,
  hienThanhTren = false,
  hienTab = true,
  soLuongThich = 0,
  soLuongGio = 0,
}: KhungUngDungProps) {
  return (
    <KhungDienThoai>
      {hienThanhTren && <ThanhTren soLuongGio={soLuongGio} />}
      <main className="flex-1 min-h-0 flex flex-col">{children}</main>
      {hienTab && (
        <ThanhTab soLuongThich={soLuongThich} soLuongGio={soLuongGio} />
      )}
    </KhungDienThoai>
  );
}
