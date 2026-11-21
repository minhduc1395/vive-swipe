"use client";

import Link from "next/link";
import { useState } from "react";
import type { Deal, SanPham } from "@/lib/data/types";
import { duongDanAnh } from "@/lib/anh";
import { dinhDangTien } from "@/lib/dinh-dang";
import { lopNut } from "@/components/ui/Nut";

export type NhomDeal = "qua" | "combo" | "giam";

export const TEN_NHOM: Record<NhomDeal, string> = { qua: "Quà theo hóa đơn", combo: "Combo", giam: "Giảm giá" };

export function nhomCuaDeal(d: Deal): NhomDeal {
  if (d.loai === "combo") return "combo";
  if (d.loai === "giam_khi_mua_kem" || d.loai === "mua_x_tang_y") return "giam";
  return "qua";
}

/** Dòng nhỏ góc phải thẻ: chỉ nói có giới hạn, không tự tính còn bao nhiêu (web không biết tồn quà). */
export function nhanGioiHan(d: Deal): string | null {
  if (d.gioi_han || d.moc?.some((m) => m.gioi_han)) return "Số lượng có hạn";
  if (d.gioi_han_qua) return "Quà có hạn";
  return null;
}

/** 700000 → "700K", 1100000 → "1,1 triệu" */
export function tienNgan(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
  return `${Math.round(n / 1000)}K`;
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
  const moc = deal.moc ?? [];
  return (
    <ol className="relative m-0 p-0 list-none flex items-start" aria-label="Các mốc quà">
      <span className="absolute left-1.5 right-1.5 top-[6px] h-[2px] bg-oliu-vua" aria-hidden="true" />
      {moc.map((m, i) => {
        const tien = m.tu ?? m.tren ?? 0;
        return (
          <li key={i} className="relative flex-1 pt-[18px] text-[12px] leading-[1.35] min-w-0 pr-1">
            <span className="absolute left-0 top-[1px] w-3 h-3 rounded-full bg-trang border-2 border-oliu" aria-hidden="true" />
            <b className="block text-[13px]">{m.tren ? "Trên " : ""}{tienNgan(tien)}</b>
            <span className={`text-xam ${gon ? "line-clamp-1" : ""}`}>{m.qua.replace(/^1\s+/, "")}</span>
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
  const nhom = nhomCuaDeal(deal);
  const han = nhanGioiHan(deal);
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
          {deal.goi_y?.length ? `${deal.goi_y.length} bộ gợi ý vừa mốc` : "Xem điều kiện"}
        </button>
        {bo ? (
          <button type="button" onClick={(e) => { dungLan(e); onThemBo(bo.ten, bo.san_pham); }} className={lopNut("chinh", "vua")}>
            Thêm {bo.ten.length > 16 ? "bộ gợi ý" : bo.ten}
          </button>
        ) : (
          <Link href="/gio" onClick={dungLan} className={lopNut("phu", "vua")}>Xem giỏ</Link>
        )}
      </>
    );
  } else if (nhom === "combo") {
    const c = tinhCombo(deal, sanPhamMap);
    than = (
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex">{c.sp.slice(0, 3).map((s) => <AnhNho key={s.id} sp={s} co={56} chong={c.sp.length > 1} />)}</span>
        <span className="text-[13px] text-xam leading-[1.4] line-clamp-2 min-w-0">
          {deal.qua ? `Tặng ${deal.qua.replace(/^1\s+/, "")}` : c.sp.map((s) => s.ten_hien_thi).join(" + ")}
        </span>
      </div>
    );
    chan = (
      <>
        <span className="flex items-baseline gap-2 flex-wrap">
          <b className="text-[22px] tracking-[-0.01em]">{dinhDangTien(c.gia)}</b>
          {c.tongLe > c.gia && <s className="text-[13px] text-xam">{dinhDangTien(c.tongLe)}</s>}
          {c.tietKiem > 0 && <span className="text-[12px] font-semibold text-xanh-dam bg-oliu-nhat px-2 py-0.5 rounded-full">−{tienNgan(c.tietKiem)}</span>}
        </span>
        <button type="button" onClick={(e) => { dungLan(e); onThemCombo(deal); }} className={lopNut("chinh-bac-ha", "vua")}>
          Thêm vào giỏ
        </button>
      </>
    );
  } else if (deal.loai === "giam_khi_mua_kem") {
    const ds = (deal.ap_dung_cho ?? []).map((id) => sanPhamMap.get(id)).filter((s): s is SanPham => Boolean(s));
    than = (
      <div className="flex flex-col gap-1.5 text-[13px] text-xam leading-[1.4]">
        {deal.dieu_kien && <p className="m-0 line-clamp-1">{deal.dieu_kien}</p>}
        <p className="m-0 text-den">
          {ds.map((s, i) => (
            <span key={s.id}>{i ? " · " : ""}{s.ten_hien_thi.replace(/^.*?(Sữa rửa mặt|Ampoule|Kem dưỡng|Kem).*$/i, "$1")} <b>{tienNgan(deal.gia_uu_dai?.[s.id] ?? Math.round(s.gia_ban * 0.75))}</b></span>
          ))}
        </p>
      </div>
    );
    chan = (
      <>
        <button type="button" onClick={(e) => { dungLan(e); onMo(deal); }} className={lopNut("chu", "vua")}>Xem điều kiện</button>
        <Link href={dichSanPhamApDung(deal, sanPhamMap)} onClick={dungLan} className={lopNut("phu", "vua")}>Xem sản phẩm</Link>
      </>
    );
  } else {
    than = (
      <div className="flex flex-col gap-1.5 text-[13px] text-xam leading-[1.4]">
        {deal.dieu_kien && <p className="m-0 line-clamp-2">{deal.dieu_kien}</p>}
        {deal.qua && <p className="m-0 text-den line-clamp-1">Quà: {deal.qua}</p>}
      </div>
    );
    chan = (
      <>
        <button type="button" onClick={(e) => { dungLan(e); onMo(deal); }} className={lopNut("chu", "vua")}>Xem điều kiện</button>
        <Link href={dichSanPhamApDung(deal, sanPhamMap)} onClick={dungLan} className={lopNut("phu", "vua")}>Xem sản phẩm</Link>
      </>
    );
  }

  return (
    <article
      id={`deal-${deal.id}`}
      data-nhom={nhom}
      aria-label={deal.ten}
      onClick={() => onMo(deal)}
      className={`min-w-0 flex flex-col gap-3 p-4 rounded-[20px] bg-trang border cursor-pointer transition-[box-shadow,transform,border-color] duration-200 hover:shadow-[0_8px_28px_rgba(43,43,42,0.08)] hover:-translate-y-0.5 md:min-h-[236px] ${
        noiBat ? "border-hong ring-2 ring-hong" : "border-vien"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-[12px] text-xam">
        <span className={`inline-flex items-center h-6 px-2.5 rounded-full font-semibold text-den ${nenNhan}`}>
          {deal.loai === "mua_x_tang_y" ? "Mua nhiều" : deal.loai === "may_rui" ? "May mắn" : TEN_NHOM[nhom]}
        </span>
        {han && (
          <span className="inline-flex items-center gap-1.5">
            <i className="w-1.5 h-1.5 rounded-full bg-cam" aria-hidden="true" />
            {han}
          </span>
        )}
      </div>
      <h3 className="m-0 text-[17px] font-semibold leading-[1.35] line-clamp-2">{deal.ten}</h3>
      {than}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-2.5">{chan}</div>
    </article>
  );
}
