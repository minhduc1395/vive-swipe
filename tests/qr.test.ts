import { describe, expect, it } from "vitest";
import { taoMaTranQR, taoMaQrSvg } from "@/lib/qr";

describe("W014 · Bộ sinh mã QR thuần TypeScript (lib/qr.ts)", () => {
  it("tạo ma trận QR hợp lệ và có đủ 3 finder pattern ở góc", () => {
    const noiDung = "/nhan-vien?ma=VIVE-4821";
    const qr = taoMaTranQR(noiDung);
    expect(qr.kichThuoc).toBeGreaterThanOrEqual(21);
    expect(qr.duLieu.length).toBe(qr.kichThuoc);

    // Kiểm tra finder pattern góc trên-trái (0,0) đến (6,6)
    // Tâm (2,2) đến (4,4) phải là true (đen)
    expect(qr.duLieu[0][0]).toBe(true);
    expect(qr.duLieu[0][6]).toBe(true);
    expect(qr.duLieu[6][0]).toBe(true);
    expect(qr.duLieu[3][3]).toBe(true);

    // Góc trên-phải (0, size-7)
    const sz = qr.kichThuoc;
    expect(qr.duLieu[0][sz - 7]).toBe(true);
    expect(qr.duLieu[0][sz - 1]).toBe(true);

    // Góc dưới-trái (size-7, 0)
    expect(qr.duLieu[sz - 7][0]).toBe(true);
    expect(qr.duLieu[sz - 1][0]).toBe(true);
  });

  it("xuất mã SVG hợp lệ có thẻ rect nền trắng và path nét đen", () => {
    const noiDung = "VIVE-4821";
    const svg = taoMaQrSvg(noiDung, { kichThuoc: 176 });
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('fill="#FFFFFF"');
    expect(svg).toContain('fill="#2B2B2A"');
    expect(svg).toContain('width="176"');
    expect(svg).toContain('height="176"');
  });
});
