import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// W052: trang khách không gõ tay mã màu (dùng token trong app/globals.css).
// Ngoại lệ có chủ ý: bảng màu minh họa personal color trong khối đối tác, chấm màu trạng thái landing.
const NGOAI_LE = new Set([
  "components/landing/khoi/KhoiDoiTac.tsx",
  "components/landing/khoi/KhoiHero.tsx",
  "components/landing/khoi/KhoiTieuDiem.tsx",
]);

function duyet(thuMuc: string): string[] {
  return fs.readdirSync(thuMuc, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(thuMuc, e.name);
    if (e.isDirectory()) return duyet(p);
    return p.endsWith(".tsx") ? [p] : [];
  });
}

describe("W052 · token màu dùng chung", () => {
  it("không còn mã màu [#xxxxxx] gõ tay trong app/(khach) và components (trừ components/ui)", () => {
    const loi: string[] = [];
    for (const f of [...duyet("app/(khach)"), ...duyet("components")]) {
      const rel = f.split(path.sep).join("/");
      if (rel.startsWith("components/ui/") || NGOAI_LE.has(rel)) continue;
      const t = fs.readFileSync(f, "utf8");
      for (const m of t.matchAll(/\b(?:bg|text|border|divide|ring|from|to|via)-\[#[0-9A-Fa-f]{3,8}\]/g)) loi.push(`${rel}: ${m[0]}`);
    }
    expect(loi).toEqual([]);
  });
});
