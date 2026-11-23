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

// ───────────── W072 phần B (#127): bọt bay từ miệng chai, nảy 1 lần; chai trong ảnh khung điện thoại dời + thu nhỏ ─────────────

export type Diem = { x: number; y: number };
const kep01 = (v: number) => Math.max(0, Math.min(1, v));
const muot = (t: number) => t * t * (3 - 2 * t);

/**
 * Nhịp bay trong đoạn 4 hoạt chất, theo q = tiến trình trong đoạn (0 → 1, mốc yaml a → b).
 * Bọt i rời miệng chai ở q = batDau + i·cach, bay trong `bay`; bọt cuối tới chỗ ở q = 0,6 (chữ còn đứng tới ~0,9).
 */
export const NHIP_BOT = { batDau: 0.22, cach: 0.07, bay: 0.17 } as const;

/** Tiến trình bay (0 → 1) của bọt thứ i tại q. */
export const tienTrinhBot = (q: number, i: number) => kep01((q - NHIP_BOT.batDau - i * NHIP_BOT.cach) / NHIP_BOT.bay);

/** Phần thời gian bay tới lúc vượt đích xa nhất; phần còn lại là nhịp nảy về. */
const T_VUOT = 0.72;

/**
 * Đường bay của 1 bọt tại t (0 → 1): cong Bezier bậc 2 từ `dau` (miệng chai) tới `cuoi` (chỗ đứng phần A), đỉnh cong
 * nhô lên trên. Tới cuối, bọt trượt quá đích theo hướng đang bay tối đa `vuot` px (≤ 8% quãng bay) rồi lùi về đúng đích,
 * dừng hẳn: đúng 1 lần nảy, không dao động thêm. Trả về vị trí tâm, tỉ lệ cỡ (s) và độ đục (o).
 */
export function duongBay(t: number, dau: Diem, cuoi: Diem, vuot = 14): Diem & { s: number; o: number } {
  t = kep01(t);
  const L = Math.hypot(cuoi.x - dau.x, cuoi.y - dau.y);
  const A = L > 0 ? Math.min(0.08, vuot / L) : 0;
  // rời miệng chậm, tăng tốc giữa đường, chậm lại tới đỉnh vượt (vận tốc 0), rồi lùi êm về đích
  const k = t < T_VUOT ? (1 + A) * muot(t / T_VUOT) : 1 + A * (1 - muot((t - T_VUOT) / (1 - T_VUOT)));
  const c = { x: (dau.x + cuoi.x) / 2, y: Math.min(dau.y, cuoi.y) - 0.25 * L };
  let x: number, y: number;
  if (k <= 1) {
    const u = 1 - k;
    x = u * u * dau.x + 2 * u * k * c.x + k * k * cuoi.x;
    y = u * u * dau.y + 2 * u * k * c.y + k * k * cuoi.y;
  } else {
    // quá đích: đi tiếp theo tiếp tuyến cuối đường cong
    const tx = cuoi.x - c.x, ty = cuoi.y - c.y, d = Math.hypot(tx, ty) || 1;
    x = cuoi.x + (tx / d) * (k - 1) * L;
    y = cuoi.y + (ty / d) * (k - 1) * L;
  }
  return { x, y, s: 0.3 + 0.7 * muot(kep01(t / T_VUOT)), o: muot(kep01(t / 0.12)) };
}

/**
 * Chai ampoule trong ảnh khung điện thoại đứng ở cảnh 0,53 (khung 426, khung nhìn chụp 390×844): toạ độ đo trên ảnh.
 * x: tâm chai; tren: đỉnh nắp; mieng: miệng chai (cổ nắp); day: đáy thân. `cat`: vùng cắt chai (gồm bóng đổ) để vẽ lại.
 * Nền khung đối xứng trái-phải (cảnh đặt nền giữa), nên nền sạch = nửa phải lật sang trái.
 */
export const CHAI_KHUNG = { x: 121, tren: 144, mieng: 260, day: 475, cat: { x0: 40, x1: 200, y0: 125, y1: 500 }, mo: { x: 16, y: 14 } } as const;

/**
 * Chai trong ảnh khung điện thoại (đơn vị px màn hình): dời từ chỗ gốc vào giữa vùng trống [tren, duoi] (dưới 2 nút,
 * trên lưới bọt), thu còn tối đa `coToiDa` (70%); q 0 → 0,2 đi tới (xong trước khi bọt đầu rời chai), đứng yên tới 0,93, rồi về chỗ gốc khi chữ đã mờ
 * (nối liền với chuỗi ảnh sau đoạn). Trả về tâm đáy chai mới (x, y) và tỉ lệ k (1 = như ảnh gốc).
 */
export function chaiDienThoai(
  q: number,
  goc: { x: number; tren: number; day: number },
  vung: { x: number; tren: number; duoi: number },
  coToiDa = 0.7,
): Diem & { k: number; e: number } {
  const h = goc.day - goc.tren, cao = Math.max(0, vung.duoi - vung.tren);
  const k1 = Math.min(coToiDa, cao / h);
  const y1 = vung.duoi - (cao - k1 * h) / 2;
  const e = muot(kep01(q / 0.2)) * (1 - muot(kep01((q - 0.93) / 0.07)));
  return { x: goc.x + (vung.x - goc.x) * e, y: goc.day + (y1 - goc.day) * e, k: 1 + (k1 - 1) * e, e };
}
