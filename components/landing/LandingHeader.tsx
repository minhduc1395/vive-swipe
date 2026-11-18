"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { layGioHang } from "@/lib/kho-luu-tru";

interface LandingHeaderProps {
  scrolled?: boolean;
}

export function LandingHeader({ scrolled: initialScrolled = false }: LandingHeaderProps) {
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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 flex items-center gap-3 md:gap-5 px-4 md:px-8 py-3.5 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md shadow-xs"
          : "bg-transparent"
      }`}
    >
      <Link
        href="/new-arrival"
        className="flex items-center h-11 shrink-0"
        aria-label="VIVE New Arrival, về đầu trang"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vive-logo-chu.png"
          alt="VIVE"
          className="h-7 w-auto object-contain"
        />
      </Link>

      {/* Nav desktop */}
      <nav
        aria-label="Điều hướng chính"
        className="ml-auto hidden md:flex items-center gap-1.5 flex-wrap"
      >
        <Link
          href="/new-arrival"
          className="h-10 px-3.5 rounded-full flex items-center text-[15px] font-bold bg-white text-den shadow-xs"
          aria-current="page"
        >
          New Arrival
        </Link>
        <Link
          href="/"
          className="h-10 px-3.5 rounded-full flex items-center text-[15px] font-medium text-den hover:bg-white/60 transition-colors"
        >
          Home
        </Link>
        <Link
          href="/quet"
          className="h-10 px-3.5 rounded-full flex items-center text-[15px] font-medium text-den hover:bg-white/60 transition-colors"
        >
          Quẹt
        </Link>
        <Link
          href="/danh-muc"
          className="h-10 px-3.5 rounded-full flex items-center text-[15px] font-medium text-den hover:bg-white/60 transition-colors"
        >
          Sản phẩm
        </Link>
        <Link
          href="/gio"
          className="h-10 px-4 rounded-full flex items-center gap-1.5 text-[14px] font-semibold text-den border border-den/20 hover:bg-white transition-colors"
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
          Giỏ {soMonGio > 0 && `· ${soMonGio}`}
        </Link>
        <Link
          href="/dang-nhap"
          className="h-10 px-5 rounded-full bg-den text-white flex items-center text-[14px] font-semibold hover:bg-black transition-colors"
        >
          Đăng nhập
        </Link>
      </nav>

      {/* Nav mobile */}
      <div className="ml-auto flex md:hidden items-center gap-2">
        <Link
          href="/gio"
          className="h-9 px-3 rounded-full flex items-center gap-1 text-[13px] font-semibold text-den bg-white shadow-xs border border-den/10"
          aria-label={`Giỏ hàng, ${soMonGio} món`}
        >
          <svg
            width="14"
            height="14"
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
          {soMonGio > 0 && <span>{soMonGio}</span>}
        </Link>
        <Link
          href="/dang-nhap"
          className="h-9 px-3.5 rounded-full bg-den text-white flex items-center text-[13px] font-semibold"
        >
          Đăng nhập
        </Link>
      </div>
    </header>
  );
}
