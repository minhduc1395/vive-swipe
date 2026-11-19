"use client";

import Link from "next/link";
import type { NutTrangChu as NutTrangChuType } from "@/lib/trang-chu/schema";
import { hienToast } from "@/components/ui/Toast";

interface NutTrangChuProps {
  nut: NutTrangChuType;
  banDoUrl?: string;
  className?: string;
}

/**
 * Nút chuẩn trên trang chủ `/` (W050).
 * Đọc đích từ cấu hình YAML; nút có `sap_co: true` hoặc `den: null` không điều hướng mà hiện toast "Tính năng sắp ra mắt".
 */
export function NutTrangChu({
  nut,
  banDoUrl,
  className = "",
}: NutTrangChuProps) {
  const lopCoBan = `tc-btn ${nut.kieu === "phu" ? "phu" : "chinh"} ${className}`.trim();

  const dichThucTe =
    nut.nguon_den === "doanh_nghiep.ban_do" ? banDoUrl ?? null : nut.den ?? null;

  if (nut.sap_co || !dichThucTe) {
    return (
      <button
        type="button"
        data-sap-co="true"
        onClick={() => hienToast("Tính năng sắp ra mắt")}
        className={`${lopCoBan} cursor-pointer border-0 font-[inherit]`}
      >
        {nut.chu}
      </button>
    );
  }

  if (nut.mo_tab_moi) {
    return (
      <a
        href={dichThucTe}
        target="_blank"
        rel="noopener noreferrer"
        className={lopCoBan}
      >
        {nut.chu}
      </a>
    );
  }

  if (dichThucTe.startsWith("#")) {
    return (
      <a href={dichThucTe} className={lopCoBan}>
        {nut.chu}
      </a>
    );
  }

  return (
    <Link href={dichThucTe} prefetch={false} className={lopCoBan}>
      {nut.chu}
    </Link>
  );
}
