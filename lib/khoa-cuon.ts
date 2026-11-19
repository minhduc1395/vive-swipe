"use client";

import { useEffect } from "react";

/**
 * Khóa cuộn trang nền khi mở khung chi tiết: lăn chuột hay vuốt chỉ cuộn nội dung trong khung (CĐT 20/11).
 * Giữ nguyên vị trí cuộn và bù bề rộng thanh cuộn để trang không giật.
 */
export function useKhoaCuon(mo: boolean) {
  useEffect(() => {
    if (!mo) return;
    const html = document.documentElement;
    const body = document.body;
    const truoc = { overflow: html.style.overflow, paddingRight: body.style.paddingRight, overscroll: html.style.overscrollBehavior };
    const thanhCuon = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    if (thanhCuon > 0) body.style.paddingRight = `${thanhCuon}px`;
    return () => {
      html.style.overflow = truoc.overflow;
      html.style.overscrollBehavior = truoc.overscroll;
      body.style.paddingRight = truoc.paddingRight;
    };
  }, [mo]);
}
