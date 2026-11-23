import { describe, expect, it } from "vitest";
import { KHOA, KHOA_AMP_BOT_NUOC, tuTheAmp } from "@/components/cuon-3d/canh";
import { chaiDienThoai, duongBay, MOC_CANH_AMP, NHIP_BOT, tienTrinhBot, type Diem } from "@/components/cuon-3d/phat-khung";

/** W072 phần B (#127): chai đi theo cuộn (không xoay), bọt bay từ miệng chai và nảy 1 lần. */

const buocP = (a: number, b: number, n = 400) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
/** x màn hình (0 → 1 theo bề rộng) của tư thế: cảnh đặt x·nuaW ở z = 0 → x chuẩn hoá = (1 + x) / 2 */
const xManHinh = (x: number) => (1 + x) / 2;

describe("W072 (#127) · tư thế chai ampoule khi bật bọt nước", () => {
  const { a, b } = MOC_CANH_AMP;

  it("góc quay quanh trục Z = 0 (và không xoay trục Y) tại mọi p trong đoạn, máy tính và điện thoại", () => {
    for (const dt of [false, true])
      for (const p of buocP(a, b)) {
        const s = tuTheAmp(p, true, dt);
        expect(s.rz, `p=${p}`).toBe(0);
        expect(s.ry, `p=${p}`).toBe(0);
      }
  });

  it("chai đầu đoạn ở giữa, cuối đoạn còn ≈ 70% (±5%) và x trong 28–40% bề rộng", () => {
    const dau = tuTheAmp(a, true, false), cuoi = tuTheAmp(b, true, false);
    expect(xManHinh(dau.x)).toBeCloseTo(0.5, 2);
    expect(cuoi.s / dau.s).toBeGreaterThanOrEqual(0.65);
    expect(cuoi.s / dau.s).toBeLessThanOrEqual(0.75);
    expect(xManHinh(cuoi.x)).toBeGreaterThanOrEqual(0.28);
    expect(xManHinh(cuoi.x)).toBeLessThanOrEqual(0.4);
    // chai đứng yên khi bọt bay (sau khi tới chỗ)
    const toi = tuTheAmp(a + (b - a) * 0.3, true, false);
    expect(toi.x).toBeCloseTo(cuoi.x, 9);
    expect(toi.s).toBeCloseTo(cuoi.s, 9);
  });

  it("đi liền mạch, cỡ chỉ giảm dần, x chỉ dời sang trái trong đoạn", () => {
    let truoc = tuTheAmp(a, true, false);
    for (const p of buocP(a, b).slice(1)) {
      const s = tuTheAmp(p, true, false);
      expect(s.s).toBeLessThanOrEqual(truoc.s + 1e-9);
      expect(s.x).toBeLessThanOrEqual(truoc.x + 1e-9);
      expect(Math.abs(s.x - truoc.x)).toBeLessThan(0.02);
      truoc = s;
    }
  });

  it("ngoài đoạn và khi tắt công tắc: giữ kịch bản cũ", () => {
    for (const p of [0, 0.3, 0.5, 0.65, 0.8, 1]) {
      const moi = tuTheAmp(p, true, false), cu = tuTheAmp(p, false, false);
      for (const k of Object.keys(cu) as (keyof typeof cu)[]) expect(moi[k], `p=${p} ${k}`).toBeCloseTo(cu[k], 9);
    }
    expect(KHOA_AMP_BOT_NUOC.filter((k) => k[0] < a || k[0] > b)).toEqual(KHOA.amp.filter((k) => k[0] < a || k[0] > b));
  });
});

