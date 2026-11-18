"use client";

import { useEffect } from "react";
import {
  damBaoKhachAnDanh,
  dongBoHoSo,
  KHOA_HO_SO_CAN_DONG_BO,
} from "@/lib/supabase/auth";
import {
  khoiTaoLangNgheMang,
  dayHangDoiLuotQuet,
} from "@/lib/supabase/luot-quet";
import {
  luuNguonVaoTuUrl,
  ghiSuKien,
  dayHangDoiSuKien,
} from "@/lib/supabase/su-kien";
import { layHoSoLocal } from "@/lib/kho-luu-tru";

export function KhoiTaoSupabase() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Bỏ qua các trang nội bộ của nhân viên và quản trị để không tạo phiên ẩn danh lẫn lộn
    const pathname = window.location.pathname;
    if (
      pathname.startsWith("/nhan-vien") ||
      pathname.startsWith("/quan-tri")
    ) {
      return;
    }

    // 1. Lưu ?src= từ URL
    luuNguonVaoTuUrl();

    // 2. Thiết lập lắng nghe sự kiện mạng (online / visibilitychange / beforeunload)
    khoiTaoLangNgheMang();

    // 3. Đăng nhập ẩn danh nếu chưa có session thật, và đồng bộ nền
    void (async () => {
      await damBaoKhachAnDanh();

      // Sự kiện mo_web (chỉ ghi 1 lần mỗi phiên duyệt web)
      try {
        const daGhi = window.sessionStorage.getItem("vive_da_ghi_mo_web");
        if (!daGhi) {
          ghiSuKien("mo_web");
          window.sessionStorage.setItem("vive_da_ghi_mo_web", "true");
        }
      } catch {
        // bỏ qua lỗi storage
      }

      // Nếu có hồ sơ đang chờ đồng bộ từ phiên ngoại tuyến trước đó
      try {
        if (window.localStorage.getItem(KHOA_HO_SO_CAN_DONG_BO) === "true") {
          const hoSo = layHoSoLocal();
          await dongBoHoSo(hoSo);
        }
      } catch {
        // bỏ qua
      }

      // Đẩy các lượt quẹt hoặc sự kiện còn đọng trong hàng đợi
      await dayHangDoiLuotQuet();
      await dayHangDoiSuKien();
    })();
  }, []);

  return null;
}
