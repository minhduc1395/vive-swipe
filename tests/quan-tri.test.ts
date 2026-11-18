import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { DEALS, SAN_PHAM } from "@/lib/data";
import {
  apDungCapNhatTon,
  parseKiotVietCsv,
} from "@/lib/admin/kiotviet";
import {
  capNhatTrangThaiDeal,
  kiemTraBatDeal,
} from "@/lib/admin/deal-rules";

describe("W017: Quản trị và kiểm soát deal / tồn KiotViet", () => {
  it("Tiêu chí 1: Nhập file CSV mẫu của KiotViet cập nhật đúng tồn", () => {
    const csvPath = path.join(__dirname, "fixtures/mau-kiotviet-ton.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");

    const ketQua = parseKiotVietCsv(csvContent, SAN_PHAM);
    expect(ketQua.thanhCong).toBe(true);
    expect(ketQua.soLuongKhop).toBeGreaterThan(0);

    // Áp dụng cập nhật tồn
    const sanPhamMoi = apDungCapNhatTon(SAN_PHAM, ketQua.thayDoi);

    // Kiểm tra Age-R Booster Pro X2 trắng (barcode 8800289468674) tồn mới = 5
    const boosterTrang = sanPhamMoi.find((sp) => sp.barcode === "8800289468674");
    expect(boosterTrang).toBeDefined();
    expect(boosterTrang!.ton).toBe(5);
    expect(boosterTrang!.con_hang).toBe("true");

    // Kiểm tra Age-R Booster Pro X2 hồng (barcode 8800289468759) tồn mới = 10
    const boosterHong = sanPhamMoi.find((sp) => sp.barcode === "8800289468759");
    expect(boosterHong).toBeDefined();
    expect(boosterHong!.ton).toBe(10);

    // Kiểm tra sản phẩm về 0 tồn (LOPOE-CF)
    const lopoeCf = sanPhamMoi.find((sp) => sp.id === "LOPOE-CF");
    expect(lopoeCf).toBeDefined();
    expect(lopoeCf!.ton).toBe(0);
    expect(lopoeCf!.con_hang).toBe("false");
    expect(lopoeCf!.hien_thi).toBe(false);
  });

  it("Tiêu chí 2: Không bật được deal may rủi khi da_dang_ky = false", () => {
    // Tìm deal may rủi chưa đăng ký (KM-12)
    const dealMayRui = DEALS.find((d) => d.id === "KM-12");
    expect(dealMayRui).toBeDefined();
    expect(dealMayRui!.may_rui).toBe(true);
    expect(dealMayRui!.da_dang_ky).toBe(false);

    // 1. Kiểm tra với kiemTraBatDeal: không cho phép bật
    const ketQua = kiemTraBatDeal(dealMayRui!, true);
    expect(ketQua.hopLe).toBe(false);
    expect(ketQua.loi).toContain("Sở Công Thương");

    // 2. Thử gọi capNhatTrangThaiDeal với deal may rủi chưa đăng ký phải ném lỗi
    expect(() => capNhatTrangThaiDeal(dealMayRui!, true)).toThrowError(
      /Sở Công Thương/
    );

    // 3. Nếu deal may rủi đã đăng ký (giả lập da_dang_ky = true) thì cho phép bật
    const dealDaDangKy = { ...dealMayRui!, da_dang_ky: true };
    const ketQuaHopLe = kiemTraBatDeal(dealDaDangKy, true);
    expect(ketQuaHopLe.hopLe).toBe(true);

    const dealSauBat = capNhatTrangThaiDeal(dealDaDangKy, true);
    expect(dealSauBat.hien_thi).toBe(true);
  });

  it("Cho phép bật tắt các deal hợp lệ thông thường", () => {
    const comboPink = DEALS.find((d) => d.id === "COMBO-PINK")!;
    expect(comboPink.may_rui).toBe(false);

    // Tắt
    const dealTat = capNhatTrangThaiDeal(comboPink, false);
    expect(dealTat.hien_thi).toBe(false);

    // Bật lại
    const dealBat = capNhatTrangThaiDeal(dealTat, true);
    expect(dealBat.hien_thi).toBe(true);
  });
});
