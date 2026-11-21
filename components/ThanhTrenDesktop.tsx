"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoVive } from "@/components/LogoVive";
import {
  CAC_MUC_MENU_DESKTOP,
  kiemTraMucDangChon,
} from "@/lib/dieu-huong";
import { hienToast } from "@/components/ui/Toast";
import { useLocale, useTranslations } from "next-intl";
import { NutNgonNgu } from "@/components/NutNgonNgu";
import type { NgonNgu } from "@/i18n/ngon-ngu";
import { LinkTaiKhoan } from "@/components/tai-khoan/LinkTaiKhoan";

interface ThanhTrenDesktopProps {
  soLuongThich?: number;
  soLuongGio?: number;
}

/**
 * Thanh menu chuẩn cho máy tính (≥ 1024px) theo bản mẫu landing v3 (W051).
 * Cao 48px, nền kính mờ (backdrop-filter), dính trên cùng, chữ 13px, không nút đen, không viền tối.
 */
export function ThanhTrenDesktop({
  soLuongThich = 0,
  soLuongGio = 0,
}: ThanhTrenDesktopProps) {
  const pathname = usePathname();
  const ngonNgu = useLocale() as NgonNgu;
  const t = useTranslations("chung.thanh");

  return (
    <div
      role="banner"
      className="hidden lg:block sticky top-0 z-50 h-[48px] bg-[rgba(255,255,255,0.78)] backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-[rgba(43,43,42,0.06)]"
    >
      <div className="max-w-[1024px] h-full mx-auto px-[22px] flex items-center justify-between">
        {/* Trái: Logo VIVE -> về / (trang chủ mới W050) */}
        <Link
          href="/"
          prefetch={false}
          aria-label={t("trangChu")}
          className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-den rounded"
        >
          <LogoVive rong={46} />
        </Link>

        {/* Giữa: Menu chính (New Arrival, Quẹt, Sản phẩm, Deal, Đã thích) */}
        <nav
          aria-label={t("dieuHuongMayTinh")}
          className="flex items-center gap-[30px]"
        >
          {CAC_MUC_MENU_DESKTOP.map((muc) => {
            const dangChon = kiemTraMucDangChon(muc.key, pathname);
            const soDem = muc.key === "da-thich" ? soLuongThich : 0;

            return (
              <Link
                key={muc.key}
                href={muc.href}
                prefetch={false}
                aria-current={dangChon ? "page" : undefined}
                className={`text-[13px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-den flex items-center gap-1.5 ${
                  dangChon
                    ? "text-den font-bold"
                    : "text-den/82 hover:text-den font-medium"
                }`}
              >
                <span>{muc.nhan[ngonNgu]}</span>
                {soDem > 0 && (
                  <span
                    aria-label={`${soDem} món`}
                    className="min-w-[16px] h-4 px-1 rounded-full bg-hong text-den text-[10px] font-bold inline-flex items-center justify-center leading-none"
                  >
                    {soDem > 99 ? "99+" : soDem}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Phải: Biểu tượng tìm sản phẩm, Giỏ hàng, Đăng nhập */}
        <div data-testid="menu-phai" className="flex items-center gap-[22px]">
          {/* Biểu tượng tìm kiếm */}
          <Link
            href="/danh-muc"
            prefetch={false}
            aria-label={t("timKiem")}
            className="text-den/82 hover:text-den transition-colors focus-visible:outline-2 focus-visible:outline-den p-1"
          >
            <svg
              className="w-[17px] h-[17px] block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 21 21" />
            </svg>
          </Link>

          {/* Giỏ hàng (biểu tượng + nhãn + số lượng) */}
          <Link
            href="/gio"
            prefetch={false}
            aria-label={
              soLuongGio > 0 ? t("gioHangCoMon", { so: soLuongGio }) : t("gioHang")
            }
            className="flex items-center gap-1.5 text-[13px] font-medium text-den/82 hover:text-den transition-colors focus-visible:outline-2 focus-visible:outline-den"
          >
            <svg
              className="w-[17px] h-[17px] block"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 8h14l-1 12H6L5 8Z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </svg>
            <span>{t("gio")}</span>
            {soLuongGio > 0 && (
              <span
                aria-label={t("soMon", { so: soLuongGio })}
                className="min-w-[16px] h-4 px-1 rounded-full bg-hong text-den text-[10px] font-bold inline-flex items-center justify-center leading-none"
              >
                {soLuongGio > 99 ? "99+" : soLuongGio}
              </span>
            )}
          </Link>

          <NutNgonNgu />

          {/* Đăng nhập (W051 sap_co, click hiện toast). Đã đăng nhập email: "Tài khoản" → /tai-khoan (#65) */}
          <LinkTaiKhoan className="text-[13px] font-medium text-den/82 hover:text-den transition-colors focus-visible:outline-2 focus-visible:outline-den">
          <a
            href="/dang-nhap"
            onClick={(e) => {
              e.preventDefault();
              hienToast("Tính năng sắp ra mắt");
            }}
            data-sap-co="true"
            aria-label="Đăng nhập"
            className="text-[13px] font-medium text-den/82 hover:text-den transition-colors focus-visible:outline-2 focus-visible:outline-den cursor-pointer"
          >
            <span>Đăng nhập</span>
          </a>
          </LinkTaiKhoan>
        </div>
      </div>
    </div>
  );
}
