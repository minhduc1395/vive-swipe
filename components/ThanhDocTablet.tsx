"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoVive } from "@/components/LogoVive";
import { CAC_MUC_TABLET, kiemTraMucDangChon } from "@/lib/dieu-huong";
import { hienToast } from "@/components/ui/Toast";

interface ThanhDocTabletProps {
  soLuongThich?: number;
  soLuongGio?: number;
}

function BieuTuongTablet({ tabKey }: { tabKey: string }) {
  switch (tabKey) {
    case "new-arrival":
      return (
        <svg
          width="20"
          height="20"
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
      );
    case "quet":
      return (
        <svg
          width="20"
          height="20"
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
      );
    case "danh-muc":
      return (
        <svg
          width="20"
          height="20"
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
      );
    case "deal":
      return (
        <svg
          width="20"
          height="20"
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
      );
    case "da-thich":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "gio":
      return (
        <svg
          width="20"
          height="20"
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
      );
    case "dang-nhap":
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

/**
 * Thanh điều hướng rail dọc cho máy tính bảng (768–1023px) theo v3 (W051).
 * Kính mờ, chữ nhỏ, màu token, không nút đen, logo về `/`.
 */
export function ThanhDocTablet({
  soLuongThich = 0,
  soLuongGio = 0,
}: ThanhDocTabletProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng máy tính bảng"
      className="hidden md:flex lg:hidden w-[96px] shrink-0 border-r border-[rgba(43,43,42,0.06)] bg-[rgba(255,255,255,0.85)] backdrop-blur-md h-dvh sticky top-0 flex-col items-center gap-1.5 py-5 z-20"
    >
      {/* Logo VIVE -> về / */}
      <Link
        href="/"
        aria-label="Trang chủ VIVE"
        className="flex items-center justify-center mb-3 focus-visible:outline-2 focus-visible:outline-den rounded"
      >
        <LogoVive rong={52} />
      </Link>

      {/* Các mục điều hướng */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {CAC_MUC_TABLET.map((tab) => {
          const dangChon = kiemTraMucDangChon(tab.key, pathname);
          const soDem =
            tab.key === "da-thich"
              ? soLuongThich
              : tab.key === "gio"
                ? soLuongGio
                : 0;

          const lopStyle = `relative w-[80px] h-[58px] rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-den ${
            dangChon
              ? "bg-[#F7EEEB] text-[#2B2B2A] font-semibold"
              : "bg-transparent text-[#737373] hover:text-[#2B2B2A] hover:bg-[#F7EEEB]/50 font-medium"
          }`;

          if (tab.sap_co) {
            return (
              <a
                key={tab.key}
                href={tab.href}
                onClick={(e) => {
                  e.preventDefault();
                  hienToast("Tính năng sắp ra mắt");
                }}
                data-sap-co="true"
                aria-label={tab.nhan.vi}
                className={`${lopStyle} cursor-pointer`}
              >
                <BieuTuongTablet tabKey={tab.key} />
                <span className="leading-none">{tab.nhan.vi}</span>
              </a>
            );
          }

          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={dangChon ? "page" : undefined}
              className={lopStyle}
            >
              <BieuTuongTablet tabKey={tab.key} />
              <span className="leading-none">{tab.nhan.vi}</span>
              {soDem > 0 && (
                <span
                  aria-label={`${soDem} món`}
                  className="absolute top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#E8D2CC] text-den text-[10px] font-bold flex items-center justify-center leading-none"
                >
                  {soDem > 99 ? "99+" : soDem}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
