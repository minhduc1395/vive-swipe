"use server";

import { xuLyTaoGiuHang } from "@/lib/giu-hang/tao-giu-hang";
import type { KetQuaTaoGiuHang, ThongTinDatGiuHangInput } from "@/lib/giu-hang/types";

export async function actionTaoGiuHang(
  input: ThongTinDatGiuHangInput
): Promise<KetQuaTaoGiuHang> {
  return xuLyTaoGiuHang(input);
}
