"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Deal, SanPham } from "@/lib/data/types";
import { timDealTheoId } from "@/lib/data";
import { dieuKienDeal, hookDeal, quaDeal, tenBoGoiY, tenDeal, tienNgan, tienThe } from "@/lib/deals/ngon-ngu";
import { tenSanPham, thieuBanEn } from "@/components/deck/ngon-ngu-quet";
import { lopNut } from "@/components/ui/Nut";
import { AnhNho, DuongMocQua, dichSanPhamApDung, nhanGioiHan, nhanLoaiDeal, tinhCombo } from "./TheDeal";

/** Nội dung ngăn kéo chi tiết deal (W039): bộ gợi ý theo từng mốc (tab), điều kiện đầy đủ, "không cộng với…". */
export function NganKeoDeal({
  deal,
  sanPhamMap,
  onDong,
  onThemCombo,
  onThemBo,
}: {
  deal: Deal;
  sanPhamMap: Map<string, SanPham>;
  onDong: () => void;
  onThemCombo: (d: Deal) => void;
  onThemBo: (ten: string, ids: string[]) => void;
}) {
  const t = useTranslations("deal");
  const nn = useLocale();
  const ten = tenDeal(deal, nn);
  const hook = hookDeal(deal, nn);
  const dieuKien = dieuKienDeal(deal, nn);
  const qua = quaDeal(deal, nn);
  const moc = deal.moc ?? [];
  const [tab, setTab] = useState(0);
  const tienMoc = moc[tab] ? moc[tab].tu ?? moc[tab].tren ?? 0 : 0;
  const boTheoMoc = (deal.goi_y ?? []).filter((b) => (moc.length ? b.moc === tienMoc : true));
  const han = nhanGioiHan(deal, t);
  const khongCong = (deal.khong_cong_voi ?? []).map((id) => (() => { const d = timDealTheoId(id); return d ? tenDeal(d, nn) : id; })());

  return (
    <div className="relative p-6 flex flex-col gap-4">
      <button type="button" onClick={onDong} aria-label={t("nganKeo.dong")} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-nen-phu border-0 flex items-center justify-center cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
      <span className="text-[12px] text-xam pr-12">
        {nhanLoaiDeal(deal, t)}
        {han ? ` · ${han}` : ""}
      </span>
      <h2 className="m-0 text-[22px] font-bold leading-[1.25] pr-10">{ten}</h2>
      {hook && hook !== ten && <p className="m-0 text-[14px] text-xam leading-[1.5]">{hook}</p>}

      {moc.length > 0 && (
        <>
          <DuongMocQua deal={deal} />
          {(deal.goi_y?.length ?? 0) > 0 && (
            <>
              <div role="tablist" aria-label={t("nganKeo.chonMoc")} className="flex gap-1.5 flex-wrap mt-1">
                {moc.map((m, i) => (
                  <button
                    key={i}
                    role="tab"
                    type="button"
                    aria-selected={tab === i}
                    onClick={() => setTab(i)}
                    className={`h-9 px-3.5 rounded-full text-[13px] border-0 cursor-pointer ${tab === i ? "bg-hong font-semibold" : "bg-kem"}`}
                  >
                    {t("nganKeo.moc", { tien: tienNgan(m.tu ?? m.tren ?? 0, nn, t) })}
                  </button>
                ))}
              </div>
              <div role="tabpanel" className="flex flex-col gap-2">
                {boTheoMoc.length === 0 && <p className="m-0 text-[13px] text-xam">{t("nganKeo.chuaCoBo")}</p>}
                {boTheoMoc.map((bo) => {
                  const sp = sanPhamMap.get(bo.san_pham[0]);
                  return (
                    <div key={bo.id} className="flex items-center gap-3 p-2.5 rounded-[14px] border border-vien">
                      {sp && <AnhNho sp={sp} co={48} />}
                      <div className="min-w-0 flex-1 text-[13px] text-xam">
                        <b className="block text-[14px] text-den truncate">{tenBoGoiY(bo, nn)}</b>
                        {tienThe(bo.gia, nn)} · {t("nganKeo.datMoc")}
                      </div>
                      <button type="button" onClick={() => onThemBo(tenBoGoiY(bo, nn), bo.san_pham)} className={lopNut("chinh", "nho")}>{t("nganKeo.themBo")}</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {deal.loai === "combo" && (() => {
        const c = tinhCombo(deal, sanPhamMap);
        return (
          <div className="flex flex-col gap-2">
            {(deal.thanh_phan ?? []).map((tp) => {
              const sp = sanPhamMap.get(tp.id);
              if (!sp) return null;
              return (
                <div key={tp.id} className="flex items-center gap-3 p-2.5 rounded-[14px] border border-vien">
                  <AnhNho sp={sp} co={48} />
                  <div className="min-w-0 flex-1 text-[13px]"><b data-thieu-en={thieuBanEn(sp, nn)} className="block truncate">{tenSanPham(sp, nn)}</b><span className="text-xam">{tp.so_luong > 1 ? `${tp.so_luong} × ` : ""}{tienThe(sp.gia_ban, nn)}</span></div>
                </div>
              );
            })}
            {qua && <p className="m-0 text-[13px]">{t("the.quaCo", { qua })}{deal.gioi_han_qua ? t("nganKeo.khiConQua") : ""}</p>}
            {deal.khi_het_qua?.gia_combo && <p className="m-0 text-[13px] text-xam">{t("nganKeo.hetQua", { gia: tienThe(deal.khi_het_qua.gia_combo, nn) })}</p>}
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="flex items-baseline gap-2"><b className="text-[22px]">{tienThe(c.gia, nn)}</b>{c.tongLe > c.gia && <s className="text-[13px] text-xam">{tienThe(c.tongLe, nn)}</s>}</span>
              <button type="button" onClick={() => onThemCombo(deal)} className={lopNut("chinh-bac-ha", "lon")}>{t("the.themVaoGio")}</button>
            </div>
          </div>
        );
      })()}

      {deal.loai === "giam_khi_mua_kem" && (
        <div className="flex flex-col gap-1">
          {(deal.ap_dung_cho ?? []).map((id) => {
            const sp = sanPhamMap.get(id);
            if (!sp) return null;
            const gia = deal.gia_uu_dai?.[id] ?? Math.round(sp.gia_ban * 0.75);
            return (
              <div key={id} className="flex items-center justify-between gap-3 py-1.5 text-[14px]">
                <span data-thieu-en={thieuBanEn(sp, nn)} className="truncate">{tenSanPham(sp, nn)}</span>
                <span className="shrink-0"><s className="text-xam text-[12px] mr-1.5">{tienThe(sp.gia_ban, nn)}</s><b>{tienThe(gia, nn)}</b></span>
              </div>
            );
          })}
        </div>
      )}

      {dieuKien && (
        <section>
          <h3 className="m-0 mb-1 text-[13px] font-semibold">{t("nganKeo.dieuKien")}</h3>
          <p className="m-0 text-[14px] text-xam leading-[1.5]">{dieuKien}</p>
        </section>
      )}
      {deal.loai !== "combo" && qua && !moc.length && <p className="m-0 text-[14px]">{t("the.quaCo", { qua })}</p>}
      {khongCong.length > 0 && <p className="m-0 text-[13px] text-xam">{t("nganKeo.khongCongVoi", { ds: khongCong.join(", ") })}</p>}
      <p className="m-0 text-[12px] text-xam">{t("nganKeo.apDungBooth")}</p>

      {deal.loai !== "combo" && (
        <Link href={dichSanPhamApDung(deal, sanPhamMap)} className={lopNut("phu", "lon", true)}>{t("nganKeo.xemSanPhamApDung")}</Link>
      )}
    </div>
  );
}
