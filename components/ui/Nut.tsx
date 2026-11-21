import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Nút dùng chung (W040, docs/05 §2.5). Không viết nút riêng trong trang.
 * - chinh: nền hồng, hành động chính của thẻ (thêm vào giỏ…)
 * - chinh-bac-ha: như chinh, cho combo / sản phẩm
 * - phu: nền trắng viền mảnh (như nút phụ trang chủ), xem giỏ, xem sản phẩm, bộ lọc
 * - chu: chữ xám gạch chân, link phụ
 * - dam: nền đen. CHỈ 1 nút mỗi màn hình, cho bước chốt (Giữ hàng ở giỏ, Xác nhận ở form giữ hàng)
 */
export type BienTheNut = "chinh" | "chinh-bac-ha" | "phu" | "chu" | "dam";
export type CoNut = "vua" | "lon" | "nho";

const NEN: Record<BienTheNut, string> = {
  chinh: "bg-hong text-den font-semibold hover:brightness-[0.97]",
  "chinh-bac-ha": "bg-bac-ha text-den font-semibold hover:brightness-[0.97]",
  phu: "bg-trang text-den font-medium shadow-[inset_0_0_0_1px_rgba(43,43,42,0.14)] hover:bg-kem",
  chu: "bg-transparent text-xam underline underline-offset-4 font-medium hover:text-den px-0",
  dam: "bg-den text-trang font-semibold hover:opacity-90",
};
const CO: Record<CoNut, string> = {
  nho: "h-9 px-3.5 text-[13px]",
  vua: "h-11 md:h-10 px-5 text-[14px]",
  lon: "h-12 px-6 text-[15px]",
};

export function lopNut(bien: BienTheNut = "chinh", co: CoNut = "vua", rong = false) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap no-underline border-0 cursor-pointer",
    "transition-[filter,opacity,background-color] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-den",
    CO[co],
    NEN[bien],
    rong ? "w-full" : "",
  ].join(" ");
}

type ChungProps = { bien?: BienTheNut; co?: CoNut; rong?: boolean; className?: string; children: ReactNode };

export function Nut({ bien = "chinh", co = "vua", rong, className = "", children, ...con }: ChungProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type="button" data-nut={bien} className={`${lopNut(bien, co, rong)} ${className}`} {...con}>
      {children}
    </button>
  );
}

export function NutLink({ bien = "chinh", co = "vua", rong, className = "", children, ...con }: ChungProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link data-nut={bien} className={`${lopNut(bien, co, rong)} ${className}`} {...con}>
      {children}
    </Link>
  );
}
