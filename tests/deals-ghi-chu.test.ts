import { describe, it, expect } from "vitest";
import { DEALS, SAN_PHAM } from "@/lib/data";
import { layCacDealCuaSanPham, layGhiChuDeal } from "@/lib/deals/ghi-chu";
import type { SanPham } from "@/lib/data/types";

describe("lib/deals/ghi-chu - lấy deal liên quan và ghi chú deal cho sản phẩm", () => {
  it("lấy đúng deal mua kèm cho sản phẩm LOPOE (LOPOE-25)", () => {
    const spLopoe = SAN_PHAM.find((sp) => sp.id === "LOPOE-CF"); // LOPOE Sữa rửa mặt
    expect(spLopoe).toBeDefined();

    if (spLopoe) {
      const deals = layCacDealCuaSanPham(spLopoe, DEALS);
      expect(deals.some((d) => d.id === "LOPOE-25")).toBe(true);

      const ghiChu = layGhiChuDeal(spLopoe, DEALS);
      expect(ghiChu).toBeDefined();
      expect(ghiChu).toContain("Mua kèm: còn 186.000");
    }
  });

  it("trả về undefined khi sản phẩm không thuộc deal nào đang chạy", () => {
    const spAo: SanPham = {
      id: "SP_KHONG_CO_DEAL",
      barcode: "1234567890",
      thuong_hieu: "Test Brand",
      ten_goc: "Sản phẩm test",
      ten_hien_thi: "Sản phẩm test",
      quy_cach: null,
      gia_goc: 100000,
      gia_ban: 100000,
      giam_tren_tag: null,
      danh_muc: "tinh-chat",
      van_de: ["cap-am"],
      thanh_phan: ["B5"],
      loai_da: ["moi-loai-da"],
      mo_ta: null,
      con_hang: "true",
      ton: null,
      hien_thi: true,
      anh: null,
      pho_bien: 0.5,
      ghi_chu: null,
    };

    const deals = layCacDealCuaSanPham(spAo, DEALS);
    expect(deals.length).toBe(0);

    const ghiChu = layGhiChuDeal(spAo, DEALS);
    expect(ghiChu).toBeUndefined();
  });
});
