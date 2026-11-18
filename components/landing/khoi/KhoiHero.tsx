"use client";

import Image from "next/image";
import Link from "next/link";
import type { KhoiHero as KhoiHeroType } from "@/lib/chien-dich/types";

interface KhoiHeroProps {
  khoi: KhoiHeroType;
  stageReady?: boolean;
}

export function KhoiHero({ khoi, stageReady = false }: KhoiHeroProps) {
  const { nhan_tren, tieu_de, mo_ta, nut = [] } = khoi;

  const heroItem =
    khoi.vat_the?.doc?.find((v) => v.id === "ampoule") ||
    khoi.vat_the?.ngang?.find((v) => v.id === "ampoule") ||
    khoi.vat_the?.doc?.[0] ||
    khoi.vat_the?.ngang?.[0];
  const anhHero =
    heroItem?.anh ||
    (khoi.anh && khoi.anh.length > 1 ? khoi.anh[1] : khoi.anh?.[0]) ||
    "";

  return (
    <section
      id="hero-chien-dich"
      data-k="0"
      aria-label="Phần đầu chiến dịch"
      className="vq-k trai relative z-10"
    >
      {anhHero && (
        <div
          className={`anh-hero-tinh pointer-events-none absolute inset-0 -z-10 overflow-hidden ${
            stageReady ? "hidden" : "block"
          }`}
          aria-hidden="true"
        >
          {/* Mobile: đặt ở nửa trên màn hình (trên phần chữ ở 41svh). Desktop: đặt ở nửa phải màn hình */}
          <div className="absolute top-[6svh] sm:top-[8svh] left-1/2 -translate-x-1/2 w-[180px] sm:w-[220px] h-[30svh] max-h-[280px] lg:top-1/2 lg:-translate-y-1/2 lg:left-auto lg:right-[12%] lg:translate-x-0 lg:w-[320px] lg:h-[440px] lg:max-h-none">
            <Image
              src={anhHero}
              alt=""
              fill
              preload
              sizes="(max-width: 768px) 220px, 320px"
              className="object-contain drop-shadow-[0_20px_25px_rgba(43,43,42,0.12)]"
            />
          </div>
        </div>
      )}

      <div className="cot flex flex-col gap-2.5 sm:gap-3.5 md:gap-5">
        {nhan_tren && (
          <div className="self-start inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white text-[12px] md:text-[13px] font-bold tracking-[1.5px] text-den shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#8FBF9F]" />
            {nhan_tren}
          </div>
        )}

        <h1 className="m-0 font-bold text-[clamp(40px,11.5vw,72px)] lg:text-[clamp(56px,7.4vw,112px)] leading-[0.9] tracking-[-0.045em] text-den">
          {tieu_de.map((line, idx) => {
            const isOutline = line.startsWith("~");
            const cleanLine = isOutline ? line.slice(1) : line;

            if (isOutline) {
              return (
                <span
                  key={idx}
                  className="block text-transparent"
                  style={{
                    WebkitTextStroke: "2px #2B2B2A",
                  }}
                >
                  {cleanLine}
                </span>
              );
            }

            return (
              <span
                key={idx}
                className={`block ${idx === tieu_de.length - 1 ? "vet-hong" : ""}`}
              >
                {cleanLine}
              </span>
            );
          })}
        </h1>

        {mo_ta && (
          <p className="m-0 text-[16px] lg:text-[18px] leading-[1.55] lg:leading-[1.6] text-xam">
            {mo_ta}
          </p>
        )}

        {nut.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
            {nut.map((n, i) => {
              const isChinh = i === 0;
              const dichDen =
                n.den === "/bat-dau" ||
                n.chu.toLowerCase().includes("bắt đầu quẹt")
                  ? "/chao"
                  : n.den;
              return (
                <Link
                  key={i}
                  href={dichDen}
                  className={`min-h-[44px] h-[46px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 lg:px-7 rounded-full inline-flex items-center gap-2 font-semibold text-[14px] sm:text-[15px] lg:text-[16px] transition-transform active:scale-95 whitespace-nowrap ${
                    isChinh
                      ? "bg-den text-white hover:bg-black shadow-sm"
                      : "bg-white text-den hover:bg-white/80 border border-den/10 shadow-xs"
                  }`}
                >
                  {n.chu}
                  {isChinh && (
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
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
