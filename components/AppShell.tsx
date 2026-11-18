"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThanhTrenDesktop } from "./ThanhTrenDesktop";
import { ThanhDocTablet } from "./ThanhDocTablet";
import { ThanhTab } from "./ThanhTab";
import { layDanhSachDaThich, layGioHang } from "@/lib/kho-luu-tru";

export interface AppShellProps {
  children: React.ReactNode;
  hienDieuHuong?: boolean;
  hienThanhTrenDesktop?: boolean;
  hienThanhDocTablet?: boolean;
  hienThanhTabMobile?: boolean;
  soLuongThich?: number;
  soLuongGio?: number;
  className?: string;
  noiDungClassName?: string;
  khoaChieuCao?: boolean;
}

/**
 * Khung ứng dụng đa nền tảng (AppShell) co giãn linh hoạt theo 3 mốc (docs/05 mục 2.1):
 * - Điện thoại (< 768px): Thanh tab dưới 5 mục
 * - Máy tính bảng (768–1023px): Thanh điều hướng rail dọc bên trái
 * - Máy tính (>= 1024px): Thanh điều hướng trên cùng, nội dung tối đa 1280px
 */
export function AppShell({
  children,
  hienDieuHuong = true,
  hienThanhTrenDesktop = true,
  hienThanhDocTablet = true,
  hienThanhTabMobile = true,
  soLuongThich: propSoLuongThich,
  soLuongGio: propSoLuongGio,
  className = "",
  noiDungClassName = "",
  khoaChieuCao = false,
}: AppShellProps) {
  const pathname = usePathname();
  const laTrangNoiBo =
    pathname.startsWith("/nhan-vien") || pathname.startsWith("/quan-tri");
  const coHienDieuHuong = hienDieuHuong && !laTrangNoiBo;

  const [soThich, setSoThich] = useState(propSoLuongThich ?? 0);
  const [soGio, setSoGio] = useState(propSoLuongGio ?? 0);

  useEffect(() => {
    const capNhatSoDem = () => {
      if (propSoLuongThich === undefined) {
        setSoThich(layDanhSachDaThich().length);
      }
      if (propSoLuongGio === undefined) {
        const gio = layGioHang();
        setSoGio(gio.reduce((sum, item) => sum + item.soLuong, 0));
      }
    };

    capNhatSoDem();
    window.addEventListener("storage", capNhatSoDem);
    window.addEventListener("vive_storage_update", capNhatSoDem);

    return () => {
      window.removeEventListener("storage", capNhatSoDem);
      window.removeEventListener("vive_storage_update", capNhatSoDem);
    };
  }, [propSoLuongThich, propSoLuongGio]);

  const tongThich = propSoLuongThich ?? soThich;
  const tongGio = propSoLuongGio ?? soGio;

  const isFixedH =
    khoaChieuCao ||
    className.includes("h-dvh") ||
    className.includes("h-screen") ||
    className.includes("h-full");

  return (
    <div
      className={`w-full bg-trang text-den flex flex-col ${
        isFixedH ? "h-dvh overflow-hidden" : "min-h-dvh"
      } ${className}`}
    >
      {/* 1. Thanh trên cho máy tính (>= 1024px) */}
      {coHienDieuHuong && hienThanhTrenDesktop && (
        <ThanhTrenDesktop soLuongThich={tongThich} soLuongGio={tongGio} />
      )}

      {/* 2. Thân trang: bố cục hàng ngang ở tablet (768–1023px) để chứa thanh rail bên trái */}
      <div className="w-full flex-1 min-h-0 flex flex-col md:flex-row">
        {coHienDieuHuong && hienThanhDocTablet && (
          <ThanhDocTablet soLuongThich={tongThich} soLuongGio={tongGio} />
        )}

        {/* Khung nội dung chính */}
        <div
          className={`flex-1 min-w-0 min-h-0 flex flex-col ${
            isFixedH ? "h-full overflow-hidden" : ""
          } ${noiDungClassName}`}
        >
          {children}
        </div>
      </div>

      {/* 3. Thanh tab dưới cho điện thoại (< 768px) */}
      {coHienDieuHuong && hienThanhTabMobile && (
        <ThanhTab soLuongThich={tongThich} soLuongGio={tongGio} />
      )}
    </div>
  );
}
