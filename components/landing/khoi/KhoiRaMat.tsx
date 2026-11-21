"use client";
import { lopNut } from "@/components/ui/Nut";

import Link from "next/link";
import { dichDeal } from "@/lib/chien-dich/dich-den";
import type { KhoiRaMat as KhoiRaMatType } from "@/lib/chien-dich/types";
import { timDealTheoId, timSanPhamTheoId } from "@/lib/data";
import { dinhDangTienGio } from "@/lib/dinh-dang";
import { themComboVaoGio } from "@/lib/kho-luu-tru";

interface KhoiRaMatProps {
  khoi: KhoiRaMatType;
  /** W064: khối đứng riêng (không có sân khấu 3D phía sau), căn giữa */
  phang?: boolean;
}

export function KhoiRaMat({ khoi, phang = false }: KhoiRaMatProps) {
  const { tieu_de, mo_ta, deal: dealIds = [] } = khoi;

  const resolvedDeals = dealIds
    .map((id) => timDealTheoId(id))
    .filter(
      (d): d is NonNullable<typeof d> =>
        Boolean(d) && (!d?.may_rui || d?.da_dang_ky) && d?.hien_thi !== false
    );

  return (
    <section
      id="ke-ra-mat"
      data-k={phang ? undefined : "2"}
      aria-label="Kệ ra mắt"
      className={phang ? "relative z-10 px-5 md:px-16 py-20 md:py-28 flex justify-center" : "vq-k trai relative z-10"}
    >
      <div className={phang ? "w-full max-w-[640px] flex flex-col gap-3.5 md:gap-4" : "cot flex flex-col gap-3.5 md:gap-4"}>
        <h2 className="m-0 font-bold text-[clamp(34px,9.5vw,56px)] lg:text-[clamp(44px,5.6vw,76px)] leading-[0.95] tracking-[-0.04em] text-den">
          {tieu_de}
        </h2>

        <div className="flex flex-col gap-2.5 w-full">
          {resolvedDeals.map((d) => {
            const thanhPhan = (d.thanh_phan || []).map((tp) => {
              const sp = timSanPhamTheoId(tp.id);
              return { ...tp, sp };
            });
            const giaGoc = thanhPhan.reduce(
              (acc, item) => acc + (item.sp?.gia_ban || 0) * item.so_luong,
              0
            );
            const giaBan = d.gia_combo || giaGoc;

            return (
              <div
                key={d.id}
                className="rounded-[20px] lg:rounded-[24px] bg-white px-4 py-3.5 lg:px-5 lg:py-4 shadow-[0_10px_24px_rgba(43,43,42,0.06)] flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5"
              >
                <div className="min-w-0 flex-1 basis-[200px] flex flex-col gap-0.5">
                  <Link href={dichDeal(d.id)} className="text-[15px] lg:text-[16px] font-semibold text-den leading-snug no-underline hover:underline underline-offset-4">
                    {d.ten}
                  </Link>
                  {d.qua && (
                    <span className="text-[12px] text-xam leading-snug">
                      {d.qua} (khi còn quà)
                    </span>
                  )}
                </div>

                <div className="shrink-0 ml-auto flex items-center gap-2.5">
                  <div className="text-right flex flex-col">
                    <b className="text-[18px] lg:text-[20px] font-bold text-den leading-none">
                      {dinhDangTienGio(giaBan)}
                    </b>
                    {giaGoc > giaBan && (
                      <s className="text-[12px] text-xam mt-0.5">
                        {dinhDangTienGio(giaGoc)}
                      </s>
                    )}
                  </div>

                  <Link
                    href="/gio"
                    onClick={() => themComboVaoGio(d.id, 1)}
                    aria-label={`Thêm vào giỏ ${d.ten}`}
                    className={lopNut("chinh","nho")}
                  >
                    Thêm vào giỏ
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {mo_ta && (
          <p className="m-0 text-[14px] lg:text-[15px] leading-[1.55] text-xam">
            {mo_ta}
          </p>
        )}
      </div>
    </section>
  );
}
