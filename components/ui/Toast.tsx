"use client";

import { useEffect, useState } from "react";

export const SU_KIEN_TOAST = "vive_toast";

/**
 * Kích hoạt hiển thị toast toàn cục.
 * Mặc định: "Tính năng sắp ra mắt" (hoặc "Coming soon").
 */
export function hienToast(tinNhan: string = "Tính năng sắp ra mắt") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SU_KIEN_TOAST, {
        detail: { thongBao: tinNhan },
      })
    );
  }
}

/**
 * Toast nhỏ thông báo trạng thái dùng chung (W050/W051/W040).
 * Vị trí: giữa dưới màn hình, không chặn cuộn, tự tắt sau ~2,5 giây, role="status".
 */
export function Toast() {
  const [thongBao, setThongBao] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const xuLySuKien = (e: Event) => {
      const ce = e as CustomEvent<{ thongBao?: string }>;
      setThongBao(ce.detail?.thongBao || "Tính năng sắp ra mắt");
      clearTimeout(timer);
      timer = setTimeout(() => {
        setThongBao(null);
      }, 2500);
    };

    window.addEventListener(SU_KIEN_TOAST, xuLySuKien);
    return () => {
      window.removeEventListener(SU_KIEN_TOAST, xuLySuKien);
      clearTimeout(timer);
    };
  }, []);

  if (!thongBao) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300"
    >
      <div className="bg-[#2B2B2A]/90 backdrop-blur-md text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
        <span>{thongBao}</span>
      </div>
    </div>
  );
}
