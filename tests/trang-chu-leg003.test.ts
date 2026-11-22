import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// LEG-003: bỏ claim "nội địa Hàn" / "Korean domestic" trên module trang-chu.
const FILES = ["messages/vi/trang-chu.json", "messages/en/trang-chu.json"];

function doc(path: string): string {
  return readFileSync(path, "utf8");
}

function khoa(obj: unknown, tienTo = ""): string[] {
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      khoa(v, tienTo ? `${tienTo}.${k}` : k),
    );
  }
  return [tienTo];
}

describe("LEG-003 trang-chu", () => {
  it.each(FILES)("%s không còn 'nội địa Hàn' hay 'domestic'", (f) => {
    const s = doc(f);
    expect(s).not.toMatch(/nội địa Hàn/i);
    expect(s).not.toMatch(/domestic/i);
  });

  it("khóa vi và en khớp nhau", () => {
    const vi = khoa(JSON.parse(doc(FILES[0]))).sort();
    const en = khoa(JSON.parse(doc(FILES[1]))).sort();
    expect(en).toEqual(vi);
  });
});
