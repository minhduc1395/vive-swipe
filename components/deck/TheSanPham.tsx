"use client";

import { useState, useRef, useCallback } from "react";
import type { SanPham } from "@/lib/data/types";
import { dinhDangTien } from "@/lib/dinh-dang";
import { layNhanVanDe } from "@/lib/nhan";

interface TheSanPhamProps {
  sanPham: SanPham;
  lyDoGoiY?: string;
  ghiChuDeal?: string;
  onThich: () => void;
  onBoQua: () => void;
  onVaoGio: () => void;
  onMoChiTiet: () => void;
  isTopCard?: boolean;
  onDragStateChange?: (dx: number, dy: number) => void;
  animState?: "like" | "skip" | "cart" | "";
}

function layFlyTransform(kind: "like" | "skip" | "cart" | "") {
  if (kind === "like") return "translate3d(560px, 60px, 0px) rotate(26deg)";
  if (kind === "skip") return "translate3d(-560px, 60px, 0px) rotate(-26deg)";
  if (kind === "cart")
    return "translate3d(0px, -760px, 0px) rotate(-4deg) scale(0.9)";
  return "translate3d(0px, 0px, 0px) rotate(0deg)";
}

export function TheSanPham({
  sanPham,
  lyDoGoiY,
  ghiChuDeal,
  onThich,
  onBoQua,
  onVaoGio,
  onMoChiTiet,
  isTopCard = false,
  onDragStateChange,
  animState = "",
}: TheSanPhamProps) {
  const [keo, setKeo] = useState<{ x: number; y: number; dangKeo: boolean }>({
    x: 0,
    y: 0,
    dangKeo: false,
  });
  const [anhLoi, setAnhLoi] = useState<boolean>(false);

  const startPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const keoRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const daRung = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTopCard || animState) return;
    // Bỏ qua nếu chạm vào nút chi tiết hoặc link
    if ((e.target as HTMLElement).closest("button, a")) return;

    startPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    keoRef.current = { x: 0, y: 0 };
    daRung.current = false;
    setKeo({ x: 0, y: 0, dangKeo: true });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Bỏ qua nếu không hỗ trợ pointer capture
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPos.current || !isTopCard || animState) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    keoRef.current = { x: dx, y: dy };
    setKeo({ x: dx, y: dy, dangKeo: true });
    onDragStateChange?.(dx, dy);

    // Rung haptic 10ms khi qua ngưỡng (docs/01 mục 2.3)
    const quaNgang = Math.abs(dx) > 110;
    const quaDoc = dy < -120 && Math.abs(dy) > Math.abs(dx);
    if ((quaNgang || quaDoc) && !daRung.current) {
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
      daRung.current = true;
    } else if (!quaNgang && !quaDoc) {
      daRung.current = false;
    }
  };

  const ketThucKeo = useCallback(() => {
    if (!startPos.current) return;
    const { x, y } = keoRef.current;
    const dt = Date.now() - startPos.current.time;
    startPos.current = null;
    keoRef.current = { x: 0, y: 0 };
    daRung.current = false;
    onDragStateChange?.(0, 0);

    // Ngưỡng vuốt chuẩn (docs/01 mục 2.3 & design/Quet.dc.html)
    // Ngang: |dx| > 110px hoặc vuốt nhanh (|dx| > 60px và dt < 250ms)
    // Lên: -dy > 120px và |dy| > |dx| hoặc vuốt nhanh lên (-dy > 60px và dt < 250ms)
    const vuotNhanhNgang = dt < 250 && Math.abs(x) > 60;
    const vuotNhanhLen = dt < 250 && y < -60 && Math.abs(y) > Math.abs(x);

    if (x > 110 || (vuotNhanhNgang && x > 0)) {
      onThich();
    } else if (x < -110 || (vuotNhanhNgang && x < 0)) {
      onBoQua();
    } else if ((y < -120 && Math.abs(y) > Math.abs(x)) || vuotNhanhLen) {
      onVaoGio();
    } else {
      setKeo({ x: 0, y: 0, dangKeo: false });
    }
  }, [onThich, onBoQua, onVaoGio, onDragStateChange]);

  const handlePointerUp = () => {
    ketThucKeo();
  };

  const handlePointerCancel = () => {
    startPos.current = null;
    daRung.current = false;
    setKeo({ x: 0, y: 0, dangKeo: false });
    onDragStateChange?.(0, 0);
  };

  // Tính toán hiệu ứng xoay và stamp
  const { x, y, dangKeo } = keo;
  const rot = isTopCard ? x * 0.06 : 0;
  const likeOp =
    animState === "like"
      ? 1
      : isTopCard && x > 0
      ? Math.min(1, Math.max(0, x / 110))
      : 0;
  const skipOp =
    animState === "skip"
      ? 1
      : isTopCard && x < 0
      ? Math.min(1, Math.max(0, -x / 110))
      : 0;
  const cartOp =
    animState === "cart"
      ? 1
      : isTopCard && y < 0 && Math.abs(y) > Math.abs(x)
      ? Math.min(1, Math.max(0, -y / 120))
      : 0;

  let cardTransform: string;
  let cardTransition: string;
  let cardOpacity = "1";

  if (animState) {
    cardTransform = layFlyTransform(animState);
    cardTransition =
      "transform 380ms cubic-bezier(0.3, 0.6, 0.3, 1), opacity 380ms ease-in";
    cardOpacity = "0.2";
  } else if (dangKeo) {
    cardTransform = `translate3d(${x}px, ${y}px, 0px) rotate(${rot}deg)`;
    cardTransition = "none";
  } else {
    cardTransform = "translate3d(0px, 0px, 0px) rotate(0deg) scale(1)";
    cardTransition = "transform 320ms cubic-bezier(0.2, 0.9, 0.3, 1.25)";
  }

  const nenAnh =
    sanPham.danh_muc === "mat-na" || sanPham.danh_muc === "kem-duong"
      ? "bg-[#EAF3ED]"
      : "bg-[#F7EEEB]";

  const chipList = [
    ...(sanPham.van_de?.map(layNhanVanDe).slice(0, 2) ?? []),
    ...(sanPham.thanh_phan?.slice(0, 1) ?? []),
  ].slice(0, 3);

  const anhSrc = sanPham.anh || "/brand/vive-logo-black.png";

  return (
    <article
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        transform: cardTransform,
        transition: cardTransition,
        opacity: cardOpacity,
        touchAction: "none",
      }}
      className={`absolute inset-0 rounded-[28px] bg-trang border border-vien shadow-[0_16px_40px_rgba(43,43,42,0.12)] flex flex-col overflow-hidden select-none cursor-grab active:cursor-grabbing ${
        isTopCard ? "z-10" : "z-0"
      }`}
    >
      {/* Vùng ảnh */}
      <div
        className={`relative m-2 flex-1 min-h-[140px] rounded-[22px] ${nenAnh} flex items-center justify-center shrink-0 overflow-hidden`}
      >
        {anhLoi ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <span className="text-[13px] font-semibold tracking-[1.4px] text-xam uppercase">
              {sanPham.thuong_hieu}
            </span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={anhSrc}
            alt={sanPham.ten_hien_thi}
            onError={() => setAnhLoi(true)}
            draggable="false"
            className="w-[236px] h-[236px] max-w-[85%] max-h-[85%] object-contain pointer-events-none"
          />
        )}

        {/* Nút xem chi tiết (i) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoChiTiet();
          }}
          aria-label={`Xem chi tiết ${sanPham.ten_hien_thi}`}
          className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-trang flex items-center justify-center text-den shadow-sm hover:bg-hong-nhat transition-colors cursor-pointer z-20"
        >
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>

        {/* Tag giảm giá */}
        {sanPham.giam_tren_tag && (
          <span className="absolute top-2.5 left-2.5 h-7 px-2.5 rounded-full bg-den text-trang text-[12px] font-bold flex items-center">
            {sanPham.giam_tren_tag}
          </span>
        )}

        {/* Lý do gợi ý */}
        {lyDoGoiY && (
          <span className="absolute left-3 bottom-3 h-7 px-3 rounded-full bg-trang text-[12px] font-medium flex items-center gap-1.5 text-den shadow-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {lyDoGoiY}
          </span>
        )}

        {/* STAMPS TRÊN ẢNH */}
        {/* Stamp THÍCH (phải) */}
        <div
          aria-hidden="true"
          style={{
            opacity: likeOp,
            transform: `rotate(-16deg) scale(${0.8 + likeOp * 0.2})`,
          }}
          className="absolute left-[18px] top-[26px] px-4 py-1.5 border-[3px] border-den rounded-xl bg-[#CFE3D5] text-den font-bold text-[30px] tracking-[4px] pointer-events-none transition-transform"
        >
          THÍCH
        </div>

        {/* Stamp BỎ QUA (trái) */}
        <div
          aria-hidden="true"
          style={{
            opacity: skipOp,
            transform: `rotate(16deg) scale(${0.8 + skipOp * 0.2})`,
          }}
          className="absolute right-[18px] top-[26px] px-4 py-1.5 border-[3px] border-den rounded-xl bg-hong-nhat text-den font-bold text-[30px] tracking-[4px] pointer-events-none transition-transform"
        >
          BỎ QUA
        </div>

        {/* Stamp VÀO GIỎ (lên) */}
        <div
          aria-hidden="true"
          style={{
            opacity: cartOp,
            transform: `translateX(-50%) scale(${0.8 + cartOp * 0.2})`,
          }}
          className="absolute left-1/2 bottom-[52px] px-4 py-1.5 border-[3px] border-den rounded-xl bg-trang text-den font-bold text-[26px] tracking-[3px] whitespace-nowrap pointer-events-none"
        >
          VÀO GIỎ
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="px-5 pt-1 pb-1 flex flex-col gap-0.5 shrink-0">
        <span className="text-[12px] font-semibold tracking-[1.4px] text-xam uppercase">
          {sanPham.thuong_hieu}
        </span>
        <h2 className="m-0 text-[18px] sm:text-[19px] leading-[1.3] font-semibold text-den line-clamp-2">
          {sanPham.ten_hien_thi}
        </h2>
        <span className="text-[13px] text-xam">
          {sanPham.quy_cach || "Quy cách chuẩn"}
        </span>
      </div>

      {/* Giá bán */}
      <div className="px-5 py-1 flex items-baseline gap-2 shrink-0">
        <span className="text-[24px] sm:text-[26px] font-bold tracking-[-0.3px] text-den">
          {dinhDangTien(sanPham.gia_ban)}
        </span>
        {sanPham.gia_goc && sanPham.gia_goc > sanPham.gia_ban && (
          <span className="text-[14px] text-xam line-through">
            {dinhDangTien(sanPham.gia_goc)}
          </span>
        )}
      </div>

      {/* Dải ghi chú deal (docs/01 mục 2.3) */}
      {ghiChuDeal && (
        <div className="mx-5 mb-1 px-3 py-1.5 rounded-xl bg-hong-nhat border border-vien flex items-center gap-2 text-[12px] font-medium text-den shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <path d="M7 7h.01" />
          </svg>
          <span className="truncate">{ghiChuDeal}</span>
        </div>
      )}

      {/* Chip tags */}
      {chipList.length > 0 && (
        <div className="px-5 py-1.5 mt-auto flex flex-wrap gap-1.5 pb-3 shrink-0">
          {chipList.map((chip) => (
            <span
              key={chip}
              className="h-7 px-3 rounded-full bg-hong-nhat text-[13px] flex items-center text-den"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
