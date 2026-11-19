import type { ReactNode } from "react";

/** Nhãn nhỏ (giảm giá, quà, loại da…). Không dùng nền đen. */
export function Nhan({ mau = "hong", children, className = "" }: { mau?: "hong" | "bac-ha" | "trang" | "phu"; children: ReactNode; className?: string }) {
  const nen = { hong: "bg-hong text-den", "bac-ha": "bg-bac-ha text-den", trang: "bg-trang/90 text-den", phu: "bg-nen-phu text-den" }[mau];
  return <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${nen} ${className}`}>{children}</span>;
}

/** Chip lọc: chọn = nền hồng, chưa chọn = nền phụ. Không viền tối. */
export function lopChip(dangChon: boolean) {
  return [
    "inline-flex items-center gap-1.5 h-11 md:h-10 px-4 rounded-full text-[14px] whitespace-nowrap shrink-0 cursor-pointer border-0 transition-colors",
    dangChon ? "bg-hong text-den font-semibold" : "bg-nen-phu text-den hover:bg-hong-nhat",
  ].join(" ");
}
