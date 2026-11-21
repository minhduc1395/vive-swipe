"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Deal, SanPham } from "@/lib/data/types";
import { duongDanAnh } from "@/lib/anh";
import { dieuKienDeal, dichVi, quaDeal, quaMoc, tenDeal, tenNganSanPham, tienNgan, tienThe, type Dich } from "@/lib/deals/ngon-ngu";
import { lopNut } from "@/components/ui/Nut";

export type NhomDeal = "qua" | "combo" | "giam";

export function tenNhom(nhom: NhomDeal, t: Dich = dichVi): string {
  return t(`nhom.${nhom}`);
}

/** Nhãn loại trên thẻ/ngăn kéo: loại đặc biệt trước, còn lại theo nhóm. */
export function nhanLoaiDeal(d: Deal, t: Dich = dichVi): string {
  if (d.loai === "mua_x_tang_y") return t("nhom.muaNhieu");
  if (d.loai === "may_rui") return t("nhom.mayMan");
  return tenNhom(nhomCuaDeal(d), t);
}

export function nhomCuaDeal(d: Deal): NhomDeal {
  if (d.loai === "combo") return "combo";
  if (d.loai === "giam_khi_mua_kem" || d.loai === "mua_x_tang_y") return "giam";
  return "qua";
}

/** Dòng nhỏ góc phải thẻ: chỉ nói có giới hạn, không tự tính còn bao nhiêu (web không biết tồn quà). */
export function nhanGioiHan(d: Deal, t: Dich = dichVi): string | null {
  if (d.gioi_han || d.moc?.some((m) => m.gioi_han)) return t("the.gioiHanSoLuong");
  if (d.gioi_han_qua) return t("the.gioiHanQua");
  return null;
}

export function tinhCombo(d: Deal, sanPhamMap: Map<string, SanPham>) {
  const sp: SanPham[] = [];
  let tongLe = 0;
  for (const tp of d.thanh_phan ?? []) {
    const s = sanPhamMap.get(tp.id);
    if (s) {
      tongLe += s.gia_ban * tp.so_luong;
      sp.push(s);
    }
  }
  const gia = d.gia_combo ?? tongLe;
  return { sp, tongLe, gia, tietKiem: Math.max(0, tongLe - gia) };
}

/** Thương hiệu chung của các món áp dụng (để nút "Xem sản phẩm" lọc đúng) */
export function dichSanPhamApDung(d: Deal, sanPhamMap: Map<string, SanPham>): string {
  const ths = new Set((d.ap_dung_cho ?? []).map((id) => sanPhamMap.get(id)?.thuong_hieu).filter(Boolean) as string[]);
  return ths.size === 1 ? `/danh-muc?thuong-hieu=${encodeURIComponent([...ths][0])}` : "/danh-muc";
}

export function AnhNho({ sp, co = 56, chong = false }: { sp: SanPham; co?: number; chong?: boolean }) {
  const [loi, setLoi] = useState(false);
  const src = duongDanAnh(sp.anh, "the-nho");
  const coAnh = src && !src.startsWith("/products/") && !loi;
  return (
    <span
      className={`shrink-0 rounded-[14px] bg-oliu-nhat flex items-center justify-center overflow-hidden ${chong ? "border-2 border-trang -ml-4 first:ml-0" : ""}`}
      style={{ width: co, height: co }}
    >
      {coAnh ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src!} alt="" loading="lazy" onError={() => setLoi(true)} className="w-[82%] h-[82%] object-contain" />
      ) : (
        <span className="text-[9px] font-semibold text-xam uppercase px-1 text-center leading-tight">{sp.thuong_hieu.slice(0, 8)}</span>
      )}
    </span>
  );
}

export function DuongMocQua({ deal, gon = false }: { deal: Deal; gon?: boolean }) {
  const t = useTranslations("deal");
  const nn = useLocale();
  const moc = deal.moc ?? [];
  return (
    <ol className="relative m-0 p-0 list-none flex items-start" aria-label={t("the.cacMocQua")}>
      <span className="absolute left-1.5 right-1.5 top-[6px] h-[2px] bg-oliu-vua" aria-hidden="true" />
      {moc.map((m, i) => {
        const tien = m.tu ?? m.tren ?? 0;
        return (
          <li key={i} className="relative flex-1 pt-[18px] text-[12px] leading-[1.35] min-w-0 pr-1">
            <span className="absolute left-0 top-[1px] w-3 h-3 rounded-full bg-trang border-2 border-oliu" aria-hidden="true" />
            <b className="block text-[13px]">{m.tren ? `${t("the.tren")} ` : ""}{tienNgan(tien, nn, t)}</b>
            <span className={`text-xam ${gon ? "line-clamp-1" : ""}`}>{quaMoc(m, nn).replace(/^1\s+/, "")}</span>
          </li>
        );
      })}
    </ol>
  );
}

interface TheDealProps {
  deal: Deal;
  sanPhamMap: Map<string, SanPham>;
  onMo: (d: Deal) => void;
  onThemCombo: (d: Deal) => void;
  onThemBo: (ten: string, ids: string[]) => void;
  noiBat?: boolean;
}

