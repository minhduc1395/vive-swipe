import { describe, expect, it } from "vitest";
import { DEALS, SAN_PHAM, type SanPham } from "@/lib/data";
import {
  capNhatHoSo,
  hoanTacHoSo,
  khoiTaoHoSo,
  tinhDiemSanPham,
  tinhEta,
  trichXuatDacTrung,
  xepDeck,
  xepLaiDeck,
} from "@/lib/goi-y";

const NGAY_POPUP = "2026-11-17";

describe("gợi ý v1 (W009)", () => {
  it("trích xuất đúng trọng số đặc trưng sản phẩm theo docs/02 mục 5.1", () => {
    const pad = SAN_PHAM.find((s) => s.id === "8809463992615")!;
    const dacTrung = trichXuatDacTrung(pad);
    const map = new Map(dacTrung.map((d) => [d.khoa, d.trongSo]));

    expect(map.get("dm:toner-pad")).toBe(1.0);
    expect(map.get("vd:mun")).toBe(1.0);
    expect(map.get("tp:BHA")).toBe(0.8);
    expect(map.get("th:Celimax")).toBe(0.6);
    expect(map.get("ld:da-dau")).toBe(0.5);
    expect(map.get("gia:200-500k")).toBe(0.5);
  });

  it("1. Khách chọn Da dầu + Mụn thấy toner pad/serum mụn, lỗ chân lông trong 5 thẻ đầu", () => {
    const hoSo = khoiTaoHoSo({
      loai_da: "Da dầu",
      van_de: ["Mụn"],
    });
    expect(hoSo["ld:da-dau"]).toBe(1.5);
    expect(hoSo["vd:mun"]).toBe(1.5);

    const deck = xepDeck({
      sanPham: SAN_PHAM,
      deals: DEALS,
      hoSo,
      homNay: NGAY_POPUP,
      ngauNhien: () => 0.4,
    });

    const namTheDau = deck.slice(0, 5);
    const coSanPhamMunHoacLoChanLong = namTheDau.some(
      (t) =>
        (t.san_pham.danh_muc === "toner-pad" ||
          t.san_pham.danh_muc === "tinh-chat" ||
          t.san_pham.danh_muc === "nuoc-can-bang") &&
        (t.san_pham.van_de.includes("mun") ||
          t.san_pham.van_de.includes("lo-chan-long"))
    );

    expect(namTheDau.length).toBe(5);
    expect(coSanPhamMunHoacLoChanLong).toBe(true);
    expect(namTheDau[4]?.nguon).toBe("kham_pha");
  });

  it("2. Không có 3 thẻ liên tiếp cùng thương hiệu trên toàn bộ deck", () => {
    const hoSo = khoiTaoHoSo({
      loai_da: "Da nhạy cảm",
      van_de: ["Làm dịu"],
    });
    expect(hoSo["vd:lam-diu"]).toBe(2.0); // 0.5 từ da nhạy cảm + 1.5 từ Làm dịu

    const deck = xepDeck({
      sanPham: SAN_PHAM,
      deals: DEALS,
      hoSo,
      homNay: NGAY_POPUP,
      ngauNhien: () => 0.25,
    });

    for (let i = 2; i < deck.length; i += 1) {
      const a = deck[i - 2].san_pham.thuong_hieu;
      const b = deck[i - 1].san_pham.thuong_hieu;
      const c = deck[i].san_pham.thuong_hieu;
      expect(a === b && b === c).toBe(false);
    }
  });

  it("3. Hoàn tác trả hồ sơ về đúng trạng thái trước (kể cả khi chạm ngưỡng kẹp [-3, 5])", () => {
    const sp = SAN_PHAM.find((s) => s.id === "8809463992615")!;
    const h0 = khoiTaoHoSo({
      loai_da: "Da dầu",
      van_de: ["Mụn", "Trang điểm"],
      ngan_sach: "200K–500K",
    });

    expect(h0["dm:trang-diem"]).toBe(1.5);
    expect(h0["gia:200-500k"]).toBe(1.0);

    const h1 = capNhatHoSo(h0, sp, "thich", 0);
    expect(h1["vd:mun"]).toBeCloseTo(1.5 + tinhEta(0) * 1.0 * 1.0);

    const hUndo1 = hoanTacHoSo(h1);
    expect(hUndo1).toEqual(h0);

    // Chạm trần +5 rồi hoàn tác vẫn về đúng giá trị cũ
    const hoSoGanTran = { ...h0, "vd:mun": 4.8 };
    const h2 = capNhatHoSo(hoSoGanTran, sp, "giu_hang", 0);
    expect(h2["vd:mun"]).toBe(5);
    const hUndo2 = hoanTacHoSo(h2);
    expect(hUndo2["vd:mun"]).toBe(4.8);

    // Fallback đảo ngược toán học khi không có snapshot (ví dụ nạp từ JSON)
    const banJson = JSON.parse(JSON.stringify(h1)) as Record<string, number>;
    const hUndoJson = hoanTacHoSo(banJson, sp, "thich", 0);
    expect(hUndoJson["vd:mun"]).toBeCloseTo(h0["vd:mun"]);
    expect(hUndoJson["dm:toner-pad"]).toBeUndefined();
  });

  it("4. Sản phẩm hết hàng, ẩn, chưa có ảnh, đã thích, đã vào giỏ hoặc bỏ qua trong 7 ngày không vào deck", () => {
    const coAnh = SAN_PHAM.filter((s) => s.hien_thi && s.con_hang !== "false").slice(
      0,
      4
    );
    const bayGio = Date.parse("2026-11-17T12:00:00Z");

    const mau: SanPham[] = [
      { ...coAnh[0], id: "HOP_LE_1" },
      { ...coAnh[1], id: "HET_HANG", con_hang: "false" },
      { ...coAnh[2], id: "BI_AN", hien_thi: false },
      { ...coAnh[3], id: "THIEU_ANH", anh: null },
      { ...coAnh[0], id: "DA_THICH" },
      { ...coAnh[1], id: "DA_GIO" },
      { ...coAnh[2], id: "BO_QUA_GAN" },
      { ...coAnh[3], id: "BO_QUA_CU" },
    ];

    const deck = xepDeck({
      sanPham: mau,
      deals: DEALS,
      homNay: NGAY_POPUP,
      bayGio,
      daThich: ["DA_THICH"],
      daVaoGio: ["DA_GIO"],
      daBoQua: [
        { id: "BO_QUA_GAN", bo_qua_luc: bayGio - 2 * 24 * 60 * 60 * 1000 },
        { id: "BO_QUA_CU", bo_qua_luc: bayGio - 8 * 24 * 60 * 60 * 1000 },
      ],
    });

    const ids = deck.map((t) => t.san_pham.id);
    expect(ids).toEqual(expect.arrayContaining(["HOP_LE_1", "BO_QUA_CU"]));
    expect(ids).not.toContain("HET_HANG");
    expect(ids).not.toContain("BI_AN");
    expect(ids).not.toContain("THIEU_ANH");
    expect(ids).not.toContain("DA_THICH");
    expect(ids).not.toContain("DA_GIO");
    expect(ids).not.toContain("BO_QUA_GAN");
    expect(deck.every((t) => t.nguon === "pho_bien")).toBe(true);
  });

  it("xếp lại deck giữ nguyên thẻ đang nhìn và chỉ đổi các thẻ phía sau", () => {
    const hoSoDau = khoiTaoHoSo({ loai_da: "Da dầu", van_de: ["Mụn"] });
    const deckBanDau = xepDeck({
      sanPham: SAN_PHAM,
      deals: DEALS,
      hoSo: hoSoDau,
      homNay: NGAY_POPUP,
      ngauNhien: () => 0.3,
    });

    const theDangNhin = deckBanDau[1].san_pham;
    const hoSoMoi = capNhatHoSo(hoSoDau, theDangNhin, "thich", 1);

    const deckMoi = xepLaiDeck(deckBanDau, 1, {
      sanPham: SAN_PHAM,
      deals: DEALS,
      hoSo: hoSoMoi,
      homNay: NGAY_POPUP,
      ngauNhien: () => 0.3,
    });

    expect(deckMoi[0].san_pham.id).toBe(deckBanDau[0].san_pham.id);
    expect(deckMoi[1].san_pham.id).toBe(deckBanDau[1].san_pham.id);
    expect(deckMoi).toHaveLength(deckBanDau.length);

    // Đảm bảo hàm chấm điểm không lỗi với hồ sơ rỗng
    const spGiamGia = SAN_PHAM.find((s) => s.id === "8809198845989")!;
    expect(
      tinhDiemSanPham(spGiamGia, {
        hoSo: {},
        dealsHienThi: [],
      })
    ).toBeGreaterThan(0);
  });
});
