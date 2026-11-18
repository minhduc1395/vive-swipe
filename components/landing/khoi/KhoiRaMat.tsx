"use client";

import Link from "next/link";
import type { KhoiRaMat as KhoiRaMatType } from "@/lib/chien-dich/types";
import { timDealTheoId, timSanPhamTheoId } from "@/lib/data";
import { dinhDangTienGio } from "@/lib/dinh-dang";
import { themComboVaoGio } from "@/lib/kho-luu-tru";

interface KhoiRaMatProps {
  khoi: KhoiRaMatType;
}

export function KhoiRaMat({ khoi }: KhoiRaMatProps) {
  const { tieu_de, mo_ta, deal: dealIds = [], anh_san_pham = {} } = khoi;

  const resolvedDeals = dealIds
    .map((id) => timDealTheoId(id))
    .filter(
      (d): d is NonNullable<typeof d> =>
        Boolean(d) && (!d?.may_rui || d?.da_dang_ky) && d?.hien_thi !== false
    );

  return (
    <section
      id="ke-ra-mat"
      aria-label="Kệ ra mắt"
      className="relative z-10 bg-transparent"
    >
      {/* Phần tiêu đề kệ nằm dưới vùng 3D trên màn nhỏ và bên trái trên máy tính */}
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:pl-[120px] md:pr-8 lg:px-16 pt-[46dvh] lg:pt-20 pb-8 lg:pb-12">
        <div className="w-full lg:max-w-[44%] lg:min-h-[30dvh] flex flex-col justify-center gap-3 md:gap-4 bg-hong-nhat/65 lg:bg-transparent backdrop-blur-[2px] lg:backdrop-blur-none rounded-[24px] p-4 lg:p-0">
          <h2 className="m-0 font-bold text-[clamp(30px,7.5vw,42px)] sm:text-[50px] lg:text-[64px] leading-[0.95] tracking-[-0.04em] text-den">
            {tieu_de}
          </h2>
          {mo_ta && (
            <p className="m-0 text-[15px] sm:text-[17px] leading-[1.6] text-xam max-w-[420px]">
              {mo_ta}
            </p>
          )}
        </div>
      </div>

      {/* Kệ sản phẩm nền trắng phía dưới tiêu đề */}
      <div className="bg-white rounded-t-[32px] md:rounded-t-[44px] py-14 sm:py-18 px-5 sm:px-8 md:pl-[120px] md:pr-8 lg:px-16 shadow-[0_-12px_40px_rgba(43,43,42,0.04)]">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {resolvedDeals.map((d, idx) => {
            const thanhPhan = (d.thanh_phan || []).map((tp) => {
              const sp = timSanPhamTheoId(tp.id);
              return { ...tp, sp };
            });

            const giaGoc = thanhPhan.reduce(
              (acc, item) => acc + (item.sp?.gia_ban || 0) * item.so_luong,
              0
            );
            const giaBan = d.gia_combo || giaGoc;
            const rotY =
              idx === 0
                ? "md:rotate-y-[6deg]"
                : idx === 2
                ? "md:rotate-y-[-6deg]"
                : "";

            return (
              <article
                key={d.id}
                className="perspective-1000 group transition-all duration-300"
              >
                <div
                  className={`rounded-[30px] bg-linear-to-b from-white to-hong-nhat p-7 flex flex-col gap-4 shadow-[0_20px_45px_rgba(43,43,42,0.08)] min-h-[420px] transition-transform duration-300 hover:scale-[1.02] ${rotY}`}
                >
                  <div className="h-[200px] flex items-end justify-center gap-3 pb-3">
                    {thanhPhan.map((item, itemIdx) => {
                      const imgPath =
                        anh_san_pham[item.id] ??
                        (item.sp?.anh
                          ? item.sp.anh.startsWith("/")
                            ? item.sp.anh
                            : `/products/${item.sp.anh}`
                          : null);

                      if (!imgPath) return null;

                      return (
                        <div
                          key={itemIdx}
                          className="relative flex flex-col items-center"
                          style={{
                            transform: `rotate(${
                              itemIdx === 0 ? -4 : itemIdx === 1 ? 4 : 0
                            }deg)`,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgPath}
                            alt={item.sp?.ten_hien_thi || ""}
                            className="max-h-[160px] w-auto object-contain drop-shadow-md select-none"
                            loading="lazy"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <span className="text-[12px] font-bold tracking-[1px] text-xam uppercase">
                    COMBO ƯU ĐÃI
                  </span>
                  <h3 className="m-0 text-[22px] sm:text-[24px] font-bold tracking-[-0.4px] text-den leading-[1.2]">
                    {d.ten}
                  </h3>

                  <div className="mt-auto pt-4 flex items-baseline gap-2.5">
                    <span className="text-[26px] sm:text-[28px] font-bold text-den">
                      {dinhDangTienGio(giaBan)}
                    </span>
                    {giaGoc > giaBan && (
                      <span className="text-[15px] text-xam line-through">
                        {dinhDangTienGio(giaGoc)}
                      </span>
                    )}
                  </div>

                  {d.qua && (
                    <p className="m-0 text-[13px] text-xam">
                      {d.qua} (khi còn quà)
                    </p>
                  )}

                  <Link
                    href="/gio"
                    onClick={() => themComboVaoGio(d.id, 1)}
                    className="mt-2 w-full min-h-[44px] h-11 rounded-full bg-den text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-black transition-colors"
                  >
                    Thêm vào giỏ
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
