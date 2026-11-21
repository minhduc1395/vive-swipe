"use client";
import { lopNut } from "@/components/ui/Nut";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { SanPham } from "@/lib/data/types";
import { useDuLieu } from "@/lib/du-lieu-context";
import { NutQuayLai } from "@/components/NutQuayLai";
import { duongDanAnh } from "@/lib/anh";
import { layCacDealCuaSanPham } from "@/lib/deals/ghi-chu";
import { moTaTam } from "@/lib/mo-ta-tam";
import { useKhoaCuon } from "@/lib/khoa-cuon";
import { useDichQuet } from "./dung-dich";
import {
  dichDuLieu,
  moTaSanPham,
  moTaTamEn,
  nhanHamDich,
  taoNhan,
  tenSanPham,
  tienKhongDon,
  truongTheoNgonNgu,
} from "./ngon-ngu-quet";

interface BangChiTietProps {
  sanPham: SanPham | null;
  dangMo: boolean;
  onDong: () => void;
  onThich: () => void;
  onThemGio: () => void;
  daThich?: boolean;
}

export function BangChiTiet({
  sanPham,
  dangMo,
  onDong,
  onThich,
  onThemGio,
  daThich = false,
}: BangChiTietProps) {
  const { deals } = useDuLieu();
  const ngonNgu = useLocale();
  const t = useTranslations("quet.chiTiet");
  const tNhan = useDichQuet("quet.nhan");
  const nhan = taoNhan(tNhan);
  const tMoTa = nhanHamDich(useTranslations("quet.chiTiet.moTaTam"));
  const [anhLoi, setAnhLoi] = useState<boolean>(false);
  useKhoaCuon(dangMo && sanPham !== null);

  if (!dangMo || !sanPham) return null;

  const nenAnh =
    sanPham.danh_muc === "mat-na" || sanPham.danh_muc === "kem-duong"
      ? "bg-oliu-nhat"
      : "bg-kem";

  const anhSrc = duongDanAnh(sanPham.anh, "the") || "/brand/vive-logo-black.png";
  const dealsLienQuan = layCacDealCuaSanPham(sanPham, deals);
  const tenSp = tenSanPham(sanPham, ngonNgu);
  const moTa =
    moTaSanPham(sanPham, ngonNgu) ||
    (ngonNgu === "en" ? moTaTamEn(sanPham, tMoTa, nhan, tNhan) : moTaTam(sanPham));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("dialog", { ten: tenSp })}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 transition-opacity p-0 md:p-6"
      onClick={onDong}
    >
      <div
        className="w-full max-w-[480px] md:max-w-[560px] max-h-[85vh] bg-trang rounded-t-[28px] md:rounded-[28px] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Nắp kéo */}
        <div
          className="flex justify-center pt-2.5 pb-1 shrink-0"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-hong" />
        </div>

        {/* Nút quay lại (góc trên trái) */}
        <NutQuayLai
          fallback="/quet"
          nhan={t("quayLai")}
          onClick={onDong}
          className="absolute top-2.5 left-4 z-10"
        />

        {/* Nút đóng */}
        <button
          type="button"
          onClick={onDong}
          aria-label={t("dong")}
          className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-den hover:bg-kem transition-colors cursor-pointer z-10"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Nội dung cuộn */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-6 flex flex-col gap-4">
          {/* Hộp ảnh */}
          <div
            className={`w-full h-[196px] rounded-[22px] ${nenAnh} flex items-center justify-center shrink-0 overflow-hidden`}
          >
            {anhLoi ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <span className="text-[13px] font-semibold tracking-[1.4px] text-xam uppercase">
                  {sanPham.thuong_hieu}
                </span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={anhSrc}
                alt={tenSp}
                onError={() => setAnhLoi(true)}
                className="w-[176px] h-[176px] object-contain"
              />
            )}
          </div>

          {/* Tiêu đề & giá */}
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold tracking-[1.4px] text-xam uppercase">
              {sanPham.thuong_hieu}
            </span>
            <h2 className="m-0 text-[20px] leading-[1.3] font-semibold text-den">
              {tenSp}
            </h2>
            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-bold text-den">
                  {tienKhongDon(sanPham.gia_ban, ngonNgu)}
                </span>
                {sanPham.gia_goc && sanPham.gia_goc > sanPham.gia_ban && (
                  <span className="text-[14px] text-xam line-through">
                    {tienKhongDon(sanPham.gia_goc, ngonNgu)}
                  </span>
                )}
              </div>
              <span className="text-[13px] text-xam">
                {sanPham.quy_cach ? dichDuLieu(tNhan, "quyCach", sanPham.quy_cach, ngonNgu) : t("quyCachChuan")} · {t("conHang")}
              </span>
            </div>
          </div>

          {/* Phù hợp với */}
          {sanPham.loai_da?.length || sanPham.van_de?.length ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-vien">
              <h3 className="m-0 text-[13px] font-semibold tracking-[1px] text-xam uppercase">
                {t("phuHop")}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sanPham.loai_da?.map((da) => (
                  <span
                    key={da}
                    className="h-[30px] px-3 rounded-full bg-kem text-[13px] font-medium flex items-center text-den"
                  >
                    {nhan.loaiDa(da)}
                  </span>
                ))}
                {sanPham.van_de?.map((vd) => (
                  <span
                    key={vd}
                    className="h-[30px] px-3 rounded-full bg-oliu-nhat text-[13px] font-medium flex items-center text-den"
                  >
                    {nhan.vanDe(vd)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Các deal có sản phẩm này */}
          {dealsLienQuan.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-vien">
              <h3 className="m-0 text-[13px] font-semibold tracking-[1px] text-xam uppercase">
                {t("dealCoSp")}
              </h3>
              <div className="flex flex-col gap-2">
                {dealsLienQuan.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-2xl bg-kem border border-vien flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-den">
                        {truongTheoNgonNgu(deal, "ten", ngonNgu)}
                      </span>
                    </div>
                    {(deal.hook || deal.dieu_kien) && (
                      <p className="m-0 text-[13px] text-xam-dam">
                        {truongTheoNgonNgu(deal, "hook", ngonNgu) || truongTheoNgonNgu(deal, "dieu_kien", ngonNgu)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thành phần nổi bật */}
          {sanPham.thanh_phan?.length ? (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-vien">
              <h3 className="m-0 text-[13px] font-semibold tracking-[1px] text-xam uppercase">
                {t("thanhPhan")}
              </h3>
              <p className="m-0 text-[14px] leading-relaxed text-den">
                {sanPham.thanh_phan.map((tp) => dichDuLieu(tNhan, "thanhPhan", tp, ngonNgu)).join(" · ")}
              </p>
            </div>
          ) : null}

          {/* Giới thiệu: mô tả thật (W047) hoặc mô tả tạm ghép từ dữ liệu, luôn có */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-vien" data-mo-ta={sanPham.mo_ta ? "that" : "tam"}>
            <h3 className="m-0 text-[13px] font-semibold tracking-[1px] text-xam uppercase">
              {t("gioiThieu")}
            </h3>
            <p className="m-0 text-[14px] leading-relaxed text-den/90">
              {moTa}
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="p-4 pt-2 border-t border-vien flex items-center gap-3 bg-trang shrink-0">
          <button
            type="button"
            onClick={() => {
              onThich();
              onDong();
            }}
            aria-label={t("thichSp")}
            className={`h-[52px] px-5 rounded-full flex items-center justify-center gap-2 font-semibold text-[15px] border cursor-pointer transition-colors ${
              daThich
                ? "bg-hong border-transparent text-den font-semibold"
                : "bg-nen-phu border-transparent text-den hover:bg-kem"
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={daThich ? "#2B2B2A" : "none"}
              stroke="#2B2B2A"
              strokeWidth="1.8"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{daThich ? t("daThich") : t("thich")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onThemGio();
              onDong();
            }}
            className={lopNut("chinh-bac-ha","lon") + " flex-1"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>{t("themGio")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
