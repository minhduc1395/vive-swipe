"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ThanhTabProps {
  soLuongThich?: number;
  soLuongGio?: number;
}

const MUC_TAB = [
  { href: "/quet", label: "Quẹt", key: "quet" },
  { href: "/danh-muc", label: "Danh mục", key: "danh-muc" },
  { href: "/da-thich", label: "Đã thích", key: "da-thich" },
  { href: "/deal", label: "Deal", key: "deal" },
  { href: "/gio", label: "Giỏ", key: "gio" },
] as const;

type TabKey = (typeof MUC_TAB)[number]["key"];

function BieuTuongTab({
  tabKey,
  dangChon,
}: {
  tabKey: TabKey;
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
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
  }
}

/**
 * Thanh điều hướng dưới cố định 5 tab: Quẹt · Danh mục · Đã thích · Deal · Giỏ.
 */
export function ThanhTab({
  soLuongThich = 0,
  soLuongGio = 0,
}: ThanhTabProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="mt-auto sticky bottom-0 z-40 shrink-0 min-h-[76px] px-1 pt-2 pb-[max(14px,env(safe-area-inset-bottom,0px))] border-t border-vien bg-trang grid grid-cols-5 md:hidden"
    >
      {MUC_TAB.map((tab) => {
        const dangChon =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);
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
            className={`relative min-w-0 min-h-[44px] flex flex-col items-center justify-center gap-1 no-underline focus-visible:outline-2 focus-visible:outline-den rounded-xl ${
              dangChon ? "text-den font-semibold" : "text-xam font-medium"
            }`}
          >
            {dangChon && (
              <span
                aria-hidden="true"
                className="absolute -top-2 w-6 h-[2px] rounded-full bg-den"
              />
            )}
            <span className="relative flex items-center justify-center">
              <BieuTuongTab tabKey={tab.key} dangChon={dangChon} />
              {soDem > 0 && (
                <span
                  aria-label={`${soDem} món`}
                  className="absolute -top-[5px] -right-[11px] min-w-[18px] h-[18px] px-1 rounded-full border-2 border-trang bg-den text-trang text-[10px] font-bold leading-none flex items-center justify-center"
                >
                  {soDem > 99 ? "99+" : soDem}
                </span>
              )}
            </span>
            <span className="text-[11px] leading-[1.2] whitespace-nowrap">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
