"use client";

import Link from "next/link";

interface TheDealDacBietProps {
  onBoQua: () => void;
}

export function TheDealDacBiet({ onBoQua }: TheDealDacBietProps) {
  return (
    <article className="absolute inset-0 rounded-[28px] bg-den text-trang p-6 box-border flex flex-col justify-between shadow-[0_16px_40px_rgba(43,43,42,0.22)] select-none">
      <div className="flex items-center justify-between">
        <span className="h-[30px] px-3 rounded-full bg-[#CFE3D5] text-den text-[13px] font-semibold flex items-center gap-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
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
        <span className="text-[12px] text-[#E8D2CC]">Số lượng có hạn</span>
      </div>

      <div className="flex flex-col gap-2 my-auto">
        <span className="text-[14px] text-[#E8D2CC]">
          Bạn đã thích các món chăm sóc da Hàn Quốc
        </span>
        <h2 className="m-0 font-bold text-[26px] leading-[1.25] tracking-[-0.5px]">
          Mua từ 700K, tặng sữa rửa mặt LOPOE
        </h2>
        <p className="m-0 text-[14px] leading-relaxed text-[#E8D2CC]">
          Cộng chung tiền Medicube, Celimax, SKINFOOD trong một hóa đơn tại booth.
        </p>

        <div className="mt-2 flex flex-col border-t border-white/20 text-[14px]">
          <div className="flex justify-between py-2 border-b border-white/20">
            <span>Từ 700.000</span>
            <strong className="font-semibold">Sữa rửa mặt LOPOE</strong>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20">
            <span>Từ 1.100.000</span>
            <strong className="font-semibold">Ampoule LOPOE</strong>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20">
            <span>Từ 1.300.000</span>
            <strong className="font-semibold">Kem dưỡng LOPOE</strong>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 shrink-0">
        <button
          type="button"
          onClick={onBoQua}
          className="h-[48px] px-4 rounded-full border border-white/40 text-trang text-[14px] font-medium hover:bg-white/10 cursor-pointer"
        >
          Quẹt tiếp
        </button>
        <Link
          href="/deal"
          className="flex-1 h-[48px] rounded-full bg-[#CFE3D5] text-den flex items-center justify-center font-semibold text-[15px] no-underline hover:bg-[#b8d4c0] transition-colors"
        >
          Xem tất cả deal
        </Link>
      </div>
    </article>
  );
}
