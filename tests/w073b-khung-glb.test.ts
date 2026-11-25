import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GlbSchema, parseCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { CHAI_KHUNG, CHAI_KHUNG_GLB } from "@/components/cuon-3d/phat-khung";

/** Cỡ ảnh WebP (VP8, VP8L, VP8X) đọc từ đầu file. */
function coWebp(b: Buffer): { w: number; h: number } {
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") throw new Error("không phải WebP");
  const loai = b.toString("ascii", 12, 16);
  if (loai === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (loai === "VP8L") { const v = b.readUInt32LE(21); return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 }; }
  if (loai === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  throw new Error(`WebP lạ: ${loai}`);
}

/** W073 phần B (#152): chuỗi khung điện thoại chụp từ cảnh 3D có GLB, sau công tắc glb. */
describe("W073 phần B · chuỗi khung GLB điện thoại", () => {
  const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8"));
  const pub = (p: string) => path.join(process.cwd(), "public", p);
  const cu = cfg.khung_dien_thoai!;
  const moi = cfg.glb?.khung_dien_thoai;
  const dsWebp = (thuMuc: string) => fs.readdirSync(pub(thuMuc)).filter((f) => /^\d{3}\.webp$/.test(f)).sort();
  const tongByte = (thuMuc: string) => fs.readdirSync(pub(thuMuc)).reduce((t, f) => t + fs.statSync(path.join(pub(thuMuc), f)).size, 0);

  it("yaml: glb.bat vẫn TẮT; chuỗi GLB cùng số khung, cỡ ảnh, khung nhìn với chuỗi cũ, thư mục khác", () => {
    expect(cfg.glb?.bat).toBe(false);
    expect(cfg.bot_nuoc?.bat).toBe(false);
    expect(moi, "thiếu glb.khung_dien_thoai").toBeDefined();
    expect(cu.thu_muc).toBe("/thu-nghiem/lopoe-khung");
    expect(moi!.thu_muc).not.toBe(cu.thu_muc);
    expect({ so: moi!.so, rong: moi!.rong, cao: moi!.cao, vp_rong: moi!.vp_rong, vp_cao: moi!.vp_cao }).toEqual({ so: 799, rong: 780, cao: 1688, vp_rong: 390, vp_cao: 844 });
    expect({ so: cu.so, rong: cu.rong, cao: cu.cao }).toEqual({ so: 799, rong: 780, cao: 1688 });
  });

  it("đúng 799 khung WebP 780×1688, đánh số 000–798", () => {
    const ds = dsWebp(moi!.thu_muc);
    expect(ds).toHaveLength(moi!.so);
    expect(ds[0]).toBe("000.webp");
    expect(ds[ds.length - 1]).toBe(`${String(moi!.so - 1).padStart(3, "0")}.webp`);
    for (const f of ds) {
      const b = fs.readFileSync(path.join(pub(moi!.thu_muc), f));
      expect(coWebp(b), f).toEqual({ w: moi!.rong, h: moi!.cao });
    }
  });

  it("tổng dung lượng ± 10% chuỗi cũ", () => {
    const a = tongByte(cu.thu_muc), b = tongByte(moi!.thu_muc);
    expect(b / a).toBeGreaterThanOrEqual(0.9);
    expect(b / a).toBeLessThanOrEqual(1.1);
  });

  it("nhan.json: cùng bảng p với chuỗi cũ, đủ nhãn mỗi khung", () => {
    const j = JSON.parse(fs.readFileSync(pub(moi!.nhan), "utf8"));
    const jc = JSON.parse(fs.readFileSync(pub(cu.nhan), "utf8"));
    expect(j.p).toEqual(jc.p);
    expect(j.nhan).toHaveLength(moi!.so);
    for (const n of j.nhan) { expect(n.srm).toHaveLength(4); expect(n.amp).toHaveLength(4); }
  });

  it("schema: glb.khung_dien_thoai không bắt buộc", () => {
    expect(GlbSchema.parse({ ampoule: "/a.glb" }).khung_dien_thoai).toBeUndefined();
    expect(() => GlbSchema.parse({ ampoule: "/a.glb", khung_dien_thoai: { thu_muc: "/x" } })).toThrow();
  });

  it("CHAI_KHUNG cũ giữ nguyên số đo; CHAI_KHUNG_GLB nằm trong khung nhìn 390×844", () => {
    expect(CHAI_KHUNG).toMatchObject({ x: 121, tren: 144, mieng: 260, day: 475, cat: { x0: 40, x1: 200, y0: 125, y1: 500 } });
    const c = CHAI_KHUNG_GLB;
    expect(c.tren).toBeLessThan(c.mieng);
    expect(c.mieng).toBeLessThan(c.day);
    expect(c.cat.x0).toBeLessThan(c.x - c.nua);
    expect(c.cat.x1).toBeGreaterThan(c.x + c.nua);
    expect(c.cat.y0).toBeLessThan(c.tren);
    expect(c.cat.y1).toBeGreaterThan(c.day);
    expect(c.cat.x0).toBeGreaterThanOrEqual(0);
  });
});
