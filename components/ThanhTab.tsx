"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CAC_MUC_TAB_MOBILE, kiemTraMucDangChon } from "@/lib/dieu-huong";

interface ThanhTabProps {
  soLuongThich?: number;
  soLuongGio?: number;
}

function BieuTuongTab({
  tabKey,
  dangChon,
}: {
  tabKey: string;
  dangChon: boolean;
}) {
  const strokeWidth = dangChon ? 2.1 : 1.8;

  switch (tabKey) {
    case "quet":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="7" y="3" width="13" height="17" rx="2.5" />
          <path d="M4 7v12a2 2 0 0 0 2 2h9" />
        </svg>
      );
    case "danh-muc":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "da-thich":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={dangChon ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "deal":
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <path d="M7 7h.01" />
        </svg>
      );
    case "gio":
    default:
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
      );
  }
}

/**
 * Thanh điều hướng dưới cố định 5 tab cho điện thoại: Quẹt · Sản phẩm · Đã thích · Deal · Giỏ (W051).
 * Kiểu dáng kính mờ v3, chữ nhỏ, màu token, không nút đen.
 */
export function ThanhTab({
  soLuongThich = 0,
  soLuongGio = 0,
}: ThanhTabProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="mt-auto sticky bottom-0 z-40 shrink-0 min-h-[64px] px-1 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom,0px))] border-t border-[rgba(43,43,42,0.06)] bg-[rgba(255,255,255,0.85)] backdrop-blur-md grid grid-cols-5 md:hidden"
    >
      {CAC_MUC_TAB_MOBILE.map((tab) => {
        const dangChon = kiemTraMucDangChon(tab.key, pathname);
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
            prefetch={false}
            aria-current={dangChon ? "page" : undefined}
            className={`relative min-w-0 min-h-[44px] flex flex-col items-center justify-center gap-1 no-underline focus-visible:outline-2 focus-visible:outline-den rounded-xl transition-colors ${
              dangChon ? "text-den font-semibold" : "text-xam hover:text-den font-medium"
            }`}
          >
            {dangChon && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 w-6 h-[2px] rounded-full bg-den"
              />
            )}
            <span className="relative flex items-center justify-center">
              <BieuTuongTab tabKey={tab.key} dangChon={dangChon} />
              {soDem > 0 && (
                <span
                  aria-label={`${soDem} món`}
                  className="absolute -top-[5px] -right-[11px] min-w-[17px] h-[17px] px-1 rounded-full bg-hong text-den text-[10px] font-bold leading-none flex items-center justify-center"
                >
                  {soDem > 99 ? "99+" : soDem}
                </span>
              )}
            </span>
            <span className="text-[11px] leading-[1.2] whitespace-nowrap">
              {tab.nhan.vi}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
