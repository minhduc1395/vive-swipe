"use client";

import { useState, useRef, useCallback } from "react";
import type { SanPham } from "@/lib/data/types";
import { dinhDangTien } from "@/lib/dinh-dang";

interface TheSanPhamProps {
  sanPham: SanPham;
  lyDoGoiY?: string;
  onThich: () => void;
  onBoQua: () => void;
  onVaoGio: () => void;
  onMoChiTiet: () => void;
  isTopCard?: boolean;
  onDragStateChange?: (dx: number, dy: number) => void;
}

export function TheSanPham({
  sanPham,
  lyDoGoiY,
  onThich,
  onBoQua,
  onVaoGio,
  onMoChiTiet,
  isTopCard = false,
  onDragStateChange,
}: TheSanPhamProps) {
  const [keo, setKeo] = useState<{ x: number; y: number; dangKeo: boolean }>({
    x: 0,
    y: 0,
    dangKeo: false,
  });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isTopCard) return;
    // Bỏ qua nếu chạm vào nút chi tiết
    if ((e.target as HTMLElement).closest("button")) return;

    startPos.current = { x: e.clientX, y: e.clientY };
    setKeo({ x: 0, y: 0, dangKeo: true });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // bỏ qua
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPos.current || !isTopCard) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setKeo({ x: dx, y: dy, dangKeo: true });
    onDragStateChange?.(dx, dy);
  };

  const ketThucKeo = useCallback(() => {
    if (!startPos.current) return;
    const { x, y } = keo;
    startPos.current = null;
    onDragStateChange?.(0, 0);

    // Ngưỡng hành động
    if (x > 85) {
      onThich();
    } else if (x < -85) {
      onBoQua();
    } else if (y < -85 && Math.abs(x) < 70) {
      onVaoGio();
    } else {
      setKeo({ x: 0, y: 0, dangKeo: false });
    }
  }, [keo, onThich, onBoQua, onVaoGio, onDragStateChange]);

  const handlePointerUp = () => {
    ketThucKeo();
  };

  const handlePointerCancel = () => {
    startPos.current = null;
    setKeo({ x: 0, y: 0, dangKeo: false });
    onDragStateChange?.(0, 0);
  };

  // Tính toán hiệu ứng xoay và stamp
  const { x, y, dangKeo } = keo;
  const rot = isTopCard ? x * 0.06 : 0;
  const likeOp = isTopCard && x > 0 ? Math.min(1, Math.max(0, x / 80)) : 0;
  const skipOp = isTopCard && x < 0 ? Math.min(1, Math.max(0, -x / 80)) : 0;
  const cartOp =
    isTopCard && y < -20 && Math.abs(x) < 60
      ? Math.min(1, Math.max(0, -y / 70))
      : 0;

  const cardTransform = isTopCard
    ? `translate3d(${x}px, ${y}px, 0px) rotate(${rot}deg)`
    : "none";

  const cardTransition = dangKeo
    ? "none"
    : "transform 250ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 200ms ease-out";

  const nenAnh =
    sanPham.danh_muc === "mat-na" || sanPham.danh_muc === "kem-duong"
      ? "bg-[#EAF3ED]"
      : "bg-[#F7EEEB]";

  const chipList = [
    ...(sanPham.van_de?.slice(0, 2) ?? []),
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
        touchAction: "none",
      }}
      className={`absolute inset-0 rounded-[28px] bg-trang border border-vien shadow-[0_16px_40px_rgba(43,43,42,0.12)] flex flex-col overflow-hidden select-none cursor-grab active:cursor-grabbing ${
        isTopCard ? "z-10" : "z-0"
      }`}
    >
      {/* Vùng ảnh */}
      <div
        className={`relative m-2 h-[292px] rounded-[22px] ${nenAnh} flex items-center justify-center shrink-0 overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={anhSrc}
          alt={sanPham.ten_hien_thi}
          draggable="false"
          className="w-[236px] h-[236px] object-contain pointer-events-none"
        />

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
      <div className="px-5 pt-1 pb-1 flex flex-col gap-1">
        <span className="text-[12px] font-semibold tracking-[1.4px] text-xam uppercase">
          {sanPham.thuong_hieu}
        </span>
        <h2 className="m-0 text-[19px] leading-[1.3] font-semibold text-den line-clamp-2">
          {sanPham.ten_hien_thi}
        </h2>
        <span className="text-[13px] text-xam">
          {sanPham.quy_cach || "Quy cách chuẩn"}
        </span>
      </div>

      {/* Giá bán */}
      <div className="px-5 py-1 flex items-baseline gap-2">
        <span className="text-[26px] font-bold tracking-[-0.3px] text-den">
          {dinhDangTien(sanPham.gia_ban)}
        </span>
        {sanPham.gia_goc && sanPham.gia_goc > sanPham.gia_ban && (
          <span className="text-[14px] text-xam line-through">
            {dinhDangTien(sanPham.gia_goc)}
          </span>
        )}
      </div>

      {/* Chip tags */}
      {chipList.length > 0 && (
        <div className="px-5 py-1.5 mt-auto flex flex-wrap gap-1.5 pb-3">
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
