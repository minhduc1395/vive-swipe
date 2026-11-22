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

/**
 * W072: mốc gốc của đoạn 4 hoạt chất ampoule trong cảnh (canh.ts) và trong chuỗi ảnh khung điện thoại (đã chụp theo mốc này).
 * `het`: lúc 4 hạt thành phần cũ (có đường kẻ) đã mờ hết trong ảnh khung.
 */
export const MOC_CANH_AMP = { a: 0.53, b: 0.62, het: 0.636 } as const;

/**
 * Đổi tiến trình cuộn p (mốc mới trong yaml: đoạn amp-thanh-phan = [a, b]) sang tiến trình của cảnh / ảnh khung (mốc gốc).
 * Tuyến tính từng khúc qua (0,0), (a, 0.53), (b, 0.62), (1,1): nới đoạn 4 hoạt chất mà không phải dựng lại cảnh.
 * giu = true (điện thoại, bố cục bọt nước): cả đoạn [a, b) đứng ở khung 0.53 (chưa có hạt, chưa có đường kẻ),
 * sau b đi tiếp từ khung 0.636 (hạt cũ đã mờ hết).
 */
export function pCanh(p: number, a: number, b: number, giu = false): number {
  const A = MOC_CANH_AMP.a, B = MOC_CANH_AMP.b, C = giu ? MOC_CANH_AMP.het : B;
  if (p <= a) return a > 0 ? (p * A) / a : A;
  if (p < b) return giu ? A : A + ((p - a) * (B - A)) / (b - a);
  return b < 1 ? Math.min(1, C + ((p - b) * (1 - C)) / (1 - b)) : 1;
}

/** Ngược của pCanh (giu = false): tiến trình cảnh → tiến trình cuộn. Với giu, đoạn đứng [0.53, 0.636] trả về a. */
export function pTuCanh(pc: number, a: number, b: number, giu = false): number {
  const A = MOC_CANH_AMP.a, B = MOC_CANH_AMP.b, C = giu ? MOC_CANH_AMP.het : B;
  if (pc <= A) return (pc * a) / A;
  if (giu && pc <= C) return a;
  if (pc < B) return a + ((pc - A) * (b - a)) / (B - A);
  return Math.min(1, b + ((pc - C) * (1 - b)) / (1 - C));
}
