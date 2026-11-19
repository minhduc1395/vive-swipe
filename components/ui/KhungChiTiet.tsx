"use client";

import { useEffect, type ReactNode } from "react";
import { useKhoaCuon } from "@/lib/khoa-cuon";

/**
 * Khung chi tiết dùng chung: bottom sheet trên điện thoại, ngăn kéo phải 420px từ 768px.
 * Đóng bằng nút nền mờ hoặc phím Esc.
 */
export function KhungChiTiet({ mo, onDong, nhan, children }: { mo: boolean; onDong: () => void; nhan: string; children: ReactNode }) {
  useKhoaCuon(mo);
  useEffect(() => {
    if (!mo) return;
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") onDong(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [mo, onDong]);
  if (!mo) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={nhan} className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-den/40" onClick={onDong}>
      <div
        className="w-full max-h-[88vh] md:max-h-none md:h-full md:w-[420px] bg-trang rounded-t-[28px] md:rounded-none md:rounded-l-[28px] overflow-y-auto overscroll-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
