"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { KhoiDoiTac } from "@/lib/chien-dich/types";
import { dinhDangTien } from "@/lib/dinh-dang";

interface KhoiDoiTacProps {
  khoi: KhoiDoiTac;
}

export function KhoiDoiTac({ khoi }: KhoiDoiTacProps) {
  const {
    tieu_de = "Tone bạn màu nào?",
    mo_ta = "Đo personal color cùng Pawlette, rồi thử lớp nền đúng tone ngay tại booth.",
    gia_goi = 378000,
    link = "/personal-color",
  } = khoi;

  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="personal-color"
      aria-label="Đối tác Pawlette"
      className="relative z-10 bg-white overflow-x-clip py-20 sm:py-24 px-5 sm:px-8 md:px-16"
    >
      <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
        {/* Animated 4 Seasonal Color Fan */}
        <div
          aria-hidden="true"
          className="relative w-[300px] md:w-[340px] max-w-full h-[270px] md:h-[300px] mx-auto md:mx-0 shrink-0"
        >
          {/* Fan Blade 1: Xuân ấm */}
          <div
            className="absolute left-1/2 bottom-8 w-[120px] h-[240px] -ml-[60px] rounded-[22px] bg-white shadow-[0_16px_34px_rgba(43,43,42,0.14)] p-3 flex flex-col gap-2 origin-[50%_110%] transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{
              transform: inView ? "rotate(-36deg)" : "rotate(0deg)",
            }}
          >
            <span className="flex-2 rounded-xl bg-[#F6C9A9]" />
            <span className="flex-1 rounded-xl bg-[#F9E0A8]" />
            <span className="text-[12px] font-bold text-center text-den mt-1">
              Xuân ấm
            </span>
          </div>

          {/* Fan Blade 2: Hạ mát */}
          <div
            className="absolute left-1/2 bottom-8 w-[120px] h-[240px] -ml-[60px] rounded-[22px] bg-white shadow-[0_16px_34px_rgba(43,43,42,0.14)] p-3 flex flex-col gap-2 origin-[50%_110%] transition-transform duration-700 ease-out delay-75"
            style={{
              transform: inView ? "rotate(-12deg)" : "rotate(0deg)",
            }}
          >
            <span className="flex-2 rounded-xl bg-[#C9D6EA]" />
            <span className="flex-1 rounded-xl bg-[#E7C6D9]" />
            <span className="text-[12px] font-bold text-center text-den mt-1">
              Hạ mát
            </span>
          </div>

          {/* Fan Blade 3: Thu ấm */}
          <div
            className="absolute left-1/2 bottom-8 w-[120px] h-[240px] -ml-[60px] rounded-[22px] bg-white shadow-[0_16px_34px_rgba(43,43,42,0.14)] p-3 flex flex-col gap-2 origin-[50%_110%] transition-transform duration-700 ease-out delay-150"
            style={{
              transform: inView ? "rotate(12deg)" : "rotate(0deg)",
            }}
          >
            <span className="flex-2 rounded-xl bg-[#C98B5E]" />
            <span className="flex-1 rounded-xl bg-[#D6B46A]" />
            <span className="text-[12px] font-bold text-center text-den mt-1">
              Thu ấm
            </span>
          </div>

          {/* Fan Blade 4: Đông lạnh */}
          <div
            className="absolute left-1/2 bottom-8 w-[120px] h-[240px] -ml-[60px] rounded-[22px] bg-white shadow-[0_16px_34px_rgba(43,43,42,0.14)] p-3 flex flex-col gap-2 origin-[50%_110%] transition-transform duration-700 ease-out delay-200"
            style={{
              transform: inView ? "rotate(36deg)" : "rotate(0deg)",
            }}
          >
            <span className="flex-2 rounded-xl bg-[#2F3A66]" />
            <span className="flex-1 rounded-xl bg-[#B3264B]" />
            <span className="text-[12px] font-bold text-center text-den mt-1">
              Đông lạnh
            </span>
          </div>
        </div>

        {/* Text and Info */}
        <div className="flex-1 max-w-[540px] flex flex-col gap-5">
          <span className="text-[13px] md:text-[14px] font-bold tracking-[1.5px] text-xam uppercase">
            TRẢI NGHIỆM TẠI BOOTH · PAWLETTE
          </span>
          <h2 className="m-0 font-bold text-[36px] sm:text-[44px] md:text-[46px] lg:text-[60px] leading-[0.95] tracking-[-0.04em] text-den">
            {tieu_de}
          </h2>
          <p className="m-0 text-[16px] sm:text-[18px] leading-[1.6] text-xam">
            {mo_ta}
          </p>

          {gia_goi > 0 && (
            <div className="flex items-baseline gap-2.5">
              <span className="text-[15px] text-xam">Gói trải nghiệm</span>
              <span className="text-[28px] sm:text-[32px] font-bold text-den">
                {dinhDangTien(gia_goi)}
              </span>
            </div>
          )}

          <Link
            href={link}
            data-testid="nut-personal-color"
            className="self-start h-14 px-6 sm:px-8 rounded-full bg-den text-white font-semibold text-[15px] sm:text-[16px] whitespace-nowrap max-w-full inline-flex items-center gap-2.5 hover:bg-black transition-transform active:scale-95"
          >
            Tìm hiểu Personal Color
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
        </div>
      </div>
    </section>
  );
}
