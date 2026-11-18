"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { daTungKhaoSat, capNhatCookieKhaoSat } from "@/lib/khao-sat";

/**
 * Tự động chuyển khách cũ (đã từng khảo sát trên máy nhưng chưa có cookie)
 * từ /chao sang thẳng /quet mà không bắt làm lại khảo sát.
 */
export function KiemTraKhachCu() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coCookie = document.cookie.includes("vive_da_khao_sat=true");
    if (!coCookie && daTungKhaoSat()) {
      capNhatCookieKhaoSat();
      router.replace("/quet");
    }
  }, [router]);

  return null;
}
