import { describe, expect, it } from "vitest";
import { DEALS, SAN_PHAM, type SanPham } from "@/lib/data";
import {
  capNhatHoSo,
  khoiTaoHoSo,
  type HoSoKhach,
} from "@/lib/goi-y/ho-so";
import {
  giaTriDeal,
  layDanhSachDealChoBan,
  trichXuatNhanGiaiThich,
} from "@/lib/deals/diem-deal";
import { hienThi } from "@/lib/deals/hien-thi";

const NGAY_POPUP = "2026-11-18";

describe("W016: Deal cho bạn và xếp theo diem_deal", () => {
  const sanPhamMap = new Map<string, SanPham>(SAN_PHAM.map((sp) => [sp.id, sp]));

  it("Tiêu chí 1: Khách thích 2 món Medicube thấy combo Medicube trong 3 deal đầu (KM-08 dừng từ 20/11)", () => {
    // Tìm 2 sản phẩm Medicube trong dữ liệu thực
    const dsMedicube = SAN_PHAM.filter(
      (sp) => sp.thuong_hieu.toLowerCase() === "medicube"
    );
    expect(dsMedicube.length).toBeGreaterThanOrEqual(2);

    const sp1 = dsMedicube[0];
    const sp2 = dsMedicube[1];

    // Khách bắt đầu quẹt và thích 2 món Medicube
    let hoSo: HoSoKhach = khoiTaoHoSo(null);
    hoSo = capNhatHoSo(hoSo, sp1, "thich", 0);
    hoSo = capNhatHoSo(hoSo, sp2, "thich", 1);

    const daThich = [sp1.id, sp2.id];

    // Lấy danh sách deal cho bạn
    const dealsChoBan = layDanhSachDealChoBan(
      DEALS,
      hoSo,
      sanPhamMap,
      daThich,
      [],
      NGAY_POPUP
    );

    // Kiểm tra top 3 deal
    const baDealDau = dealsChoBan.slice(0, 3);
    const coComboMedicube = baDealDau.some((d) => d.id === "COMBO-PINK" || d.id === "COMBO-VAMPIRE-GLOW");

    expect(coComboMedicube).toBe(true);
    // Vòng quay (DC-02) là ưu đãi chung, không đứng trên combo đúng nhãn khách thích
    const viTriQuay = dealsChoBan.findIndex((d) => d.id === "DC-02");
    const viTriPink = dealsChoBan.findIndex((d) => d.id === "COMBO-PINK");
    expect(viTriPink).toBeLessThan(viTriQuay);
  });

  it("Tiêu chí 2: Không deal ẩn nào lọt vào trang", () => {
    const hoSo: HoSoKhach = khoiTaoHoSo(null);
    const dealsChoBan = layDanhSachDealChoBan(
      DEALS,
      hoSo,
      sanPhamMap,
      [],
      [],
      NGAY_POPUP
    );

    // 1. Tất cả deal trong danh sách phải thỏa mãn hienThi
    for (const deal of dealsChoBan) {
      expect(hienThi(deal, NGAY_POPUP)).toBe(true);
      expect(deal.hien_thi).toBe(true);
      expect(["DANG_CHAY", "DA_DUYET"]).toContain(deal.trang_thai);
      expect(deal.may_rui && !deal.da_dang_ky).toBe(false);
    }

    // 2. Các deal bị ẩn hoặc đã dừng (QD-SALE-012, INV-005) không được xuất hiện; vòng quay DC-02 được hiện (QD-DIR-018)
    const tapIdHienThi = new Set(dealsChoBan.map((d) => d.id));
    for (const id of ["KM-10", "KM-08", "KM-11", "KM-13", "DC-01", "DC-04", "DC-06", "KM-12", "KM-12b"]) {
      expect(tapIdHienThi.has(id), `deal ${id} phải ẩn`).toBe(false);
    }
    expect(tapIdHienThi.has("DC-02")).toBe(true);
    // QD-BOD-060: voucher nhà hàng thành deal riêng
    expect(tapIdHienThi.has("KM-09")).toBe(true);
  });

  it("Tính đúng giá trị kinh tế gia_tri theo docs/02 mục 6", () => {
    // Combo PINK
    const pink = DEALS.find((d) => d.id === "COMBO-PINK")!;
    const gtPink = giaTriDeal(pink, sanPhamMap);
    expect(gtPink).toBeGreaterThan(0);
    expect(gtPink).toBeLessThan(1);

    // KM-08
    const km08 = DEALS.find((d) => d.id === "KM-08")!;
    const gtKm08 = giaTriDeal(km08, sanPhamMap);
    expect(gtKm08).toBeGreaterThan(0.3); // 249k/700k hoặc 549k/1300k

    // LOPOE-25
    const lopoe25 = DEALS.find((d) => d.id === "LOPOE-25")!;
    expect(giaTriDeal(lopoe25, sanPhamMap)).toBe(0.25);
  });

  it("Trích xuất đúng nhãn giải thích 'Vì bạn thích ...'", () => {
    let hoSo: HoSoKhach = khoiTaoHoSo({
      loai_da: "Da dầu",
      van_de: ["Mụn", "Cấp ẩm"],
    });

    const dsMedicube = SAN_PHAM.filter((sp) => sp.thuong_hieu === "Medicube");
    if (dsMedicube.length > 0) {
      hoSo = capNhatHoSo(hoSo, dsMedicube[0], "thich", 0);
    }

    const nhan = trichXuatNhanGiaiThich(
      hoSo,
      dsMedicube.slice(0, 1).map((s) => s.id),
      sanPhamMap
    );
    expect(nhan.length).toBeGreaterThan(0);
    expect(nhan.length).toBeLessThanOrEqual(3);
  });
});
