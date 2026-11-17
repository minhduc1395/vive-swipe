import type { ReactNode } from "react";

interface KhungDienThoaiProps {
  children: ReactNode;
  className?: string;
}

/**
 * Khung điện thoại chuẩn VIVE Quẹt: căn giữa trên máy tính, rộng tối đa 480px.
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
        className={`w-full max-w-[480px] bg-trang text-den flex flex-col relative ${
          isFixedH ? "h-full overflow-hidden" : "min-h-dvh"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
