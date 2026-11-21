import { describe, it, expect } from "vitest";
import {
  buocPhat,
  chonDich,
  diemDungTuKhoi,
  khungTuP,
  pTuKhung,
  PHAT_MAC_DINH as O,
  type TrangThaiPhat,
} from "@/components/cuon-3d/phat-khung";

const DT = 1 / 60;

/** Chạy n bước 60 fps với đích thay đổi theo thời gian; trả lịch sử tốc độ. */
function chay(dau: TrangThaiPhat, dich: (t: number) => number, giay: number) {
  let s = dau;
  const v: number[] = [];
  const f: number[] = [];
  for (let k = 0; k < Math.round(giay * 60); k++) {
    s = buocPhat(s, dich(k * DT), DT);
    v.push(s.v);
    f.push(s.f);
  }
  return { s, v, f };
}

describe("phát khung LOPOE tốc độ đều", () => {
  it("cuộn chậm hay nhanh (trong ngưỡng) đều chạy đúng tốc độ cơ bản", () => {
    // đích 45 khung (≈1 màn hình) đặt ngay lập tức (vuốt nhanh) hoặc tăng dần trong 0,3 giây (vuốt chậm)
    const nhanh = chay({ f: 0, v: 0 }, () => 45, 0.8);
    const cham = chay({ f: 0, v: 0 }, (t) => Math.min(45, t * 150), 0.8);
    // giữa đường, cả hai chạy đúng 40 khung/giây
    expect(nhanh.v[30]).toBeCloseTo(O.coBan, 5);
    expect(cham.v[30]).toBeCloseTo(O.coBan, 5);
  });

  it("thả tay (đích ngừng đổi) không làm hình chậm đột ngột: tốc độ giữ nguyên tới gần đích", () => {
    // ngón tay kéo 60 khung trong 0,2 giây rồi thả (quán tính thêm 30 khung chậm dần)
    const dich = (t: number) => (t < 0.2 ? t * 300 : Math.min(90, 60 + (1 - Math.exp(-(t - 0.2) * 4)) * 30));
    const r = chay({ f: 0, v: 0 }, dich, 1.6);
    // từ 0,4 đến 1,6 giây: tốc độ luôn là 40, không tụt theo quán tính cuộn
    for (let k = 24; k < 90; k++) expect(r.v[k]).toBeCloseTo(O.coBan, 5);
  });

  it("đổi tốc độ không bao giờ quá gia tốc cho phép (không giật)", () => {
    const dich = (t: number) => (t < 0.1 ? 400 : t < 2 ? 100 : 500);
    const r = chay({ f: 0, v: 0 }, dich, 6);
    for (let k = 1; k < r.v.length; k++) {
      const dv = Math.abs(r.v[k] - r.v[k - 1]);
      // bước dừng đúng đích được phép về 0 từ tốc độ đã hãm rất thấp
      if (r.v[k] === 0) expect(Math.abs(r.v[k - 1])).toBeLessThan(10);
      else expect(dv).toBeLessThanOrEqual(O.gia * DT + 1e-9);
    }
  });

  it("vuốt rất mạnh (bị bỏ xa) thì đuổi nhanh dần, không quá tốc độ tối đa, rồi dừng đúng đích", () => {
    const r = chay({ f: 0, v: 0 }, () => 600, 10);
    expect(Math.max(...r.v)).toBeLessThanOrEqual(O.toiDa + 1e-9);
    expect(Math.max(...r.v)).toBeGreaterThan(O.coBan);
    expect(r.s.f).toBe(600);
    expect(r.s.v).toBe(0);
  });

  it("không vượt qua đích, cả khi cuộn ngược lại", () => {
    const tien = chay({ f: 0, v: 0 }, () => 30, 3);
    expect(Math.max(...tien.f)).toBeLessThanOrEqual(30);
    const lui = chay({ f: 100, v: 0 }, () => 70, 3);
    expect(Math.min(...lui.f)).toBeGreaterThanOrEqual(70);
    expect(lui.s.f).toBe(70);
  });

  it("đổi chiều giữa chừng thì hãm êm rồi quay lại", () => {
    const r = chay({ f: 0, v: 0 }, (t) => (t < 0.5 ? 100 : 0), 4);
    expect(r.s.f).toBe(0);
    for (let k = 1; k < r.v.length; k++) {
      if (r.v[k] !== 0) expect(Math.abs(r.v[k] - r.v[k - 1])).toBeLessThanOrEqual(O.gia * DT + 1e-9);
    }
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

describe("chọn cảnh đích theo hướng cuộn", () => {
  const D = [0, 0.1, 0.2, 0.3, 1];
  it("cuộn tới một chút thì chạy tới cảnh kế tiếp, kể cả khi kéo rất chậm", () => {
    let st = { dich: 0.1, moc: 0.1 };
    st = chonDich(st, 0.102, D); // rung tay nhỏ: giữ nguyên
    expect(st.dich).toBe(0.1);
    st = chonDich(st, 0.105, D);
    expect(st.dich).toBe(0.2);
    // tiếp tục kéo chậm trước cảnh 0.2: đích không đổi, hình không khựng theo tay
    for (const q of [0.11, 0.13, 0.15]) st = chonDich(st, q, D);
    expect(st.dich).toBe(0.2);
    st = chonDich(st, 0.21, D);
    expect(st.dich).toBe(0.3);
  });

  it("cuộn lui thì chạy lùi về cảnh trước; vuốt mạnh qua nhiều cảnh thì tới cảnh gần chỗ dừng tay", () => {
    let st = chonDich({ dich: 0.2, moc: 0.13 }, 0.12, D);
    expect(st.dich).toBe(0.1);
    st = chonDich({ dich: 0.1, moc: 0.1 }, 0.55, D);
    expect(st.dich).toBe(1);
  });

  it("điểm dừng lấy từ khối chữ, có đầu và cuối", () => {
    expect(diemDungTuKhoi([{ a: 0.3 }, { a: 0.075 }, { a: 0.99 }])).toEqual([0, 0.095, 0.32, 1]);
  });
});
