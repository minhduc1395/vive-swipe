"use client";

import { useEffect } from "react";
import { batDauDongBo } from "@/lib/tai-khoan/dong-bo";

/**
 * #66: chạy đồng bộ đã thích + giỏ hàng lên tài khoản ở nền (không hiện gì).
 * Gắn nhiều nơi vẫn chỉ một bộ chạy (đếm số nơi dùng). Chỉ làm việc khi khách đã đăng nhập email.
 */
export function DongBoTaiKhoan() {
  useEffect(() => batDauDongBo(), []);
  return null;
}
