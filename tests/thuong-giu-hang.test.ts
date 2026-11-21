import { describe, expect, it } from "vitest";
import { DEALS } from "@/lib/data";
import {
  dongThuongGiuHang,
  layThuongGiuHang,
  thuongGiuHang,
} from "@/lib/giu-hang/thuong";

const QUA = "Thêm 1 lượt quay vòng quay may mắn";

function dealsVoiDC02(sua: Record<string, unknown>) {
  return DEALS.map((d) => (d.id === "DC-02" ? { ...d, ...sua } : d));
}

describe("#75 · Thưởng thêm khi giữ hàng web, nhận tại booth", () => {
  it("dữ liệu có thưởng ở DC-02", () => {
    expect(DEALS.find((d) => d.id === "DC-02")?.thuong_giu_hang?.qua).toBe(QUA);
  });

  it("trước 27/11: trả quà, chưa tới ngày", () => {
    expect(thuongGiuHang(DEALS, "2026-11-26")).toBe(QUA);
    expect(layThuongGiuHang(DEALS, "2026-11-26")?.daTuNgay).toBe(false);
    expect(dongThuongGiuHang(DEALS, "2026-11-26")).toBe(
      `Nhận tại booth từ 27/11: ${QUA}`
    );
  });

  it("đúng 27/11 giờ VN: tới ngày, dòng không còn 'từ 27/11'", () => {
    expect(layThuongGiuHang(DEALS, "2026-11-27")?.daTuNgay).toBe(true);
    expect(dongThuongGiuHang(DEALS, "2026-11-27")).toBe(`Nhận tại booth: ${QUA}`);
  });

  it("so ngày theo giờ Việt Nam", () => {
    // 26/11 17:30 UTC = 27/11 00:30 giờ VN
    const dauNgayVN = new Date("2026-11-26T17:30:00Z");
    expect(layThuongGiuHang(DEALS, dauNgayVN)?.daTuNgay).toBe(true);
    // 26/11 16:30 UTC = 26/11 23:30 giờ VN
    const cuoiNgayTruoc = new Date("2026-11-26T16:30:00Z");
    expect(layThuongGiuHang(DEALS, cuoiNgayTruoc)?.daTuNgay).toBe(false);
  });

  it("DC-02 bị tắt thì trả null", () => {
    expect(thuongGiuHang(dealsVoiDC02({ hien_thi: false }), "2026-11-27")).toBeNull();
    expect(thuongGiuHang(dealsVoiDC02({ da_dang_ky: false }), "2026-11-27")).toBeNull();
    expect(thuongGiuHang(dealsVoiDC02({ trang_thai: "HUY" }), "2026-11-27")).toBeNull();
    expect(dongThuongGiuHang(dealsVoiDC02({ hien_thi: false }), "2026-11-27")).toBeNull();
  });

  it("ngoài thời gian deal thì null", () => {
    expect(thuongGiuHang(DEALS, "2026-12-30")).toBeNull();
  });
});
