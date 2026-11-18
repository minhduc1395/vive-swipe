"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ThanhDocTabletProps {
  soLuongThich?: number;
  soLuongGio?: number;
}

const CAC_MUC_TABLET = [
  {
    href: "/",
    label: "New Arrival",
    key: "new-arrival",
    icon: (
      <svg
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
  {
    href: "/gio",
    label: "Giỏ",
    key: "gio",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 8h14l-1 12H6L5 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    ),
  },
];

export function ThanhDocTablet({
  soLuongThich = 0,
  soLuongGio = 0,
}: ThanhDocTabletProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng máy tính bảng"
      className="hidden md:flex lg:hidden w-[104px] shrink-0 border-r border-[#F7EEEB] bg-trang h-dvh sticky top-0 flex-col items-center gap-2 py-6 z-20"
    >
      {/* Logo VIVE */}
      <Link
        href="/"
        aria-label="Trang chủ VIVE"
        className="flex items-center justify-center mb-4 focus-visible:outline-2 focus-visible:outline-den rounded"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vive-logo-chu.png"
          alt="VIVE"
          className="w-[60px] h-auto"
        />
      </Link>

      {/* Các mục điều hướng */}
      <div className="flex flex-col items-center gap-2 w-full px-2.5">
        {CAC_MUC_TABLET.map((tab) => {
          const dangChon =
            tab.key === "new-arrival"
              ? pathname === "/" ||
                pathname === "/new-arrival" ||
                pathname.startsWith("/new-arrival/")
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const soDem =
            tab.key === "da-thich"
              ? soLuongThich
              : tab.key === "gio"
                ? soLuongGio
                : 0;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={dangChon ? "page" : undefined}
              className={`relative w-[84px] h-[64px] rounded-[18px] flex flex-col items-center justify-center gap-1 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-den ${
                dangChon
                  ? "bg-[#F7EEEB] text-den font-semibold"
                  : "bg-transparent text-[#737373] hover:text-den font-medium"
              }`}
            >
              {tab.icon}
              <span className="leading-none">{tab.label}</span>
              {soDem > 0 && (
                <span
                  aria-label={`${soDem} món`}
                  className="absolute top-1 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-den text-trang text-[11px] font-semibold flex items-center justify-center leading-none"
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
