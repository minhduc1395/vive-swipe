/** Số giây khóa nút "Gửi lại mã". */
export const GIAY_KHOA_GUI_LAI = 60;

/** Hạn mã OTP mặc định của Supabase (giây). Dùng để phân biệt "sai mã" và "hết hạn". */
export const GIAY_HAN_MA = 3600;

const MAU_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function chuanHoaEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function laEmailHopLe(email: string): boolean {
  const e = chuanHoaEmail(email);
  return e.length <= 254 && MAU_EMAIL.test(e);
}

/** Chỉ nhận đúng 6 chữ số. */
export function laMaHopLe(ma: string): boolean {
  return /^\d{6}$/.test(ma.trim());
}

/** Bỏ ký tự không phải số, giữ tối đa 6 số (dán cả chuỗi "123 456" vẫn được). */
export function lamSachMa(ma: string): string {
  return ma.replace(/\D/g, "").slice(0, 6);
}

/** Che phần giữa email: "minhduc@gmail.com" → "m***c@gmail.com". */
export function cheEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) return "***";
  const ten = email.slice(0, at);
  const mien = email.slice(at);
  if (ten.length <= 2) return `${ten[0]}***${mien}`;
  return `${ten[0]}***${ten[ten.length - 1]}${mien}`;
}

/** Số giây còn lại trước khi được gửi lại mã (0 = được gửi). */
export function giayConLaiGuiLai(
  guiLuc: number | null,
  bayGio: number,
  giayKhoa = GIAY_KHOA_GUI_LAI
): number {
  if (guiLuc === null) return 0;
  const conLai = Math.ceil((guiLuc + giayKhoa * 1000 - bayGio) / 1000);
  return Math.max(0, Math.min(giayKhoa, conLai));
}
