import { lopNut } from "@/components/ui/Nut";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { NutQuayLai } from "@/components/NutQuayLai";
import { LogoVive } from "@/components/LogoVive";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("quet.chao");
  return { title: t("tieuDeTrang"), description: t("moTaTrang") };
}

export default async function TrangChao() {
  const t = await getTranslations("quet.chao");
  return (
    <div className="max-w-[540px] w-full mx-auto px-4 sm:px-6 pt-2 pb-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-2">
          <NutQuayLai fallback="/" nhan={t("quayLai")} />
        </div>

        <div className="relative h-[400px] sm:h-[460px] shrink-0 bg-kem rounded-[36px] overflow-hidden">
          <LogoVive
            rong={92}
            className="absolute left-1/2 top-8 -translate-x-1/2"
          />

          <div aria-hidden="true">
            <div className="absolute left-[20px] sm:left-[28px] top-[148px] w-[144px] sm:w-[164px] h-[194px] sm:h-[222px] rounded-[26px] bg-trang -rotate-12 shadow-[0_10px_28px_rgba(43,43,42,0.10)] flex items-center justify-center">
              <Image
                src="/products/8809369850262.webp"
                alt=""
                width={142}
                height={142}
                priority
                className="w-[122px] sm:w-[142px] h-[122px] sm:h-[142px] object-contain"
              />
              <div className="absolute -left-2 -top-2 w-[42px] h-[42px] rounded-full bg-trang border-[1.5px] border-den flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2B2B2A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            </div>

            <div className="absolute right-[20px] sm:right-[28px] top-[148px] w-[144px] sm:w-[164px] h-[194px] sm:h-[222px] rounded-[26px] bg-trang rotate-12 shadow-[0_10px_28px_rgba(43,43,42,0.10)] flex items-center justify-center">
              <Image
                src="/products/8809369850248.webp"
                alt=""
                width={142}
                height={142}
                priority
                className="w-[122px] sm:w-[142px] h-[122px] sm:h-[142px] object-contain"
              />
            </div>

            <div className="absolute left-1/2 top-[116px] -translate-x-1/2 w-[168px] sm:w-[192px] h-[228px] sm:h-[260px] rounded-[30px] bg-trang shadow-[0_18px_40px_rgba(43,43,42,0.16)] flex items-center justify-center">
              <Image
                src="/products/8809369850521.webp"
                alt=""
                width={170}
                height={170}
                priority
                className="w-[146px] sm:w-[170px] h-[146px] sm:h-[170px] object-contain"
              />
              <div className="absolute -right-3.5 -top-3.5 w-[50px] h-[50px] rounded-full bg-den flex items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="#FFFFFF"
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col px-3 pt-7 pb-4">
          <h1 className="m-0 text-center font-bold text-[36px] sm:text-[40px] leading-[1.15] tracking-[-1.2px] text-den">
            {t("thichThi")}
            <br />
            <span className="vet-hong-lon">{t("quetPhai")}</span>
          </h1>

          <div className="mt-auto pt-5 flex flex-col items-center gap-1.5">
            <Link
              href="/bat-dau"
              className={lopNut("chinh","lon",true)}
            >
              {t("batDauQuet")}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <Link
              href="/danh-muc"
              className="h-11 inline-flex items-center gap-2 text-[15px] font-semibold text-den no-underline"
            >
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
              {t("xemDanhMuc")}
            </Link>

            <p className="m-0 flex items-center gap-1.5 text-center text-[13px] text-xam">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {CAU_HINH_BOOTH.diaChiNgan} · {CAU_HINH_BOOTH.gioMoCua}
            </p>
          </div>
        </main>
      </div>
  );
}
