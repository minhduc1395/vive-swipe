import { describe, expect, it } from "vitest";
import { DEALS } from "@/lib/data";
import { tinhThuongNhanDon } from "@/lib/nhan-vien/thuong-giu-hang";

describe("W066 · Nhắc thưởng giữ hàng tại trang nhân viên", () => {
  it("Đơn nhận ngày 26/11 (trước 27/11) không hiện thưởng", () => {
    expect(tinhThuongNhanDon(DEALS, "2026-11-26")).toBeNull();
  });

  it("Đơn nhận từ 27/11 hiện Tặng thêm theo DC-02", () => {
    const kq = tinhThuongNhanDon(DEALS, "2026-11-27");
    expect(kq).toBe("Tặng thêm: Thêm 1 lượt quay vòng quay may mắn");
  });

  it("Khi DC-02 tắt (hien_thi=false hoặc trang_thai=HUY) ngày 27/11 không hiện thưởng", () => {
    const dealsTatHienThi = DEALS.map((d) =>
      d.id === "DC-02" ? { ...d, hien_thi: false } : d,
    );
    expect(tinhThuongNhanDon(dealsTatHienThi, "2026-11-27")).toBeNull();

    const dealsHuy = DEALS.map((d) =>
      d.id === "DC-02" ? { ...d, trang_thai: "HUY" as const } : d,
    );
    expect(tinhThuongNhanDon(dealsHuy, "2026-11-27")).toBeNull();
  });
});
