import { describe, it, expect } from "vitest";
import { DEALS } from "@/lib/data";
import { dichQua } from "@/lib/deals/ngon-ngu";

const deal = (id: string) => DEALS.find((d) => d.id === id)!;

describe("dichQua: tên quà hiện theo ngôn ngữ", () => {
  it("mốc 800K và 1,2 triệu (BAC-HOA-DON)", () => {
    const moc = deal("BAC-HOA-DON").moc!;
    expect(moc.length).toBeGreaterThanOrEqual(2);
    for (const m of moc) {
      expect(m.qua_en).toBeTruthy();
      expect(dichQua(m.qua, DEALS, "en")).toBe(m.qua_en);
    }
    expect(dichQua("1 sữa rửa mặt LOPOE", DEALS, "en")).toBe("1 LOPOE cleansing foam");
    expect(dichQua("1 ampoule LOPOE", DEALS, "en")).toBe("1 LOPOE ampoule");
  });

  it("voucher KM-09", () => {
    const d = deal("KM-09");
    expect(d.qua_en).toBeTruthy();
    expect(dichQua(d.moc![0].qua, DEALS, "en")).toBe(d.moc![0].qua_en);
    expect(dichQua("1 voucher giảm 15% nhà hàng Union Square", DEALS, "en")).toBe(
      "1 15% off Union Square restaurant voucher",
    );
  });

  it("lượt quay DC-02 và thưởng giữ hàng", () => {
    const d = deal("DC-02");
    expect(dichQua("1 lượt quay vòng quay may mắn", DEALS, "en")).toBe("1 lucky-wheel spin");
    expect(dichQua(d.thuong_giu_hang!.qua, DEALS, "en")).toBe(d.thuong_giu_hang!.qua_en);
    expect(d.thuong_giu_hang!.qua_en).toBe("1 extra lucky-wheel spin");
  });

  it("quà combo LOPOE-COMBO-BO3", () => {
    const d = deal("LOPOE-COMBO-BO3");
    expect(d.qua_en).toBeTruthy();
    expect(dichQua(d.qua!, DEALS, "en")).toBe(d.qua_en);
  });

  it("chuỗi lạ trả nguyên", () => {
    expect(dichQua("Quà không có trong dữ liệu", DEALS, "en")).toBe("Quà không có trong dữ liệu");
  });

  it("nn vi trả nguyên", () => {
    expect(dichQua("1 sữa rửa mặt LOPOE", DEALS, "vi")).toBe("1 sữa rửa mặt LOPOE");
    expect(dichQua("1 lượt quay vòng quay may mắn", DEALS, "vi")).toBe("1 lượt quay vòng quay may mắn");
  });

  it("rỗng/null trả nguyên", () => {
    expect(dichQua(null, DEALS, "en")).toBeNull();
    expect(dichQua(undefined, DEALS, "en")).toBeUndefined();
  });
});
