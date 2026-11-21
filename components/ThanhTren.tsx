import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogoVive } from "@/components/LogoVive";

interface ThanhTrenProps {
  soLuongGio?: number;
}

/**
 * Thanh trên cho màn Deck quẹt: logo VIVE gốc bên trái, giỏ hàng bên phải.
 */
export function ThanhTren({ soLuongGio = 0 }: ThanhTrenProps) {
  const t = useTranslations("chung.thanh");
  return (
    <header className="h-[60px] shrink-0 px-5 pr-3 pt-3 flex items-center justify-between">
      <Link
        href="/"
        aria-label={t("trangChu")}
        className="inline-flex items-center min-h-[44px]"
      >
        <LogoVive rong={58} />
      </Link>

      <Link
        href="/gio"
        aria-label={
          soLuongGio > 0 ? t("gioHangCoMon", { so: soLuongGio }) : t("gioHang")
        }
        className="relative w-11 h-11 flex items-center justify-center rounded-full text-den focus-visible:outline-2 focus-visible:outline-den"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {soLuongGio > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-[5px] rounded-full bg-den text-trang text-[11px] font-semibold flex items-center justify-center leading-none"
          >
            {soLuongGio > 99 ? "99+" : soLuongGio}
          </span>
        )}
      </Link>
    </header>
  );
}
