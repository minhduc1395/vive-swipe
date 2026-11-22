import { describe, expect, it } from "vitest";
import { DEALS, SAN_PHAM } from "@/lib/data";
import { tinhGio } from "@/lib/deals/gio-hang";
import trangChu from "@/lib/data/trang-chu.json";

// QA-006 (QD-BOD-060) và QD-BOD-072, doc claude/VIVE-LOPOE-chuong-trinh-da-chot.md mục 1, 6
const NGAY = "2026-11-23";
const VOUCHER = "1 voucher giảm 15% nhà hàng Union Square";
const QUAY = "1 lượt quay vòng quay may mắn";
const deal = (id: string) => DEALS.find((d) => d.id === id)!;

describe("QA-006 voucher nhà hàng tách khỏi mốc 1,2 triệu; QD-BOD-072 vòng quay mọi hóa đơn", () => {
  it("BAC-HOA-DON: mốc 1,2 triệu chỉ còn ampoule, giữ giới hạn 15; hook không nhắc voucher", () => {
    const b = deal("BAC-HOA-DON");
    const moc12 = b.moc!.find((m) => m.tu === 1_200_000)!;
    expect(moc12.qua).toBe("1 ampoule LOPOE");
    expect(moc12.gioi_han).toBe(15);
    expect(`${b.hook} ${b.hook_en} ${moc12.qua_en}`).not.toMatch(/voucher/i);
  });

  it("KM-09: hiện, cộng thêm, từ 1 triệu, không giới hạn, chữ khách thấy không ghi mốc", () => {
    const v = deal("KM-09");
    expect(v.hien_thi).toBe(true);
    expect(v.trang_thai).toBe("DA_DUYET");
    expect(v.nhom_qua).toBe("cong_them");
    expect(v.an_moc).toBe(true);
    expect(v.moc).toEqual([expect.objectContaining({ tu: 1_000_000, qua: VOUCHER })]);
    expect(v.moc!.every((m) => m.gioi_han === undefined)).toBe(true);
    expect(v.gioi_han).toBeUndefined();
    const chu = [v.ten, v.ten_en, v.hook, v.hook_en, v.dieu_kien, v.dieu_kien_en].join(" ");
    expect(chu).not.toMatch(/1 triệu|1\.000\.000|1M|1,000,000|1\.2|1,2/);
  });

  it("Đơn từ 1 triệu dưới 1,2 triệu (1.135.000): sữa rửa mặt LOPOE + voucher + lượt quay", () => {
    const kq = tinhGio(
      [
        { san_pham_id: "8800256114320", so_luong: 1 },
        { san_pham_id: "8800256114351", so_luong: 1 },
      ],
      SAN_PHAM,
      DEALS,
      NGAY
    );
    expect(kq.tong_tam_tinh).toBe(1_135_000);
    expect(kq.qua_du_kien).toBe("1 sữa rửa mặt LOPOE");
    expect(kq.qua_cong_them).toEqual(expect.arrayContaining([VOUCHER, QUAY]));
  });

  it("Đơn dưới 1 triệu không có voucher; đơn nhỏ vẫn được quay", () => {
    const kq = tinhGio([{ san_pham_id: "LOPOE-CF", so_luong: 1 }], SAN_PHAM, DEALS, NGAY);
    expect(kq.tong_tam_tinh).toBeLessThan(1_000_000);
    expect(kq.qua_cong_them).not.toContain(VOUCHER);
    expect(kq.qua_cong_them).toContain(QUAY);
  });

  it("DC-02: chữ VI, EN không còn mốc 300K; ẩn đường mốc trên thẻ", () => {
    const q = deal("DC-02");
    expect(q.an_moc).toBe(true);
    const chu = [q.hook, q.hook_en, q.dieu_kien, q.dieu_kien_en].join(" ");
    expect(chu).not.toMatch(/300/);
    expect(q.dieu_kien).toContain("Mỗi hóa đơn tại VIVE được quay 1 lượt");
  });

  it("Trang chủ khối quà LOPOE không nhắc voucher", () => {
    const q = (trangChu as { qua_lopoe: { phu_de: string; phu_de_en: string } }).qua_lopoe;
    expect(`${q.phu_de} ${q.phu_de_en}`).not.toMatch(/voucher/i);
  });
});
