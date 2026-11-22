import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Cay = { [k: string]: string | Cay };
const doc = (l: string) => readFileSync(join("messages", l, "quet.json"), "utf8");
const khoa = (c: Cay, p = ""): string[] =>
  Object.entries(c).flatMap(([k, v]) => (typeof v === "string" ? [p + k] : khoa(v, `${p}${k}.`)));

describe("LEG-003 quet: bỏ 'nội địa Hàn' và 'domestic'", () => {
  it("quet.json vi không còn 'nội địa Hàn'", () => {
    expect(doc("vi")).not.toMatch(/nội địa Hàn/i);
  });
  it("quet.json en không còn 'domestic'", () => {
    expect(doc("en")).not.toMatch(/domestic/i);
  });
  it("khóa vi và en vẫn khớp nhau", () => {
    const vi = khoa(JSON.parse(doc("vi")) as Cay).sort();
    const en = khoa(JSON.parse(doc("en")) as Cay).sort();
    expect(en).toEqual(vi);
  });
});
