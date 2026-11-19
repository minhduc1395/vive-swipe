import { dinhDangTien } from "@/lib/dinh-dang";

/** Giá: giá bán đậm, giá gốc gạch ngang xám khi có giảm. */
export function GiaTien({ gia, giaGoc, co = "vua", className = "" }: { gia: number; giaGoc?: number | null; co?: "nho" | "vua" | "lon"; className?: string }) {
  const lop = { nho: "text-[14px]", vua: "text-[17px]", lon: "text-[22px]" }[co];
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <b className={`${lop} font-bold text-den`}>{dinhDangTien(gia)}</b>
      {giaGoc && giaGoc > gia ? <s className="text-[13px] text-xam">{dinhDangTien(giaGoc)}</s> : null}
    </span>
  );
}
