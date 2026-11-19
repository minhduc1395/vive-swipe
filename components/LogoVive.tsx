/* eslint-disable @next/next/no-img-element */

/** Tỉ lệ gốc của file public/brand/vive-logo-chu.png / vive-logo-chu.webp (1144 × 549). */
const TI_LE = 549 / 1144;

interface LogoViveProps {
  /** Chiều rộng hiển thị (px). Chiều cao tự tính theo tỉ lệ gốc để không giật bố cục. */
  rong: number;
  className?: string;
  uuTien?: boolean;
}

/**
 * Logo chữ VIVE dùng chung cho mọi thanh điều hướng khách.
 * Dùng `<img>` bản WebP lossless với kích thước cố định để không nhấp nháy và nhẹ ~8,8 KB.
 */
export function LogoVive({ rong, className = "", uuTien = false }: LogoViveProps) {
  const cao = Math.round(rong * TI_LE);
  return (
    <img
      src="/brand/vive-logo-chu.webp"
      alt="VIVE"
      width={rong}
      height={cao}
      loading={uuTien ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={uuTien ? "high" : "low"}
      data-testid="logo"
      className={`block shrink-0 ${className}`}
      style={{ width: `${rong}px`, height: "auto" }}
    />
  );
}
