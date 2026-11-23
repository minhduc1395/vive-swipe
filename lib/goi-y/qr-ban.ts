/** QD-BOD-027 / DES-013: chọn đích chuyển hướng cho QR để bàn `/q/<ma>`. Hàm thuần, có test. */

export type CauHinhQrBan = {
  mac_dinh: string;
  ma: Record<string, string>;
};

/** Đích hợp lệ: đường dẫn trong web (`/...`, không phải `//...` hay `/\...`) hoặc link `https://...` đầy đủ. */
export function laDichHopLe(dich: unknown): dich is string {
  if (typeof dich !== "string" || dich !== dich.trim()) return false;
  if (/[\u0000-\u001f\u007f\\]/.test(dich)) return false;
  if (dich.startsWith("/")) return !dich.startsWith("//");
  if (!dich.startsWith("https://")) return false;
  try {
    const u = new URL(dich);
    return u.protocol === "https:" && u.hostname.length > 0 && !u.username && !u.password;
  } catch {
    return false;
  }
}

/** Mã có trong `ma` và đích hợp lệ thì dùng; ngược lại rơi về `mac_dinh` (và `/bat-dau` nếu mặc định cũng hỏng). */
export function chonDichQr(ma: string, cauHinh: CauHinhQrBan): string {
  const macDinh = laDichHopLe(cauHinh.mac_dinh) ? cauHinh.mac_dinh : "/bat-dau";
  if (!Object.prototype.hasOwnProperty.call(cauHinh.ma, ma)) return macDinh;
  const dich = cauHinh.ma[ma];
  return laDichHopLe(dich) ? dich : macDinh;
}

/** Đích dạng đường dẫn thì ghép với origin của request; `https://` giữ nguyên. */
export function taoUrlDich(dich: string, goc: string): string {
  return dich.startsWith("/") ? new URL(dich, goc).toString() : dich;
}
