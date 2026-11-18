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

  it("Tiêu chí 1: Khách thích 2 món Medicube thấy KM-08 trong 3 deal đầu", () => {
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
    const coKm08TrongBaDealDau = baDealDau.some((d) => d.id === "KM-08");

    expect(coKm08TrongBaDealDau).toBe(true);

    const km08 = dealsChoBan.find((d) => d.id === "KM-08");
    expect(km08).toBeDefined();
    // KM-08 phải có điểm liên quan cao
    expect(km08!.lien_quan).toBeGreaterThanOrEqual(0.5);
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

    // 2. Các deal bị ẩn trong dữ liệu (KM-10, KM-09, DC-01, DC-02, DC-04, KM-12, KM-12b) không được xuất hiện
    const tapIdHienThi = new Set(dealsChoBan.map((d) => d.id));
    expect(tapIdHienThi.has("KM-10")).toBe(false);
    expect(tapIdHienThi.has("KM-09")).toBe(false);
    expect(tapIdHienThi.has("DC-01")).toBe(false);
    expect(tapIdHienThi.has("DC-02")).toBe(false);
    expect(tapIdHienThi.has("DC-04")).toBe(false);
    expect(tapIdHienThi.has("KM-12")).toBe(false);
    expect(tapIdHienThi.has("KM-12b")).toBe(false);
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