/** W039: mỗi deal một thẻ gọn (~240px). Chi tiết dài mở trong ngăn kéo khi bấm thẻ. */
export function TheDeal({ deal, sanPhamMap, onMo, onThemCombo, onThemBo, noiBat = false }: TheDealProps) {
  const t = useTranslations("deal");
  const nn = useLocale();
  const ten = tenDeal(deal, nn);
  const dieuKien = dieuKienDeal(deal, nn);
  const qua = quaDeal(deal, nn);
  const nhom = nhomCuaDeal(deal);
  const han = nhanGioiHan(deal, t);
  const nenNhan = nhom === "qua" ? "bg-be" : nhom === "combo" ? "bg-oliu-nhat" : "bg-cat";
  const dungLan = (e: React.MouseEvent) => e.stopPropagation();

  let than: React.ReactNode = null;
  let chan: React.ReactNode = null;

  if (deal.moc?.length) {
    const bo = deal.goi_y?.[0];
    than = <DuongMocQua deal={deal} gon />;
    chan = (
      <>
        <button type="button" onClick={(e) => { dungLan(e); onMo(deal); }} className={lopNut("chu", "vua")}>
          {deal.goi_y?.length ? t("the.boGoiY", { so: deal.goi_y.length }) : t("the.xemDieuKien")}
        </button>
        {bo ? (
          <button type="button" onClick={(e) => { dungLan(e); onThemBo(bo.ten, bo.san_pham); }} className={lopNut("chinh", "vua")}>
            {t("the.themBo", { ten: bo.ten.length > 16 ? t("the.themBoGoiY") : bo.ten })}
          </button>
        ) : (
          <Link href="/gio" onClick={dungLan} className={lopNut("phu", "vua")}>{t("the.xemGio")}</Link>
        )}
      </>
    );
  } else if (nhom === "combo") {
    const c = tinhCombo(deal, sanPhamMap);
    than = (
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex">{c.sp.slice(0, 3).map((s) => <AnhNho key={s.id} sp={s} co={56} chong={c.sp.length > 1} />)}</span>
        <span className="text-[13px] text-xam leading-[1.4] line-clamp-2 min-w-0">
          {qua ? t("the.tang", { qua: qua.replace(/^1\s+/, "") }) : c.sp.map((s) => s.ten_hien_thi).join(" + ")}
        </span>
      </div>
    );
    chan = (
      <>
        <span className="flex items-baseline gap-2 flex-wrap">
          <b className="text-[22px] tracking-[-0.01em]">{tienThe(c.gia, nn)}</b>
          {c.tongLe > c.gia && <s className="text-[13px] text-xam">{tienThe(c.tongLe, nn)}</s>}
          {c.tietKiem > 0 && <span className="text-[12px] font-semibold text-xanh-dam bg-oliu-nhat px-2 py-0.5 rounded-full">−{tienNgan(c.tietKiem, nn, t)}</span>}
        </span>
        <button type="button" onClick={(e) => { dungLan(e); onThemCombo(deal); }} className={lopNut("chinh-bac-ha", "vua")}>
          {t("the.themVaoGio")}
        </button>
      </>
    );
  } else if (deal.loai === "giam_khi_mua_kem") {
    const ds = (deal.ap_dung_cho ?? []).map((id) => sanPhamMap.get(id)).filter((s): s is SanPham => Boolean(s));
    than = (
      <div className="flex flex-col gap-1.5 text-[13px] text-xam leading-[1.4]">
        {dieuKien && <p className="m-0 line-clamp-1">{dieuKien}</p>}
        <p className="m-0 text-den">
          {ds.map((s, i) => (
            <span key={s.id}>{i ? " · " : ""}{tenNganSanPham(s.ten_hien_thi, nn, t)} <b>{tienNgan(deal.gia_uu_dai?.[s.id] ?? Math.round(s.gia_ban * 0.75), nn, t)}</b></span>
          ))}
        </p>
      </div>
    );
    chan = (
      <>
        <button type="button" onClick={(e) => { dungLan(e); onMo(deal); }} className={lopNut("chu", "vua")}>{t("the.xemDieuKien")}</button>
        <Link href={dichSanPhamApDung(deal, sanPhamMap)} onClick={dungLan} className={lopNut("phu", "vua")}>{t("the.xemSanPham")}</Link>
      </>
    );
  } else {
    than = (
      <div className="flex flex-col gap-1.5 text-[13px] text-xam leading-[1.4]">
        {dieuKien && <p className="m-0 line-clamp-2">{dieuKien}</p>}
        {qua && <p className="m-0 text-den line-clamp-1">{t("the.quaCo", { qua })}</p>}
      </div>
    );
    chan = (
      <>
        <button type="button" onClick={(e) => { dungLan(e); onMo(deal); }} className={lopNut("chu", "vua")}>{t("the.xemDieuKien")}</button>
        <Link href={dichSanPhamApDung(deal, sanPhamMap)} onClick={dungLan} className={lopNut("phu", "vua")}>{t("the.xemSanPham")}</Link>
      </>
    );
  }

  return (
    <article
      id={`deal-${deal.id}`}
      data-nhom={nhom}
      aria-label={ten}
      onClick={() => onMo(deal)}
      className={`min-w-0 flex flex-col gap-3 p-4 rounded-[20px] bg-trang border cursor-pointer transition-[box-shadow,transform,border-color] duration-200 hover:shadow-[0_8px_28px_rgba(43,43,42,0.08)] hover:-translate-y-0.5 md:min-h-[236px] ${
        noiBat ? "border-hong ring-2 ring-hong" : "border-vien"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-[12px] text-xam">
        <span className={`inline-flex items-center h-6 px-2.5 rounded-full font-semibold text-den ${nenNhan}`}>
          {nhanLoaiDeal(deal, t)}
        </span>
        {han && (
          <span className="inline-flex items-center gap-1.5">
            <i className="w-1.5 h-1.5 rounded-full bg-cam" aria-hidden="true" />
            {han}
          </span>
        )}
      </div>
      <h3 className="m-0 text-[17px] font-semibold leading-[1.35] line-clamp-2">{ten}</h3>
      {than}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2.5">{chan}</div>
    </article>
  );
}
