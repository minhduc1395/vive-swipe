"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoVive } from "./LogoVive";
import { ThanhTrenDesktop } from "./ThanhTrenDesktop";
import { ThanhDocTablet } from "./ThanhDocTablet";
import { ThanhTab } from "./ThanhTab";
import { ChanTrang } from "./ChanTrang";
import { Toast, hienToast } from "./ui/Toast";
import { layDanhSachDaThich, layGioHang } from "@/lib/kho-luu-tru";

export interface AppShellProps {
  children: React.ReactNode;
  hienChanTrang?: boolean;
  soLuongThich?: number;
  soLuongGio?: number;
  className?: string;
  noiDungClassName?: string;
  khoaChieuCao?: boolean;
}

/**
 * Khung ứng dụng đa nền tảng (AppShell) co giãn linh hoạt theo 3 mốc (docs/05 mục 2.1, W038 §5):
 * - Điện thoại (< 768px): Thanh trên mảnh 52px (Logo · Đăng nhập) + thanh tab dưới 5 mục (Quẹt · Sản phẩm · Đã thích · Deal · Giỏ)
 * - Máy tính bảng (768–1023px): Thanh điều hướng rail dọc bên trái
 * - Máy tính (>= 1024px): Thanh điều hướng trên cùng, nội dung tối đa 1280px
 */
export function AppShell({
  children,
  hienChanTrang = true,
  soLuongThich: propSoLuongThich,
  soLuongGio: propSoLuongGio,
  className = "",
  noiDungClassName = "",
  khoaChieuCao = false,
}: AppShellProps) {
  const pathname = usePathname();
  const laTrangNoiBo =
    pathname.startsWith("/nhan-vien") || pathname.startsWith("/quan-tri");
  const coHienDieuHuong = !laTrangNoiBo;

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

  const isLanding = pathname === "/new-arrival";

  const isFixedH =
    khoaChieuCao ||
    pathname === "/quet" ||
    pathname.startsWith("/quet/") ||
    pathname === "/bat-dau" ||
    pathname.startsWith("/bat-dau/") ||
    className.includes("h-dvh") ||
    className.includes("h-screen") ||
    className.includes("h-full");

  return (
    <div
      className={`w-full bg-trang text-den flex flex-col ${
        isFixedH ? "h-dvh overflow-hidden" : "min-h-dvh"
      } ${className}`}
    >
      {/* 0. Thanh trên mảnh cho điện thoại (< 768px): cao 48px theo landing v3 (W051), Logo (về /) · New Arrival · Đăng nhập (sap_co) */}
      {coHienDieuHuong && (
        <header className="flex md:hidden h-[48px] shrink-0 px-4 items-center justify-between border-b border-[rgba(43,43,42,0.06)] bg-[rgba(255,255,255,0.85)] backdrop-blur-md sticky top-0 z-40">
          <Link
            href="/"
            aria-label="Trang chủ VIVE"
            className="inline-flex items-center min-h-[44px] focus-visible:outline-2 focus-visible:outline-den rounded"
          >
            <LogoVive rong={46} />
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/new-arrival"
              aria-current={pathname === "/new-arrival" ? "page" : undefined}
              className={`min-h-[44px] px-2.5 inline-flex items-center text-[13px] rounded-lg transition-colors ${
                pathname === "/new-arrival"
                  ? "text-[#2B2B2A] font-bold"
                  : "text-[#2B2B2A]/82 hover:text-[#2B2B2A] font-medium"
              }`}
            >
              New Arrival
            </Link>
            <a
              href="/dang-nhap"
              onClick={(e) => {
                e.preventDefault();
                hienToast("Tính năng sắp ra mắt");
              }}
              data-sap-co="true"
              aria-label="Đăng nhập"
              className="min-h-[44px] px-2.5 inline-flex items-center text-[13px] font-medium text-[#2B2B2A]/82 hover:text-[#2B2B2A] transition-colors cursor-pointer"
            >
              <span>Đăng nhập</span>
            </a>
          </div>
        </header>
      )}

      {/* 1. Thanh trên cho máy tính (>= 1024px) */}
      {coHienDieuHuong && (
        <ThanhTrenDesktop soLuongThich={tongThich} soLuongGio={tongGio} />
      )}

      {/* 2. Thân trang: bố cục hàng ngang ở tablet (768–1023px) để chứa thanh rail bên trái */}
      <div className="w-full flex-1 min-h-0 flex flex-col md:flex-row">
        {coHienDieuHuong && (
          <ThanhDocTablet soLuongThich={tongThich} soLuongGio={tongGio} />
        )}

        {/* Khung nội dung chính */}
        <div
          className={`flex-1 min-w-0 min-h-0 flex flex-col ${
            isFixedH ? "h-full overflow-hidden" : ""
          } ${noiDungClassName}`}
        >
          {children}
          {coHienDieuHuong && !isFixedH && !isLanding && hienChanTrang && (
            <ChanTrang className="mt-auto" />
          )}
        </div>
      </div>

      {/* 3. Thanh tab dưới cho điện thoại (< 768px) */}
      {coHienDieuHuong && (
        <ThanhTab soLuongThich={tongThich} soLuongGio={tongGio} />
      )}

      {/* 4. Toast trạng thái toàn cục (W050, W051, W040) */}
      <Toast />
    </div>
  );
}
