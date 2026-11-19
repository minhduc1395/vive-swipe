"use client";
import { lopNut } from "@/components/ui/Nut";

import { useState } from "react";
import type { SanPham } from "@/lib/data/types";
import { useDuLieu } from "@/lib/du-lieu-context";
import { NutQuayLai } from "@/components/NutQuayLai";
import { dinhDangTien } from "@/lib/dinh-dang";
import { duongDanAnh } from "@/lib/anh";
import { layNhanLoaiDa, layNhanVanDe } from "@/lib/nhan";
import { layCacDealCuaSanPham } from "@/lib/deals/ghi-chu";

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
  const [anhLoi, setAnhLoi] = useState<boolean>(false);

  if (!dangMo || !sanPham) return null;

  const nenAnh =
    sanPham.danh_muc === "mat-na" || sanPham.danh_muc === "kem-duong"
      ? "bg-bac-ha-nhat"
      : "bg-hong-nhat";

  const anhSrc = duongDanAnh(sanPham.anh, "the") || "/brand/vive-logo-black.png";
  const dealsLienQuan = layCacDealCuaSanPham(sanPham, deals);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết sản phẩm ${sanPham.ten_hien_thi}`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 transition-opacity p-0 md:p-6"
      onClick={onDong}
    >
      <div
        className="w-full max-w-[480px] md:max-w-[560px] max-h-[85vh] bg-trang rounded-t-[28px] md:rounded-[28px] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
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
          onClick={onDong}
          className="absolute top-2.5 left-4 z-10"
        />

        {/* Nút đóng */}
        <button
          type="button"
          onClick={onDong}
          aria-label="Đóng chi tiết"
          className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-den hover:bg-hong-nhat transition-colors cursor-pointer z-10"
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
        <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 flex flex-col gap-4">
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
                alt={sanPham.ten_hien_thi}
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
              {sanPham.ten_hien_thi}
            </h2>
            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-bold text-den">
                  {dinhDangTien(sanPham.gia_ban)}
                </span>
                {sanPham.gia_goc && sanPham.gia_goc > sanPham.gia_ban && (
                  <span className="text-[14px] text-xam line-through">
                    {dinhDangTien(sanPham.gia_goc)}
                  </span>
                )}
              </div>
              <span className="text-[13px] text-xam">
                {sanPham.quy_cach || "Quy cách chuẩn"} · Còn hàng
              </span>
            </div>
          </div>

          {/* Phù hợp với */}
          {sanPham.loai_da?.length || sanPham.van_de?.length ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-vien">
              <h3 className="m-0 text-[13px] font-semibold tracking-[1px] text-xam uppercase">
                Phù hợp với
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sanPham.loai_da?.map((da) => (
                  <span
                    key={da}
                    className="h-[30px] px-3 rounded-full bg-hong-nhat text-[13px] font-medium flex items-center text-den"
                  >
                    {layNhanLoaiDa(da)}
                  </span>
                ))}
                {sanPham.van_de?.map((vd) => (
                  <span
                    key={vd}
                    className="h-[30px] px-3 rounded-full bg-bac-ha-nhat text-[13px] font-medium flex items-center text-den"
                  >
                    {layNhanVanDe(vd)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Các deal có sản phẩm này */}
          {dealsLienQuan.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-vien">
              <h3 className="m-0 text-[13px] font-semibold tracking-[1px] text-xam uppercase">
                Các deal có sản phẩm này
              </h3>
              <div className="flex flex-col gap-2">
                {dealsLienQuan.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 rounded-2xl bg-hong-nhat border border-vien flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[14px] text-den">
                        {deal.ten}
                      </span>
                    </div>
                    {(deal.hook || deal.dieu_kien) && (
                      <p className="m-0 text-[13px] text-xam-dam">
                        {deal.hook || deal.dieu_kien}
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
                Thành phần nổi bật
              </h3>
              <p className="m-0 text-[14px] leading-relaxed text-den">
                {sanPham.thanh_phan.join(" · ")}
              </p>
            </div>
          ) : null}

          {/* Mô tả ngắn */}
          {sanPham.mo_ta && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-vien">
              <h3 className="m-0 text-[13px] font-semibold tracking-[1px] text-xam uppercase">
                Giới thiệu
              </h3>
              <p className="m-0 text-[14px] leading-relaxed text-den/90">
                {sanPham.mo_ta}
              </p>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="p-4 pt-2 border-t border-vien flex items-center gap-3 bg-trang shrink-0">
          <button
            type="button"
            onClick={() => {
              onThich();
              onDong();
            }}
            aria-label="Thích sản phẩm này"
            className={`h-[52px] px-5 rounded-full flex items-center justify-center gap-2 font-semibold text-[15px] border cursor-pointer transition-colors ${
              daThich
                ? "bg-hong border-transparent text-den font-semibold"
                : "bg-nen-phu border-transparent text-den hover:bg-hong-nhat"
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
            <span>{daThich ? "Đã thích" : "Thích"}</span>
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
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
