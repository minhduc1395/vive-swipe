import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// LEG-002 (NĐ 13/2023): ô đồng ý chính sách mặc định chưa tick, chưa tick thì không giữ hàng.
const FILE_FORM = join("app", "(khach)", "giu-hang", "FormGiuHang.tsx");

describe("LEG-002: đồng ý chính sách ở form giữ hàng", () => {
  const nd = readFileSync(FILE_FORM, "utf8");

  it("ô chính sách mặc định chưa tick", () => {
    expect(nd).toMatch(
      /\[dongYChinhSach,\s*setDongYChinhSach\]\s*=\s*useState(<boolean>)?\(false\)/,
    );
    expect(nd).not.toMatch(/\[dongYChinhSach,[^\]]*\]\s*=\s*useState(<boolean>)?\(true\)/);
  });

  it("chưa tick thì báo lỗi chinhSach và không gọi tạo giữ hàng", () => {
    const iKiem = nd.indexOf("if (!dongYChinhSach)");
    const iGoi = nd.indexOf("actionTaoGiuHang(");
    expect(iKiem).toBeGreaterThan(-1);
    expect(iGoi).toBeGreaterThan(iKiem);
    const khoiKiem = nd.slice(iKiem, iGoi);
    expect(khoiKiem).toContain('t("loi.chinhSach")');
    expect(khoiKiem).toMatch(/return;/);
  });
});
