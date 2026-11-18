"use client";

import { useEffect, useState, Suspense } from "react";
import {
  layPhienNhanVienLocal,
  dangXuatNhanVienLocal,
  type PhienNhanVien,
} from "@/lib/nhan-vien/auth";
import { DangNhapNhanVien } from "./DangNhapNhanVien";
import { BangNhanVien } from "./BangNhanVien";

export function NhanVienClient() {
  const [phien, setPhien] = useState<PhienNhanVien | null>(null);
  const [daKiemTra, setDaKiemTra] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const p = layPhienNhanVienLocal();
    setPhien(p);
    setDaKiemTra(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleAuthChange = () => {
      setPhien(layPhienNhanVienLocal());
    };

    window.addEventListener("vive_staff_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("vive_staff_auth_changed", handleAuthChange);
    };
  }, []);

  if (!daKiemTra) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-den" />
      </div>
    );
  }

  // Khách hoặc nhân viên chưa đăng nhập -> Hiện form đăng nhập
  if (!phien) {
    return (
      <DangNhapNhanVien
        onDangNhapThanhCong={(phienMoi) => setPhien(phienMoi)}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[500px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-den" />
        </div>
      }
    >
      <BangNhanVien phien={phien} onDangXuat={() => dangXuatNhanVienLocal()} />
    </Suspense>
  );
}
