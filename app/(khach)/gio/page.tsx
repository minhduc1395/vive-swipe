"use client";
import { lopNut } from "@/components/ui/Nut";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useDuLieu } from "@/lib/du-lieu-context";
import { dinhDangGia } from "@/lib/dinh-dang";
import { dichQua, dieuKienDeal, tenDeal } from "@/lib/deals/ngon-ngu";
import { tenSanPham, thieuBanEn } from "@/components/deck/ngon-ngu-quet";
import { duongDanAnh } from "@/lib/anh";
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
import { ghiSuKien } from "@/lib/supabase/su-kien";

function layNgayTinhGio(): string {
  return chuanHoaNgay(new Date());
}

/** Ảnh nhỏ; ảnh lỗi (404) thì hiện chữ thương hiệu như khi không có ảnh. */
function AnhHoacChu({
  src,
  alt,
  className,
  chu,
  chuClassName,
}: {
  src: string | null;
  alt: string;
  className: string;
  chu: string;
  chuClassName?: string;
}) {
  const [loi, setLoi] = useState(false);
  if (!src || loi) return <span className={chuClassName}>{chu}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setLoi(true)} />
  );
}

export default function TrangGio() {
  const t = useTranslations("deal");
  const nn = useLocale();
  const { sanPham, deals, timSanPham } = useDuLieu();
  const g = (so: number) => dinhDangGia(so, nn);
  const tenCombo = (id: string, macDinh: string) => {
    const d = deals.find((x) => x.id === id);
    return d ? tenDeal(d, nn) : macDinh;
  };
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
    return tinhGio(gioInput, sanPham, deals, ngay, {
      daThich: danhSachThich,
    });
  }, [gioInput, sanPham, deals, danhSachThich]);

  const dieuKienCongThem = useMemo(() => {
    if (ketQua.qua_cong_them.length === 0) return null;
    const deal = deals.find(
      (d) =>
        d.nhom_qua === "cong_them" &&
        d.dieu_kien &&
        (d.moc?.some((m) => ketQua.qua_cong_them.includes(m.qua)) ||
          (d.qua != null && ketQua.qua_cong_them.includes(d.qua)))
    );
    return deal ? dieuKienDeal(deal, nn) ?? null : null;
  }, [ketQua.qua_cong_them, deals, nn]);

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
    ghiSuKien("them_combo", { deal_id: dealId });
  };

  return (
    <div className="max-w-[1280px] w-full mx-auto flex-1 flex flex-col min-h-0 bg-trang text-den font-sans overflow-hidden">
        {/* Header */}
        <header className="px-5 pt-7 pb-2 flex items-baseline gap-2 shrink-0">
          <h1 className="tieu-de-trang">{t("gio.tieuDe")}</h1>
          <span suppressHydrationWarning className="text-[15px] text-xam">
            {t("gio.soMon", { so: tongSoLuongGio })}
          </span>
        </header>

        {/* Nội dung giỏ hàng */}
        {!daSanSang ? (
          <div className="flex-1" />
        ) : gioHang.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-kem flex items-center justify-center mb-4 text-den">
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
              {t("gio.trong")}
            </p>
            <p className="text-[14px] text-xam max-w-[280px] mb-6">
              {t("gio.trongMoTa")}
            </p>
            <div className="flex gap-3">
              <Link
                href="/quet"
                className={lopNut("chinh")}
              >
                {t("gio.batDauQuet")}
              </Link>
              <Link
                href="/danh-muc"
                className="h-11 px-5 rounded-full bg-trang text-den border border-hong text-[14px] font-semibold inline-flex items-center justify-center"
              >
                {t("gio.xemDanhMuc")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-2 pb-12">
            <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start flex flex-col gap-6 max-w-[1280px] mx-auto">
              {/* Cột trái: Quà theo hóa đơn, Mốc tiếp theo, Đổi combo, và Danh sách sản phẩm */}
              <div className="flex flex-col gap-5 min-w-0">
                {/* 1. Phần Quà theo hóa đơn & Mốc tiếp theo & Đổi combo */}
            {(ketQua.qua_du_kien ||
              ketQua.qua_cong_them.length > 0 ||
              ketQua.moc_tiep_theo) && (
              <section
                aria-label={t("gio.quaTheoHoaDon")}
                className="rounded-[22px] bg-kem p-4 flex flex-col gap-3"
              >
                {/* Quà dự kiến */}
                {ketQua.qua_du_kien && (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-oliu-vua text-den flex items-center justify-center shrink-0">
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
                        {t("gio.quaDuKienDai", { qua: dichQua(ketQua.qua_du_kien, deals, nn) })}
                      </strong>
                      <span className="text-[13px] text-xam-dam">
                        {t("gio.moiHoaDon")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quà cộng thêm (lượt quay...), không thay quà theo hóa đơn */}
                {ketQua.qua_cong_them.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {ketQua.qua_cong_them.map((qua) => (
                      <strong
                        key={qua}
                        className="text-[15px] font-semibold text-den"
                      >
                        {t("gio.them", { qua: dichQua(qua, deals, nn) })}
                      </strong>
                    ))}
                    {dieuKienCongThem && (
                      <span className="text-[13px] text-xam-dam">
                        {dieuKienCongThem}
                      </span>
                    )}
                  </div>
                )}

                {/* Thanh tới mốc quà tiếp theo */}
                {ketQua.moc_tiep_theo && (
                  <>
                    {(ketQua.qua_du_kien || ketQua.qua_cong_them.length > 0) && (
                      <div className="h-[1px] bg-vien" />
                    )}
                    <p className="m-0 text-[14px] leading-[1.45] text-den">
                      {t.rich(ketQua.moc_tiep_theo.nhan_ap_dung ? "gio.mocTiepNhan" : "gio.mocTiep", {
                        tien: g(ketQua.moc_tiep_theo.con_thieu),
                        nhan: ketQua.moc_tiep_theo.nhan_ap_dung?.join(", ") ?? "",
                        qua: dichQua(ketQua.moc_tiep_theo.qua, deals, nn),
                        b: (chunks) => <strong className="font-bold text-den">{chunks}</strong>,
                      })}
                    </p>

                    {/* Progress Bar */}
                    <div
                      role="img"
                      aria-label={t("gio.tienDo", {
                        hienTai: g(ketQua.moc_tiep_theo.muc_hien_tai),
                        muc: g(ketQua.moc_tiep_theo.moc_muc_tieu),
                      })}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="h-2 rounded-full bg-trang overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-oliu transition-all duration-300"
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
                      <div className="flex justify-between text-[12px] text-xam-dam">
                        <span>
                          {t("gio.dangCo", { tien: g(ketQua.moc_tiep_theo.muc_hien_tai) })}
                        </span>
                        <span>
                          {t("gio.mocMucTieu", { tien: g(ketQua.moc_tiep_theo.moc_muc_tieu) })}
                        </span>
                      </div>
                    </div>

                    {/* Gợi ý món từ Đã thích */}
                    {ketQua.moc_tiep_theo.goi_y.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        <span className="text-[12px] font-medium text-xam">
                          {t("gio.goiYDaThich")}
                        </span>
                        {ketQua.moc_tiep_theo.goi_y.map((spGoiY) => {
                          const anhGoiY = duongDanAnh(spGoiY.anh, "nho");
                          return (
                            <div
                              key={spGoiY.id}
                              className="flex items-center gap-2.5 bg-trang rounded-[14px] p-2.5 shadow-xs"
                            >
                              <div
                                role="img"
                                aria-label={t("gio.anhSanPham")}
                                className="w-12 h-12 rounded-xl bg-kem text-[10px] font-semibold tracking-wider uppercase text-xam-dam flex items-center justify-center shrink-0 overflow-hidden"
                              >
                                <AnhHoacChu
                                  key={anhGoiY}
                                  src={anhGoiY}
                                  alt={tenSanPham(spGoiY, nn)}
                                  className="w-10 h-10 object-contain"
                                  chu={spGoiY.thuong_hieu}
                                />
                              </div>
                              <div className="flex-1 flex flex-col min-w-0 text-[13px]">
                                <span className="text-xam text-[11px]">
                                  {spGoiY.thuong_hieu}
                                </span>
                                <strong
                                  data-thieu-en={thieuBanEn(spGoiY, nn)}
                                  className="font-semibold text-den truncate"
                                >
                                  {tenSanPham(spGoiY, nn)} · {g(spGoiY.gia_ban)}
                                </strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleThemGoiY(spGoiY.id)}
                                className="h-9 px-3 rounded-full bg-be hover:opacity-90 text-den font-semibold text-[13px] shrink-0 transition-transform active:scale-95 cursor-pointer"
                              >
                                {t("gio.themNhanh")}
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
                aria-label={t("gio.goiYDoiCombo")}
                className="rounded-[18px] bg-oliu-nhat border border-be p-3.5 flex flex-col gap-2"
              >
                {ketQua.goi_y_doi_combo.map((combo) => (
                  <div
                    key={combo.deal_id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-den uppercase tracking-wide">
                        {t("gio.goiYComboTieuDe")}
                      </span>
                      <strong className="text-[14px] font-semibold text-den truncate">
                        {t("gio.doiSang", { ten: tenCombo(combo.deal_id, combo.ten) })}
                      </strong>
                      <span className="text-[12px] text-xam">
                        {t("gio.tietKiemThem", { tiet: g(combo.tiet_kiem), gia: g(combo.gia_combo) })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleDoiCombo(combo.deal_id, combo.thanh_phan)
                      }
                      className={lopNut("chinh","nho")}
                    >
                      {t("gio.doiCombo")}
                    </button>
                  </div>
                ))}
              </section>
            )}

            {/* 2. Danh sách sản phẩm trong giỏ */}
            <section
              aria-label={t("gio.sanPhamTrongGio")}
              className="flex flex-col divide-y divide-vien"
            >
              {ketQua.cac_dong.map((dong) => {
                const sp =
                  dong.loai === "san_pham" ? timSanPham(dong.id) : null;

                const bgAnh =
                  sp?.danh_muc === "mat-na" || sp?.danh_muc === "kem-duong"
                    ? "bg-oliu-nhat"
                    : "bg-kem";

                const anhSrc = duongDanAnh(sp?.anh, "nho");
                const tenDong =
                  dong.loai === "combo"
                    ? tenCombo(dong.id, dong.ten)
                    : sp
                      ? tenSanPham(sp, nn)
                      : dong.ten;
                const thieuEnDong =
                  dong.loai === "san_pham" && sp
                    ? thieuBanEn(sp, nn)
                    : nn === "en" && dong.loai === "san_pham"
                      ? ""
                      : undefined;

                return (
                  <article
                    key={`${dong.loai}-${dong.id}`}
                    className="hien-dan flex gap-3 py-3.5 first:pt-0"
                  >
                    {/* Ảnh sản phẩm / combo */}
                    <div
                      role="img"
                      aria-label={t("gio.anhMucGio")}
                      className={`relative w-[76px] h-[76px] rounded-[16px] ${bgAnh} flex items-center justify-center shrink-0 overflow-hidden`}
                    >
                      {dong.loai === "combo" && (
                        <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-hong text-den text-[10px] font-bold">
                          {t("gio.nhanCombo")}
                        </span>
                      )}
                      <AnhHoacChu
                        key={anhSrc}
                        src={anhSrc}
                        alt={tenDong}
                        className="w-14 h-14 object-contain"
                        chu={dong.thuong_hieu}
                        chuClassName="text-[10px] font-bold uppercase tracking-wider text-xam-dam px-1 text-center"
                      />
                    </div>

                    {/* Thông tin dòng */}
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <span className="text-[11px] font-semibold tracking-[1.2px] text-xam uppercase truncate">
                        {dong.thuong_hieu}
                      </span>
                      <strong
                        data-thieu-en={thieuEnDong}
                        className="text-[15px] font-semibold text-den leading-[1.3] line-clamp-2"
                      >
                        {tenDong}
                      </strong>

                      {/* Tag deal nếu có */}
                      {dong.deal_ap_dung.includes("LOPOE-25") && (
                        <span className="self-start px-2 py-0.5 rounded-full bg-be text-den text-[11px] font-semibold">
                          {t("gio.giam25")}
                        </span>
                      )}

                      {/* Giá và nút tăng giảm số lượng */}
                      <div className="flex items-center justify-between mt-1">
                        {(() => {
                          const laDealGiamDong = dong.deal_ap_dung.includes("LOPOE-25");
                          const giaHienThi =
                            dong.loai === "combo" || laDealGiamDong
                              ? dong.gia_sau_uu_dai
                              : dong.gia_goc_dong;
                          const coGachGia =
                            laDealGiamDong &&
                            dong.gia_sau_uu_dai < dong.gia_goc_dong;

                          return (
                            <div className="flex items-baseline gap-1.5">
                              <strong className="text-[16px] font-bold text-den whitespace-nowrap">
                                {g(giaHienThi)}
                              </strong>
                              {coGachGia && (
                                <s className="text-[12px] text-xam whitespace-nowrap">
                                  {g(dong.gia_goc_dong)}
                                </s>
                              )}
                            </div>
                          );
                        })()}

                        {/* Nút cộng trừ */}
                        <div className="flex items-center border border-hong rounded-full overflow-hidden bg-trang">
                          <button
                            type="button"
                            aria-label={t("gio.giamSoLuong")}
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
                            aria-label={t("gio.tangSoLuong")}
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
          </div>

          {/* Cột phải: Tóm tắt đơn hàng dính trên máy tính */}
          <div className="lg:sticky lg:top-6 flex flex-col gap-4 bg-kem p-5 md:p-6 rounded-[24px] border border-vien shadow-xs">
            <h2 className="m-0 text-[18px] font-bold text-den">
              {t("gio.tomTat")}
            </h2>

            {/* 3. Tổng tiền */}
            <section
              aria-label={t("gio.tongTien")}
              className="flex flex-col gap-2 pt-2 text-[14px] border-t border-vien"
            >
              <div className="flex justify-between text-xam">
                <span>{t("gio.tamTinh")}</span>
                <span className="text-den font-medium">
                  {g(ketQua.tong_le)}
                </span>
              </div>

              {ketQua.tiet_kiem > 0 && (
                <div className="flex justify-between text-den font-semibold">
                  <span>{t("gio.banTietKiem")}</span>
                  <span>−{g(ketQua.tiet_kiem)}</span>
                </div>
              )}

              {ketQua.qua_du_kien && (
                <div className="flex justify-between text-xam">
                  <span>{t("gio.quaDuKien")}</span>
                  <span className="text-den font-semibold">
                    {dichQua(ketQua.qua_du_kien, deals, nn)}
                  </span>
                </div>
              )}

              <div className="h-[1px] bg-vien my-1" />

              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-den text-[16px]">
                  {t("gio.tongUocTinh")}
                </span>
                <span className="text-[24px] font-bold text-den">
                  {g(ketQua.tong_tam_tinh)}
                </span>
              </div>

              <p className="m-0 mt-1.5 text-[12px] leading-[1.5] text-xam">
                {t("gio.luuY")}
              </p>
            </section>

            {/* 4. Nút Giữ hàng tại booth */}
            <div className="flex flex-col gap-2 items-center pt-2">
              <Link
                href="/giu-hang"
                onClick={() =>
                  ghiSuKien("bat_dau_giu_hang", {
                    so_luong: tongSoLuongGio,
                    tong_tam_tinh: ketQua.tong_tam_tinh,
                  })
                }
                className={lopNut("dam","lon",true) + " h-14 text-[17px] shadow-sm"}
              >
                {t("gio.giuHang")}
              </Link>
              <span className="text-[12px] text-xam text-center">
                {t("gio.diaChiBooth")}
              </span>
            </div>
          </div>
            </div>
          </div>
        )}
      </div>
  );
}
