"use client";

import { useTranslations } from "next-intl";
import { nhanHamDich, taoNhan, type BoNhan, type HamDich } from "./ngon-ngu-quet";

/** Hook lấy hàm dịch của một nhóm trong messages/<ngôn ngữ>/quet.json (ví dụ "quet.deck"). */
export function useDichQuet(nhom: string): HamDich {
  return nhanHamDich(useTranslations(nhom));
}

/** Hook lấy bộ nhãn theo mã (loại da, vấn đề da, danh mục, ngân sách). */
export function useNhanQuet(): BoNhan {
  return taoNhan(useDichQuet("quet.nhan"));
}
