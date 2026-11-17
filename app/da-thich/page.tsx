"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";
import { ThanhTab } from "@/components/ThanhTab";
import { BangChiTiet } from "@/components/deck/BangChiTiet";
import { timSanPhamTheoId } from "@/lib/data";
import type { SanPham } from "@/lib/data/types";
import { dinhDangTien } from "@/lib/dinh-dang";
import {
  layDanhSachDaThich,
  themDaThich,
  xoaDaThich,
  layGioHang,
  themVaoGio,
  type ItemGioHang,
} from "@/lib/kho-luu-tru";

const DANH_MUC_LABEL: Record<string, string> = {
  "sua-rua-mat": "Sữa rửa mặt",
  "nuoc-can-bang": "Nước cân bằng",
  "toner-pad": "Toner pad",
  "tinh-chat": "Tinh chất",
  "kem-duong": "Kem dưỡng",
  "mat-na": "Mặt nạ",
  "chong-nang": "Chống nắng",
  "trang-diem": "Trang điểm",
  "duong-moi": "Dưỡng môi",
  "mieng-dan": "Miếng dán mụn",
  "duong-the": "Chăm sóc cơ thể",
  "thiet-bi": "Thiết bị làm đẹp",
};

const MAP_GHI_CHU_DEAL: Record<string, string> = {
  "LOPOE-CF": "Mua kèm: còn 186.000",
  "LOPOE-AMP": "Mua kèm: còn 314.000",
  "LOPOE-CR": "Mua kèm: còn 411.000",
  "8800256114320": "Có trong COMBO PINK",
  "8800256114351": "Có trong COMBO PINK",
};

