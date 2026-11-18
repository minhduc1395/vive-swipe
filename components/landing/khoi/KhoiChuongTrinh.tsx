import Link from "next/link";
import type { KhoiChuongTrinh } from "@/lib/chien-dich/types";
import { timDealTheoId, timSanPhamTheoId } from "@/lib/data";
import { dinhDangTien } from "@/lib/dinh-dang";

interface KhoiChuongTrinhProps {
  khoi: KhoiChuongTrinh;
}

export function KhoiChuongTrinh({ khoi }: KhoiChuongTrinhProps) {
  const { tieu_de, deal: dealIds = [], o_to } = khoi;

  const resolvedDeals = dealIds
    .map((id) => timDealTheoId(id))
    .filter((d): d is NonNullable<typeof d> => {
      if (!d) return false;
      // Do not show unregistered lottery deals
      if (d.may_rui && !d.da_dang_ky) return false;
      // Do not show hidden deals
      if (d.hien_thi === false) return false;
      return true;
    });

  return (
    <section
      id="dang-chay"
      aria-label="Chương trình đang chạy"
      className="relative z-10 bg-bac-ha-nhat py-20 sm:py-24 px-5 sm:px-8 md:px-16"
    >
      <div className="max-w-[1360px] mx-auto flex flex-col gap-10">
        <h2 className="m-0 font-bold text-[40px] sm:text-[54px] md:text-[68px] leading-[0.95] tracking-[-0.04em] text-den">
          {tieu_de}
        </h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 auto-rows-fr">
          {resolvedDeals.map((d) => {
            const isBig = d.id === o_to;

            // Compute prices
            let giaGoc = 0;
            if (d.thanh_phan) {
              for (const tp of d.thanh_phan) {
                const sp = timSanPhamTheoId(tp.id);
                if (sp) giaGoc += sp.gia_ban * tp.so_luong;
              }
            }

            const giaBan = d.gia_combo || (giaGoc > 0 ? giaGoc : null);

            // Card background styles
            const bgClass =
              d.id === "COMBO-PINK"
                ? "bg-[#E8D2CC]"
                : d.id === "DC-05"
                ? "bg-[#CFE3D5]"
                : "bg-white";

            return (
              <Link
                key={d.id}
                href="/deal"
                className={`rounded-[30px] p-7 md:p-8 flex flex-col justify-between gap-4 no-underline text-den shadow-[0_12px_32px_rgba(43,43,42,0.06)] hover:shadow-lg transition-all duration-300 hover:scale-[1.01] ${bgClass} ${
                  isBig ? "md:col-span-2 md:row-span-2 min-h-[340px]" : "min-h-[220px]"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <span className="self-start px-3 py-1 rounded-full bg-white/75 text-[12px] font-bold text-den">
                    {d.loai === "combo"
                      ? "Combo"
                      : d.loai === "mua_x_tang_y"
                      ? "Ưu đãi số lượng"
                      : "Quà tặng"}
                  </span>

                  <strong
                    className={`font-bold tracking-tight text-den leading-[1.15] ${
                      isBig ? "text-[28px] sm:text-[36px]" : "text-[22px] sm:text-[24px]"
                    }`}
                  >
                    {d.ten}
                  </strong>

                  {d.hook && (
                    <p className="m-0 text-[14px] sm:text-[15px] text-xam leading-[1.5]">
                      {d.hook}
                    </p>
                  )}
                </div>

                {giaBan && (
                  <div className="mt-auto pt-2 flex items-baseline gap-2.5">
                    <span
                      className={`font-bold text-den ${
                        isBig ? "text-[32px] sm:text-[38px]" : "text-[24px] sm:text-[26px]"
                      }`}
                    >
                      {dinhDangTien(giaBan)}
                    </span>
                    {giaGoc > giaBan && (
                      <span className="text-[15px] text-xam line-through">
                        {dinhDangTien(giaGoc)}
                      </span>
                    )}
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
