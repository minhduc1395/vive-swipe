import { describe, it, expect } from "vitest";
import { TRANG_CHU_CONFIG } from "@/lib/trang-chu";

// CĐT 21/11: thẻ combo trùng màu nền hàng trượt (kem) bị hòa vào nền.
describe("Màu thẻ combo trượt ngang trang chủ", () => {
  const the = TRANG_CHU_CONFIG.truot_combo.the;

  it("không thẻ nào dùng màu kem (trùng nền .hang-combo)", () => {
    expect(the.filter((t) => t.mau_nen === "kem").map((t) => t.deal_id)).toEqual([]);
  });

  it("2 thẻ kề nhau khác màu", () => {
    for (let i = 1; i < the.length; i++) {
      expect(the[i].mau_nen, `${the[i - 1].deal_id} và ${the[i].deal_id}`).not.toBe(the[i - 1].mau_nen);
    }
  });
});
