import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CAC_KHOI } from "@/i18n/tu-dien";
import { chonNgonNgu } from "@/i18n/ngon-ngu";
import { dinhDangGia, dinhDangNgayNgan } from "@/lib/dinh-dang";

type Cay = { [k: string]: string | Cay };
const doc = (l: string, k: string) => JSON.parse(readFileSync(join("messages", l, `${k}.json`), "utf8")) as Cay;
const khoa = (c: Cay, p = ""): string[] =>
  Object.entries(c).flatMap(([k, v]) => (typeof v === "string" ? [p + k] : khoa(v, `${p}${k}.`)));

describe("W044 từ điển", () => {
  it("mỗi module có đủ 2 file vi, en và không có file thừa", () => {
    for (const l of ["vi", "en"]) {
      const files = readdirSync(join("messages", l)).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
      expect(files).toEqual([...CAC_KHOI].sort());
    }
  });

  it.each([...CAC_KHOI])("khóa %s ở vi và en trùng khớp", (k) => {
    expect(khoa(doc("en", k)).sort()).toEqual(khoa(doc("vi", k)).sort());
  });

  it("chọn ngôn ngữ: cookie trước, rồi Accept-Language, mặc định vi", () => {
    expect(chonNgonNgu("en", "vi-VN")).toBe("en");
    expect(chonNgonNgu(undefined, "en-US,en;q=0.9")).toBe("en");
    expect(chonNgonNgu(undefined, "ko-KR")).toBe("vi");
    expect(chonNgonNgu("fr", null)).toBe("vi");
  });

  it("giá và ngày theo ngôn ngữ", () => {
    expect(dinhDangGia(349000, "vi")).toBe("349.000đ");
    expect(dinhDangGia(349000, "en")).toBe("349,000 VND");
    expect(dinhDangNgayNgan("2026-11-27T05:00:00Z", "vi")).toBe("27/11");
    expect(dinhDangNgayNgan("2026-11-27T05:00:00Z", "en")).toBe("Nov 27");
  });
});
