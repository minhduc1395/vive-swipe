/**
 * Che SĐT khách trước khi trả về trình duyệt của nhân viên (job #136, LEG L1).
 * Bỏ khoảng trắng, giữ 4 số cuối, phần trước thay bằng `*`.
 * SĐT ngắn hơn 4 ký tự thì che hết.
 */
export function cheSdt(sdt: string | null | undefined): string {
  const sach = (sdt ?? "").replace(/\s+/g, "");
  if (sach.length < 4) return "*".repeat(sach.length);
  return "*".repeat(sach.length - 4) + sach.slice(-4);
}

/** Phần số còn thấy được của SĐT đã che (bỏ các dấu `*`). */
export function duoiSdtDaChe(sdtDaChe: string): string {
  return sdtDaChe.replace(/\*/g, "");
}
