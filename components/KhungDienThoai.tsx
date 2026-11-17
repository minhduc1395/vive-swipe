import type { ReactNode } from "react";

interface KhungDienThoaiProps {
  children: ReactNode;
  className?: string;
}

/**
 * Khung điện thoại chuẩn VIVE Quẹt: căn giữa trên máy tính, rộng tối đa 480px.
 */
export function KhungDienThoai({ children, className = "" }: KhungDienThoaiProps) {
  return (
    <div className="min-h-dvh w-full bg-trang flex justify-center">
      <div
        className={`w-full max-w-[480px] min-h-dvh bg-trang text-den flex flex-col relative ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
