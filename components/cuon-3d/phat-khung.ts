/**
 * Phát chuỗi ảnh khung LOPOE trên điện thoại với tốc độ đều, không phụ thuộc tốc độ cuộn.
 *
 * Cuộn chỉ đặt "khung đích". Khung đang hiện chạy về đích như phát video:
 * - tốc độ cơ bản cố định (`coBan` khung/giây), cuộn nhanh hay chậm, thả tay hay vuốt mạnh đều như nhau;
 * - chỉ khi bị bỏ xa (vuốt rất mạnh) mới tăng tốc dần để đuổi kịp, tối đa `toiDa`;
 * - mọi thay đổi tốc độ bị giới hạn gia tốc `gia` (khung/giây²): khởi động và dừng êm, không giật;
 * - không bao giờ vượt qua đích.
 */
export type TrangThaiPhat = { f: number; v: number };

export const PHAT_MAC_DINH = {
  /** khung/giây khi đi bình thường (~47 khung cho mỗi màn hình cuộn) */
  coBan: 40,
  /** trễ quá số khung này (~3 màn hình cuộn) mới bắt đầu tăng tốc đuổi theo; dưới ngưỡng luôn đúng tốc độ cơ bản */
  nguongDuoi: 150,
  /** mỗi khung trễ thêm (sau ngưỡng) tăng bao nhiêu khung/giây */
  heSoDuoi: 0.5,
  /** khung/giây tối đa khi đuổi */
  toiDa: 140,
  /** gia tốc tối đa (khung/giây²): 0 → 40 khung/giây trong ~0,33 giây */
  gia: 120,
};

export type CauHinhPhat = typeof PHAT_MAC_DINH;

export function buocPhat(
  s: TrangThaiPhat,
  dich: number,
  dt: number,
  o: CauHinhPhat = PHAT_MAC_DINH,
): TrangThaiPhat {
  const e = dich - s.f;
  const d = Math.abs(e);
  if (d < 0.02 && Math.abs(s.v) < 2) return { f: dich, v: 0 };
  if (dt <= 0) return s;

  let toc = Math.min(o.toiDa, o.coBan + Math.max(0, d - o.nguongDuoi) * o.heSoDuoi);
  // gần đích thì hãm dần để dừng êm đúng khung đích
  toc = Math.min(toc, Math.sqrt(2 * o.gia * d));
  const vMuon = Math.sign(e) * toc;

  const buocToiDa = o.gia * dt;
  const v = s.v + Math.max(-buocToiDa, Math.min(buocToiDa, vMuon - s.v));
  const f = s.f + v * dt;
  // đi qua đích trong bước này thì dừng đúng đích
  if (e * (dich - f) < 0) return { f: dich, v: 0 };
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
 * Chọn điểm dừng làm đích theo hướng cuộn, để tốc độ hình không phụ thuộc tốc độ ngón tay
 * kể cả khi kéo rất chậm: cuộn tới một chút là hình tự chạy (tốc độ đều) tới cảnh kế tiếp rồi dừng;
 * cuộn lui một chút là chạy lùi về cảnh trước. Rung tay nhỏ hơn `nguong` (theo tiến trình p) bị bỏ qua.
 *
 * - `q`: tiến trình cuộn hiện tại (0–1)
 * - `dich`: đích đang chạy tới (p)
 * - `moc`: tiến trình cuộn lúc ra quyết định gần nhất
 * - `diemDung`: các điểm dừng (p), tăng dần, gồm 0 và 1
 */
export function chonDich(
  st: { dich: number; moc: number },
  q: number,
  diemDung: number[],
  nguong = 0.003,
): { dich: number; moc: number } {
  const dq = q - st.moc;
  if (dq > nguong) {
    if (st.dich > q) return { dich: st.dich, moc: q };
    const tren = diemDung.find((d) => d >= q) ?? 1;
    return { dich: tren, moc: q };
  }
  if (dq < -nguong) {
    if (st.dich < q) return { dich: st.dich, moc: q };
    let duoi = 0;
    for (const d of diemDung) if (d <= q) duoi = d;
    return { dich: duoi, moc: q };
  }
  return st;
}

/** Điểm dừng từ các khối chữ: lúc chữ của khối đã hiện đủ (a + 0,02), cộng đầu và cuối đoạn. */
export function diemDungTuKhoi(khoi: { a: number }[]): number[] {
  const ds = [0, ...khoi.map((k) => Math.min(1, k.a + 0.02)), 1];
  return [...new Set(ds)].sort((x, y) => x - y);
}
