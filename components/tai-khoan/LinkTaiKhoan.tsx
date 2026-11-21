"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTaiKhoan } from "@/lib/tai-khoan/use-tai-khoan";

interface LinkTaiKhoanProps {
  /** Lớp CSS cho link "Tài khoản" (bám kiểu nút "Đăng nhập" của thanh). */
  className: string;
  /** Phần hiện khi chưa đăng nhập (nút "Đăng nhập" sẵn có của thanh). */
  children: ReactNode;
}

/** Thay nút "Đăng nhập" bằng link "Tài khoản" khi khách đã đăng nhập email. */
export function LinkTaiKhoan({ className, children }: LinkTaiKhoanProps) {
  const { daDangNhap } = useTaiKhoan();
  if (!daDangNhap) return <>{children}</>;
  return (
    <Link href="/tai-khoan" prefetch={false} aria-label="Tài khoản" className={className}>
      <span>Tài khoản</span>
    </Link>
  );
}
