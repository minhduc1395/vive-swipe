"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useTaiKhoan } from "@/lib/tai-khoan/use-tai-khoan";
import { dangNhapEmailBat } from "@/lib/tai-khoan/co";

interface LinkTaiKhoanProps {
  /** Lớp CSS cho link "Tài khoản" (bám kiểu nút "Đăng nhập" của thanh). */
  className: string;
  /** Phần hiện khi chưa đăng nhập (nút "Đăng nhập" sẵn có của thanh). */
  children: ReactNode;
}

function LinkKhiBatCo({ className, children }: LinkTaiKhoanProps) {
  const t = useTranslations("tai-khoan.chung");
  const { daDangNhap } = useTaiKhoan();
  if (!daDangNhap) return <>{children}</>;
  return (
    <Link href="/tai-khoan" prefetch={false} aria-label={t("taiKhoan")} className={className}>
      <span>{t("taiKhoan")}</span>
    </Link>
  );
}

/**
 * Thay nút "Đăng nhập" bằng link "Tài khoản" khi khách đã đăng nhập email.
 * Tắt cờ `NEXT_PUBLIC_DANG_NHAP_EMAIL`: giữ nguyên nút cũ, không đọc session.
 */
export function LinkTaiKhoan(props: LinkTaiKhoanProps) {
  if (!dangNhapEmailBat()) return <>{props.children}</>;
  return <LinkKhiBatCo {...props} />;
}
