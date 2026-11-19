"use client";

import Link from "next/link";
import type { DealChoBan } from "@/lib/deals/diem-deal";
import { dinhDangTien } from "@/lib/dinh-dang";

interface TheDealDacBietProps {
  onBoQua: () => void;
  soMonHopDa?: number;
  dealTop?: DealChoBan | null;
  tenThuongHieuNoiBat?: string | null;
  soMonThuongHieu?: number;
}

/**
 * Thẻ gợi ý deal sau mốc 5 lượt thích trong deck (docs/01 mục 2.3 & design/TheDeal.dc.html).
 */
export function TheDealDacBiet({
  onBoQua,
  soMonHopDa = 5,
  dealTop,
  tenThuongHieuNoiBat,
  soMonThuongHieu,
}: TheDealDacBietProps) {
  // Nếu có thông tin deal cụ thể theo thiết kế TheDeal.dc.html
  if (dealTop) {
    const moTaPhu = tenThuongHieuNoiBat && soMonThuongHieu
      ? `Bạn đã thích ${soMonThuongHieu} món ${tenThuongHieuNoiBat}`
      : `Đã có ${soMonHopDa} món hợp da của bạn`;

    const boGoiYDau = dealTop.goi_y && dealTop.goi_y.length > 0 ? dealTop.goi_y[0] : null;

    return (
      <article
        aria-label="Thẻ deal trong deck"
        className="absolute inset-0 rounded-[28px] bg-den text-trang p-6 box-border flex flex-col justify-between shadow-[0_16px_40px_rgba(43,43,42,0.22)] select-none z-10"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="h-[30px] px-3.5 rounded-full bg-bac-ha text-den text-[13px] font-semibold flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 12v10H4V12" />
                <path d="M2 7h20v5H2z" />
                <path d="M12 22V7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              Deal hợp với bạn
            </span>
            <span className="text-[12px] text-hong">Số lượng có hạn</span>
          </div>

          <span className="text-[14px] text-hong">{moTaPhu}</span>

          <h2 className="m-0 font-bold text-[24px] leading-[1.25] tracking-[-0.5px]">
            {dealTop.hook ?? dealTop.ten}
          </h2>

          {dealTop.moc && dealTop.moc.length > 0 ? (
            <div className="flex flex-col border-t border-white/20 mt-1">
              {dealTop.moc.slice(0, 3).map((m, idx) => {
                const mocGia = m.tu ?? m.tren ?? 0;
                return (
                  <div
                    key={idx}
                    className="flex justify-between py-2 border-b border-white/20 text-[13px]"
                  >
                    <span className="text-hong">Từ {dinhDangTien(mocGia)}</span>
                    <strong className="font-semibold text-trang line-clamp-1">
                      {m.qua}
                    </strong>
                  </div>
                );
              })}
            </div>
          ) : dealTop.dieu_kien ? (
            <p className="m-0 text-[14px] text-hong leading-relaxed">
              {dealTop.dieu_kien}
            </p>
          ) : null}

          {boGoiYDau && (
            <div className="flex items-center gap-2.5 mt-1 bg-white/10 rounded-2xl p-2.5">
              <div className="flex flex-col text-[13px]">
                <span className="text-hong text-[11px]">Gợi ý vừa mốc</span>
                <span className="font-semibold text-trang truncate">
                  {boGoiYDau.ten} · {dinhDangTien(boGoiYDau.gia)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-4">
          <Link
            href="/deal"
            className="h-[50px] rounded-full bg-trang text-den no-underline flex items-center justify-center font-semibold text-[16px] hover:opacity-95 transition-opacity"
          >
            Xem bộ gợi ý
          </Link>
          <button
            type="button"
            onClick={onBoQua}
            className="h-[44px] rounded-full border border-white/20 text-trang bg-transparent text-[14px] font-medium cursor-pointer hover:bg-white/10 transition-colors"
          >
            Để sau (tiếp tục quẹt)
          </button>
        </div>
      </article>
    );
  }

  // Mặc định (khi chưa có deal top)
  return (
    <article
      aria-label="Gợi ý deal sau 5 lượt thích"
      className="absolute inset-0 rounded-[28px] bg-den text-trang p-6 box-border flex flex-col justify-between shadow-[0_16px_40px_rgba(43,43,42,0.22)] select-none z-10"
    >
      <div className="flex items-center justify-between">
        <span className="h-[30px] px-3.5 rounded-full bg-bac-ha text-den text-[13px] font-semibold flex items-center gap-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <path d="M7 7h.01" />
          </svg>
          Deal cho bạn
        </span>
      </div>

      <div className="flex flex-col gap-3 my-auto text-center items-center px-2">
        <div className="w-14 h-14 rounded-full bg-trang/10 flex items-center justify-center text-bac-ha mb-1">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        <h2 className="m-0 font-bold text-[24px] leading-[1.3] tracking-[-0.5px]">
          Đã có {soMonHopDa} món hợp da
        </h2>
        <p className="m-0 text-[15px] leading-relaxed text-hong max-w-[280px]">
          Các sản phẩm bạn thích đang có các deal và quà tặng hấp dẫn hôm nay tại booth.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/deal"
          className="h-[52px] rounded-full bg-trang text-den no-underline flex items-center justify-center font-semibold text-[16px] hover:opacity-90 transition-opacity"
        >
          Xem deal cho bạn
        </Link>
        <button
          type="button"
          onClick={onBoQua}
          className="h-[44px] rounded-full border border-white/20 text-trang bg-transparent text-[14px] font-medium cursor-pointer hover:bg-white/10 transition-colors"
        >
          Tiếp tục quẹt
        </button>
      </div>
    </article>
  );
}
