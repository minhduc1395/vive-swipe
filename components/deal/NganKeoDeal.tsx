"use client";

import { useState } from "react";
import Link from "next/link";
import type { Deal, SanPham } from "@/lib/data/types";
import { timDealTheoId } from "@/lib/data";
import { dinhDangTien } from "@/lib/dinh-dang";
import { lopNut } from "@/components/ui/Nut";
import { AnhNho, DuongMocQua, TEN_NHOM, dichSanPhamApDung, nhanGioiHan, nhomCuaDeal, tienNgan, tinhCombo } from "./TheDeal";

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
  const moc = deal.moc ?? [];
  const [tab, setTab] = useState(0);
  const tienMoc = moc[tab] ? moc[tab].tu ?? moc[tab].tren ?? 0 : 0;
  const boTheoMoc = (deal.goi_y ?? []).filter((b) => (moc.length ? b.moc === tienMoc : true));
  const han = nhanGioiHan(deal);
  const khongCong = (deal.khong_cong_voi ?? []).map((id) => timDealTheoId(id)?.ten ?? id);

  return (
    <div className="relative p-6 flex flex-col gap-4">
      <button type="button" onClick={onDong} aria-label="Đóng chi tiết deal" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-nen-phu border-0 flex items-center justify-center cursor-pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
      <span className="text-[12px] text-xam pr-12">
        {deal.loai === "mua_x_tang_y" ? "Mua nhiều" : TEN_NHOM[nhomCuaDeal(deal)]}
        {han ? ` · ${han}` : ""}
      </span>
      <h2 className="m-0 text-[22px] font-bold leading-[1.25] pr-10">{deal.ten}</h2>
      {deal.hook && deal.hook !== deal.ten && <p className="m-0 text-[14px] text-xam leading-[1.5]">{deal.hook}</p>}

      {moc.length > 0 && (
        <>
          <DuongMocQua deal={deal} />
          {(deal.goi_y?.length ?? 0) > 0 && (
            <>
              <div role="tablist" aria-label="Chọn mốc" className="flex gap-1.5 flex-wrap mt-1">
                {moc.map((m, i) => (
                  <button
                    key={i}
                    role="tab"
                    type="button"
                    aria-selected={tab === i}
                    onClick={() => setTab(i)}
                    className={`h-9 px-3.5 rounded-full text-[13px] border-0 cursor-pointer ${tab === i ? "bg-hong font-semibold" : "bg-nen-phu"}`}
                  >
                    Mốc {tienNgan(m.tu ?? m.tren ?? 0)}
                  </button>
                ))}
              </div>
              <div role="tabpanel" className="flex flex-col gap-2">
                {boTheoMoc.length === 0 && <p className="m-0 text-[13px] text-xam">Chưa có bộ gợi ý cho mốc này.</p>}
                {boTheoMoc.map((bo) => {
                  const sp = sanPhamMap.get(bo.san_pham[0]);
                  return (
                    <div key={bo.id} className="flex items-center gap-3 p-2.5 rounded-[14px] border border-vien">
                      {sp && <AnhNho sp={sp} co={48} />}
                      <div className="min-w-0 flex-1 text-[13px] text-xam">
                        <b className="block text-[14px] text-den truncate">{bo.ten}</b>
                        {dinhDangTien(bo.gia)} · đạt mốc tặng quà
                      </div>
                      <button type="button" onClick={() => onThemBo(bo.ten, bo.san_pham)} className={lopNut("chinh", "nho")}>Thêm bộ</button>
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
                  <div className="min-w-0 flex-1 text-[13px]"><b className="block truncate">{sp.ten_hien_thi}</b><span className="text-xam">{tp.so_luong > 1 ? `${tp.so_luong} × ` : ""}{dinhDangTien(sp.gia_ban)}</span></div>
                </div>
              );
            })}
            {deal.qua && <p className="m-0 text-[13px]">Quà: {deal.qua}{deal.gioi_han_qua ? " (khi còn quà)" : ""}</p>}
            {deal.khi_het_qua?.gia_combo && <p className="m-0 text-[13px] text-xam">Hết quà: combo {dinhDangTien(deal.khi_het_qua.gia_combo)}, không quà.</p>}
            <div className="flex items-center justify-between gap-2 pt-2">
              <span className="flex items-baseline gap-2"><b className="text-[22px]">{dinhDangTien(c.gia)}</b>{c.tongLe > c.gia && <s className="text-[13px] text-xam">{dinhDangTien(c.tongLe)}</s>}</span>
              <button type="button" onClick={() => onThemCombo(deal)} className={lopNut("chinh-bac-ha", "lon")}>Thêm vào giỏ</button>
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
                <span className="truncate">{sp.ten_hien_thi}</span>
                <span className="shrink-0"><s className="text-xam text-[12px] mr-1.5">{dinhDangTien(sp.gia_ban)}</s><b>{dinhDangTien(gia)}</b></span>
              </div>
            );
          })}
        </div>
      )}

      {deal.dieu_kien && (
        <section>
          <h3 className="m-0 mb-1 text-[13px] font-semibold">Điều kiện</h3>
          <p className="m-0 text-[14px] text-xam leading-[1.5]">{deal.dieu_kien}</p>
        </section>
      )}
      {deal.loai !== "combo" && deal.qua && !moc.length && <p className="m-0 text-[14px]">Quà: {deal.qua}</p>}
      {khongCong.length > 0 && <p className="m-0 text-[13px] text-xam">Không cộng với: {khongCong.join(", ")}.</p>}
      <p className="m-0 text-[12px] text-xam">Áp dụng tại booth. Nhân viên xác nhận khi thanh toán.</p>

      {deal.loai !== "combo" && (
        <Link href={dichSanPhamApDung(deal, sanPhamMap)} className={lopNut("phu", "lon", true)}>Xem sản phẩm áp dụng</Link>
      )}
    </div>
  );
}
