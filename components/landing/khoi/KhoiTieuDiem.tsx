import { lopNut } from "@/components/ui/Nut";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { KhoiTieuDiem as KhoiTieuDiemType } from "@/lib/chien-dich/types";
import { timDealTheoId, timSanPhamTheoId } from "@/lib/data";
import { dinhDangGia } from "@/lib/dinh-dang";
import { chuTheoNgonNgu } from "@/lib/trang-chu/ngon-ngu";

interface KhoiTieuDiemProps {
  khoi: KhoiTieuDiemType;
}

export function KhoiTieuDiem({ khoi }: KhoiTieuDiemProps) {
  const { nhan_phu, tieu_de, mo_ta, san_pham_id, deal_id, cta_chinh } = khoi;
  const t = useTranslations("trang-chu.landing.tieuDiem");
  const ngonNgu = useLocale();

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

  // en: mô tả của khối yaml (đã có bản en) trước; sản phẩm/deal chỉ dùng bản en khi dữ liệu có
  const moTaHienThi =
    (ngonNgu === "en" ? chuTheoNgonNgu(sp, "mo_ta", ngonNgu) || mo_ta : sp?.mo_ta || mo_ta) ||
    chuTheoNgonNgu(dealHopLe, "hook", ngonNgu) ||
    null;

  return (
    <section
      id={khoi.id || "tieu-diem"}
      data-k="1"
      aria-label={t("aria")}
      className="vq-k phai relative z-10"
    >
      <div className="cot flex flex-col gap-3 md:gap-4 text-left">
        {nhan_phu && (
          <span className="self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[12px] md:text-[13px] font-bold tracking-[1.5px] text-den shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#8FBF9F]" />
            {nhan_phu}
          </span>
        )}

        <h2 className="m-0 font-bold text-[clamp(34px,9.5vw,56px)] lg:text-[clamp(44px,6vw,78px)] leading-[0.95] tracking-[-0.04em] text-den">
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
          <p className="m-0 text-[16px] lg:text-[18px] leading-[1.55] lg:leading-[1.6] text-xam">
            {moTaHienThi}
          </p>
        )}

        {(giaUuDai !== null || giaNiemYet !== null) && (
          <div className="flex flex-wrap items-baseline gap-3 pt-1">
            {giaUuDai !== null ? (
              <>
                <span className="text-[28px] lg:text-[34px] font-bold text-den">
                  {dinhDangGia(giaUuDai, ngonNgu)}
                </span>
                {giaNiemYet !== null && giaNiemYet > giaUuDai && (
                  <span className="text-[15px] lg:text-[16px] text-xam line-through">
                    {dinhDangGia(giaNiemYet, ngonNgu)}
                  </span>
                )}
                {dealHopLe?.dieu_kien && (
                  <span className="text-[13px] lg:text-[14px] text-xam">
                    {t("khiMuaKem")}
                  </span>
                )}
              </>
            ) : (
              giaNiemYet !== null && (
                <span className="text-[28px] lg:text-[34px] font-bold text-den">
                  {dinhDangGia(giaNiemYet, ngonNgu)}
                </span>
              )
            )}
          </div>
        )}

        {cta_chinh && (
          <div className="pt-1">
            <Link
              href={cta_chinh.den}
              className={lopNut("chinh","lon")}
            >
              {cta_chinh.chu}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
