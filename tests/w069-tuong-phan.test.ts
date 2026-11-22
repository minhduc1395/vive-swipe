import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CSS = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");

function mau(ten: string): string {
  const m = CSS.match(new RegExp(`--color-${ten}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Thiếu token --color-${ten}`);
  return m[1];
}

function doSang(hex: string): number {
  const kenh = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * kenh[0] + 0.7152 * kenh[1] + 0.0722 * kenh[2];
}

function tuongPhan(a: string, b: string): number {
  const [s1, s2] = [doSang(a), doSang(b)].sort((x, y) => y - x);
  return (s1 + 0.05) / (s2 + 0.05);
}

describe("W069 · tương phản chữ xám", () => {
  const xam = mau("xam");
  for (const nen of ["trang", "kem", "lopoe-nen", "oliu-nhat", "be"]) {
    it(`--color-xam trên --color-${nen} đạt ≥ 4.5:1`, () => {
      expect(tuongPhan(xam, mau(nen))).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("--color-xam-dam đậm hơn hoặc bằng --color-xam trên nền trắng", () => {
    expect(tuongPhan(mau("xam-dam"), mau("trang"))).toBeGreaterThanOrEqual(
      tuongPhan(mau("xam"), mau("trang"))
    );
  });

  it("5 component không dùng text-den/10..60 cho chữ", () => {
    const files = [
      "NutNgonNgu",
      "NutQuayLai",
      "ThanhDocTablet",
      "ThanhTab",
      "ChanTrang",
    ];
    for (const f of files) {
      const src = fs.readFileSync(path.join(ROOT, "components", `${f}.tsx`), "utf8");
      expect(src, f).not.toMatch(/(^|[\s"'`:])text-den\/[1-6]0(?![0-9])/);
    }
  });
});
