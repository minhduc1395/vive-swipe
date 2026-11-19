import type { ComponentProps } from "react";

/** Thẻ dùng chung: nền trắng, bo 20px, viền 1px --vien. `nen="phu"` cho nền xám nhạt. */
export function The({ nen = "trang", className = "", ...con }: { nen?: "trang" | "phu" | "hong" | "bac-ha" } & ComponentProps<"div">) {
  const mau = { trang: "bg-trang border border-vien", phu: "bg-nen-phu", hong: "bg-hong-nhat", "bac-ha": "bg-bac-ha-nhat" }[nen];
  return <div className={`rounded-[20px] ${mau} ${className}`} {...con} />;
}
