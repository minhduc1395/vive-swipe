"use client";

import Link from "next/link";
import { useState } from "react";
import type { KhoiChuongTrinh } from "@/lib/chien-dich/types";
import type { Deal } from "@/lib/data/types";
import { timDealTheoId } from "@/lib/data";
import { useDuLieu } from "@/lib/du-lieu-context";
import { dinhDangTien } from "@/lib/dinh-dang";
import { duongDanAnh } from "@/lib/anh";
import { dichDeal } from "@/lib/chien-dich/dich-den";

interface KhoiChuongTrinhProps {
  khoi: KhoiChuongTrinh;
  /** Ảnh tách nền riêng của đợt (yaml `ra-mat.anh_san_pham`), dùng trước ảnh kho media */
  anhRieng?: Record<string, string>;
}

/** W048: mã sản phẩm có ảnh trên thẻ deal: anh_san_pham → thanh_phan → ap_dung_cho */
export function maAnhCuaDeal(d: Deal): string[] {
  if (d.anh_san_pham?.length) return d.anh_san_pham;
  if (d.thanh_phan?.length) return d.thanh_phan.map((t) => t.id);
  return d.ap_dung_cho ?? [];
}

function AnhSanPham({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [loi, setLoi] = useState(false);
  if (loi) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setLoi(true)} className={className} style={style} />
  );
}

