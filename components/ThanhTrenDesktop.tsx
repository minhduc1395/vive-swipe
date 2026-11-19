"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoVive } from "@/components/LogoVive";
import { kiemTraMucDangChon } from "@/lib/dieu-huong";

interface ThanhTrenDesktopProps {
  soLuongThich?: number;
  soLuongGio?: number;
}

const CAC_MUC_MENU = [
  {
    href: "/",
    label: "New Arrival",
    key: "new-arrival",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: "/quet",
    label: "Quẹt",
    key: "quet",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="6" y="3" width="13" height="17" rx="2.5" />
        <path d="M3.5 7v11.5A2.5 2.5 0 0 0 6 21h9" />
      </svg>
    ),
  },
  {
    href: "/danh-muc",
    label: "Sản phẩm",
    key: "danh-muc",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/deal",
    label: "Deal",
    key: "deal",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    ),
  },
  {
    href: "/da-thich",
    label: "Đã thích",
    key: "da-thich",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export function ThanhTrenDesktop({
  soLuongThich = 0,
  soLuongGio = 0,
}: ThanhTrenDesktopProps) {
  const pathname = usePathname();

  return (
    <div
      role="banner"
      className="hidden lg:block sticky top-0 z-50 bg-trang border-b border-[#F7EEEB]"
    >
      <div className="max-w-[1280px] mx-auto px-8 h-[72px] flex items-center gap-6">
        {/* Logo VIVE */}
        <Link
          href="/"
          aria-label="Trang chủ VIVE"
          className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-den rounded"
        >
          <LogoVive rong={76} />
        </Link>

        {/* Menu chính */}
        <nav
          aria-label="Điều hướng máy tính"
          className="flex items-center gap-1 min-w-0"
        >
          {CAC_MUC_MENU.map((muc) => {
            const dangChon = kiemTraMucDangChon(muc.key, pathname);
            const soDem = muc.key === "da-thich" ? soLuongThich : 0;

            return (
              <Link
                key={muc.key}
                href={muc.href}
                aria-current={dangChon ? "page" : undefined}
                className={`h-11 px-3 rounded-full flex items-center gap-2 text-[15px] whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-den ${
                  dangChon
                    ? "bg-[#F7EEEB] text-den font-semibold"
                    : "text-[#2B2B2A] hover:bg-[#F7EEEB]/60 font-medium"
                }`}
              >
                <span className="hidden xl:inline-flex">{muc.icon}</span>
                <span>{muc.label}</span>
                {soDem > 0 && (
                  <span
                    aria-label={`${soDem} món`}
                    className="min-w-[20px] h-5 px-1.5 rounded-full bg-den text-trang text-[12px] font-semibold inline-flex items-center justify-center leading-none"
                  >
                    {soDem > 99 ? "99+" : soDem}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Cụm công cụ bên phải: Ô tìm kiếm, Giỏ, Đăng nhập */}
        <div className="ml-auto flex items-center gap-3">
          {/* Ô tìm kiếm nhanh */}
          <form
            action="/danh-muc"
            method="GET"
            role="search"
            className="relative hidden xl:flex items-center"
          >
            <label className="h-11 w-[220px] px-4 rounded-full bg-[#F7EEEB] flex items-center gap-2.5 focus-within:ring-2 focus-within:ring-den/20 transition-all cursor-text">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#737373"
                strokeWidth="1.9"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <span className="sr-only">Tìm sản phẩm</span>
              <input
                type="search"
                name="tim"
                placeholder="Tìm sản phẩm, thương hiệu"
                className="border-0 outline-none bg-transparent text-[14px] text-den w-full placeholder:text-[#737373]"
              />
            </label>
          </form>

          {/* Nút Giỏ hàng */}
          <Link
            href="/gio"
            aria-label={
              soLuongGio > 0 ? `Giỏ hàng (${soLuongGio} món)` : "Giỏ hàng"
            }
            className="h-11 px-4.5 rounded-full bg-den text-trang flex items-center gap-2 text-[15px] font-semibold whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-den"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span>Giỏ</span>
            {soLuongGio > 0 && (
              <span
                aria-hidden="true"
                className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#E8D2CC] text-den text-[12px] font-bold inline-flex items-center justify-center leading-none"
              >
                {soLuongGio > 99 ? "99+" : soLuongGio}
              </span>
            )}
          </Link>

          {/* Nút Đăng nhập */}
          <Link
            href="/dang-nhap"
            className="h-11 px-4 rounded-full border border-[#E8D2CC] text-den flex items-center text-[14px] font-semibold whitespace-nowrap shrink-0 hover:bg-[#F7EEEB] transition-colors focus-visible:outline-2 focus-visible:outline-den"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
