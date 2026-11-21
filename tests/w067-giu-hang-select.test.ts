import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SELECT_GIU_HANG_CHI_TIET } from "@/lib/giu-hang/kho-giu-hang";

describe("W067 · Chuỗi select PostgREST giữ hàng", () => {
  it("dùng alias deal(ten:du_lieu->>ten) thay cho deal(ten) trần", () => {
    expect(SELECT_GIU_HANG_CHI_TIET).toContain("deal(ten:du_lieu->>ten)");
    expect(SELECT_GIU_HANG_CHI_TIET).not.toContain("deal(ten)");
  });

  it("cả 2 hàm đọc giữ hàng dùng chung hằng SELECT_GIU_HANG_CHI_TIET và không còn deal(ten)", () => {
    const src = readFileSync(
      resolve(process.cwd(), "lib/giu-hang/kho-giu-hang.ts"),
      "utf8",
    );
    expect(src).not.toContain("deal(ten)");
    const soLanDung = src.match(/\.select\(SELECT_GIU_HANG_CHI_TIET\)/g) ?? [];
    expect(soLanDung).toHaveLength(2);
  });
});