export default function TrangDaThich() {
  const [danhSachThich, setDanhSachThich] = useState<string[]>([]);
  const [gioHang, setGioHang] = useState<ItemGioHang[]>([]);
  const [danhMucChon, setDanhMucChon] = useState<string>("all");
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState<SanPham | null>(null);
  const [thongBao, setThongBao] = useState<string | null>(null);
  const [daSanSang, setDaSanSang] = useState(false);

  const taiDuLieu = () => {
    setDanhSachThich(layDanhSachDaThich());
    setGioHang(layGioHang());
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

  const sanPhamThich = useMemo(() => {
    return danhSachThich
      .map((id) => timSanPhamTheoId(id))
      .filter((sp): sp is SanPham => Boolean(sp));
  }, [danhSachThich]);

  // Bộ lọc danh mục theo các món đang có trong Đã thích
  const danhSachLoc = useMemo(() => {
    const demTheoDanhMuc: Record<string, number> = {};
    for (const sp of sanPhamThich) {
      demTheoDanhMuc[sp.danh_muc] = (demTheoDanhMuc[sp.danh_muc] ?? 0) + 1;
    }

    const cacMuc = [
      { id: "all", label: "Tất cả", count: sanPhamThich.length },
    ];

    for (const [dm, count] of Object.entries(demTheoDanhMuc)) {
      cacMuc.push({
        id: dm,
        label: DANH_MUC_LABEL[dm] ?? dm,
        count,
      });
    }

    return cacMuc;
  }, [sanPhamThich]);

  const sanPhamHienThi = useMemo(() => {
    if (danhMucChon === "all") return sanPhamThich;
    return sanPhamThich.filter((sp) => sp.danh_muc === danhMucChon);
  }, [sanPhamThich, danhMucChon]);

  const tongSoLuongGio = useMemo(() => {
    return gioHang.reduce((sum, item) => sum + item.soLuong, 0);
  }, [gioHang]);

  const handleBoThich = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    xoaDaThich(id);
    setDanhSachThich((prev) => prev.filter((item) => item !== id));
  };

  const handleThemVaoGio = (sp: SanPham, e: React.MouseEvent) => {
    e.stopPropagation();
    themVaoGio(sp.id, 1);
    setGioHang(layGioHang());
    setThongBao(`Đã thêm "${sp.ten_hien_thi}" vào giỏ`);
    setTimeout(() => setThongBao(null), 2500);
  };

  return (
    <KhungDienThoai>
      <div className="flex-1 flex flex-col min-h-0 bg-trang text-den font-sans overflow-hidden">
        {/* Header */}
        <header className="px-5 pt-7 pb-2 flex items-baseline gap-2 shrink-0">
          <h1 className="m-0 text-[28px] font-semibold tracking-tight">Đã thích</h1>
          <span suppressHydrationWarning className="text-[15px] text-xam">
            {sanPhamThich.length} món
          </span>
        </header>

        {/* Thông báo toast khi thêm giỏ */}
        {thongBao && (
          <div
            role="status"
            className="mx-5 mb-2 px-3.5 py-2 rounded-xl bg-den text-trang text-[13px] font-medium shadow-lg flex items-center justify-between animate-fadeIn z-30"
          >
            <span className="truncate">{thongBao}</span>
            <Link href="/gio" className="ml-2 text-bac-ha underline shrink-0 font-semibold">
              Xem giỏ
            </Link>
          </div>
        )}

        {/* Thanh lọc danh mục */}
        {daSanSang && sanPhamThich.length > 0 && (
          <div
            role="group"
            aria-label="Lọc theo danh mục"
            className="px-5 py-2 flex gap-2 overflow-x-auto shrink-0 no-scrollbar"
          >
            {danhSachLoc.map((f) => {
              const dangChon = danhMucChon === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={dangChon}
                  onClick={() => setDanhMucChon(f.id)}
                  className={`h-9 px-3.5 rounded-full text-[14px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    dangChon
                      ? "bg-den text-trang border border-den"
                      : "bg-trang text-den border border-[#E8D2CC] hover:border-den"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              );
            })}
          </div>
        )}

        {/* Nội dung danh sách hoặc trạng thái trống */}
        {!daSanSang ? (
          <div className="flex-1" />
        ) : sanPhamThich.length === 0 ? (
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
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-[17px] font-semibold text-den mb-1">
              Quẹt phải để lưu món bạn thích.
            </p>
            <p className="text-[14px] text-xam max-w-[280px] mb-6">
              Các sản phẩm bạn thích trong lúc quẹt sẽ hiển thị ở đây để dễ dàng so sánh và đưa vào giỏ.
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
        ) : sanPhamHienThi.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xam">
            <p className="text-[15px]">Không có sản phẩm nào trong danh mục này.</p>
            <button
              type="button"
              onClick={() => setDanhMucChon("all")}
              className="mt-3 text-[14px] text-den underline font-medium"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 grid grid-cols-2 gap-3 content-start">
            {sanPhamHienThi.map((sp) => {
              const bgMoi =
                sp.danh_muc === "mat-na" || sp.danh_muc === "kem-duong"
                  ? "bg-[#EAF3ED]"
                  : "bg-[#F7EEEB]";
              const dealNote = MAP_GHI_CHU_DEAL[sp.id];

              return (
                <article
                  key={sp.id}
                  onClick={() => setSanPhamChiTiet(sp)}
                  className="flex flex-col gap-1.5 cursor-pointer group"
                >
                  {/* Khối ảnh */}
                  <div
                    className={`relative h-[150px] rounded-[18px] ${bgMoi} flex items-center justify-center overflow-hidden transition-transform group-active:scale-[0.98]`}
                  >
                    {sp.anh ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sp.anh}
                        alt={sp.ten_hien_thi}
                        className="w-[128px] h-[128px] object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        role="img"
                        aria-label="Ảnh sản phẩm chờ bổ sung"
                        className="text-[11px] font-semibold tracking-wider uppercase text-[#5C5C5B]"
                      >
                        {sp.thuong_hieu}
                      </span>
                    )}

                    {/* Nút bỏ thích */}
                    <button
                      type="button"
                      aria-label="Bỏ thích"
                      onClick={(e) => handleBoThich(sp.id, e)}
                      className="absolute top-1.5 right-1.5 w-10 h-10 rounded-full bg-trang/95 hover:bg-trang shadow-sm flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="#2B2B2A"
                        stroke="#2B2B2A"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Thông tin sản phẩm */}
                  <span className="text-[11px] font-semibold tracking-[1.2px] text-xam uppercase truncate">
                    {sp.thuong_hieu}
                  </span>
                  <span className="text-[14px] leading-[1.35] font-medium h-[38px] overflow-hidden line-clamp-2 text-den">
                    {sp.ten_hien_thi}
                  </span>

                  {/* Giá và nút thêm giỏ */}
                  <div className="flex items-center justify-between gap-1.5 mt-auto pt-1">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[16px] font-bold text-den leading-tight">
                        {dinhDangTien(sp.gia_ban)}đ
                      </span>
                      <span className="text-[11px] text-xam h-[16px] truncate">
                        {dealNote ?? ""}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label="Thêm vào giỏ"
                      onClick={(e) => handleThemVaoGio(sp, e)}
                      className="w-10 h-10 shrink-0 rounded-full bg-[#CFE3D5] hover:bg-[#BCD7C4] text-den flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Thanh tab dưới cố định */}
      <ThanhTab soLuongThich={sanPhamThich.length} soLuongGio={tongSoLuongGio} />

      {/* Modal chi tiết sản phẩm */}
      <BangChiTiet
        sanPham={sanPhamChiTiet}
        dangMo={Boolean(sanPhamChiTiet)}
        daThich={Boolean(sanPhamChiTiet && danhSachThich.includes(sanPhamChiTiet.id))}
        onDong={() => setSanPhamChiTiet(null)}
        onThich={() => {
          if (sanPhamChiTiet) {
            themDaThich(sanPhamChiTiet.id);
            setDanhSachThich(layDanhSachDaThich());
          }
        }}
        onThemGio={() => {
          if (sanPhamChiTiet) {
            themVaoGio(sanPhamChiTiet.id, 1);
            setGioHang(layGioHang());
            setSanPhamChiTiet(null);
            setThongBao(`Đã thêm "${sanPhamChiTiet.ten_hien_thi}" vào giỏ`);
            setTimeout(() => setThongBao(null), 2500);
          }
        }}
      />
    </KhungDienThoai>
  );
}
