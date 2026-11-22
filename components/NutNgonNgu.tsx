"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { COOKIE_NGON_NGU, type NgonNgu } from "@/i18n/ngon-ngu";

/**
 * W044: nút VI | EN. Đặt cookie rồi làm mới dữ liệu trang (router.refresh), không tải lại trang
 * nên giỏ, đã thích (localStorage) và vị trí cuộn giữ nguyên.
 */
function ghiCookieNgonNgu(ma: NgonNgu) {
  document.cookie = `${COOKIE_NGON_NGU}=${ma}; path=/; max-age=31536000; samesite=lax`;
}

export function NutNgonNgu({ className = "" }: { className?: string }) {
  const ngonNgu = useLocale() as NgonNgu;
  const t = useTranslations("chung.thanh");
  const router = useRouter();
  const [dangDoi, batDau] = useTransition();

  const doi = (moi: NgonNgu) => {
    if (moi === ngonNgu) return;
    ghiCookieNgonNgu(moi);
    batDau(() => router.refresh());
  };

  const nut = (ma: NgonNgu, chu: string, nhan: string) => (
    <button
      type="button"
      onClick={() => doi(ma)}
      aria-pressed={ngonNgu === ma}
      aria-label={nhan}
      lang={ma}
      className={`min-h-[44px] min-w-[44px] md:min-w-[32px] px-1 text-[12px] tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-den rounded ${
        ngonNgu === ma ? "text-den font-bold" : "text-den/60 hover:text-den font-medium"
      }`}
    >
      {chu}
    </button>
  );

  return (
    <div
      role="group"
      aria-label={t("ngonNgu")}
      aria-busy={dangDoi}
      data-testid="nut-ngon-ngu"
      className={`inline-flex items-center ${className}`}
    >
      {nut("vi", "VI", t("doiSangVi"))}
      <span aria-hidden="true" className="text-den/30 text-[12px]">|</span>
      {nut("en", "EN", t("doiSangEn"))}
    </div>
  );
}
