import Image from "next/image";

/** Tỉ lệ gốc của file public/brand/vive-logo-chu.png (1144 × 549). */
const TI_LE = 549 / 1144;

interface LogoViveProps {
  /** Chiều rộng hiển thị (px). Chiều cao tự tính theo tỉ lệ gốc để không giật bố cục. */
  rong: number;
  className?: string;
}

/**
 * Logo chữ VIVE dùng chung cho mọi thanh điều hướng khách.
 * Kích thước cố định + `priority` để logo không nhấp nháy khi chuyển trang.
 */
export function LogoVive({ rong, className = "" }: LogoViveProps) {
  const cao = Math.round(rong * TI_LE);
  return (
    <Image
      src="/brand/vive-logo-chu.png"
      alt="VIVE"
      width={rong}
      height={cao}
      priority
      data-testid="logo"
      className={`block shrink-0 ${className}`}
      style={{ width: `${rong}px`, height: `${cao}px` }}
    />
  );
}
