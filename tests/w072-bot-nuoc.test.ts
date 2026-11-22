import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { MOC_CANH_AMP, pCanh, pTuCanh } from "@/components/cuon-3d/phat-khung";

const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8"));

/** Kích thước ảnh webp (VP8 / VP8L / VP8X) đọc từ phần đầu file. */
function coWebp(buf: Buffer): { w: number; h: number } {
  expect(buf.toString("ascii", 0, 4)).toBe("RIFF");
  expect(buf.toString("ascii", 8, 12)).toBe("WEBP");
  const loai = buf.toString("ascii", 12, 16);
  if (loai === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (loai === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) };
  }
  return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
}

describe("W072 (#126) · bọt nước đoạn 4 hoạt chất", () => {
  it("công tắc mặc định tắt trên bản thật", () => {
    expect(cfg.bot_nuoc, "thiếu khối bot_nuoc").toBeDefined();
    expect(cfg.bot_nuoc!.bat).toBe(false);
  });

  it("đủ 4 ảnh bọt, ghép đúng 4 hoạt chất ampoule; mỗi file ≤ 80 KB, cạnh ≤ 512px", () => {
    const anh = cfg.bot_nuoc!.anh as Record<string, string | undefined>;
    for (const t of cfg.thanh_phan.ampoule) {
      const url = anh[t.loai];
      expect(url, `${t.ten}: thiếu ảnh bọt`).toMatch(/^\/thanh-phan\/bot-nuoc-[a-z-]+\.webp$/);
      const buf = fs.readFileSync(path.join(process.cwd(), "public", url!));
      expect(buf.length, url).toBeLessThanOrEqual(80 * 1024);
      const { w, h } = coWebp(buf);
      expect(Math.max(w, h), url).toBeLessThanOrEqual(512);
    }
    const tep = fs.readdirSync(path.join(process.cwd(), "public/thanh-phan")).filter((f) => f.startsWith("bot-nuoc-"));
    expect(tep).toHaveLength(4);
  });

  it("đoạn amp-thanh-phan 0,53–0,68; khối sau không chồng, giữ thứ tự", () => {
    const i = cfg.khoi.findIndex((k) => k.id === "amp-thanh-phan");
    expect(cfg.khoi[i].a).toBe(0.53);
    expect(cfg.khoi[i].b).toBe(0.68);
    expect(cfg.khoi.slice(i + 1).map((k) => k.id)).toEqual(["amp-giai-thuong", "kem-cong-dung", "ket"]);
    for (let j = i + 1; j < cfg.khoi.length; j++) expect(cfg.khoi[j].a).toBeGreaterThan(cfg.khoi[j - 1].b);
  });

  it("máy tính: 4 góc vòng cung tăng dần, cách đều; cỡ bọt như nhau", () => {
    const g = cfg.bot_nuoc!.may_tinh.goc;
    const buoc = g.slice(1).map((x, i) => x - g[i]);
    for (const b of buoc) expect(Math.abs(b - buoc[0])).toBeLessThan(0.5);
  });

  it("pCanh: mốc yaml mới → mốc gốc của cảnh / ảnh khung", () => {
    const { a, b } = { a: 0.53, b: 0.68 };
    expect(pCanh(0.3, a, b)).toBeCloseTo(0.3, 9); // trước đoạn: giữ nguyên
    expect(pCanh(a, a, b)).toBeCloseTo(MOC_CANH_AMP.a, 9);
    expect(pCanh(b, a, b)).toBeCloseTo(MOC_CANH_AMP.b, 9);
    expect(pCanh(1, a, b)).toBe(1);
    // khối giải thưởng cũ 0,65 → mốc mới (0,705) vẫn ra cảnh ≈ 0,65
    expect(pCanh(0.705, a, b)).toBeCloseTo(0.65, 2);
    // tăng dần
    let truoc = -1;
    for (let p = 0; p <= 1; p += 0.01) { const q = pCanh(p, a, b); expect(q).toBeGreaterThanOrEqual(truoc); truoc = q; }
    // ngược lại
    for (const p of [0.1, 0.55, 0.6, 0.7, 0.9]) expect(pTuCanh(pCanh(p, a, b), a, b)).toBeCloseTo(p, 9);
  });

  it("pCanh giữ khung (điện thoại, bọt nước): cả đoạn đứng ở 0,53; sau đoạn đi tiếp từ lúc hạt cũ đã mờ", () => {
    const { a, b } = { a: 0.53, b: 0.68 };
    for (const p of [a, 0.6, 0.679]) expect(pCanh(p, a, b, true)).toBe(MOC_CANH_AMP.a);
    expect(pCanh(b, a, b, true)).toBeCloseTo(MOC_CANH_AMP.het, 9);
    expect(pCanh(1, a, b, true)).toBe(1);
    expect(pTuCanh(MOC_CANH_AMP.a + 0.05, a, b, true)).toBe(a);
    expect(pTuCanh(pCanh(0.8, a, b, true), a, b, true)).toBeCloseTo(0.8, 9);
  });
});
