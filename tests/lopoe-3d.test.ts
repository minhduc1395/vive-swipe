import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";

describe("W054 · data/thu-nghiem/lopoe-3d.yaml", () => {
  const cfg = parseCauHinhLopoe3D(fs.readFileSync(path.join(process.cwd(), "data/thu-nghiem/lopoe-3d.yaml"), "utf8"));
  it("mốc khối chữ tăng dần, a < b, không chồng nhau", () => {
    let truoc = 0;
    for (const k of cfg.khoi) {
      expect(k.a, k.id).toBeLessThan(k.b);
      expect(k.a, k.id).toBeGreaterThanOrEqual(truoc);
      truoc = k.b;
    }
  });
  it("tài sản tồn tại trong public/", () => {
    for (const p of Object.values(cfg.tai_san)) expect(fs.existsSync(path.join(process.cwd(), "public", p)), p).toBe(true);
  });
  it("câu cần bằng chứng (Winner, No.1, Hwahae) có cờ cho_duyet", () => {
    for (const k of cfg.khoi) {
      const chu = [k.tu_khoa, k.lon_nghieng, k.cau].join(" ");
      if (/Winner|No\.?1|Hwahae|số 1|Hạng 1/i.test(chu)) expect(k.cho_duyet, k.id).toBe(true);
    }
  });
});
