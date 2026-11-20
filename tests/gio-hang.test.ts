import { describe, expect, it } from "vitest";
import { DEALS, SAN_PHAM, type Deal } from "@/lib/data";
import { layGiaTriQua } from "@/lib/deals/qua";
import { tinhGio } from "@/lib/deals/gio-hang";

const NGAY_POPUP = "2026-11-17";

describe("engine giỏ hàng tinhGio (W008)", () => {
  it("1. 1 sữa rửa mặt LOPOE: 249.000; không quà (KM-13 dừng từ 20/11, QD-SALE-012)", () => {
    const kq = tinhGio(
      [{ san_pham_id: "LOPOE-CF", so_luong: 1 }],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    expect(kq.tong_tam_tinh).toBe(249_000);
    expect(kq.tiet_kiem).toBe(0);
    expect(kq.qua_du_kien).toBeNull();
    expect(kq.canh_bao).toBe("uoc_tinh");
  });

  it("2. Sữa rửa mặt LOPOE + Rep!el Gel Cleanser (209.000): LOPOE 186.000, tổng 395.000; không quà", () => {
    const kq = tinhGio(
      [
        { san_pham_id: "LOPOE-CF", so_luong: 1 },
        { san_pham_id: "8809198846184", so_luong: 1 },
      ],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    const dongLopoe = kq.cac_dong.find((d) => d.id === "LOPOE-CF");
    expect(dongLopoe?.don_gia_sau_uu_dai).toBe(186_000);
    expect(dongLopoe?.deal_ap_dung).toContain("LOPOE-25");
    expect(kq.tong_tam_tinh).toBe(395_000);
    expect(kq.qua_du_kien).toBeNull();
  });

  it("3. Combo LOPOE bộ 3: 911.000 quà kem LOPOE; khi het_qua: 889.000 không quà", () => {
    const kq = tinhGio(
      [{ loai: "combo", deal_id: "LOPOE-COMBO-BO3", so_luong: 1 }],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    expect(kq.tong_tam_tinh).toBe(911_000);
    expect(kq.qua_du_kien).toBe("1 kem dưỡng LOPOE");

    const dealsHetQua: Deal[] = DEALS.map((d) =>
      d.id === "LOPOE-COMBO-BO3" ? { ...d, het_qua: true } : d
    );
    const kqHetQua = tinhGio(
      [{ loai: "combo", deal_id: "LOPOE-COMBO-BO3", so_luong: 1 }],
      SAN_PHAM,
      dealsHetQua,
      NGAY_POPUP
    );

    expect(kqHetQua.tong_tam_tinh).toBe(889_000);
    expect(kqHetQua.qua_du_kien).toBeNull();
  });

  it("4. Combo LOPOE bộ 3 + 1 Rep!el serum 319.000: tổng 1.230.000; quà kem LOPOE (549K > 419K)", () => {
    const kq = tinhGio(
      [
        { loai: "combo", deal_id: "LOPOE-COMBO-BO3", so_luong: 1 },
        { san_pham_id: "8809198846238", so_luong: 1 },
      ],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    const dongCombo = kq.cac_dong.find((d) => d.id === "LOPOE-COMBO-BO3");
    expect(dongCombo?.gia_sau_uu_dai).toBe(911_000);
    expect(dongCombo?.deal_ap_dung).not.toContain("LOPOE-25");
    expect(kq.tong_tam_tinh).toBe(1_230_000);
    expect(kq.qua_du_kien).toBe("1 kem dưỡng LOPOE");
    expect(layGiaTriQua(kq.qua_du_kien)).toBe(549_000);
  });

  it("5. COMBO PINK: 999.000; quà sữa rửa mặt LOPOE (KM-08 mốc 700K)", () => {
    const kq = tinhGio(
      [{ loai: "combo", deal_id: "COMBO-PINK", so_luong: 1 }],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    expect(kq.tong_tam_tinh).toBe(999_000);
    expect(kq.qua_du_kien).toBe("1 sữa rửa mặt LOPOE");
  });

  it("6. Medicube Triple Collagen toner + serum: 1.135.000; quà sữa rửa mặt LOPOE (mốc 800K, KM-08 đã dừng)", () => {
    const kq = tinhGio(
      [
        { san_pham_id: "8800256114320", so_luong: 1 },
        { san_pham_id: "8800256114351", so_luong: 1 },
      ],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    expect(kq.tong_tam_tinh).toBe(1_135_000);
    expect(kq.qua_du_kien).toBe("1 sữa rửa mặt LOPOE");
  });

  it("7. 6 miếng Uniura bất kỳ: 396.000 + 99.000 = 495.000", () => {
    const kq = tinhGio(
      [
        { san_pham_id: "8800274071278", so_luong: 2 },
        { san_pham_id: "8800274071247", so_luong: 2 },
        { san_pham_id: "8800274071285", so_luong: 1 },
        { san_pham_id: "8800274071292", so_luong: 1 },
      ],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    expect(kq.tong_le).toBe(594_000);
    expect(kq.tong_tam_tinh).toBe(495_000);
    expect(kq.tiet_kiem).toBe(99_000);
  });

  it("8. Celimax serum 600.000: moc_tiep_theo là mốc 800K (BAC-HOA-DON) còn thiếu 200.000 và gợi ý từ Đã thích", () => {
    const kq = tinhGio(
      [{ san_pham_id: "8809875907412", so_luong: 1 }],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP,
      {
        daThich: [
          "8809463992615", // Celimax BHA Peeling Pad 260.000
          "8809032673631", // SKINFOOD Egg White Foam 238.000
          "8809198846184", // Rep!el 209.000 (không thuộc 3 nhãn KM-08)
        ],
      }
    );

    expect(kq.tong_tam_tinh).toBe(600_000);
    expect(kq.moc_tiep_theo).not.toBeNull();
    expect(kq.moc_tiep_theo?.deal_id).toBe("BAC-HOA-DON");
    expect(kq.moc_tiep_theo?.con_thieu).toBe(200_000);
    expect(kq.moc_tiep_theo?.qua).toBe("1 sữa rửa mặt LOPOE");
    // Mốc hóa đơn tính mọi nhãn nên Rep!el cũng được gợi ý
    expect(kq.moc_tiep_theo?.goi_y.map((s) => s.id)).toEqual([
      "8809198846184",
      "8809032673631",
      "8809463992615",
    ]);
  });

  it("9. Deal may_rui có hien_thi: true không bao giờ hiện hoặc áp dụng", () => {
    const dealsBiBatNham: Deal[] = DEALS.map((d) =>
      d.may_rui ? { ...d, hien_thi: true, da_dang_ky: false } : d
    );
    const kq = tinhGio(
      [{ loai: "combo", deal_id: "DC-02", so_luong: 1 }],
      SAN_PHAM,
      dealsBiBatNham,
      NGAY_POPUP
    );

    expect(kq.cac_dong[0]?.deal_ap_dung).toEqual([]);
    expect(kq.qua_du_kien).toBeNull();
  });

  it("10. Ngày 30/11/2026: không deal pop-up nào hiện hoặc áp dụng", () => {
    const kq = tinhGio(
      [
        { loai: "combo", deal_id: "COMBO-PINK", so_luong: 1 },
        { san_pham_id: "LOPOE-CF", so_luong: 1 },
        { san_pham_id: "8800274071278", so_luong: 5 },
      ],
      SAN_PHAM,
      DEALS,
      "2026-11-30"
    );

    expect(kq.tong_tam_tinh).toBe(kq.tong_le);
    expect(kq.tiet_kiem).toBe(0);
    expect(kq.qua_du_kien).toBeNull();
    expect(kq.moc_tiep_theo).toBeNull();
  });

  it("khớp chính xác giỏ mẫu trong design/Gio.dc.html", () => {
    const kq = tinhGio(
      [
        { loai: "combo", deal_id: "COMBO-PINK", so_luong: 1 },
        { san_pham_id: "LOPOE-CF", so_luong: 1 },
        { san_pham_id: "8809369850354", so_luong: 2 },
      ],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP,
      { daThich: ["8800256115174"] }
    );

    expect(kq.tong_le).toBe(1_444_000);
    expect(kq.tiet_kiem).toBe(209_000);
    expect(kq.tong_tam_tinh).toBe(1_235_000);
    // 20/11: mốc 1,2 triệu tặng ampoule + voucher nhà hàng; KM-08 (mốc 1,3 triệu tặng kem) đã dừng nên không còn mốc tiếp theo
    expect(kq.qua_du_kien).toBe("1 ampoule LOPOE và 1 voucher giảm 15% nhà hàng Union Square");
    expect(kq.moc_tiep_theo).toBeNull();
  });

  it("gợi ý đổi combo khi giỏ có đủ món lẻ rẻ hơn và bỏ qua sản phẩm ẩn", () => {
    const kq = tinhGio(
      [
        { san_pham_id: "8800256108053", so_luong: 1 }, // PDRN Pink Peptide Serum 530K
        { san_pham_id: "8800289467714", so_luong: 1 }, // PDRN Pink Collagen Cream 615K
        { san_pham_id: "8800256108046", so_luong: 1 }, // sản phẩm hien_thi: false
      ],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    expect(kq.cac_dong.find((d) => d.id === "8800256108046")).toBeUndefined();
    expect(kq.tong_tam_tinh).toBe(1_145_000);
    expect(kq.goi_y_doi_combo).toHaveLength(1);
    expect(kq.goi_y_doi_combo[0]?.deal_id).toBe("COMBO-PINK");
    expect(kq.goi_y_doi_combo[0]?.tiet_kiem).toBe(146_000);
  });

  it("DC-06 đã dừng (INV-005, máy Medicube trả nhãn): mua Age-R Booster Pro không còn cộng quà Uniura", () => {
    const kq = tinhGio(
      [{ san_pham_id: "8800289468759", so_luong: 1 }],
      SAN_PHAM,
      DEALS,
      NGAY_POPUP
    );

    expect(kq.qua_cong_them).toEqual([]);
    // Máy đã ẩn khỏi web
    expect(SAN_PHAM.find((s) => s.id === "8800289468759")?.hien_thi).toBe(false);
  });
});
