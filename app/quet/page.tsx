"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";
import { ThanhTren } from "@/components/ThanhTren";
import { ThanhTab } from "@/components/ThanhTab";
import { TheSanPham } from "@/components/deck/TheSanPham";
import { TheDealDacBiet } from "@/components/deck/TheDealDacBiet";
import { BangChiTiet } from "@/components/deck/BangChiTiet";
import type { SanPham } from "@/lib/data/types";
import { xepDeck, type TheDeck } from "@/lib/goi-y/deck";
import {
  khoiTaoHoSo,
  capNhatHoSo,
  hoanTacHoSo,
  type HoSoKhach,
  type HanhDongHoSo,
} from "@/lib/goi-y/ho-so";
import { layTraLoiLocal } from "@/lib/khao-sat";
import { layNhanVanDe, layLyDoGoiY } from "@/lib/nhan";
import { layGhiChuDeal } from "@/lib/deals/ghi-chu";
import { ghiLuotQuet } from "@/lib/supabase/luot-quet";
import { danhDauCanDongBoHoSo } from "@/lib/supabase/auth";
import { useDuLieu } from "@/lib/du-lieu-context";
import {
  layDanhSachDaThich,
  themDaThich,
  xoaDaThich,
  layGioHang,
  themVaoGio,
  giamSoLuongGio,
  layDanhSachDaBoQua,
  themDaBoQua,
  xoaDaBoQua,
  layHoSoLocal,
  luuHoSoLocal,
} from "@/lib/kho-luu-tru";

interface BuocLichSu {
  sanPham: SanPham;
  hanhDong: HanhDongHoSo;
  hoSoTruoc: HoSoKhach;
}

const HEARTS = [
  { x: -52, delay: 0, size: 18, fill: "#2B2B2A" },
  { x: -24, delay: 70, size: 14, fill: "#E8D2CC" },
  { x: 4, delay: 30, size: 22, fill: "#2B2B2A" },
  { x: 30, delay: 110, size: 16, fill: "#CFE3D5" },
  { x: 54, delay: 50, size: 14, fill: "#2B2B2A" },
  { x: -8, delay: 150, size: 12, fill: "#E8D2CC" },
];

