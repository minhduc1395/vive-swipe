"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";
import { ThanhTab } from "@/components/ThanhTab";
import { DEALS, SAN_PHAM, timSanPhamTheoId } from "@/lib/data";
import { dinhDangTien } from "@/lib/dinh-dang";
import { chuanHoaNgay } from "@/lib/deals/hien-thi";
import {
  tinhGio,
  type MucGioInput,
  type KetQuaTinhGio,
  type DongGioHang,
} from "@/lib/deals/gio-hang";
import {
  layGioHang,
  layDanhSachDaThich,
  themVaoGio,
  capNhatSoLuongGio,
  giamSoLuongGio,
  doiSangCombo,
  type ItemGioHang,
} from "@/lib/kho-luu-tru";

function layNgayTinhGio(): string {
  if (typeof window === "undefined") return "2026-11-17";
  const homNay = chuanHoaNgay(new Date());
  // Nếu ngày hiện tại ngoài khung thời gian pop-up thì dùng ngày đại diện 2026-11-17
  if (homNay < "2026-11-14" || homNay > "2026-11-29") {
    return "2026-11-17";
  }
  return homNay;
}

export default function TrangGio() {
  const [gioHang, setGioHang] = useState<ItemGioHang[]>([]);
  const [danhSachThich, setDanhSachThich] = useState<string[]>([]);
  const [daSanSang, setDaSanSang] = useState(false);

  const taiDuLieu = () => {
    setGioHang(layGioHang());
    setDanhSachThich(layDanhSachDaThich());
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    taiDuLieu();
    setDaSanSang(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const handleStorage = () => taiDuLieu();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("vive_storage_update", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("vive_storage_update", handleStorage);
    };
  }, []);

  const gioInput: MucGioInput[] = useMemo(() => {
    return gioHang.map((m) => {
      if (m.loai === "combo" || m.dealId) {
        return {
          loai: "combo" as const,
          deal_id: (m.dealId || m.sanPhamId) as string,
          so_luong: m.soLuong,
        };
      }
      return {
        loai: "san_pham" as const,
        san_pham_id: m.sanPhamId as string,
        so_luong: m.soLuong,
      };
    });
  }, [gioHang]);

  const ketQua: KetQuaTinhGio = useMemo(() => {
    const ngay = layNgayTinhGio();
    return tinhGio(gioInput, SAN_PHAM, DEALS, ngay, {
      daThich: danhSachThich,
    });
  }, [gioInput, danhSachThich]);

  const tongSoLuongGio = useMemo(() => {
    return gioHang.reduce((sum, item) => sum + item.soLuong, 0);
  }, [gioHang]);

  const handleTangSoLuong = (dong: DongGioHang) => {
    capNhatSoLuongGio(dong.id, dong.so_luong + 1, dong.loai);
    setGioHang(layGioHang());
  };

  const handleGiamSoLuong = (dong: DongGioHang) => {
    giamSoLuongGio(dong.id, dong.loai);
    setGioHang(layGioHang());
  };

  const handleThemGoiY = (id: string) => {
    themVaoGio(id, 1);
    setGioHang(layGioHang());
  };

  const handleDoiCombo = (
    dealId: string,
    thanhPhan: Array<{ id: string; so_luong: number }>
  ) => {
    doiSangCombo(dealId, thanhPhan);
    setGioHang(layGioHang());
  };

  return (
    <KhungDienThoai>
      <div className="flex-1 flex flex-col min-h-0 bg-trang text-den font-sans overflow-hidden">
        {/* Header */}
        <header className="px-5 pt-7 pb-2 flex items-baseline gap-2 shrink-0">
          <h1 className="m-0 text-[28px] font-semibold tracking-tight">Giỏ hàng</h1>
          <span suppressHydrationWarning className="text-[15px] text-xam">
            {tongSoLuongGio} món
          </span>
        </header>

        {/* Nội dung giỏ hàng */}
        {!daSanSang ? (
          <div className="flex-1" />
        ) : gioHang.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-hong-nhat flex items-center justify-center mb-4 text-[#D96B6B]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <p className="text-[17px] font-semibold text-den mb-1">
              Giỏ đang trống. Quẹt lên để thêm nhanh.
            </p>
            <p className="text-[14px] text-xam max-w-[280px] mb-6">
              Bạn có thể vuốt thẻ lên trong khi quẹt hoặc bấm nút thêm giỏ ở trang Danh mục.
            </p>
            <div className="flex gap-3">
              <Link
                href="/quet"
                className="h-11 px-5 rounded-full bg-den text-trang text-[14px] font-semibold inline-flex items-center justify-center shadow-sm"
              >
                Bắt đầu quẹt
              </Link>
              <Link
                href="/danh-muc"
                className="h-11 px-5 rounded-full bg-trang text-den border border-[#E8D2CC] text-[14px] font-semibold inline-flex items-center justify-center"
              >
                Xem danh mục
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-8 flex flex-col gap-4">
            {/* 1. Phần Quà theo hóa đơn & Mốc tiếp theo & Đổi combo */}
            {(ketQua.qua_du_kien || ketQua.moc_tiep_theo) && (
              <section
                aria-label="Quà theo hóa đơn"
                className="rounded-[22px] bg-[#F7EEEB] p-4 flex flex-col gap-3"
              >
                {/* Quà dự kiến */}
                {ketQua.qua_du_kien && (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-den text-trang flex items-center justify-center shrink-0">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 12v10H4V12" />
                        <path d="M2 7h20v5H2z" />
                        <path d="M12 22V7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <strong className="text-[15px] font-semibold text-den">
                        Quà dự kiến: {ketQua.qua_du_kien}
                      </strong>
                      <span className="text-[13px] text-[#5C5C5B]">
                        Mỗi hóa đơn nhận 1 quà có giá trị cao nhất
                      </span>
                    </div>
                  </div>
                )}

                {/* Thanh tới mốc quà tiếp theo */}
                {ketQua.moc_tiep_theo && (
                  <>
                    {ketQua.qua_du_kien && (
                      <div className="h-[1px] bg-[#E8D2CC]" />
                    )}
                    <p className="m-0 text-[14px] leading-[1.45] text-den">
                      Thêm{" "}
                      <strong className="font-bold text-den">
                        {dinhDangTien(ketQua.moc_tiep_theo.con_thieu)}đ
                      </strong>{" "}
                      {ketQua.moc_tiep_theo.nhan_ap_dung
                        ? `sản phẩm ${ketQua.moc_tiep_theo.nhan_ap_dung.join(
                            ", "
                          )} `
                        : ""}
                      để nhận{" "}
                      <strong className="font-bold text-den">
                        {ketQua.moc_tiep_theo.qua}
                      </strong>
                    </p>

                    {/* Progress Bar */}
                    <div
                      role="img"
                      aria-label={`Đã có ${dinhDangTien(
                        ketQua.moc_tiep_theo.muc_hien_tai
                      )} trên mốc ${dinhDangTien(
                        ketQua.moc_tiep_theo.moc_muc_tieu
                      )}`}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="h-2 rounded-full bg-trang overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-den transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                5,
                                Math.round(
                                  (ketQua.moc_tiep_theo.muc_hien_tai /
                                    ketQua.moc_tiep_theo.moc_muc_tieu) *
                                    100
                                )
                              )
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[12px] text-[#5C5C5B]">
                        <span>
                          Đang có {dinhDangTien(ketQua.moc_tiep_theo.muc_hien_tai)}đ
                        </span>
                        <span>
                          Mốc {dinhDangTien(ketQua.moc_tiep_theo.moc_muc_tieu)}đ
                        </span>
                      </div>
                    </div>

                    {/* Gợi ý món từ Đã thích */}
                    {ketQua.moc_tiep_theo.goi_y.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        <span className="text-[12px] font-medium text-xam">
                          Gợi ý từ danh sách Đã thích:
                        </span>
                        {ketQua.moc_tiep_theo.goi_y.map((spGoiY) => {
                          return (
                            <div
                              key={spGoiY.id}
                              className="flex items-center gap-2.5 bg-trang rounded-[14px] p-2.5 shadow-xs"
                            >
                              <div
                                role="img"
                                aria-label="Ảnh sản phẩm"
                                className="w-12 h-12 rounded-xl bg-hong-nhat text-[10px] font-semibold tracking-wider uppercase text-[#5C5C5B] flex items-center justify-center shrink-0 overflow-hidden"
                              >
                                {spGoiY.anh ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={spGoiY.anh}
                                    alt={spGoiY.ten_hien_thi}
                                    className="w-10 h-10 object-contain"
                                  />
                                ) : (
                                  spGoiY.thuong_hieu
                                )}
                              </div>
                              <div className="flex-1 flex flex-col min-w-0 text-[13px]">
                                <span className="text-xam text-[11px]">
                                  {spGoiY.thuong_hieu}
                                </span>
                                <strong className="font-semibold text-den truncate">
                                  {spGoiY.ten_hien_thi} · {dinhDangTien(spGoiY.gia_ban)}đ
                                </strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleThemGoiY(spGoiY.id)}
                                className="h-9 px-3 rounded-full bg-[#CFE3D5] hover:bg-[#BCD7C4] text-den font-semibold text-[13px] shrink-0 transition-transform active:scale-95 cursor-pointer"
                              >
                                + Thêm
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* Gợi ý đổi combo nếu có */}
            {ketQua.goi_y_doi_combo.length > 0 && (
              <section
                aria-label="Gợi ý đổi combo"
                className="rounded-[18px] bg-[#EAF3ED] border border-[#CFE3D5] p-3.5 flex flex-col gap-2"
              >
                {ketQua.goi_y_doi_combo.map((combo) => (
                  <div
                    key={combo.deal_id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-[#1F7A4C] uppercase tracking-wide">
                        Gợi ý combo tiết kiệm
                      </span>
                      <strong className="text-[14px] font-semibold text-den truncate">
                        Đổi sang {combo.ten}
                      </strong>
                      <span className="text-[12px] text-xam">
                        Tiết kiệm thêm {dinhDangTien(combo.tiet_kiem)}đ (giá {dinhDangTien(combo.gia_combo)}đ)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDoiCombo(combo.deal_id, combo.thanh_phan)
                      }
                      className="h-9 px-3.5 rounded-full bg-den hover:bg-black text-trang font-semibold text-[13px] shrink-0 cursor-pointer transition-transform active:scale-95"
                    >
                      Đổi combo
                    </button>
                  </div>
                ))}
              </section>
            )}

            {/* 2. Danh sách sản phẩm trong giỏ */}
            <section
              aria-label="Sản phẩm trong giỏ"
              className="flex flex-col divide-y divide-[#F2E4E0]"
            >
              {ketQua.cac_dong.map((dong) => {
                const sp =
                  dong.loai === "san_pham" ? timSanPhamTheoId(dong.id) : null;

                const bgAnh =
                  sp?.danh_muc === "mat-na" || sp?.danh_muc === "kem-duong"
                    ? "bg-[#EAF3ED]"
                    : "bg-[#F7EEEB]";

                const anhSrc = sp?.anh;
                const coUuDai = dong.don_gia_sau_uu_dai < dong.don_gia_goc;

                return (
                  <article
                    key={`${dong.loai}-${dong.id}`}
                    className="flex gap-3 py-3.5 first:pt-0"
                  >
                    {/* Ảnh sản phẩm / combo */}
                    <div
                      role="img"
                      aria-label="Ảnh mục giỏ hàng"
                      className={`relative w-[76px] h-[76px] rounded-[16px] ${bgAnh} flex items-center justify-center shrink-0 overflow-hidden`}
                    >
                      {dong.loai === "combo" && (
                        <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-den text-trang text-[10px] font-bold">
                          COMBO
                        </span>
                      )}
                      {anhSrc ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={anhSrc}
                          alt={dong.ten}
                          className="w-14 h-14 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C5C5B] px-1 text-center">
                          {dong.thuong_hieu}
                        </span>
                      )}
                    </div>

                    {/* Thông tin dòng */}
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <span className="text-[11px] font-semibold tracking-[1.2px] text-xam uppercase truncate">
                        {dong.thuong_hieu}
                      </span>
                      <strong className="text-[15px] font-semibold text-den leading-[1.3] line-clamp-2">
                        {dong.ten}
                      </strong>

                      {/* Tag deal nếu có */}
                      {dong.deal_ap_dung.includes("LOPOE-25") && (
                        <span className="self-start px-2 py-0.5 rounded-full bg-[#CFE3D5] text-den text-[11px] font-semibold">
                          Giảm 25% vì mua kèm
                        </span>
                      )}

                      {/* Giá và nút tăng giảm số lượng */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <strong className="text-[16px] font-bold text-den">
                            {dinhDangTien(dong.gia_sau_uu_dai)}đ
                          </strong>
                          {coUuDai && (
                            <s className="text-[12px] text-xam">
                              {dinhDangTien(dong.gia_goc_dong)}đ
                            </s>
                          )}
                        </div>

                        {/* Nút cộng trừ */}
                        <div className="flex items-center border border-[#E8D2CC] rounded-full overflow-hidden bg-trang">
                          <button
                            type="button"
                            aria-label="Giảm số lượng"
                            onClick={() => handleGiamSoLuong(dong)}
                            className="w-9 h-9 flex items-center justify-center text-[18px] text-den hover:bg-neutral-100 cursor-pointer active:scale-95"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-[14px] font-semibold text-den">
                            {dong.so_luong}
                          </span>
                          <button
                            type="button"
                            aria-label="Tăng số lượng"
                            onClick={() => handleTangSoLuong(dong)}
                            className="w-9 h-9 flex items-center justify-center text-[18px] text-den hover:bg-neutral-100 cursor-pointer active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* 3. Tổng tiền */}
            <section
              aria-label="Tổng tiền"
              className="flex flex-col gap-2 pt-2 text-[14px] border-t border-[#F2E4E0]"
            >
              <div className="flex justify-between text-xam">
                <span>Tạm tính theo giá lẻ</span>
                <span className="text-den font-medium">
                  {dinhDangTien(ketQua.tong_le)}đ
                </span>
              </div>

              {ketQua.tiet_kiem > 0 && (
                <div className="flex justify-between text-[#1F7A4C] font-semibold">
                  <span>Ưu đãi</span>
                  <span>−{dinhDangTien(ketQua.tiet_kiem)}đ</span>
                </div>
              )}

              {ketQua.qua_du_kien && (
                <div className="flex justify-between text-xam">
                  <span>Quà dự kiến</span>
                  <span className="text-den font-semibold">
                    {ketQua.qua_du_kien}
                  </span>
                </div>
              )}

              <div className="h-[1px] bg-[#F2E4E0] my-1" />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-den text-[16px]">
                  Tổng ước tính
                </span>
                <span className="text-[24px] font-bold text-den">
                  {dinhDangTien(ketQua.tong_tam_tinh)}đ
                </span>
              </div>

              <p className="m-0 mt-1.5 text-[12px] leading-[1.5] text-xam">
                Giá và quà là ước tính. Nhân viên xác nhận khi thanh toán tại booth. Quà số lượng có hạn.
              </p>
            </section>

            {/* 4. Nút Giữ hàng tại booth */}
            <div className="flex flex-col gap-2 items-center pt-2">
              <Link
                href="/giu-hang"
                className="w-full h-14 rounded-full bg-den hover:bg-black text-trang flex items-center justify-center font-semibold text-[17px] shadow-sm transition-transform active:scale-[0.99] no-underline"
              >
                Giữ hàng tại booth
              </Link>
              <span className="text-[12px] text-xam text-center">
                Trả tiền và nhận hàng tại VIVE, tầng LL2 Union Square
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Thanh tab dưới */}
      <ThanhTab soLuongThich={danhSachThich.length} soLuongGio={tongSoLuongGio} />
    </KhungDienThoai>
  );
}
