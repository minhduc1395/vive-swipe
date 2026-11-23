"use client";
import { lopNut } from "@/components/ui/Nut";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { NutQuayLai } from "@/components/NutQuayLai";
import { KhungChiTiet } from "@/components/ui/KhungChiTiet";
import { lopChip } from "@/components/ui/Nhan";
import { ChonXep } from "./ChonXep";
import { BangChiTiet } from "@/components/deck/BangChiTiet";
import { AnhSanPhamO } from "@/components/deck/AnhSanPhamO";
import { laySanPhamHienThi, duongDanAnh } from "@/lib/data";
import { useDuLieu } from "@/lib/du-lieu-context";
import type { SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import { useDichQuet } from "@/components/deck/dung-dich";
import {
  dichDuLieu,
  ghiChuDealTheoNgonNgu,
  nhanHamDich,
  taoNhan,
  tenSanPham,
  thieuBanEn,
  tienKhongDon,
} from "@/components/deck/ngon-ngu-quet";
import {
  layDanhSachDaThich,
  themDaThich,
  xoaDaThich,
  themVaoGio,
} from "@/lib/kho-luu-tru";

const DANH_SACH_LOAI = [
  "sua-rua-mat",
  "nuoc-can-bang",
  "toner-pad",
  "tinh-chat",
  "kem-duong",
  "mat-na",
  "chong-nang",
  "trang-diem",
  "duong-moi",
  "mieng-dan",
  "duong-the",
  "thiet-bi",
] as const;

const BUOC_TAI = 24;

const DANH_SACH_VAN_DE = [
  "mun",
  "lo-chan-long",
  "sang-da",
  "cap-am",
  "lam-diu",
  "chong-lao-hoa",
] as const;


function DanhMucNoiDung() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ngonNgu = useLocale();
  const t = useTranslations("quet.danhMuc");
  const tNhan = useDichQuet("quet.nhan");
  const nhan = taoNhan(tNhan);
  const tGhiChu = nhanHamDich(useTranslations("quet.ghiChuDeal"));

  // Đọc bộ lọc từ URL
  const loaiUrl = searchParams.get("loai") || "";
  const vanDeUrl = searchParams.get("van-de") || "";
  const thuongHieuUrl = searchParams.get("thuong-hieu") || "";
  const timUrl = searchParams.get("tim") || "";
  const xepUrl = searchParams.get("xep") || "goi-y";
  const coDealUrl = searchParams.get("co-deal") === "1";
  const spUrl = searchParams.get("sp") || "";
  const moChiTietTuTrang = useRef(false);
  const [moLoc, setMoLoc] = useState(false);
  const hangChipLoai = useRef<HTMLDivElement>(null);
  // Chip loại đang chọn luôn nằm trong tầm nhìn của hàng cuộn ngang
  useEffect(() => {
    const el = hangChipLoai.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    const hang = hangChipLoai.current;
    if (el && hang) {
      const lech = el.getBoundingClientRect().left - hang.getBoundingClientRect().left + hang.scrollLeft;
      hang.scrollTo({ left: Math.max(0, lech - 20), behavior: "smooth" });
    }
  }, [loaiUrl]);

  const [timKiemInput, setTimKiemInput] = useState<string>(timUrl);
  const [gioiHanHienThi, setGioiHanHienThi] = useState<number>(BUOC_TAI);
  const [daThich, setDaThich] = useState<string[]>([]);

  // Sync state từ storage
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDaThich(layDanhSachDaThich());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Sync ô tìm kiếm khi URL thay đổi (không ghi đè khi người dùng đang gõ)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (
      typeof document === "undefined" ||
      document.activeElement?.id !== "tim-sp"
    ) {
      setTimKiemInput(timUrl);
    }
    setGioiHanHienThi(BUOC_TAI);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [timUrl, loaiUrl, vanDeUrl, thuongHieuUrl, xepUrl, coDealUrl]);

  // Tất cả sản phẩm hiển thị hợp lệ
  const { sanPham, deals } = useDuLieu();
  const tatCaSanPhamHienThi = useMemo(() => laySanPhamHienThi(sanPham), [sanPham]);

  // W041: ?sp=<id> mở sẵn bảng chi tiết; đóng bảng thì bỏ sp (Back của trình duyệt cũng đóng)
  const sanPhamChiTiet = useMemo<SanPham | null>(
    () => (spUrl ? sanPham.find((s) => s.id === spUrl) ?? null : null),
    [spUrl, sanPham]
  );
  const setSanPhamChiTiet = (sp: SanPham | null) => {
    if (sp) {
      moChiTietTuTrang.current = true;
      capNhatBoLoc({ sp: sp.id }, { scroll: false });
    } else if (moChiTietTuTrang.current) {
      moChiTietTuTrang.current = false;
      router.back();
    } else {
      capNhatBoLoc({ sp: "" }, { replace: true, scroll: false });
    }
  };

  // Đếm số món trên từng loại sản phẩm
  const soLuongTheoLoai = useMemo(() => {
    const dem: Record<string, number> = {};
    for (const sp of tatCaSanPhamHienThi) {
      dem[sp.danh_muc] = (dem[sp.danh_muc] || 0) + 1;
    }
    return dem;
  }, [tatCaSanPhamHienThi]);

  // Đếm số món theo thương hiệu
  const danhSachThuongHieu = useMemo(() => {
    const dem: Record<string, number> = {};
    for (const sp of tatCaSanPhamHienThi) {
      dem[sp.thuong_hieu] = (dem[sp.thuong_hieu] || 0) + 1;
    }
    return Object.entries(dem)
      .sort((a, b) => b[1] - a[1])
      .map(([ten, count]) => ({ ten, count }));
  }, [tatCaSanPhamHienThi]);

  // Cập nhật URL bộ lọc
  const capNhatBoLoc = (
    params: {
      loai?: string;
      vanDe?: string;
      thuongHieu?: string;
      tim?: string;
      xep?: string;
      coDeal?: boolean;
      sp?: string;
    },
    options?: { replace?: boolean; scroll?: boolean }
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (params.loai !== undefined) {
      if (params.loai) nextParams.set("loai", params.loai);
      else nextParams.delete("loai");
    }
    if (params.vanDe !== undefined) {
      if (params.vanDe) nextParams.set("van-de", params.vanDe);
      else nextParams.delete("van-de");
    }
    if (params.thuongHieu !== undefined) {
      if (params.thuongHieu) nextParams.set("thuong-hieu", params.thuongHieu);
      else nextParams.delete("thuong-hieu");
    }
    if (params.tim !== undefined) {
      if (params.tim) nextParams.set("tim", params.tim);
      else nextParams.delete("tim");
    }
    if (params.xep !== undefined) {
      if (params.xep && params.xep !== "goi-y") nextParams.set("xep", params.xep);
      else nextParams.delete("xep");
    }

    if (params.sp !== undefined) {
      if (params.sp) nextParams.set("sp", params.sp);
      else nextParams.delete("sp");
    }
    if (params.coDeal !== undefined) {
      if (params.coDeal) nextParams.set("co-deal", "1");
      else nextParams.delete("co-deal");
    }

    const queryStr = nextParams.toString();
    const target = `/danh-muc${queryStr ? `?${queryStr}` : ""}`;
    const tuyChon = options?.scroll === false ? { scroll: false } : undefined;
    if (options?.replace) {
      router.replace(target, tuyChon);
    } else {
      router.push(target, tuyChon);
    }
  };

  const xuLyVeTrangDau = () => {
    if (typeof window !== "undefined" && window.history.state?.idx > 0) {
      router.back();
    } else {
      router.push("/danh-muc");
    }
    setTimKiemInput("");
  };

  // Có đang lọc không (để hiện nút Quay lại, Xóa lọc)
  const dangXemDanhSach = Boolean(
    loaiUrl || vanDeUrl || thuongHieuUrl || timUrl.trim() || coDealUrl
  );
  const soLocPhu = (vanDeUrl ? 1 : 0) + (thuongHieuUrl ? 1 : 0) + (coDealUrl ? 1 : 0);
  const loaiCoHang = DANH_SACH_LOAI.filter((l) => (soLuongTheoLoai[l] || 0) > 0);

  // Gõ là lọc ngay (chờ 300ms, thay URL không thêm lịch sử)
  useEffect(() => {
    if (timKiemInput.trim() === timUrl.trim()) return;
    const t = setTimeout(() => capNhatBoLoc({ tim: timKiemInput.trim() }, { replace: true }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timKiemInput]);

  // Lọc sản phẩm
  const ketQuaLoc = useMemo(() => {
    const qChuan = chuanHoaTimKiem(timUrl.trim());

    const ds = tatCaSanPhamHienThi.filter((sp) => {
      // Lọc theo loại
      if (loaiUrl && sp.danh_muc !== loaiUrl) return false;

      // Lọc theo vấn đề da
      if (vanDeUrl && !sp.van_de?.includes(vanDeUrl)) return false;

      // Lọc theo thương hiệu
      if (thuongHieuUrl && sp.thuong_hieu.toLowerCase() !== thuongHieuUrl.toLowerCase())
        return false;

      // Chỉ sản phẩm đang có deal
      if (coDealUrl && !ghiChuDealTheoNgonNgu(tGhiChu, ngonNgu, sp, deals)) return false;

      // Lọc theo từ khóa tìm kiếm không dấu
      if (qChuan) {
        const tenChuan = chuanHoaTimKiem(tenSanPham(sp, ngonNgu));
        const gocChuan = chuanHoaTimKiem(sp.ten_goc);
        const thChuan = chuanHoaTimKiem(sp.thuong_hieu);
        const tpChuan = sp.thanh_phan?.some((tp) =>
          chuanHoaTimKiem(tp).includes(qChuan)
        );
        const vdChuan = sp.van_de?.some((vd) =>
          chuanHoaTimKiem(vd).includes(qChuan)
        );

        const khop =
          tenChuan.includes(qChuan) ||
          gocChuan.includes(qChuan) ||
          thChuan.includes(qChuan) ||
          tpChuan ||
          vdChuan;

        if (!khop) return false;
      }

      return true;
    });

    // Sắp xếp
    if (xepUrl === "giam") {
      // Đang giảm giá: sắp xếp theo % giảm giá giảm dần
      return ds.slice().sort((a, b) => {
        const phanTramA =
          a.gia_goc && a.gia_goc > a.gia_ban
            ? (a.gia_goc - a.gia_ban) / a.gia_goc
            : 0;
        const phanTramB =
          b.gia_goc && b.gia_goc > b.gia_ban
            ? (b.gia_goc - b.gia_ban) / b.gia_goc
            : 0;
        if (phanTramB !== phanTramA) return phanTramB - phanTramA;
        return (b.pho_bien ?? 0.5) - (a.pho_bien ?? 0.5);
      });
    }

    if (xepUrl === "gia-tang") {
      return ds.slice().sort((a, b) => a.gia_ban - b.gia_ban);
    }

    if (xepUrl === "gia-giam") {
      return ds.slice().sort((a, b) => b.gia_ban - a.gia_ban);
    }

    // Mặc định: Gợi ý (sản phẩm có ảnh trước, độ phổ biến cao trước)
    return ds.slice().sort((a, b) => {
      const coAnhA = a.anh ? 1 : 0;
      const coAnhB = b.anh ? 1 : 0;
      if (coAnhB !== coAnhA) return coAnhB - coAnhA;
      return (b.pho_bien ?? 0.5) - (a.pho_bien ?? 0.5);
    });
  }, [tatCaSanPhamHienThi, loaiUrl, vanDeUrl, thuongHieuUrl, timUrl, xepUrl, coDealUrl, deals, ngonNgu, tGhiChu]);

  // Tiêu đề trang
  const tieuDeTrang = useMemo(() => {
    if (loaiUrl) {
      const timLoai = DANH_SACH_LOAI.find((l) => l === loaiUrl);
      return timLoai ? nhan.danhMucLoc(timLoai) : t("sanPham");
    }
    if (vanDeUrl) {
      const timVd = DANH_SACH_VAN_DE.find((v) => v === vanDeUrl);
      return timVd ? t("da", { nhan: nhan.vanDe(timVd) }) : t("sanPham");
    }
    if (thuongHieuUrl) {
      return thuongHieuUrl;
    }
    if (timUrl) {
      return t("tim", { q: timUrl });
    }
    if (coDealUrl) return t("dangCoDeal");
    return t("sanPham");
  }, [loaiUrl, vanDeUrl, thuongHieuUrl, timUrl, coDealUrl, t, nhan]);

  // Xử lý toggle thích
  const toggleThich = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (daThich.includes(id)) {
      xoaDaThich(id);
      setDaThich((prev) => prev.filter((item) => item !== id));
    } else {
      themDaThich(id);
      setDaThich((prev) => [id, ...prev]);
    }
  };

  // Xử lý thêm vào giỏ
  const xuLyThemVaoGio = (sp: SanPham, e?: React.MouseEvent) => {
    e?.stopPropagation();
    themVaoGio(sp.id, 1);
  };

  const sanPhamHienThiList = ketQuaLoc.slice(0, gioiHanHienThi);
  const conThem = ketQuaLoc.length - gioiHanHienThi;

  // Khối bộ lọc phụ: dùng chung cho cột trái máy tính và bottom sheet điện thoại
  const boLocPhu = (
    <>
      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-[12px] font-semibold text-xam tracking-[0.6px] uppercase">{t("vanDeDa")}</h2>
        <div className="flex flex-wrap gap-1.5">
          {DANH_SACH_VAN_DE.map((v) => {
            const on = vanDeUrl === v;
            return (
              <button key={v} type="button" aria-pressed={on} onClick={() => capNhatBoLoc({ vanDe: on ? "" : v })} className={lopChip(on)}>
                {nhan.vanDe(v)}
              </button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-[12px] font-semibold text-xam tracking-[0.6px] uppercase">{t("thuongHieu")}</h2>
        <div className="flex flex-wrap gap-1.5">
          {danhSachThuongHieu.map((b) => {
            const on = thuongHieuUrl.toLowerCase() === b.ten.toLowerCase();
            return (
              <button key={b.ten} type="button" aria-pressed={on} onClick={() => capNhatBoLoc({ thuongHieu: on ? "" : b.ten })} className={lopChip(on)}>
                {b.ten} <span className="text-[12px] text-xam font-normal">{b.count}</span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="m-0 text-[12px] font-semibold text-xam tracking-[0.6px] uppercase">{t("uuDai")}</h2>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={coDealUrl} onClick={() => capNhatBoLoc({ coDeal: !coDealUrl })} className={lopChip(coDealUrl)}>
            {t("dangCoDeal")}
          </button>
        </div>
      </section>
    </>
  );

  const xoaLoc = () => {
    setTimKiemInput("");
    capNhatBoLoc({ loai: "", vanDe: "", thuongHieu: "", tim: "", coDeal: false });
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col bg-trang font-sans text-den overflow-hidden relative">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto w-full">
          {/* Đầu trang: tiêu đề + tìm kiếm */}
          <header className="px-5 md:px-8 pt-4 md:pt-6 pb-2 flex flex-col items-start gap-1">
            {dangXemDanhSach && (
              <NutQuayLai fallback="/danh-muc" onClick={xuLyVeTrangDau} nhan={t("quayLai")} ariaLabel={t("quayLaiTatCa")} />
            )}
            <h1 className="tieu-de-trang">{tieuDeTrang}</h1>
          </header>

          <div className="px-5 md:px-8 pt-1 pb-3 max-w-[640px]">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                capNhatBoLoc({ tim: timKiemInput.trim() });
              }}
              className="h-12 rounded-full bg-nen-phu flex items-center gap-2.5 px-4 focus-within:ring-2 focus-within:ring-hong"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="text-xam">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <label htmlFor="tim-sp" className="sr-only">{t("timSanPham")}</label>
              <input
                id="tim-sp"
                name="tim"
                type="search"
                value={timKiemInput}
                onChange={(e) => setTimKiemInput(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-[15px] text-den placeholder:text-xam"
              />
              {timKiemInput && (
                <button
                  type="button"
                  onClick={() => { setTimKiemInput(""); capNhatBoLoc({ tim: "" }); }}
                  aria-label={t("xoaTim")}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xam hover:text-den cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </form>
          </div>

          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8 lg:px-8 lg:items-start">
            {/* Cột lọc trái (máy tính) */}
            <aside aria-label={t("boLoc")} className="hidden lg:flex flex-col gap-6 sticky top-4 pb-8">
              <section className="flex flex-col gap-1">
                <h2 className="m-0 mb-1 px-3 text-[12px] font-semibold text-xam tracking-[0.6px] uppercase">{t("loaiSanPham")}</h2>
                {[{ id: "", label: t("tatCa"), dem: tatCaSanPhamHienThi.length }, ...loaiCoHang.map((l) => ({ id: l, label: nhan.danhMucLoc(l), dem: soLuongTheoLoai[l] || 0 }))].map((c) => {
                  const on = loaiUrl === c.id;
                  return (
                    <button
                      key={c.id || "tat-ca"}
                      type="button"
                      aria-pressed={on}
                      onClick={() => capNhatBoLoc({ loai: c.id })}
                      className={`h-10 px-3 rounded-xl flex items-center justify-between text-[14px] cursor-pointer border-none ${on ? "bg-kem font-semibold" : "bg-transparent hover:bg-kem/60"}`}
                    >
                      <span>{c.label}</span>
                      <span className="text-[12px] text-xam">{c.dem}</span>
                    </button>
                  );
                })}
              </section>
              {boLocPhu}
            </aside>

            <div className="min-w-0 flex flex-col">
              {/* Chip loại sản phẩm cuộn ngang (điện thoại, máy tính bảng) */}
              <div ref={hangChipLoai} className="pl-5 md:pl-8 pt-1 flex gap-2 overflow-x-auto pr-5 lg:hidden [scrollbar-width:none]" role="group" aria-label={t("chonLoai")}>
                <button type="button" aria-pressed={!loaiUrl} onClick={() => capNhatBoLoc({ loai: "" })} className={lopChip(!loaiUrl)}>{t("tatCa")}</button>
                {loaiCoHang.map((c) => {
                  const on = loaiUrl === c;
                  return (
                    <button key={c} type="button" aria-pressed={on} onClick={() => capNhatBoLoc({ loai: c })} className={lopChip(on)}>
                      {nhan.danhMucLoc(c)}
                    </button>
                  );
                })}
              </div>

              {/* Hàng công cụ: Lọc · số kết quả · Xóa lọc · Xếp */}
              <div className="px-5 md:px-8 lg:px-0 pt-3 pb-2 flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <button
                  type="button"
                  onClick={() => setMoLoc(true)}
                  aria-haspopup="dialog"
                  className={lopNut("phu", "vua") + " lg:hidden"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 6h16M7 12h10M10 18h4" />
                  </svg>
                  {t("loc")}{soLocPhu > 0 ? ` · ${soLocPhu}` : ""}
                </button>
                <span className="text-[14px] text-xam whitespace-nowrap" aria-live="polite">
                  {t("soSanPham", { so: ketQuaLoc.length })}
                </span>
                {dangXemDanhSach && (
                  <button type="button" onClick={xoaLoc} className={lopNut("chu", "vua")}>
                    {t("xoaLoc")}
                  </button>
                )}
                <div className="ml-auto">
                  <ChonXep giaTri={xepUrl} onChon={(id) => capNhatBoLoc({ xep: id }, { replace: true })} />
                </div>
              </div>

              {/* Lưới sản phẩm */}
              {ketQuaLoc.length > 0 ? (
                <div className="px-4 md:px-8 lg:px-0 pt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5 md:gap-5">
                  {sanPhamHienThiList.map((sp, i) => {
                    const liked = daThich.includes(sp.id);
                    const bgClass =
                      i % 4 === 0 || i % 4 === 3
                        ? "bg-kem"
                        : "bg-oliu-nhat";
                    const ghiChuDeal = ghiChuDealTheoNgonNgu(tGhiChu, ngonNgu, sp, deals);
                    const tenSp = tenSanPham(sp, ngonNgu);
                    const anhSrc = duongDanAnh(sp.anh, "the");

                    return (
                      <article
                        key={sp.id}
                        onClick={() => setSanPhamChiTiet(sp)}
                        className="hien-dan flex flex-col gap-1 cursor-pointer group"
                      >
                        {/* Hộp ảnh */}
                        <div
                          className={`relative h-[150px] rounded-[18px] ${bgClass} flex items-center justify-center overflow-hidden`}
                        >
                          <AnhSanPhamO
                            key={sp.id}
                            src={anhSrc}
                            alt={tenSp}
                            thuongHieu={sp.thuong_hieu}
                            loading={i >= 6 ? "lazy" : undefined}
                            lopAnh="w-[126px] h-[126px] object-contain group-hover:scale-105 transition-transform"
                            lopChu="text-[11px] font-semibold tracking-[1.4px] text-xam uppercase"
                          />

                          {/* Tag giảm giá */}
                          {sp.giam_tren_tag && (
                            <span className="absolute left-2 top-2 h-6 px-2 rounded-lg bg-hong text-den text-[11px] font-semibold flex items-center">
                              {dichDuLieu(tNhan, "nhanGiam", sp.giam_tren_tag, ngonNgu)}
                            </span>
                          )}

                          {/* Nút tim */}
                          <button
                            type="button"
                            onClick={(e) => toggleThich(sp.id, e)}
                            aria-label={liked ? t("boThich") : t("thich")}
                            aria-pressed={liked}
                            className="absolute top-1.5 right-1.5 w-[38px] h-[38px] rounded-full border-none bg-trang flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill={liked ? "#2B2B2A" : "none"}
                              stroke="#2B2B2A"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>

                        {/* Thương hiệu */}
                        <span className="text-[11px] font-semibold tracking-[1.2px] text-xam uppercase">
                          {sp.thuong_hieu}
                        </span>

                        {/* Tên */}
                        <span
                          data-thieu-en={thieuBanEn(sp, ngonNgu)}
                          className="text-[14px] leading-[1.35] font-medium text-den h-[38px] overflow-hidden line-clamp-2"
                        >
                          {tenSp}
                        </span>

                        {/* Giá + Nút thêm giỏ */}
                        <div className="flex items-end justify-between gap-1.5 mt-auto">
                          <div className="flex flex-col min-w-0">
                            <span className="flex items-baseline gap-1.5">
                              <strong className="text-[16px] font-bold text-den">
                                {tienKhongDon(sp.gia_ban, ngonNgu)}
                              </strong>
                              {sp.gia_goc && sp.gia_goc > sp.gia_ban && (
                                <s className="text-[12px] text-xam">
                                  {tienKhongDon(sp.gia_goc, ngonNgu)}
                                </s>
                              )}
                            </span>
                            {ghiChuDeal && (
                              <span className="text-[11px] text-xam h-[15px] truncate">
                                {ghiChuDeal}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => xuLyThemVaoGio(sp, e)}
                            aria-label={t("themSpGio", { ten: tenSp })}
                            className="w-[38px] h-[38px] shrink-0 rounded-full bg-be flex items-center justify-center text-den hover:opacity-90 cursor-pointer transition-opacity"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#2B2B2A"
                              strokeWidth="2"
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
              ) : (
                <div className="my-10 mx-5 flex flex-col items-center gap-3 text-center">
                  <p className="m-0 text-[14px] leading-relaxed text-xam">{t("chuaCo")}</p>
                  <button type="button" onClick={xoaLoc} className={lopNut("phu")}>{t("xoaLoc")}</button>
                </div>
              )}

              {conThem > 0 && (
                <div className="px-5 md:px-8 lg:px-0 pt-6 pb-2 flex justify-center">
                  <button type="button" onClick={() => setGioiHanHienThi((prev) => prev + BUOC_TAI)} className={lopNut("phu", "lon")}>
                    {t("xemThem", { so: Math.min(BUOC_TAI, conThem) })}
                  </button>
                </div>
              )}
              <div className="h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc điện thoại / máy tính bảng */}
      <KhungChiTiet mo={moLoc} onDong={() => setMoLoc(false)} nhan={t("boLocSp")}>
        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="m-0 text-[22px] font-bold">{t("loc")}</h2>
            <button type="button" onClick={() => setMoLoc(false)} aria-label={t("dongBoLoc")} className="w-11 h-11 rounded-full bg-nen-phu flex items-center justify-center cursor-pointer border-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          {boLocPhu}
          <div className="flex gap-2 pt-2 sticky bottom-0 bg-trang pb-[env(safe-area-inset-bottom)]">
            {soLocPhu > 0 && (
              <button type="button" onClick={() => capNhatBoLoc({ vanDe: "", thuongHieu: "", coDeal: false })} className={lopNut("phu", "lon")}>{t("boChon")}</button>
            )}
            <button type="button" onClick={() => setMoLoc(false)} className={lopNut("chinh", "lon", true)}>
              {t("xemKetQua", { so: ketQuaLoc.length })}
            </button>
          </div>
        </div>
      </KhungChiTiet>

      <BangChiTiet
        sanPham={sanPhamChiTiet}
        dangMo={sanPhamChiTiet !== null}
        onDong={() => setSanPhamChiTiet(null)}
        onThich={() => {
          if (sanPhamChiTiet) {
            if (daThich.includes(sanPhamChiTiet.id)) {
              xoaDaThich(sanPhamChiTiet.id);
              setDaThich((prev) => prev.filter((id) => id !== sanPhamChiTiet.id));
            } else {
              themDaThich(sanPhamChiTiet.id);
              setDaThich((prev) => [sanPhamChiTiet.id, ...prev]);
            }
          }
        }}
        onThemGio={() => { if (sanPhamChiTiet) xuLyThemVaoGio(sanPhamChiTiet); }}
        daThich={sanPhamChiTiet !== null && daThich.includes(sanPhamChiTiet.id)}
      />
    </div>
  );
}

export default function TrangDanhMuc() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
      <DanhMucNoiDung />
    </Suspense>
  );
}
