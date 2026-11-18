"use client";

import Link from "next/link";
import type { KhoiHero } from "@/lib/chien-dich/types";

interface KhoiHeroProps {
  khoi: KhoiHero;
}

export function KhoiHero({ khoi }: KhoiHeroProps) {
  const { nhan_tren, tieu_de, mo_ta, nut = [] } = khoi;

  return (
    <section
      aria-label="Phần đầu chiến dịch"
      className="relative min-h-[85vh] md:min-h-screen flex items-center justify-start px-5 sm:px-8 md:px-16 pt-24 md:pt-32 pb-16 z-10"
    >
      <div className="w-full max-w-[560px] flex flex-col gap-5 md:gap-6">
        {nhan_tren && (
          <div className="self-start inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white text-[12px] md:text-[13px] font-bold tracking-[1.5px] text-den shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#8FBF9F] animate-pulse" />
            {nhan_tren}
          </div>
        )}

        <h1 className="m-0 font-bold text-[56px] sm:text-[76px] md:text-[110px] leading-[0.92] tracking-[-0.045em] text-den">
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

            // Normal line
            return (
              <span
                key={idx}
                className={`block ${
                  idx === tieu_de.length - 1
                    ? "vet-hong"
                    : ""
                }`}
              >
                {cleanLine}
              </span>
            );
          })}
        </h1>

        {mo_ta && (
          <p className="m-0 text-[16px] sm:text-[18px] md:text-[19px] leading-[1.6] text-xam max-w-[460px]">
            {mo_ta}
          </p>
        )}

        {nut.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {nut.map((n, i) => {
              const isChinh = i === 0;
              return (
                <Link
                  key={i}
                  href={n.den}
                  className={`h-13 sm:h-14 px-6 sm:px-7 rounded-full inline-flex items-center gap-2 font-semibold text-[15px] sm:text-[16px] transition-transform active:scale-95 ${
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
