import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GlbSchema, parseCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";

/** W073 (#150): công tắc chai ampoule 3D GLB trong data/thu-nghiem/lopoe-3d.yaml */
describe("W073 · công tắc glb", () => {
  const yaml = fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8");
  const cfg = parseCauHinhLopoe3D(yaml);
  const pub = (p: string) => path.join(process.cwd(), "public", p);

  it("mặc định TẮT; GLB ampoule có trong public/", () => {
    expect(cfg.glb, "thiếu khối glb trong yaml").toBeDefined();
    expect(cfg.glb!.bat, "web thật: glb.bat phải false tới khi QA đạt").toBe(false);
    expect(cfg.glb!.ampoule).toBe("/lopoe-3d-glb/LOPOE_ampoule_web_v2.glb");
    expect(fs.existsSync(pub(cfg.glb!.ampoule!))).toBe(true);
    for (const p of [cfg.glb!.srm, cfg.glb!.kem]) if (p) expect(fs.existsSync(pub(p)), p).toBe(true);
  });

  it("không đụng công tắc bọt nước (QD-BOD-083)", () => {
    expect(cfg.bot_nuoc?.bat).toBe(false);
  });

  it("schema nhận srm / kem là chuỗi hoặc null (đổi GLB v3, tuýp GD-003 chỉ cần sửa yaml)", () => {
    const tuyp = GlbSchema.parse({ bat: true, ampoule: "/lopoe-3d-glb/LOPOE_ampoule_web_v3.glb", srm: "/lopoe-3d-glb/srm.glb", kem: "/lopoe-3d-glb/kem.glb" });
    expect(tuyp).toEqual({ bat: true, ampoule: "/lopoe-3d-glb/LOPOE_ampoule_web_v3.glb", srm: "/lopoe-3d-glb/srm.glb", kem: "/lopoe-3d-glb/kem.glb" });
    expect(GlbSchema.parse({ bat: false, ampoule: "/a.glb", srm: null, kem: null })).toEqual({ bat: false, ampoule: "/a.glb", srm: null, kem: null });
    expect(GlbSchema.parse({ ampoule: "/a.glb" })).toEqual({ bat: false, ampoule: "/a.glb", srm: null, kem: null });
    expect(() => GlbSchema.parse({ bat: false, ampoule: "/a.glb", srm: 1, kem: null })).toThrow();
    expect(() => GlbSchema.parse({ bat: false, ampoule: "/a.glb", srm: "", kem: null })).toThrow();
    // yaml cũ không có khối glb vẫn đọc được (công tắc coi như tắt)
    expect(parseCauHinhLopoe3D(yaml.replace(/\nglb:\n(?: {2}.*\n)+/, "\n")).glb).toBeUndefined();
  });

  it("bộ giải mã Draco có sẵn; GLB + bộ giải mã WASM tải thêm ≤ 1 MB", () => {
    const draco = ["draco_wasm_wrapper.js", "draco_decoder.wasm"].map((f) => pub(`lopoe-3d-glb/draco/${f}`));
    for (const f of [...draco, pub("lopoe-3d-glb/draco/draco_decoder.js")]) expect(fs.existsSync(f), f).toBe(true);
    const tong = [pub(cfg.glb!.ampoule!), ...draco].reduce((t, f) => t + fs.statSync(f).size, 0);
    expect(tong).toBeLessThanOrEqual(1024 * 1024);
  });
});
