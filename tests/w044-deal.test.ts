import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DEALS, SAN_PHAM } from "@/lib/data";
import { layGhiChuDeal, trichXuatNhanGiaiThich } from "@/lib/deals";
import { dichVi, taoDich, tenDeal, dieuKienDeal, tienNgan, tenNganSanPham, tienThe } from "@/lib/deals/ngon-ngu";
import enDeal from "@/messages/en/deal.json";

const THU_MUC = ["components/deal", "app/(khach)/deal", "app/(khach)/gio", "lib/deals"];
// Chữ cái có dấu (không tính × ÷ ·). Lỗi lập trình `throw new Error` không hiện cho khách nên bỏ qua.
const CO_DAU = /[À-ÖØ-öø-ỹ]/;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}
const boChuThich = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

describe("W044 deal: không còn chữ tiếng Việt gõ cứng", () => {
  it.each(THU_MUC)("%s sạch chữ có dấu ngoài comment", (dir) => {
    const loi: string[] = [];
    for (const f of files(dir)) {
      boChuThich(readFileSync(f, "utf8")).split("\n").forEach((dong, i) => {
        if (CO_DAU.test(dong) && !/throw new Error/.test(dong)) loi.push(`${f}:${i + 1}: ${dong.trim()}`);
      });
    }
    expect(loi).toEqual([]);
  });
});

describe("W044 deal: chữ theo ngôn ngữ", () => {
  const tEn = taoDich(enDeal as never);
  const dealCombo = DEALS.find((d) => d.id === "LOPOE-COMBO-BO3")!;

  it("tiền ngắn: vi 1,1 triệu / 700K, en 1.1M / 700K", () => {
    expect(tienNgan(1_100_000)).toBe("1,1 triệu");
    expect(tienNgan(700_000)).toBe("700K");
    expect(tienNgan(1_100_000, "en", tEn)).toBe("1.1M");
    expect(tienNgan(700_000, "en", tEn)).toBe("700K");
  });

  it("tiền trên thẻ: vi giữ dạng cũ, en có VND", () => {
    expect(tienThe(349000, "vi")).toBe("349.000");
    expect(tienThe(349000, "en")).toBe("349,000 VND");
  });

  it("trường *_en: dùng khi có, thiếu thì hiện bản vi", () => {
    const co = { ...dealCombo, ten_en: "Trio" } as typeof dealCombo;
    expect(tenDeal(co, "en")).toBe("Trio");
    expect(tenDeal(co, "vi")).toBe(dealCombo.ten);
    expect(tenDeal(dealCombo, "en")).toBe(dealCombo.ten);
    expect(dieuKienDeal(dealCombo, "en")).toBe(dealCombo.dieu_kien);
  });

  it("ghi chú deal và nhãn giải thích đổi theo t", () => {
    const sp = SAN_PHAM.find((s) => s.id === "LOPOE-CF")!;
    expect(layGhiChuDeal(sp, DEALS)).toContain("Mua kèm: còn 186.000");
    expect(layGhiChuDeal(sp, DEALS, new Date(), tEn, "en")).toBe("With purchase: now 186,000 VND");
    expect(trichXuatNhanGiaiThich({}, [], new Map(), tEn)).toEqual(["Hot deals", "Hydration", "Combo savings"]);
    expect(trichXuatNhanGiaiThich({ "vd:cap-am": 2 }, [], new Map(), dichVi)).toEqual(["Cấp ẩm"]);
    expect(trichXuatNhanGiaiThich({ "vd:cap-am": 2 }, [], new Map(), tEn)).toEqual(["Hydration"]);
  });

  it("tên ngắn món mua kèm: vi giữ từ gốc, en dịch từ khóa", () => {
    expect(tenNganSanPham("LOPOE Sữa rửa mặt Better Balance")).toBe("Sữa rửa mặt");
    expect(tenNganSanPham("LOPOE Sữa rửa mặt Better Balance", "en", tEn)).toBe("Cleanser");
    expect(tenNganSanPham("Toner X", "en", tEn)).toBe("Toner X");
  });
});
