import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// LEG-003 (QD-BOD-028): bỏ chữ "nội địa Hàn" / "domestic" trong phần giữ hàng.
const FILE_EMAIL = join("lib", "email", "xac-nhan-giu-hang.ts");

function khoa(obj: unknown, tien = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [tien];
  return Object.entries(obj as Record<string, unknown>)
    .flatMap(([k, v]) => khoa(v, tien ? `${tien}.${k}` : k))
    .sort();
}

describe("LEG-003: email xác nhận giữ hàng", () => {
  const nd = readFileSync(FILE_EMAIL, "utf8");

  it("không còn 'nội địa Hàn'", () => {
    expect(nd).not.toMatch(/nội địa Hàn/i);
  });

  it("không còn 'domestic'", () => {
    expect(nd).not.toMatch(/domestic/i);
  });

  it("dòng chân email dùng 'Hàn Quốc'", () => {
    expect(nd).toContain("Mỹ phẩm Hàn Quốc tại TP. Hồ Chí Minh");
  });
});

describe("LEG-003: messages giu-hang vi/en", () => {
  const doc = (l: string) => JSON.parse(readFileSync(join("messages", l, "giu-hang.json"), "utf8"));

  it("khóa vi và en khớp nhau", () => {
    expect(khoa(doc("vi"))).toEqual(khoa(doc("en")));
  });
});
