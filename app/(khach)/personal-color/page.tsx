import { lopNut } from "@/components/ui/Nut";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { NutQuayLai } from "@/components/NutQuayLai";
import { dinhDangGia } from "@/lib/dinh-dang";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trang-chu.personalColor");
  return { title: t("tieuDeTrang"), description: t("moTaTrang") };
}

const BON_NHOM_MAU: { ma: "xuan" | "ha" | "thu" | "dong"; mau: string[] }[] = [
  { ma: "xuan", mau: ["#F6C9A9", "#F3A683", "#F9E0A8", "#BFD8A5"] },
  { ma: "ha", mau: ["#C9D6EA", "#E7C6D9", "#B8C9D9", "#D9D2E6"] },
  { ma: "thu", mau: ["#C98B5E", "#A6683F", "#D6B46A", "#7D7A45"] },
  { ma: "dong", mau: ["#2F3A66", "#B3264B", "#E9E6F0", "#1F1F1F"] },
];

const BA_BUOC_BOOTH = ["1", "2", "3"] as const;

export default async function TrangPersonalColor() {
  const t = await getTranslations("trang-chu.personalColor");
  const ngonNgu = await getLocale();
  return (
    <div className="bg-trang text-den w-full flex-1">
        {/* Khối quay lại */}
        <div className="max-w-[1360px] mx-auto px-5 md:px-8 pt-4 md:pt-6">
          <NutQuayLai fallback="/" nhan={t("quayLai")} />
        </div>

        {/* Hero theo Pawlette.dc.html */}
        <section
          aria-labelledby="personal-color-heading"
          className="max-w-[1360px] mx-auto px-5 md:px-8 pt-4 pb-12 md:pt-8 md:pb-20 flex flex-wrap items-center gap-8 md:gap-12"
        >
          <div className="flex-1 basis-[300px] md:basis-[440px] flex flex-col gap-5">
            <span className="self-start px-3.5 py-1.5 rounded-full bg-bac-ha-nhat text-den text-[12px] md:text-[13px] font-bold tracking-[1px]">
              {t("nhan")}
            </span>

            <h1
              id="personal-color-heading"
              className="m-0 text-[52px] sm:text-[72px] md:text-[96px] leading-[0.95] font-bold tracking-[-0.04em] text-den"
            >
              Personal
              <br />
              <span
                className="inline-block px-1.5"
                style={{ boxShadow: "inset 0 -0.26em 0 #E8D2CC" }}
              >
                Color
              </span>
            </h1>

            <p className="m-0 text-[17px] md:text-[19px] leading-[1.6] text-xam-dam max-w-[460px]">
              {t("gioiThieu")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/#ghe-vive"
                className={lopNut("chinh","lon")}
              >
                <span>{t("datLich")}</span>
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

              <div className="flex flex-col">
                <span className="text-[13px] text-xam">{t("goi")}</span>
                <span className="text-[24px] md:text-[26px] font-bold text-den leading-tight">
                  {dinhDangGia(378000, ngonNgu)}
                </span>
              </div>
            </div>
          </div>

          {/* Vòng màu xoay bên phải (tắt animation khi prefers-reduced-motion: reduce) */}
          <div
            aria-hidden="true"
            className="relative flex-1 basis-[280px] md:basis-[460px] h-[280px] sm:h-[360px] md:h-[440px] flex items-center justify-center"
          >
            <div
              data-testid="vong-mau-xoay"
              className="vong-mau-xoay w-[250px] h-[250px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] rounded-full"
              style={{
                background:
                  "conic-gradient(#F6C9A9, #F9E0A8, #BFD8A5, #C9D6EA, #E7C6D9, #2F3A66, #B3264B, #A6683F, #C98B5E, #F6C9A9)",
              }}
            />
            <div className="absolute w-[148px] h-[148px] sm:w-[186px] sm:h-[186px] md:w-[210px] md:h-[210px] rounded-full bg-trang flex flex-col items-center justify-center gap-1 shadow-xs">
              <span className="text-[12px] md:text-[13px] font-semibold text-xam">
                {t("banLa")}
              </span>
              <span className="text-[26px] md:text-[30px] font-bold text-den leading-none">
                ?
              </span>
            </div>
          </div>
        </section>

        {/* 4 nhóm màu */}
        <section aria-labelledby="bon-nhom-mau-heading" className="bg-hong-nhat">
          <div className="max-w-[1360px] mx-auto px-5 md:px-8 py-12 md:py-20 flex flex-col gap-7">
            <h2
              id="bon-nhom-mau-heading"
              className="m-0 text-[32px] md:text-[48px] font-bold tracking-[-0.03em] text-den"
            >
              {t("bonNhom")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BON_NHOM_MAU.map((nhom) => (
                <article
                  key={nhom.ma}
                  className="hien-dan rounded-[26px] bg-trang p-[18px] flex flex-col gap-3 shadow-[0_10px_26px_rgba(43,43,42,0.06)]"
                >
                  <div className="flex gap-1.5 h-[110px]" aria-hidden="true">
                    {nhom.mau.map((hex) => (
                      <span
                        key={hex}
                        className="flex-1 rounded-[12px]"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <h3 className="m-0 text-[20px] font-bold text-den">
                    {t(`nhom.${nhom.ma}.ten`)}
                  </h3>
                  <p className="m-0 text-[14px] leading-[1.5] text-xam-dam">
                    {t(`nhom.${nhom.ma}.moTa`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trải nghiệm tại booth */}
        <section
          aria-labelledby="trai-nghiem-booth-heading"
          className="hien-dan max-w-[1360px] mx-auto px-5 md:px-8 py-12 md:py-20 flex flex-col gap-7"
        >
          <h2
            id="trai-nghiem-booth-heading"
            className="m-0 text-[32px] md:text-[48px] font-bold tracking-[-0.03em] text-den"
          >
            {t("traiNghiem")}
          </h2>

          <ol className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-5">
            {BA_BUOC_BOOTH.map((buoc) => (
              <li
                key={buoc}
                className="rounded-[26px] bg-hong-nhat p-[26px] flex flex-col gap-2.5"
              >
                <span
                  aria-hidden="true"
                  className="text-[44px] font-bold leading-none text-transparent"
                  style={{ WebkitTextStroke: "1.5px #2B2B2A" }}
                >
                  {`0${buoc}`}
                </span>
                <h3 className="m-0 text-[20px] font-bold text-den">
                  {t(`buoc.${buoc}.tieuDe`)}
                </h3>
                <p className="m-0 text-[15px] leading-[1.55] text-xam-dam">
                  {t(`buoc.${buoc}.moTa`)}
                </p>
              </li>
            ))}
          </ol>

          <p className="m-0 text-[14px] text-xam">
            {t("ghiChu")}
          </p>
        </section>
      </div>
  );
}
