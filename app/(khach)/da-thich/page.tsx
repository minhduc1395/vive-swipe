"use client";
import { lopNut } from "@/components/ui/Nut";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BangChiTiet } from "@/components/deck/BangChiTiet";
import { useDuLieu } from "@/lib/du-lieu-context";
import type { SanPham } from "@/lib/data/types";
import { duongDanAnh } from "@/lib/anh";
import {
  ghiChuDealTheoNgonNgu,
  nhanHamDich,
  taoNhan,
  tenSanPham,
  thieuBanEn,
  tienCoDon,
} from "@/components/deck/ngon-ngu-quet";
import { ghiLuotQuet } from "@/lib/supabase/luot-quet";
import {
  layDanhSachDaThich,
  themDaThich,
  xoaDaThich,
  themVaoGio,
} from "@/lib/kho-luu-tru";

export default function TrangDaThich() {
  const { timSanPham, deals } = useDuLieu();
  const ngonNgu = useLocale();
  const t = useTranslations("quet.daThich");
  const nhan = taoNhan(nhanHamDich(useTranslations("quet.nhan")));
  const tGhiChu = nhanHamDich(useTranslations("quet.ghiChuDeal"));
  const [danhSachThich, setDanhSachThich] = useState<string[]>([]);
  const [danhMucChon, setDanhMucChon] = useState<string>("all");
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState<SanPham | null>(null);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [daSanSang, setDaSanSang] = useState(false);

  const taiDuLieu = () => {
    setDanhSachThich(layDanhSachDaThich());
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    taiDuLieu();
    setDaSanSang(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const handleStorage = () => taiDuLieu();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("vive_storage_update", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("vive_storage_update", handleStorage);
    };
  }, []);

  const sanPhamThich = useMemo(() => {
    return danhSachThich
      .map((id) => timSanPham(id))
      .filter((sp): sp is SanPham => Boolean(sp));
  }, [danhSachThich, timSanPham]);

  // Bộ lọc danh mục theo các món đang có trong Đã thích
  const danhSachLoc = useMemo(() => {
    const demTheoDanhMuc: Record<string, number> = {};
    for (const sp of sanPhamThich) {
      demTheoDanhMuc[sp.danh_muc] = (demTheoDanhMuc[sp.danh_muc] ?? 0) + 1;
    }

    const cacMuc = [
      { id: "all", label: t("tatCa"), count: sanPhamThich.length },
    ];

    for (const [dm, count] of Object.entries(demTheoDanhMuc)) {
      cacMuc.push({
        id: dm,
        label: nhan.danhMuc(dm),
        count,
      });
    }

    return cacMuc;
  }, [sanPhamThich, t, nhan]);

  const sanPhamHienThi = useMemo(() => {
    if (danhMucChon === "all") return sanPhamThich;
    return sanPhamThich.filter((sp) => sp.danh_muc === danhMucChon);
  }, [sanPhamThich, danhMucChon]);

  const handleBoThich = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    xoaDaThich(id);
    ghiLuotQuet({ san_pham_id: id, hanh_dong: "bo_thich" });
    setDanhSachThich((prev) => prev.filter((item) => item !== id));
  };

  const handleThemVaoGio = (sp: SanPham, e: React.MouseEvent) => {
    e.stopPropagation();
    themVaoGio(sp.id, 1);
    ghiLuotQuet({
      san_pham_id: sp.id,
      hanh_dong: "gio",
      nguon: "kham_pha",
    });
    setThongBao(t("daThemGio", { ten: tenSanPham(sp, ngonNgu) }));
    setTimeout(() => setThongBao(null), 2500);
  };

  return (
    <div className="max-w-[1280px] w-full mx-auto flex-1 flex flex-col min-h-0 bg-trang text-den font-sans overflow-hidden">
        {/* Header */}
        <header className="px-5 pt-7 pb-2 flex items-baseline gap-2 shrink-0">
          <h1 className="tieu-de-trang">{t("tieuDe")}</h1>
          <span suppressHydrationWarning className="text-[15px] text-xam">
            {t("soMon", { so: sanPhamThich.length })}
          </span>
        </header>

        {/* Thông báo toast khi thêm giỏ */}
        {thongBao && (
          <div
            role="status"
            className="mx-5 mb-2 px-3.5 py-2 rounded-xl bg-den text-trang text-[13px] font-medium shadow-lg flex items-center justify-between animate-fadeIn z-30"
          >
            <span className="truncate">{thongBao}</span>
            <Link href="/gio" className="ml-2 text-oliu underline shrink-0 font-semibold">
              {t("xemGio")}
            </Link>
          </div>
        )}

        {/* Thanh lọc danh mục */}
        {daSanSang && sanPhamThich.length > 0 && (
          <div
            role="group"
            aria-label={t("locDanhMuc")}
            className="px-5 py-2 flex gap-2 overflow-x-auto shrink-0 no-scrollbar"
          >
            {danhSachLoc.map((f) => {
              const dangChon = danhMucChon === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={dangChon}
                  onClick={() => setDanhMucChon(f.id)}
                  className={`h-9 px-3.5 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    dangChon
                      ? "bg-hong text-den border border-transparent font-semibold"
                      : "bg-nen-phu text-den border border-transparent hover:bg-kem"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              );
            })}
          </div>
        )}

        {/* Nội dung danh sách hoặc trạng thái trống */}
        {!daSanSang ? (
          <div className="flex-1" />
        ) : sanPhamThich.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-kem flex items-center justify-center mb-4 text-den">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-[17px] font-semibold text-den mb-1">
              {t("trongTieuDe")}
            </p>
            <p className="text-[14px] text-xam max-w-[280px] mb-6">
              {t("trongMoTa")}
            </p>
            <div className="flex gap-3">
              <Link
                href="/quet"
                className={lopNut("chinh")}
              >
                {t("batDauQuet")}
              </Link>
              <Link
                href="/danh-muc"
                className="h-11 px-5 rounded-full bg-trang text-den border border-hong text-[14px] font-semibold inline-flex items-center justify-center"
              >
                {t("xemDanhMuc")}
              </Link>
            </div>
          </div>
        ) : sanPhamHienThi.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xam">
            <p className="text-[15px]">{t("khongCo")}</p>
            <button
              type="button"
              onClick={() => setDanhMucChon("all")}
              className="mt-3 text-[14px] text-den underline font-medium"
            >
              {t("xemTatCa")}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-3 pb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 md:gap-5 content-start">
            {sanPhamHienThi.map((sp) => {
              const bgMoi =
                sp.danh_muc === "mat-na" || sp.danh_muc === "kem-duong"
                  ? "bg-oliu-nhat"
                  : "bg-kem";
              const dealNote = ghiChuDealTheoNgonNgu(tGhiChu, ngonNgu, sp, deals);
              const tenSp = tenSanPham(sp, ngonNgu);
              const anhSrc = duongDanAnh(sp.anh, "nho");

              return (
                <article
                  key={sp.id}
                  onClick={() => setSanPhamChiTiet(sp)}
                  className="hien-dan flex flex-col gap-1.5 cursor-pointer group"
                >
                  {/* Khối ảnh */}
                  <div
                    className={`relative h-[150px] rounded-[18px] ${bgMoi} flex items-center justify-center overflow-hidden transition-transform group-active:scale-[0.98]`}
                  >
                    {anhSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={anhSrc}
                        alt={tenSp}
                        className="w-[128px] h-[128px] object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        role="img"
                        aria-label={t("anhCho")}
                        className="text-[11px] font-semibold tracking-wider uppercase text-xam-dam"
                      >
                        {sp.thuong_hieu}
                      </span>
                    )}

                    {/* Nút bỏ thích */}
                    <button
                      type="button"
                      aria-label={t("boThich")}
                      onClick={(e) => handleBoThich(sp.id, e)}
                      className="absolute top-1.5 right-1.5 w-10 h-10 rounded-full bg-trang/95 hover:bg-trang shadow-sm flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="#2B2B2A"
                        stroke="#2B2B2A"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Thông tin sản phẩm */}
                  <span className="text-[11px] font-semibold tracking-[1.2px] text-xam uppercase truncate">
                    {sp.thuong_hieu}
                  </span>
                  <span
                    data-thieu-en={thieuBanEn(sp, ngonNgu)}
                    className="text-[14px] leading-[1.35] font-medium h-[38px] overflow-hidden line-clamp-2 text-den"
                  >
                    {tenSp}
                  </span>

                  {/* Giá và nút thêm giỏ */}
                  <div className="flex items-center justify-between gap-1.5 mt-auto pt-1">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[16px] font-bold text-den leading-tight">
                        {tienCoDon(sp.gia_ban, ngonNgu)}
                      </span>
                      <span className="text-[11px] text-xam h-[16px] truncate">
                        {dealNote ?? ""}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label={t("themGio")}
                      onClick={(e) => handleThemVaoGio(sp, e)}
                      className="w-10 h-10 shrink-0 rounded-full bg-be hover:opacity-90 text-den flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      {/* Modal chi tiết sản phẩm */}
      <BangChiTiet
        sanPham={sanPhamChiTiet}
        dangMo={Boolean(sanPhamChiTiet)}
        daThich={Boolean(sanPhamChiTiet && danhSachThich.includes(sanPhamChiTiet.id))}
        onDong={() => setSanPhamChiTiet(null)}
        onThich={() => {
          if (sanPhamChiTiet) {
            themDaThich(sanPhamChiTiet.id);
            setDanhSachThich(layDanhSachDaThich());
          }
        }}
        onThemGio={() => {
          if (sanPhamChiTiet) {
            themVaoGio(sanPhamChiTiet.id, 1);
            setSanPhamChiTiet(null);
            setThongBao(t("daThemGio", { ten: tenSanPham(sanPhamChiTiet, ngonNgu) }));
            setTimeout(() => setThongBao(null), 2500);
          }
        }}
      />
    </div>
  );
}