export function KhoiChuongTrinh({ khoi, anhRieng = {} }: KhoiChuongTrinhProps) {
  const { tieu_de, deal: dealIds = [], o_to, logo_sau_tieu_de } = khoi;
  const { timSanPham } = useDuLieu();

  const resolvedDeals = dealIds
    .map((id) => timDealTheoId(id))
    .filter((d): d is NonNullable<typeof d> => {
      if (!d) return false;
      if (d.may_rui && !d.da_dang_ky) return false; // may rủi chưa đăng ký: không hiện
      if (d.hien_thi === false) return false;
      return true;
    });

  return (
    <section id="dang-chay" aria-label={logo_sau_tieu_de ? `${tieu_de} VIVE` : tieu_de} className="relative z-10 bg-bac-ha-nhat py-20 sm:py-24 px-5 sm:px-8 md:px-16">
      <div className="max-w-[1360px] mx-auto flex flex-col gap-10">
        <h2 className="m-0 font-bold text-[40px] sm:text-[54px] md:text-[68px] leading-[0.95] tracking-[-0.04em] text-den">
          {tieu_de}
          {logo_sau_tieu_de && (
            <>
              {" "}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/vive-logo-chu.png" alt="VIVE" className="inline-block h-[0.74em] w-auto align-baseline ml-[0.05em]" />
            </>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 auto-rows-fr">
          {resolvedDeals.map((d) => {
            const isBig = d.id === o_to;
            let giaGoc = 0;
            for (const tp of d.thanh_phan ?? []) {
              const sp = timSanPham(tp.id);
              if (sp) giaGoc += sp.gia_ban * tp.so_luong;
            }
            const giaBan = d.gia_combo || (giaGoc > 0 ? giaGoc : null);
            const bgClass = d.id === "COMBO-PINK" ? "bg-hong" : d.id === "DC-05" ? "bg-bac-ha" : "bg-white";

            const anh = maAnhCuaDeal(d)
              .map((id) => {
                const sp = timSanPham(id);
                const src = anhRieng[id] ?? duongDanAnh(sp?.anh, isBig ? "the" : "the-nho");
                // chỉ dùng ảnh thật (kho media hoặc ảnh riêng của đợt); bỏ đường dẫn tĩnh cũ /products/
                return src && !src.startsWith("/products/") ? { id, src, ten: sp?.ten_hien_thi ?? id } : null;
              })
              .filter((a): a is { id: string; src: string; ten: string } => a !== null)
              .slice(0, isBig ? 3 : 4);

            return (
              <Link
                key={d.id}
                href={dichDeal(d.id)}
                data-deal={d.id}
                className={`@container relative overflow-hidden rounded-[30px] no-underline text-den shadow-[0_12px_32px_rgba(43,43,42,0.06)] hover:shadow-lg transition-all duration-300 hover:scale-[1.01] ${bgClass} ${
                  isBig ? "md:col-span-2 md:row-span-2 min-h-[340px]" : "min-h-[220px]"
                }`}
              >
                <div className={`relative z-10 h-full p-7 md:p-8 flex flex-col justify-between gap-4 ${isBig && anh.length ? "@[560px]:max-w-[52%]" : ""} ${!isBig && anh.length ? "@[360px]:pr-[150px]" : ""}`}>
                  <div className="flex flex-col gap-3">
                    <span className="self-start px-3 py-1 rounded-full bg-white/75 text-[12px] font-bold text-den">
                      {d.loai === "combo" ? "Combo" : d.loai === "mua_x_tang_y" ? "Ưu đãi số lượng" : "Quà tặng"}
                    </span>
                    <strong className={`font-bold tracking-tight text-den leading-[1.15] ${isBig ? "text-[28px] sm:text-[36px]" : "text-[22px] sm:text-[24px]"}`}>
                      {d.ten}
                    </strong>
                    {d.hook && <p className="m-0 text-[14px] sm:text-[15px] text-xam leading-[1.5]">{d.hook}</p>}

                    {/* Ô nhỏ / điện thoại: hàng ảnh nhỏ dưới mô tả */}
                    {anh.length > 0 && (
                      <div className={`flex items-end gap-1.5 ${isBig ? "@[560px]:hidden" : "@[360px]:hidden"}`} aria-hidden="true">
                        {anh.map((a) => (
                          <AnhSanPham key={a.id} src={a.src} alt="" className="h-[76px] w-[64px] object-contain drop-shadow-[0_6px_10px_rgba(43,43,42,0.14)]" />
                        ))}
                      </div>
                    )}
                  </div>
                  {giaBan && (
                    <div className="mt-auto pt-2 flex items-baseline gap-2.5">
                      <span className={`font-bold text-den ${isBig ? "text-[32px] sm:text-[38px]" : "text-[24px] sm:text-[26px]"}`}>{dinhDangTien(giaBan)}</span>
                      {giaGoc > giaBan && <span className="text-[15px] text-xam line-through">{dinhDangTien(giaGoc)}</span>}
                    </div>
                  )}
                </div>

                {/* Ô to: ảnh chiếm nửa phải, so le chồng nhẹ, món giữa to nhất */}
                {isBig && anh.length > 0 && (
                  <div className="hidden @[560px]:flex absolute inset-y-6 right-4 w-[46%] items-end justify-center" aria-hidden="true">
                    {anh.map((a, i) => {
                      const giua = i === Math.floor(anh.length / 2);
                      return (
                        <AnhSanPham
                          key={a.id}
                          src={a.src}
                          alt=""
                          className={`object-contain drop-shadow-[0_14px_22px_rgba(43,43,42,0.18)] ${giua ? "h-[70%] z-10" : "h-[54%] opacity-95"}`}
                          style={{ marginLeft: i ? "-9%" : 0, maxWidth: `${Math.round(100 / Math.max(anh.length - 0.4, 1))}%` }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Ô vừa: ảnh góc phải dưới */}
                {!isBig && anh.length > 0 && (
                  <div className="hidden @[360px]:flex absolute right-4 bottom-4 w-[140px] h-[150px] items-end justify-end" aria-hidden="true">
                    {anh.slice(0, 2).map((a, i) => (
                      <AnhSanPham key={a.id} src={a.src} alt="" className="h-full w-auto max-w-[80px] object-contain drop-shadow-[0_10px_16px_rgba(43,43,42,0.16)]" style={{ marginLeft: i ? "-18px" : 0 }} />
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
