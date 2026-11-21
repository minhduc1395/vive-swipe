"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { layGioHang } from "@/lib/kho-luu-tru";
import { LogoVive } from "@/components/LogoVive";

interface LandingHeaderProps {
  scrolled?: boolean;
}

export function LandingHeader({
  scrolled: initialScrolled = false,
}: LandingHeaderProps) {
  const t = useTranslations("trang-chu.landing.header");
  const [scrolled, setScrolled] = useState(initialScrolled);
  const [soMonGio, setSoMonGio] = useState(0);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      const gio = layGioHang();
      const count = gio.reduce((acc, item) => acc + item.soLuong, 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSoMonGio(count);
    } catch {
      // ignore
    }
  }, []);

  return (
    <header
      className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex items-center gap-2 px-3.5 py-2 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md shadow-xs"
          : "bg-white/75 backdrop-blur-sm"
      }`}
    >
      <Link
        href="/"
        className="flex items-center h-10 shrink-0"
        aria-label={t("veDauTrang")}
      >
        <LogoVive rong={52} />
      </Link>

      {/* Thanh gọn điện thoại (< 768px) */}
      <nav
        aria-label={t("dieuHuong")}
        className="ml-auto flex items-center gap-0.5 flex-wrap"
      >
        <Link
          href="/"
          aria-current="page"
          className="h-10 px-2.5 rounded-full flex items-center text-[13px] font-bold text-den bg-transparent underline decoration-2 underline-offset-[6px] decoration-hong"
        >
          {t("newArrival")}
        </Link>
        <Link
          href="/"
          className="hidden md:flex h-11 px-3.5 rounded-full items-center text-[15px] font-medium text-den hover:bg-white/60 transition-colors"
        >
          {t("home")}
        </Link>
        <Link
          href="/quet"
          className="hidden md:flex h-11 px-3.5 rounded-full items-center text-[15px] font-medium text-den hover:bg-white/60 transition-colors"
        >
          {t("quet")}
        </Link>
        <Link
          href="/danh-muc"
          className="hidden md:flex h-11 px-3.5 rounded-full items-center text-[15px] font-medium text-den hover:bg-white/60 transition-colors"
        >
          {t("sanPham")}
        </Link>
        <Link
          href="/gio"
          className="hidden md:flex h-11 px-4 rounded-full items-center gap-1.5 text-[14px] font-semibold text-den bg-hong-nhat hover:bg-hong/60 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {t("gio")} {soMonGio > 0 && `· ${soMonGio}`}
        </Link>
        <Link
          href="/dang-nhap"
          className="relative h-8 md:h-11 px-3 md:px-5 ml-1 rounded-full bg-hong-nhat text-den border border-transparent flex items-center text-[13px] md:text-[14px] font-semibold hover:opacity-90 transition-colors after:content-[''] after:absolute after:-inset-y-[6px] after:-inset-x-[2px] md:after:hidden"
        >
          {t("dangNhap")}
        </Link>
      </nav>
    </header>
  );
}
