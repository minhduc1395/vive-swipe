import { describe, it, expect } from "vitest";
import { buocBam, khungTuP, pTuKhung, type TrangThaiPhat } from "@/components/cuon-3d/phat-khung";

const DT = 1 / 60;

function chay(dau: TrangThaiPhat, dich: (t: number) => number, giay: number) {
  let s = dau;
  const v: number[] = [];
  const f: number[] = [];
  for (let k = 0; k < Math.round(giay * 60); k++) {
    s = buocBam(s, dich((k + 1) * DT), DT);
    v.push(s.v);
    f.push(s.f);
  }
  return { s, v, f };
}

/** Cuộn kiểu thật: kéo đều rồi nhấc tay, quán tính chậm dần theo hàm mũ. */
const cuonThat = (vTay: number, tNhac: number, tau: number) => (t: number) =>
  t < tNhac ? vTay * t : vTay * tNhac + vTay * tau * (1 - Math.exp(-(t - tNhac) / tau));

describe("khung bám tay (lò xo giảm chấn)", () => {
  it("theo tay sát: kéo đều 1 màn/giây (~47 khung/giây) thì trễ dưới 6 khung", () => {
    const r = chay({ f: 0, v: 0 }, (t) => 47 * t, 2);
    expect(47 * 2 - r.s.f).toBeLessThan(6);
  });

  it("trang ngừng cuộn thì hình dừng trong ~0,4 giây, không tự chạy thêm", () => {
    const dich = (t: number) => (t < 0.5 ? 100 * t : 50);
    const r = chay({ f: 0, v: 0 }, dich, 1.2);
    // 0,4 giây sau khi trang dừng (t = 0,9 giây) đã tới đích
    expect(Math.abs(r.f[Math.round(0.9 * 60) - 1] - 50)).toBeLessThan(0.05);
    expect(Math.max(...r.f)).toBeLessThanOrEqual(50);
  });

  it("nhấc tay rồi quán tính chậm dần: tốc độ hình đổi liền mạch, không giật", () => {
    const r = chay({ f: 0, v: 0 }, cuonThat(150, 0.4, 0.35), 2.5);
    for (let k = 2; k < r.v.length; k++) {
      // gia tốc của hình không vượt ~1500 khung/giây² (tức ≤25 khung/giây đổi mỗi lần vẽ)
      expect(Math.abs(r.v[k] - r.v[k - 1])).toBeLessThan(25);
    }
  });

  it("vuốt rất mạnh không nhảy quá tốc độ tối đa", () => {
    const r = chay({ f: 0, v: 0 }, (t) => 2000 * t, 1);
    expect(Math.max(...r.v)).toBeLessThanOrEqual(300 + 1e-6);
  });

  it("cuộn ngược thì về đúng đích, không vượt", () => {
    const r = chay({ f: 100, v: 0 }, () => 60, 1.5);
    expect(Math.min(...r.f)).toBeGreaterThanOrEqual(60);
    expect(r.s.f).toBe(60);
  });

  it("đổi qua lại giữa tiến trình p và vị trí khung", () => {
    const pk = [0, 0.1, 0.4, 1];
    expect(khungTuP(pk, 0)).toBe(0);
    expect(khungTuP(pk, 0.25)).toBeCloseTo(1.5, 9);
    expect(khungTuP(pk, 1)).toBe(3);
    expect(khungTuP(pk, 2)).toBe(3);
    expect(pTuKhung(pk, 1.5)).toBeCloseTo(0.25, 9);
    expect(pTuKhung(pk, 3)).toBe(1);
    for (const p of [0.03, 0.2, 0.77]) expect(pTuKhung(pk, khungTuP(pk, p))).toBeCloseTo(p, 9);
  });
});