describe("W072 (#127) · đường bay bọt", () => {
  const mieng: Diem = { x: 420, y: 380 };
  const dich: Diem[] = [{ x: 640, y: 240 }, { x: 760, y: 410 }, { x: 760, y: 600 }, { x: 640, y: 770 }, { x: 200, y: 520 }, { x: 430, y: 390 }];
  const T = buocP(0, 1, 1000);

  it("điểm đầu = miệng chai, điểm cuối = chỗ đứng phần A", () => {
    for (const d of dich) {
      const dau = duongBay(0, mieng, d), cuoi = duongBay(1, mieng, d);
      expect(dau.x).toBeCloseTo(mieng.x, 9);
      expect(dau.y).toBeCloseTo(mieng.y, 9);
      expect(cuoi.x).toBeCloseTo(d.x, 9);
      expect(cuoi.y).toBeCloseTo(d.y, 9);
      expect(cuoi.s).toBe(1);
      expect(cuoi.o).toBe(1);
    }
  });

  it("vượt quá đích tối đa 1 lần, quá không xa (≤ 14px), không dao động thêm", () => {
    for (const d of dich) {
      // khoảng cách có dấu tới đích theo hướng tới (dương = đã vượt quá)
      const c = { x: (mieng.x + d.x) / 2, y: Math.min(mieng.y, d.y) - 0.25 * Math.hypot(d.x - mieng.x, d.y - mieng.y) };
      const L = Math.hypot(d.x - c.x, d.y - c.y) || 1, ux = (d.x - c.x) / L, uy = (d.y - c.y) / L;
      let soLanVuot = 0, dangVuot = false, xaNhat = 0;
      for (const t of T) {
        const p = duongBay(t, mieng, d);
        const v = (p.x - d.x) * ux + (p.y - d.y) * uy;
        const vuot = v > 1e-6;
        if (vuot && !dangVuot) soLanVuot++;
        dangVuot = vuot;
        xaNhat = Math.max(xaNhat, Math.hypot(p.x - d.x, p.y - d.y) * (vuot ? 1 : 0));
      }
      expect(soLanVuot).toBeLessThanOrEqual(1);
      expect(xaNhat).toBeLessThanOrEqual(14 + 1e-6);
    }
  });

  it("chạy liền (không nhảy cóc), lớn dần từ 30% và hiện dần", () => {
    for (const d of dich) {
      let truoc = duongBay(0, mieng, d);
      expect(truoc.s).toBeCloseTo(0.3, 9);
      expect(truoc.o).toBe(0);
      for (const t of T.slice(1)) {
        const p = duongBay(t, mieng, d);
        expect(Math.hypot(p.x - truoc.x, p.y - truoc.y)).toBeLessThan(20);
        expect(p.s).toBeGreaterThanOrEqual(truoc.s - 1e-9);
        truoc = p;
      }
    }
  });

  it("nhịp: 4 bọt rời chai lần lượt, bọt cuối tới chỗ trước 65% đoạn (chữ còn đứng)", () => {
    const roi = [0, 1, 2, 3].map((i) => T.find((q) => tienTrinhBot(q, i) > 0)!);
    for (let i = 1; i < 4; i++) expect(roi[i]).toBeGreaterThan(roi[i - 1]);
    expect(tienTrinhBot(0.65, 3)).toBe(1);
    expect(NHIP_BOT.batDau + 3 * NHIP_BOT.cach + NHIP_BOT.bay).toBeLessThanOrEqual(0.65);
    expect(tienTrinhBot(0, 0)).toBe(0);
  });
});

describe("W072 (#127) · chai trong ảnh khung điện thoại", () => {
  const goc = { x: 121, tren: 144, day: 475 };
  const vung = { x: 195, tren: 241, duoi: 469 };

  it("cuối đoạn: chai thu ≤ 70%, nằm trọn trong vùng trống dưới 2 nút, trên lưới bọt", () => {
    for (const q of [NHIP_BOT.batDau, 0.5, 0.8, 0.9]) { // chai tới chỗ trước khi bọt đầu rời chai
      const c = chaiDienThoai(q, goc, vung);
      expect(c.k).toBeLessThanOrEqual(0.7 + 1e-9);
      const tren = c.y - (goc.day - goc.tren) * c.k;
      expect(tren).toBeGreaterThanOrEqual(vung.tren - 1e-6);
      expect(c.y).toBeLessThanOrEqual(vung.duoi + 1e-6);
      expect(c.x).toBeCloseTo(vung.x, 6);
    }
  });

  it("đầu đoạn và hết đoạn: chai đúng chỗ trong ảnh khung (nối liền chuỗi ảnh trước/sau)", () => {
    for (const q of [0, 1]) {
      const c = chaiDienThoai(q, goc, vung);
      expect(c).toMatchObject({ x: goc.x, y: goc.day, k: 1, e: 0 });
    }
  });

  it("vùng chật hơn chai 70%: chai thu nhỏ thêm cho vừa", () => {
    const c = chaiDienThoai(0.8, goc, { x: 180, tren: 236, duoi: 433 });
    expect(c.y - (goc.day - goc.tren) * c.k).toBeGreaterThanOrEqual(236 - 1e-6);
    expect(c.k).toBeLessThan(0.7);
  });
});
