"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export const KHOA_LICH_SU_NOI_BO = "vive_lich_su_noi_bo";

export interface NutQuayLaiProps {
  fallback?: string;
  nhan?: string;
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Nút quay lại dùng chung cho các trang con (W033):
 * - Gọi router.back() nếu trước đó người dùng đang duyệt trang khác trong cùng web.
 * - Ngược lại chuyển về fallback (ví dụ mở trực tiếp từ link ngoài hoặc sau reload).
 * - Điện thoại & tablet: nút nằm góc trên trái, vùng bấm >= 44x44px.
 * - Máy tính: dòng chữ nhỏ "← Quay lại" đặt phía trên tiêu đề trang.
 */
export function NutQuayLai({
  fallback = "/",
  nhan,
  ariaLabel,
  onClick,
  className = "",
}: NutQuayLaiProps) {
  const router = useRouter();
  const t = useTranslations("chung.thanh");
  const chuNut = nhan ?? t("quayLai");

  const xuLyQuayLai = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (typeof window !== "undefined") {
      let coLichSuNoiBo = false;
      try {
        const raw = window.sessionStorage.getItem(KHOA_LICH_SU_NOI_BO);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        coLichSuNoiBo = Array.isArray(arr) && arr.length > 1 && window.history.length > 1;
        if (coLichSuNoiBo) {
          arr.pop();
          window.sessionStorage.setItem(
            KHOA_LICH_SU_NOI_BO,
            JSON.stringify(arr)
          );
        }
      } catch {
        // bỏ qua lỗi sessionStorage
      }

      const referrerCungWeb =
        Boolean(document.referrer) &&
        document.referrer.startsWith(window.location.origin) &&
        window.history.length > 1;

      if (coLichSuNoiBo || referrerCungWeb) {
        router.back();
        return;
      }
    }

    router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={xuLyQuayLai}
      aria-label={ariaLabel || chuNut}
      className={`inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-2 -ml-2 lg:min-h-[36px] lg:min-w-0 lg:px-0 lg:ml-0 rounded-full lg:rounded-md text-[14px] font-medium text-den hover:bg-hong-nhat/70 lg:hover:bg-transparent lg:text-xam lg:hover:text-den transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-den ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{chuNut}</span>
    </button>
  );
}
