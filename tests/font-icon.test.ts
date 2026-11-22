import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const GOC = path.resolve(__dirname, "..");

describe("#131 · font và icon tải sớm", () => {
  it("app/icon.png nhỏ: ≤ 8 KB, vuông, ≤ 192px", () => {
    const tep = path.join(GOC, "app", "icon.png");
    expect(statSync(tep).size).toBeLessThanOrEqual(8 * 1024);
    const dau = readFileSync(tep);
    // Chữ ký PNG rồi khối IHDR: rộng ở byte 16, cao ở byte 20.
    expect(dau.subarray(1, 4).toString("ascii")).toBe("PNG");
    const rong = dau.readUInt32BE(16);
    const cao = dau.readUInt32BE(20);
    expect(rong).toBe(cao);
    expect(rong).toBeLessThanOrEqual(192);
  });

  it("layout: Playfair không preload, độ đậm Be Vietnam Pro đều có dùng trong giao diện", () => {
    const layout = readFileSync(path.join(GOC, "app", "layout.tsx"), "utf8");
    const khoiPlayfair = layout.slice(layout.indexOf("Playfair_Display({"));
    expect(khoiPlayfair).toMatch(/preload:\s*false/);
    expect(khoiPlayfair).toMatch(/display:\s*"swap"/);

    const khoiBe = layout.slice(
      layout.indexOf("Be_Vietnam_Pro({"),
      layout.indexOf("Playfair_Display({")
    );
    expect(khoiBe).toMatch(/preload:\s*false/);
    const khaiBao = khoiBe.match(/weight:\s*\[([^\]]*)\]/)![1];
    const doDam = [...khaiBao.matchAll(/"(\d+)"/g)].map((m) => m[1]);
    // font-normal/mặc định = 400, font-medium = 500, font-semibold = 600, font-bold = 700
    const lopTheoDoDam: Record<string, RegExp> = {
      "400": /\bfont-normal\b|font-weight:\s*400/,
      "500": /\bfont-medium\b|font-weight:\s*500/,
      "600": /\bfont-semibold\b|font-weight:\s*600/,
      "700": /\bfont-bold\b|font-weight:\s*700/,
    };
    const nguon = [
      ...grepTep(path.join(GOC, "app")),
      ...grepTep(path.join(GOC, "components")),
    ].join("\n");
    for (const d of doDam) {
      expect(nguon, `độ đậm ${d} khai báo mà không ai dùng`).toMatch(
        lopTheoDoDam[d]
      );
    }
  });
});

function grepTep(thuMuc: string): string[] {
  const ra: string[] = [];
  for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
    const duongDan = path.join(thuMuc, muc.name);
    if (muc.isDirectory()) ra.push(...grepTep(duongDan));
    else if (/\.(tsx|ts|css)$/.test(muc.name))
      ra.push(readFileSync(duongDan, "utf8"));
  }
  return ra;
}
