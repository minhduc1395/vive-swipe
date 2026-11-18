import Link from "next/link";
import type { KhoiTieuDiem as KhoiTieuDiemType } from "@/lib/chien-dich/types";
import { timDealTheoId, timSanPhamTheoId } from "@/lib/data";
import { dinhDangTienGio } from "@/lib/dinh-dang";

interface KhoiTieuDiemProps {
  khoi: KhoiTieuDiemType;
}

export function KhoiTieuDiem({ khoi }: KhoiTieuDiemProps) {
  const { nhan_phu, tieu_de, mo_ta, san_pham_id, deal_id, cta_chinh } = khoi;

  const sp = san_pham_id ? timSanPhamTheoId(san_pham_id) : undefined;
  const deal = deal_id ? timDealTheoId(deal_id) : undefined;
  const dealHopLe =
    deal && (!deal.may_rui || deal.da_dang_ky) && deal.hien_thi !== false
      ? deal
      : undefined;

  const giaNiemYet = sp?.gia_ban ?? null;
  const giaUuDai =
    sp && dealHopLe?.gia_uu_dai && typeof dealHopLe.gia_uu_dai[sp.id] === "number"
      ? dealHopLe.gia_uu_dai[sp.id]
      : null;

  const moTaHienThi = sp?.mo_ta || mo_ta || dealHopLe?.hook || null;

  return (
    <section
      id={khoi.id || "tieu-diem"}
      aria-label="Tiêu điểm sản phẩm"
      className="relative z-10 min-h-[100dvh] flex items-end lg:items-center justify-start lg:justify-end px-5 sm:px-8 md:pl-[120px] md:pr-8 lg:px-16 pt-[46dvh] lg:pt-20 pb-10 lg:pb-16"
    >
      <div className="w-full lg:max-w-[44%] max-w-[520px] flex flex-col gap-3 md:gap-4 text-left bg-hong-nhat/65 lg:bg-transparent backdrop-blur-[2px] lg:backdrop-blur-none rounded-[24px] p-4 lg:p-0">
        {nhan_phu && (
          <span className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[12px] md:text-[13px] font-bold tracking-[1.5px] text-den shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#8FBF9F]" />
            {nhan_phu}
          </span>
        )}

        <h2 className="m-0 font-bold text-[clamp(28px,7.5vw,40px)] sm:text-[50px] lg:text-[68px] leading-[0.95] tracking-[-0.04em] text-den">
          {tieu_de.map((line, idx) => {
            const isOutline = line.startsWith("~");
            const clean = isOutline ? line.slice(1) : line;
            if (isOutline) {
              return (
                <span key={idx} className="block vet-hong">
                  {clean}
                </span>
              );
            }
            return (
              <span key={idx} className="block">
                {clean}
              </span>
            );
          })}
        </h2>

        {moTaHienThi && (
          <p className="m-0 text-[15px] sm:text-[18px] leading-[1.55] text-xam">
            {moTaHienThi}
          </p>
        )}

        {(giaUuDai !== null || giaNiemYet !== null) && (
          <div className="flex flex-wrap items-baseline gap-3 pt-1">
            {giaUuDai !== null ? (
              <>
                <span className="text-[28px] sm:text-[36px] font-bold text-den">
                  {dinhDangTienGio(giaUuDai)}
                </span>
                {giaNiemYet !== null && giaNiemYet > giaUuDai && (
                  <span className="text-[15px] sm:text-[16px] text-xam line-through">
                    {dinhDangTienGio(giaNiemYet)}
                  </span>
                )}
                {dealHopLe?.dieu_kien && (
                  <span className="text-[13px] sm:text-[14px] text-xam">
                    khi mua kèm
                  </span>
                )}
              </>
            ) : (
              giaNiemYet !== null && (
                <span className="text-[28px] sm:text-[36px] font-bold text-den">
                  {dinhDangTienGio(giaNiemYet)}
                </span>
              )
            )}
          </div>
        )}

        {cta_chinh && (
          <div className="pt-1">
            <Link
              href={cta_chinh.den}
              className="min-h-[44px] h-11 md:h-12 px-6 rounded-full bg-den text-white inline-flex items-center gap-2 text-[14px] md:text-[15px] font-semibold hover:bg-black transition-colors"
            >
              {cta_chinh.chu}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
