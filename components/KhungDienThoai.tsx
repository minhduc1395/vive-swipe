import type { ReactNode } from "react";

interface KhungDienThoaiProps {
  children: ReactNode;
  className?: string;
}

/**
 * Khung chứa co giãn theo docs/05 mục 2.1:
 * - Bỏ khóa cứng 480px trên tablet và máy tính
 * - Nội dung tối đa 1280px căn giữa
 */
export function KhungDienThoai({ children, className = "" }: KhungDienThoaiProps) {
  const isFixedH =
    className.includes("h-dvh") ||
    className.includes("h-screen") ||
    className.includes("h-full");

  return (
    <div
      className={`w-full bg-trang flex justify-center ${
        isFixedH ? "h-dvh overflow-hidden" : "min-h-dvh"
      }`}
    >
      <div
        className={`w-full max-w-full md:max-w-[1280px] bg-trang text-den flex flex-col relative ${
          isFixedH ? "h-full overflow-hidden" : "min-h-dvh"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
