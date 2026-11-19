"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Giữ khớp với KHOA_LICH_SU_NOI_BO trong NutQuayLai.tsx mà không kéo toàn bộ component nút vào bundle gốc
const KHOA_LICH_SU_NOI_BO = "vive_lich_su_noi_bo";

interface KhoiTaoSupabaseProps {
  fontClasses?: string[];
}

export function KhoiTaoSupabase({ fontClasses = [] }: KhoiTaoSupabaseProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || fontClasses.length === 0) return;
    let raf1 = 0;
    let raf2 = 0;
    let timerId = 0;
    const classes = fontClasses.filter(Boolean);
    if (classes.length === 0) return;

    // Gắn biến font sau khung vẽ đầu tiên (first paint / LCP) để tránh .woff2 chặn LCP trong Lantern
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        timerId = window.setTimeout(() => {
          document.documentElement.classList.add(...classes);
        }, 250);
      });
    });

    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
      if (timerId) window.clearTimeout(timerId);
    };
  }, [fontClasses]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(KHOA_LICH_SU_NOI_BO);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const dich = Array.isArray(arr) ? arr : [];
      const hienTai = window.location.pathname + window.location.search;
      if (dich[dich.length - 1] !== hienTai) {
        dich.push(hienTai);
        window.sessionStorage.setItem(
          KHOA_LICH_SU_NOI_BO,
          JSON.stringify(dich.slice(-30))
        );
      }
    } catch {
      // bỏ qua lỗi sessionStorage
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Bỏ qua các trang nội bộ của nhân viên và quản trị để không tạo phiên ẩn danh lẫn lộn
    const currentPath = window.location.pathname;
    if (
      currentPath.startsWith("/nhan-vien") ||
      currentPath.startsWith("/quan-tri")
    ) {
      return;
    }

    let cancelled = false;
    let timerId = 0;

    // Trì hoãn tải cụm Supabase sau khung vẽ đầu tiên để không tranh CPU/băng thông với LCP
    const khoiChay = () => {
      if (cancelled) return;
      void (async () => {
        const [
          { damBaoKhachAnDanh, dongBoHoSo, KHOA_HO_SO_CAN_DONG_BO },
          { khoiTaoLangNgheMang, dayHangDoiLuotQuet },
          { luuNguonVaoTuUrl, ghiSuKien, dayHangDoiSuKien },
          { layHoSoLocal },
        ] = await Promise.all([
          import("@/lib/supabase/auth"),
          import("@/lib/supabase/luot-quet"),
          import("@/lib/supabase/su-kien"),
          import("@/lib/kho-luu-tru"),
        ]);

        if (cancelled) return;

        // 1. Lưu ?src= từ URL
        luuNguonVaoTuUrl();

        // 2. Thiết lập lắng nghe sự kiện mạng (online / visibilitychange / beforeunload)
        khoiTaoLangNgheMang();

        // 3. Đăng nhập ẩn danh nếu chưa có session thật, và đồng bộ nền
        await damBaoKhachAnDanh();
        if (cancelled) return;

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
    };

    const rafId = window.requestAnimationFrame(() => {
      timerId = window.setTimeout(khoiChay, 250);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  return null;
}
