import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DOANH_NGHIEP, parseDoanhNghiepYaml } from "@/lib/data";

const ROOT = process.cwd();

describe("W049 · Chân trang & DoanhNghiepSchema", () => {
  it("đọc đủ trường mới của DoanhNghiepSchema từ data/doanh-nghiep.yaml", () => {
    expect(DOANH_NGHIEP.dia_chi_booth).toContain("Phường Sài Gòn");
    expect(DOANH_NGHIEP.dia_chi_booth_en).toContain("Sai Gon Ward");
    expect(DOANH_NGHIEP.ban_do).toBe(
      "https://maps.app.goo.gl/JLNcDuKxeuYFT1yA7"
    );
    expect(DOANH_NGHIEP.mang_xa_hoi).toHaveLength(3);

    const fb = DOANH_NGHIEP.mang_xa_hoi.find((m) => m.ten === "Facebook");
    expect(fb?.url).toBe("https://www.facebook.com/1530922283427509");
    expect(fb?.tai_khoan).toBe("VIVE");

    const ig = DOANH_NGHIEP.mang_xa_hoi.find((m) => m.ten === "Instagram");
    expect(ig?.tai_khoan).toBe("@vive.vers");

    const tt = DOANH_NGHIEP.mang_xa_hoi.find((m) => m.ten === "TikTok");
    expect(tt?.tai_khoan).toBe("@viveuniverse");
  });

  it("so_dien_thoai: null thì trả về null (chân trang không hiện SĐT)", () => {
    const yamlText = fs.readFileSync(
      path.join(ROOT, "data", "doanh-nghiep.yaml"),
      "utf8"
    );
    const parsed = parseDoanhNghiepYaml(yamlText);
    expect(parsed.so_dien_thoai).toBeNull();
  });

  it("có đủ 3 icon SVG Simple Icons (CC0) trong public/icons/mxh/", () => {
    for (const file of ["facebook.svg", "instagram.svg", "tiktok.svg"]) {
      const fullPath = path.join(ROOT, "public", "icons", "mxh", file);
      expect(fs.existsSync(fullPath), `Thiếu file icon ${fullPath}`).toBe(true);
      const svg = fs.readFileSync(fullPath, "utf8");
      expect(svg).toContain("<svg");
      expect(svg).toContain('viewBox="0 0 24 24"');
    }
  });
});
