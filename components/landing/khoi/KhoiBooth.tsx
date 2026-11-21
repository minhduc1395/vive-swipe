import { lopNut } from "@/components/ui/Nut";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { KhoiBooth } from "@/lib/chien-dich/types";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import { DOANH_NGHIEP } from "@/lib/data";

interface KhoiBoothProps {
  khoi: KhoiBooth;
}

export function KhoiBooth({ khoi }: KhoiBoothProps) {
  const t = useTranslations("trang-chu.landing.booth");
  const {
    tieu_de = "VIVE | K-Beauty Experience",
    dia_chi = CAU_HINH_BOOTH.diaChiDayDu,
    gio = CAU_HINH_BOOTH.gioMoCua,
    ngay_cuoi = t("ngayCuoi"),
  } = khoi;

  return (
    <section
      id="booth"
      aria-label={t("aria")}
      className="relative z-10 bg-hong-nhat text-den overflow-hidden py-20 sm:py-24 px-5 sm:px-8 md:px-16"
    >
      <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="flex flex-col gap-3 max-w-[640px]">
          <span className="text-[13px] md:text-[14px] font-bold tracking-[1.5px] text-xam uppercase">
            {t("gheBooth")}
          </span>

          <span
            aria-hidden="true"
            className="font-bold text-[100px] sm:text-[160px] md:text-[220px] leading-[0.8] tracking-[-0.06em] text-transparent select-none -ml-1 sm:-ml-2"
            style={{
              WebkitTextStroke: "2px #2B2B2A",
            }}
          >
            LL2
          </span>

          <span className="text-[20px] sm:text-[24px] font-bold text-den mt-2">
            {tieu_de}
          </span>

          <div className="flex items-center gap-2.5 text-[15px] sm:text-[16px] text-den">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{dia_chi}</span>
          </div>

          <div className="flex items-center gap-2.5 text-[15px] sm:text-[16px] text-den">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>
              {gio} · {ngay_cuoi}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pb-2">
          <a
            href={DOANH_NGHIEP.ban_do ?? "https://maps.google.com/?q=Union+Square+Ho+Chi+Minh"}
            target="_blank"
            rel="noopener noreferrer"
            className={lopNut("chinh","lon")}
          >
            {t("chiDuong")}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <Link
            href="/gio"
            className={lopNut("phu","lon")}
          >
            {t("giuHang")}
          </Link>
        </div>
      </div>
    </section>
  );
}
