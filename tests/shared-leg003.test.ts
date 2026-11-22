import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const GOC = process.cwd();
const FILE_SUA = [
  "app/layout.tsx",
  "messages/vi/chung.json",
  "messages/en/chung.json",
  "lib/mo-ta-tam.ts",
];

function doc(duongDan: string): string {
  return fs.readFileSync(path.join(GOC, duongDan), "utf8");
}

function lietKeKhoa(obj: unknown, tienTo = ""): string[] {
  if (obj === null || typeof obj !== "object") return [tienTo];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    lietKeKhoa(v, tienTo ? `${tienTo}.${k}` : k),
  );
}

describe("LEG-003: bỏ chữ nội địa Hàn ở chữ dùng chung", () => {
  it.each(FILE_SUA)("%s không còn 'nội địa Hàn' và 'domestic'", (f) => {
    const noiDung = doc(f);
    expect(noiDung).not.toMatch(/nội địa Hàn/i);
    expect(noiDung).not.toMatch(/domestic/i);
  });

  it("khóa vi và en của chung.json khớp nhau", () => {
    const vi = lietKeKhoa(JSON.parse(doc("messages/vi/chung.json"))).sort();
    const en = lietKeKhoa(JSON.parse(doc("messages/en/chung.json"))).sort();
    expect(en).toEqual(vi);
  });
});
