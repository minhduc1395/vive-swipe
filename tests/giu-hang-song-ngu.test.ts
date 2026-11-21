import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DEALS } from "@/lib/data";
import { dongThuongGiuHang, layThuongGiuHang } from "@/lib/giu-hang/thuong";
import { xuLyTaoGiuHang } from "@/lib/giu-hang/tao-giu-hang";
import type { MaLoiGiuHang } from "@/lib/giu-hang/types";

type Cay = { [k: string]: string | Cay };
const doc = (l: string) => JSON.parse(readFileSync(join("messages", l, "giu-hang.json"), "utf8")) as Cay;

function layTsx(thuMuc: string): string[] {
  return readdirSync(thuMuc).flatMap((ten) => {
    const p = join(thuMuc, ten);
    if (statSync(p).isDirectory()) return layTsx(p);
    return p.endsWith(".tsx") ? [p] : [];
  });
}

// Chữ cái có dấu tiếng Việt (không tính × • …)
const CHU_VIET = /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/;

function dongCoChuViet(noiDung: string): string[] {
  let trongKhoiChuThich = false;
  const ra: string[] = [];
  for (const dong of noiDung.split("\n")) {
    let d = dong;
    if (trongKhoiChuThich) {
      if (d.includes("*/")) {
        trongKhoiChuThich = false;
        d = d.slice(d.indexOf("*/") + 2);
      } else continue;
    }
    d = d.replace(/\{?\/\*.*?\*\/\}?/g, "");
    if (d.includes("/*")) {
      trongKhoiChuThich = true;
      d = d.slice(0, d.indexOf("/*"));
    }
    d = d.replace(/(^|\s)\/\/.*$/, "");
    if (CHU_VIET.test(d)) ra.push(dong.trim());
  }
  return ra;
}

describe("W044 · module giu-hang song ngữ", () => {
  it("TSX của trang giữ hàng không còn chữ có dấu tiếng Việt ngoài comment", () => {
    const tep = layTsx(join("app", "(khach)", "giu-hang"));
    expect(tep.length).toBeGreaterThanOrEqual(3);
    const loi = tep.flatMap((t) => dongCoChuViet(readFileSync(t, "utf8")).map((d) => `${t}: ${d}`));
    expect(loi).toEqual([]);
  });

  it("bộ quét bắt được chữ Việt trong JSX và bỏ qua comment", () => {
    expect(dongCoChuViet("<p>Giữ hàng</p>")).toHaveLength(1);
    expect(dongCoChuViet("// Giữ hàng\n{/* Họ và tên */}\n/* a\n Giữ */\n<b>{a} × 2</b>")).toEqual([]);
  });

  it("mỗi mã lỗi từ server có chữ ở cả vi và en", () => {
    const ma: MaLoiGiuHang[] = ["chinh_sach", "ten", "sdt", "email", "gio_trong", "gioi_han", "khong_hop_le", "he_thong"];
    for (const l of ["vi", "en"]) {
      const may = (doc(l).loi as Cay).may as Cay;
      for (const m of ma) expect(typeof may[m]).toBe("string");
    }
  });

  it("server trả maLoi cùng với loi tiếng Việt", async () => {
    const kq = await xuLyTaoGiuHang({ ten: "", sdt: "0988776655", ngayDen: "hom_nay", dongYChinhSach: true, gio: [] });
    expect(kq.ok).toBe(false);
    expect(kq.maLoi).toBe("ten");
    expect(kq.loi).toMatch(/họ và tên/);
    const kq2 = await xuLyTaoGiuHang({ ten: "A", sdt: "0988776655", ngayDen: "hom_nay", dongYChinhSach: false, gio: [] });
    expect(kq2.maLoi).toBe("chinh_sach");
  });

  it("thưởng giữ hàng: en dùng qua_en, thiếu thì dùng bản vi; vi không đổi", () => {
    const goc = DEALS.find((d) => d.id === "DC-02")!;
    const voiEn = DEALS.map((d) =>
      d.id === "DC-02" ? { ...d, thuong_giu_hang: { ...goc.thuong_giu_hang!, qua_en: "1 extra lucky-wheel spin" } } : d
    );
    expect(layThuongGiuHang(voiEn, "2026-11-27", "en")?.qua).toBe("1 extra lucky-wheel spin");
    expect(layThuongGiuHang(voiEn, "2026-11-27", "vi")?.qua).toBe(goc.thuong_giu_hang!.qua);
    const khongEn = DEALS.map((d) =>
      d.id === "DC-02" ? { ...d, thuong_giu_hang: { tu_ngay: goc.thuong_giu_hang!.tu_ngay, qua: goc.thuong_giu_hang!.qua } } : d
    );
    expect(layThuongGiuHang(khongEn, "2026-11-27", "en")?.qua).toBe(goc.thuong_giu_hang!.qua);
    expect(dongThuongGiuHang(DEALS, "2026-11-27")).toBe(`Nhận tại booth: ${goc.thuong_giu_hang!.qua}`);
  });
});