export default function TrangQuet() {
  const {
    sanPham: danhSachSanPham,
    deals: danhSachDeals,
    daSanSang,
  } = useDuLieu();
  const [deck, setDeck] = useState<TheDeck[]>([]);
  const [indexHienTai, setIndexHienTai] = useState<number>(0);
  const [daThich, setDaThich] = useState<string[]>([]);
  const [soLuongGio, setSoLuongGio] = useState<number>(0);
  const [hoSo, setHoSo] = useState<HoSoKhach>({});
  const [lichSu, setLichSu] = useState<BuocLichSu[]>([]);
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState<SanPham | null>(null);
  const [hienTheDealDacBiet, setHienTheDealDacBiet] = useState<boolean>(false);
  const [animState, setAnimState] = useState<"like" | "skip" | "cart" | "">("");
  const animStateRef = useRef<"like" | "skip" | "cart" | "">("");

  const capNhatAnimState = useCallback(
    (st: "like" | "skip" | "cart" | "") => {
      animStateRef.current = st;
      setAnimState(st);
    },
    []
  );

  const [toast, setToast] = useState<string>("");
  const [burst, setBurst] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({
    dx: 0,
    dy: 0,
  });
  const [moiQuanTamLabels, setMoiQuanTamLabels] = useState<string[]>([]);
  const deckKhoiTaoRef = useRef(false);

  // Khởi tạo deck và dữ liệu lưu trữ
  useEffect(() => {
    if (!daSanSang) return;
    if (deckKhoiTaoRef.current) return;
    deckKhoiTaoRef.current = true;

    const listThich = layDanhSachDaThich();
    const listGio = layGioHang();
    const listBoQua = layDanhSachDaBoQua();
    const tongSoLuongGio = listGio.reduce((t, m) => t + m.soLuong, 0);

    setDaThich(listThich);
    setSoLuongGio(tongSoLuongGio);

    // Lấy hoặc khởi tạo hồ sơ từ khảo sát
    let hs = layHoSoLocal();
    const traLoi = layTraLoiLocal();

    if (Object.keys(hs).length === 0 && traLoi) {
      hs = khoiTaoHoSo(traLoi);
      luuHoSoLocal(hs);
    }
    setHoSo(hs);

    // Lấy label mối quan tâm hiển thị ở header phụ
    if (traLoi?.van_de?.length) {
      setMoiQuanTamLabels(
        traLoi.van_de.map((k) => layNhanVanDe(k)).slice(0, 2)
      );
    }

    // Xếp deck
    const dsThe = xepDeck({
      sanPham: danhSachSanPham,
      hoSo: hs,
      daThich: listThich,
      daVaoGio: listGio
        .map((g) => g.sanPhamId)
        .filter((id): id is string => Boolean(id)),
      daBoQua: listBoQua,
    });
    setDeck(dsThe);
  }, [daSanSang, danhSachSanPham]);

  // Preload ảnh của 3 thẻ kế tiếp
  useEffect(() => {
    if (typeof window === "undefined") return;
    for (
      let i = indexHienTai + 1;
      i <= indexHienTai + 3 && i < deck.length;
      i++
    ) {
      const sp = deck[i]?.san_pham;
      if (sp?.anh) {
        const img = new Image();
        img.src = sp.anh;
      }
    }
  }, [deck, indexHienTai]);

  const theHienTai = deck[indexHienTai];
  const theTiepTheo = deck[indexHienTai + 1];
  const daHetDeck = deck.length > 0 && indexHienTai >= deck.length;

  // Xử lý Thích
  const xuLyThich = useCallback(() => {
    if (!theHienTai || animStateRef.current) return;
    const sp = theHienTai.san_pham;

    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hoanTat = () => {
      themDaThich(sp.id);
      setDaThich((prev) => (prev.includes(sp.id) ? prev : [sp.id, ...prev]));

      ghiLuotQuet({
        san_pham_id: sp.id,
        hanh_dong: "thich",
        nguon: theHienTai.nguon,
        vi_tri: indexHienTai + 1,
      });

      const soLuotDaQuet = lichSu.length;
      const hoSoMoi = capNhatHoSo(hoSo, sp, "thich", soLuotDaQuet);
      setHoSo(hoSoMoi);
      luuHoSoLocal(hoSoMoi);
      danhDauCanDongBoHoSo();

      setLichSu((prev) => [
        ...prev,
        { sanPham: sp, hanhDong: "thich", hoSoTruoc: hoSo },
      ]);

      // Kiểm tra mốc 5 lượt thích để hiển thị thẻ đặc biệt
      if ((daThich.length + 1) % 5 === 0) {
        setHienTheDealDacBiet(true);
      }

      setIndexHienTai((prev) => prev + 1);
      capNhatAnimState("");
      setDragOffset({ dx: 0, dy: 0 });
    };

    if (isReduced) {
      hoanTat();
      return;
    }

    const toastText =
      sp.danh_muc === "trang-diem" ||
      sp.danh_muc === "duong-the" ||
      sp.danh_muc === "thiet-bi" ||
      sp.danh_muc === "dich-vu"
        ? "Ưng ý!"
        : "Hợp da!";

    capNhatAnimState("like");
    setToast(toastText);
    setBurst(true);

    setTimeout(() => {
      hoanTat();
    }, 380);

    setTimeout(() => {
      setToast("");
    }, 900);

    setTimeout(() => {
      setBurst(false);
    }, 900);
  }, [
    theHienTai,
    capNhatAnimState,
    hoSo,
    lichSu.length,
    daThich.length,
    indexHienTai,
  ]);

  // Xử lý Bỏ qua
  const xuLyBoQua = useCallback(() => {
    if (!theHienTai || animStateRef.current) return;
    const sp = theHienTai.san_pham;

    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hoanTat = () => {
      themDaBoQua(sp.id);

      ghiLuotQuet({
        san_pham_id: sp.id,
        hanh_dong: "bo_qua",
        nguon: theHienTai.nguon,
        vi_tri: indexHienTai + 1,
      });

      const soLuotDaQuet = lichSu.length;
      const hoSoMoi = capNhatHoSo(hoSo, sp, "bo_qua", soLuotDaQuet);
      setHoSo(hoSoMoi);
      luuHoSoLocal(hoSoMoi);
      danhDauCanDongBoHoSo();

      setLichSu((prev) => [
        ...prev,
        { sanPham: sp, hanhDong: "bo_qua", hoSoTruoc: hoSo },
      ]);

      setIndexHienTai((prev) => prev + 1);
      capNhatAnimState("");
      setDragOffset({ dx: 0, dy: 0 });
    };

    if (isReduced) {
      hoanTat();
      return;
    }

    capNhatAnimState("skip");
    setTimeout(() => {
      hoanTat();
    }, 380);
  }, [theHienTai, capNhatAnimState, hoSo, lichSu.length, indexHienTai]);

  // Xử lý Vào giỏ
  const xuLyVaoGio = useCallback(() => {
    if (!theHienTai || animStateRef.current) return;
    const sp = theHienTai.san_pham;

    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hoanTat = () => {
      themVaoGio(sp.id, 1);
      setSoLuongGio((prev) => prev + 1);

      // Vào giỏ cũng tính là thích mạnh
      themDaThich(sp.id);
      setDaThich((prev) => (prev.includes(sp.id) ? prev : [sp.id, ...prev]));

      ghiLuotQuet({
        san_pham_id: sp.id,
        hanh_dong: "gio",
        nguon: theHienTai.nguon,
        vi_tri: indexHienTai + 1,
      });

      const soLuotDaQuet = lichSu.length;
      const hoSoMoi = capNhatHoSo(hoSo, sp, "gio", soLuotDaQuet);
      setHoSo(hoSoMoi);
      luuHoSoLocal(hoSoMoi);
      danhDauCanDongBoHoSo();

      setLichSu((prev) => [
        ...prev,
        { sanPham: sp, hanhDong: "gio", hoSoTruoc: hoSo },
      ]);

      setIndexHienTai((prev) => prev + 1);
      capNhatAnimState("");
      setDragOffset({ dx: 0, dy: 0 });
    };

    if (isReduced) {
      hoanTat();
      return;
    }

    capNhatAnimState("cart");
    setToast("Đã vào giỏ");

    setTimeout(() => {
      hoanTat();
    }, 380);

    setTimeout(() => {
      setToast("");
    }, 900);
  }, [theHienTai, capNhatAnimState, hoSo, lichSu.length, indexHienTai]);

  // Xử lý Hoàn tác
  const xuLyHoanTac = useCallback(() => {
    if (lichSu.length === 0 || indexHienTai <= 0 || animStateRef.current) return;

    const buocCuoi = lichSu[lichSu.length - 1];
    const sp = buocCuoi.sanPham;

    // Phục hồi hồ sơ
    const hoSoPhucHoi = hoanTacHoSo(
      hoSo,
      sp,
      buocCuoi.hanhDong,
      lichSu.length - 1
    );
    setHoSo(hoSoPhucHoi);
    luuHoSoLocal(hoSoPhucHoi);
    danhDauCanDongBoHoSo();

    ghiLuotQuet({
      san_pham_id: sp.id,
      hanh_dong: "hoan_tac",
      vi_tri: indexHienTai,
    });

    // Gỡ khỏi danh sách tương ứng
    if (buocCuoi.hanhDong === "thich") {
      xoaDaThich(sp.id);
      setDaThich((prev) => prev.filter((id) => id !== sp.id));
    } else if (buocCuoi.hanhDong === "gio") {
      giamSoLuongGio(sp.id);
      setSoLuongGio((prev) => Math.max(0, prev - 1));
      xoaDaThich(sp.id);
      setDaThich((prev) => prev.filter((id) => id !== sp.id));
    } else if (buocCuoi.hanhDong === "bo_qua") {
      xoaDaBoQua(sp.id);
    }

    setLichSu((prev) => prev.slice(0, -1));
    setIndexHienTai((prev) => Math.max(0, prev - 1));
    setHienTheDealDacBiet(false);
  }, [lichSu, indexHienTai, hoSo]);

  // Phím tắt bàn phím (máy tính)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Nếu đang mở dialog chi tiết thì phím Escape để đóng
      if (sanPhamChiTiet) {
        if (e.key === "Escape") setSanPhamChiTiet(null);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        xuLyThich();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        xuLyBoQua();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        xuLyVaoGio();
      } else if (e.key === "z" || e.key === "Z" || e.key === "Backspace") {
        e.preventDefault();
        xuLyHoanTac();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sanPhamChiTiet, xuLyThich, xuLyBoQua, xuLyVaoGio, xuLyHoanTac]);

  // Tính toán scale và style của các nút điều khiển khi đang kéo
  const { dx, dy } = dragOffset;
  const skipBtnScale = dx < 0 ? Math.min(1.16, 1 + -dx / 400) : 1;
  const skipBtnBg = dx < -55 ? "#F7EEEB" : "#FFFFFF";
  const likeBtnScale = dx > 0 ? Math.min(1.16, 1 + dx / 400) : 1;
  const likeRing = dx > 0 ? Math.min(8, (dx / 110) * 8) : 0;
  const cartBtnScale =
    dy < 0 && Math.abs(dx) < 60 ? Math.min(1.16, 1 + -dy / 400) : 1;

  // Lý do gợi ý & ghi chú deal cho thẻ hiện tại
  const lyDoHienTai = useMemo(() => {
    if (!theHienTai) return undefined;
    return layLyDoGoiY(
      theHienTai.san_pham.van_de,
      theHienTai.san_pham.loai_da
    );
  }, [theHienTai]);

  const ghiChuDealHienTai = useMemo(() => {
    if (!theHienTai) return undefined;
    return layGhiChuDeal(theHienTai.san_pham, danhSachDeals);
  }, [theHienTai, danhSachDeals]);

  return (
    <KhungDienThoai className="h-dvh">
      <style>{`
        @keyframes vq-pop {
          0% { transform: scale(1); }
          35% { transform: scale(1.22); }
          70% { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
        @keyframes vq-heart {
          0% { transform: translate(0, 0) scale(0.4); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(var(--x), -150px) scale(1.15); opacity: 0; }
        }
        @keyframes vq-toast {
          0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
          30% { transform: translateX(-50%) scale(1.08); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
      `}</style>
      <div className="w-full h-full flex flex-col bg-trang font-sans text-den overflow-hidden relative">
        <h1 className="sr-only">Deck quẹt VIVE</h1>
        {/* Thanh trên */}
        <ThanhTren soLuongGio={soLuongGio} />

        {/* Thanh phụ: Xếp theo + Sửa */}
        <div className="px-5 pt-1 pb-2.5 flex items-center gap-1.5 text-[13px] shrink-0">
          <span className="text-xam">Xếp theo</span>
          {moiQuanTamLabels.length > 0 ? (
            moiQuanTamLabels.map((tag) => (
              <span
                key={tag}
                className="h-[26px] px-2.5 rounded-full bg-hong-nhat flex items-center font-medium text-den"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="h-[26px] px-2.5 rounded-full bg-hong-nhat flex items-center font-medium text-den">
              Phù hợp nhất
            </span>
          )}
          <Link
            href="/bat-dau"
            className="ml-auto font-medium text-den no-underline py-1 px-1.5 hover:underline"
          >
            Sửa
          </Link>
        </div>

        {/* Khu vực Deck quẹt thẻ */}
        <section
          aria-label="Thẻ sản phẩm"
          className="relative flex-1 min-h-0 mx-4"
        >
          {hienTheDealDacBiet ? (
            <TheDealDacBiet onBoQua={() => setHienTheDealDacBiet(false)} />
          ) : !daSanSang ? (
            <div className="absolute inset-0 rounded-[28px] bg-hong-nhat border border-vien p-8 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-1" />
              <span className="font-bold text-[16px] tracking-[-0.3px] text-chu">
                Đang chuẩn bị sản phẩm...
              </span>
            </div>
          ) : theHienTai ? (
            <>
              {/* Thẻ phía dưới tạo chiều sâu */}
              {theTiepTheo && (
                <div
                  aria-hidden="true"
                  className="absolute inset-x-3.5 top-3 -bottom-2 rounded-[28px] bg-hong-nhat border border-vien scale-[0.96] transition-transform pointer-events-none"
                />
              )}

              {/* Thẻ trên cùng tương tác */}
              <TheSanPham
                key={theHienTai.san_pham.id}
                sanPham={theHienTai.san_pham}
                lyDoGoiY={lyDoHienTai}
                ghiChuDeal={ghiChuDealHienTai}
                onThich={xuLyThich}
                onBoQua={xuLyBoQua}
                onVaoGio={xuLyVaoGio}
                onMoChiTiet={() => {
                  ghiLuotQuet({
                    san_pham_id: theHienTai.san_pham.id,
                    hanh_dong: "xem_chi_tiet",
                    nguon: theHienTai.nguon,
                    vi_tri: indexHienTai + 1,
                  });
                  setSanPhamChiTiet(theHienTai.san_pham);
                }}
                isTopCard={true}
                animState={animState}
                onDragStateChange={(dragX, dragY) =>
                  setDragOffset({ dx: dragX, dy: dragY })
                }
              />
            </>
          ) : daHetDeck ? (
            /* Khi đã xem hết thẻ (docs/01 mục 2.3) */
            <div className="absolute inset-0 rounded-[28px] bg-hong-nhat border border-vien p-8 flex flex-col items-center justify-center gap-3 text-center">
              <span className="font-bold text-[26px] tracking-[-0.5px]">
                Bạn đã xem hết sản phẩm hôm nay.
              </span>
              <p className="m-0 text-[15px] leading-relaxed text-[#5C5C5B]">
                Bạn đã thích {daThich.length} món. Xem lại danh sách hoặc các
                deal hợp với bạn hôm nay.
              </p>
              <Link
                href="/deal"
                className="mt-2 h-12 px-6 rounded-full bg-den text-trang flex items-center font-semibold text-[15px] no-underline hover:opacity-90 transition-opacity"
              >
                Xem deal cho bạn
              </Link>
              <Link
                href="/da-thich"
                className="font-medium text-den no-underline p-2 hover:underline text-[14px]"
              >
                Xem món đã thích ({daThich.length})
              </Link>
            </div>
          ) : null}

          {/* Toast thông báo quẹt */}
          {toast && (
            <div
              role="status"
              style={{ animation: "vq-toast 420ms ease-out both" }}
              className="absolute left-1/2 top-[120px] -translate-x-1/2 z-50 h-[68px] px-7 rounded-full bg-den text-trang shadow-[0_12px_32px_rgba(43,43,42,0.22)] flex items-center gap-3 whitespace-nowrap pointer-events-none"
            >
              {toast === "Đã vào giỏ" ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#FFFFFF"
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
              <span className="font-bold text-[24px] tracking-[-0.5px]">
                {toast}
              </span>
            </div>
          )}

          {/* Heart burst khi thích */}
          {burst && (
            <div
              aria-hidden="true"
              className="absolute left-1/2 bottom-[140px] w-0 h-0 pointer-events-none z-50"
            >
              {HEARTS.map((h, i) => (
                <svg
                  key={i}
                  width={h.size}
                  height={h.size}
                  viewBox="0 0 24 24"
                  fill={h.fill}
                  stroke="#2B2B2A"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  style={
                    {
                      position: "absolute",
                      left: -9,
                      top: -9,
                      "--x": `${h.x}px`,
                      animation: `vq-heart 820ms ease-out ${h.delay}ms both`,
                    } as React.CSSProperties
                  }
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              ))}
            </div>
          )}
        </section>

        {/* Thanh 4 nút điều khiển */}
        <div className="h-[88px] shrink-0 flex items-center justify-center gap-4.5 my-1">
          {/* Nút hoàn tác */}
          <button
            type="button"
            onClick={xuLyHoanTac}
            disabled={lichSu.length === 0 || !!animState}
            aria-label="Hoàn tác"
            className="w-[52px] h-[52px] rounded-full border-[1.5px] border-[#E8D2CC] bg-trang flex items-center justify-center text-den cursor-pointer hover:bg-hong-nhat disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          {/* Nút Bỏ qua (✕) */}
          <button
            type="button"
            onClick={xuLyBoQua}
            disabled={!theHienTai || !!animState}
            aria-label="Bỏ qua"
            style={{
              transform: `scale(${skipBtnScale})`,
              backgroundColor: skipBtnBg,
            }}
            className="w-[68px] h-[68px] rounded-full border-[1.5px] border-den flex items-center justify-center text-den cursor-pointer transition-transform duration-100 disabled:opacity-40"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Nút Thích (♥) */}
          <button
            type="button"
            onClick={xuLyThich}
            disabled={!theHienTai || !!animState}
            aria-label="Thích"
            style={{
              transform: `scale(${likeBtnScale})`,
              boxShadow: likeRing > 0 ? `0 0 0 ${likeRing}px #CFE3D5` : "none",
            }}
            className="w-[68px] h-[68px] rounded-full bg-den text-trang flex items-center justify-center cursor-pointer transition-transform duration-100 disabled:opacity-40"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Nút Thêm vào giỏ (👜) */}
          <button
            type="button"
            onClick={xuLyVaoGio}
            disabled={!theHienTai || !!animState}
            aria-label="Thêm vào giỏ"
            style={{
              transform: `scale(${cartBtnScale})`,
            }}
            className="w-[52px] h-[52px] rounded-full border-[1.5px] border-[#E8D2CC] bg-[#CFE3D5] text-den flex items-center justify-center cursor-pointer hover:opacity-90 transition-transform duration-100 disabled:opacity-40"
          >
            <svg
              width="22"
              height="22"
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
          </button>
        </div>

        {/* Thanh Tab 5 mục ở đáy */}
        <ThanhTab soLuongThich={daThich.length} soLuongGio={soLuongGio} />

        {/* Dialog chi tiết sản phẩm */}
        <BangChiTiet
          sanPham={sanPhamChiTiet}
          dangMo={sanPhamChiTiet !== null}
          onDong={() => setSanPhamChiTiet(null)}
          onThich={xuLyThich}
          onThemGio={xuLyVaoGio}
          daThich={
            sanPhamChiTiet !== null && daThich.includes(sanPhamChiTiet.id)
          }
        />
      </div>
    </KhungDienThoai>
  );
}
