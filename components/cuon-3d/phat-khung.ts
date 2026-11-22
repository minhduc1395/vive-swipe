/**
 * Chuỗi ảnh khung LOPOE trên điện thoại: khung đang hiện bám theo vị trí cuộn bằng lò xo giảm chấn tới hạn
 * (kiểu SmoothDamp). Hình theo tay ngay (trễ ~0,1 giây), dừng ngay khi trang ngừng cuộn, và tốc độ hình luôn
 * đổi liền mạch: ngón tay đổi nhịp, nhấc tay hay quán tính chậm dần cũng không làm hình giật cục.
 * Không tự chạy thêm sau khi trang đã đứng yên.
 */
export type TrangThaiPhat = { f: number; v: number };

export const BAM_MAC_DINH = {
  /** thời gian bám (giây): càng nhỏ càng sát tay, càng lớn càng mượt */
  thoiGian: 0.1,
  /** khung/giây tối đa (tránh nhảy quá nhiều khung trong 1 lần vẽ khi vuốt rất mạnh) */
  toiDa: 300,
};

export type CauHinhBam = typeof BAM_MAC_DINH;

export function buocBam(
  s: TrangThaiPhat,
  dich: number,
  dt: number,
  o: CauHinhBam = BAM_MAC_DINH,
): TrangThaiPhat {
  if (dt <= 0) return s;
  if (Math.abs(dich - s.f) < 0.01 && Math.abs(s.v) < 0.5) return { f: dich, v: 0 };
  const omega = 2 / o.thoiGian;
  const x = omega * dt;
  const giam = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const toiDaLech = o.toiDa * o.thoiGian;
  const lech = Math.max(-toiDaLech, Math.min(toiDaLech, s.f - dich));
  const dich2 = s.f - lech;
  const tam = (s.v + omega * lech) * dt;
  let v = (s.v - omega * tam) * giam;
  let f = dich2 + (lech + tam) * giam;
  // không vượt đích
  if (dich - s.f > 0 === f > dich) {
    f = dich;
    v = 0;
  }
  return { f, v };
}

/** Vị trí khung (có phần lẻ) ứng với tiến trình p, theo bảng p của từng khung (tăng dần). */
export function khungTuP(pKhung: number[], p: number): number {
  const n = pKhung.length;
  if (n < 2 || p <= pKhung[0]) return 0;
  if (p >= pKhung[n - 1]) return n - 1;
  let lo = 0, hi = n - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (pKhung[m] <= p) lo = m;
    else hi = m - 1;
  }
  const j = Math.min(n - 1, lo + 1);
  return j > lo ? lo + (p - pKhung[lo]) / (pKhung[j] - pKhung[lo]) : lo;
}

/** Ngược lại: tiến trình p ứng với vị trí khung f. */
export function pTuKhung(pKhung: number[], f: number): number {
  const n = pKhung.length;
  if (n === 0) return 0;
  const i = Math.max(0, Math.min(n - 1, Math.floor(f)));
  const j = Math.min(n - 1, i + 1);
  return pKhung[i] + (pKhung[j] - pKhung[i]) * Math.max(0, Math.min(1, f - i));
}
