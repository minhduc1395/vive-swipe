"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { KhoiDemNguoc } from "@/lib/chien-dich/types";

interface KhoiDemNguocProps {
  khoi: KhoiDemNguoc;
}

export function KhoiDemNguoc({ khoi }: KhoiDemNguocProps) {
  const t = useTranslations("trang-chu.landing.demNguoc");
  const { tieu_de = t("tieuDe"), thoi_gian_chot, cau_chu } = khoi;

  const [timeLeft, setTimeLeft] = useState({
    ngay: 0,
    gio: 0,
    phut: 0,
    giay: 0,
  });

  useEffect(() => {
    function tinhThoiGian() {
      const target = new Date(thoi_gian_chot).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const ngay = Math.floor(diff / (1000 * 60 * 60 * 24));
      const gio = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const phut = Math.floor((diff / 1000 / 60) % 60);
      const giay = Math.floor((diff / 1000) % 60);

      setTimeLeft({ ngay, gio, phut, giay });
    }

    tinhThoiGian();
    const interval = setInterval(tinhThoiGian, 1000);
    return () => clearInterval(interval);
  }, [thoi_gian_chot]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      aria-label={t("aria")}
      className="relative z-10 bg-hong-nhat py-16 px-5 sm:px-8 text-center"
    >
      <div className="max-w-[700px] mx-auto flex flex-col items-center gap-5">
        <h2 className="m-0 font-bold text-[32px] sm:text-[44px] text-den">
          {tieu_de}
        </h2>

        {cau_chu && (
          <p className="m-0 text-[16px] text-xam max-w-[480px]">{cau_chu}</p>
        )}

        <div className="flex items-center justify-center gap-3 sm:gap-4 font-bold text-[32px] sm:text-[48px] text-den">
          <div className="flex flex-col items-center">
            <span className="w-16 sm:w-22 h-16 sm:h-22 rounded-2xl bg-white flex items-center justify-center shadow-xs">
              {pad(timeLeft.ngay)}
            </span>
            <span className="text-[12px] font-medium text-xam mt-1.5 uppercase">
              {t("ngay")}
            </span>
          </div>
          <span className="mb-6">:</span>
          <div className="flex flex-col items-center">
            <span className="w-16 sm:w-22 h-16 sm:h-22 rounded-2xl bg-white flex items-center justify-center shadow-xs">
              {pad(timeLeft.gio)}
            </span>
            <span className="text-[12px] font-medium text-xam mt-1.5 uppercase">
              {t("gio")}
            </span>
          </div>
          <span className="mb-6">:</span>
          <div className="flex flex-col items-center">
            <span className="w-16 sm:w-22 h-16 sm:h-22 rounded-2xl bg-white flex items-center justify-center shadow-xs">
              {pad(timeLeft.phut)}
            </span>
            <span className="text-[12px] font-medium text-xam mt-1.5 uppercase">
              {t("phut")}
            </span>
          </div>
          <span className="mb-6">:</span>
          <div className="flex flex-col items-center">
            <span className="w-16 sm:w-22 h-16 sm:h-22 rounded-2xl bg-white flex items-center justify-center shadow-xs">
              {pad(timeLeft.giay)}
            </span>
            <span className="text-[12px] font-medium text-xam mt-1.5 uppercase">
              {t("giay")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
