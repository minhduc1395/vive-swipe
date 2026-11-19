import { describe, it, expect } from "vitest";
import {
  CAC_MUC_DIEU_HUONG,
  CAC_MUC_MENU_DESKTOP,
  CAC_MUC_TABLET,
  CAC_MUC_TAB_MOBILE,
  kiemTraMucDangChon,
} from "@/lib/dieu-huong";

describe("W051 · Thống nhất điều hướng theo chuẩn landing v3", () => {
  it("CAC_MUC_DIEU_HUONG chứa đầy đủ các mục chuẩn và không có 'Ghé LL2'", () => {
    const keys = CAC_MUC_DIEU_HUONG.map((m) => m.key);
    expect(keys).toEqual([
      "new-arrival",
      "quet",
      "danh-muc",
      "deal",
      "da-thich",
      "gio",
      "dang-nhap",
    ]);

    // Đảm bảo không còn chữ Ghé LL2
    const allLabels = CAC_MUC_DIEU_HUONG.map((m) => m.nhan.vi);
    expect(allLabels.some((l) => l.includes("LL2"))).toBe(false);

    // Đăng nhập được đánh dấu sap_co theo W051
    const dangNhap = CAC_MUC_DIEU_HUONG.find((m) => m.key === "dang-nhap");
    expect(dangNhap?.sap_co).toBe(true);
  });

  it("Menu máy tính (CAC_MUC_MENU_DESKTOP) gồm 5 mục giữa theo v3", () => {
    const keys = CAC_MUC_MENU_DESKTOP.map((m) => m.key);
    expect(keys).toEqual(["new-arrival", "quet", "danh-muc", "deal", "da-thich"]);
  });

  it("Thanh dọc tablet (CAC_MUC_TABLET) chứa đúng 7 mục theo chuẩn W051", () => {
    const keys = CAC_MUC_TABLET.map((m) => m.key);
    expect(keys).toEqual([
      "new-arrival",
      "quet",
      "danh-muc",
      "deal",
      "da-thich",
      "gio",
      "dang-nhap",
    ]);
  });

  it("Tab điện thoại (CAC_MUC_TAB_MOBILE) gồm đúng 5 tab: Quẹt · Sản phẩm · Đã thích · Deal · Giỏ", () => {
    const labels = CAC_MUC_TAB_MOBILE.map((m) => m.nhan.vi);
    expect(labels).toEqual(["Quẹt", "Sản phẩm", "Đã thích", "Deal", "Giỏ"]);
  });

  it("kiemTraMucDangChon: Ở trang chủ '/' KHÔNG mục nào sáng (chuẩn W050/W051)", () => {
    for (const muc of CAC_MUC_DIEU_HUONG) {
      expect(kiemTraMucDangChon(muc.key, "/")).toBe(false);
    }
  });

  it("kiemTraMucDangChon: Ở '/new-arrival' chỉ mục new-arrival sáng", () => {
    expect(kiemTraMucDangChon("new-arrival", "/new-arrival")).toBe(true);
    expect(kiemTraMucDangChon("quet", "/new-arrival")).toBe(false);
    expect(kiemTraMucDangChon("danh-muc", "/new-arrival")).toBe(false);
  });

  it("kiemTraMucDangChon: Đúng cho từng route tương ứng", () => {
    expect(kiemTraMucDangChon("quet", "/quet")).toBe(true);
    expect(kiemTraMucDangChon("danh-muc", "/danh-muc")).toBe(true);
    expect(kiemTraMucDangChon("deal", "/deal")).toBe(true);
    expect(kiemTraMucDangChon("da-thich", "/da-thich")).toBe(true);
    expect(kiemTraMucDangChon("gio", "/gio")).toBe(true);
    expect(kiemTraMucDangChon("gio", "/giu-hang")).toBe(true);
  });

  it("kiemTraMucDangChon: Các trang độc lập không sáng mục nào", () => {
    const trangDocLap = ["/chao", "/bat-dau", "/chinh-sach", "/personal-color"];
    for (const trang of trangDocLap) {
      for (const muc of CAC_MUC_DIEU_HUONG) {
        expect(kiemTraMucDangChon(muc.key, trang)).toBe(false);
      }
    }
  });
});
