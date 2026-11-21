import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { TRANG_CHU_CONFIG } from "@/lib/trang-chu";
import { chonBanNgonNgu, chuTheoNgonNgu } from "@/lib/trang-chu/ngon-ngu";
import { docCauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { docDanhSachChienDichTuDisk } from "@/lib/chien-dich";

/** Chữ có dấu tiếng Việt (bỏ × và ÷ cho khỏi nhầm với ký hiệu) */
const CO_DAU_VI = /[À-ÖØ-öø-ỹ]/;

function lietKeFile(duongDan: string, duoi: RegExp): string[] {
  if (statSync(duongDan).isFile()) return duoi.test(duongDan) ? [duongDan] : [];
  return readdirSync(duongDan).flatMap((t) => lietKeFile(join(duongDan, t), duoi));
}

/** Bỏ comment (khối, JSX và dòng //) để chỉ còn mã và chuỗi hiện cho khách */
function boComment(ma: string): string {
  return ma
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[\s;{(,])\/\/.*$/gm, "$1");
}

describe("W044 trang-chu: không còn chữ tiếng Việt gõ cứng", () => {
  const GOC = [
    "components/trang-chu",
    "components/landing",
    "components/cuon-3d",
    "app/(khach)/page.tsx",
    "app/(khach)/personal-color",
  ];
  const files = GOC.flatMap((g) => lietKeFile(g, /\.(tsx|ts)$/));

  it("có file để quét", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it.each(files)("%s", (f) => {
    const dong = boComment(readFileSync(f, "utf8")).split("\n");
    const loi = dong.map((d, i) => ({ d, i: i + 1 })).filter(({ d }) => CO_DAU_VI.test(d));
    expect(loi.map(({ d, i }) => `${f}:${i} ${d.trim()}`)).toEqual([]);
  });
});

function chuoiCoDau(v: unknown, duong = ""): string[] {
  if (typeof v === "string") return CO_DAU_VI.test(v) ? [`${duong} = ${v}`] : [];
  if (Array.isArray(v)) return v.flatMap((x, i) => chuoiCoDau(x, `${duong}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => chuoiCoDau(x, `${duong}.${k}`));
  return [];
}

describe("W044 trang-chu: dữ liệu yaml có bản en", () => {
  it("chonBanNgonNgu: en thay trường gốc bằng *_en, vi bỏ *_en, trường *_en lẻ giữ nguyên", () => {
    const d = { a: "xin chào", a_en: "hello", ds: [{ b: "một", b_en: "one" }, { c: "hai" }], qua_en: "gift" };
    expect(chonBanNgonNgu(d, "en")).toEqual({ a: "hello", ds: [{ b: "one" }, { c: "hai" }], qua_en: "gift" });
    expect(chonBanNgonNgu(d, "vi")).toEqual({ a: "xin chào", ds: [{ b: "một" }, { c: "hai" }], qua_en: "gift" });
  });

  it("chuTheoNgonNgu: en dùng *_en nếu có, thiếu thì giữ bản vi", () => {
    expect(chuTheoNgonNgu({ ten: "Bộ", ten_en: "Set" }, "ten", "en")).toBe("Set");
    expect(chuTheoNgonNgu({ ten: "Bộ" }, "ten", "en")).toBe("Bộ");
    expect(chuTheoNgonNgu({ ten: "Bộ", ten_en: "Set" }, "ten", "vi")).toBe("Bộ");
    expect(chuTheoNgonNgu(undefined, "ten", "en")).toBeUndefined();
  });

  it("trang chủ ở en: không còn chuỗi có dấu tiếng Việt", () => {
    expect(chuoiCoDau(chonBanNgonNgu(TRANG_CHU_CONFIG, "en"))).toEqual([]);
  });

  it("khối LOPOE 3D ở en: không còn chuỗi có dấu tiếng Việt", () => {
    expect(chuoiCoDau(chonBanNgonNgu(docCauHinhLopoe3D(true), "en"))).toEqual([]);
  });

  it("landing các đợt chiến dịch ở en: không còn chuỗi có dấu tiếng Việt", () => {
    const ds = docDanhSachChienDichTuDisk();
    expect(ds.length).toBeGreaterThan(0);
    for (const c of ds) expect(chuoiCoDau(chonBanNgonNgu(c, "en"))).toEqual([]);
  });

  it("ở vi dữ liệu không đổi so với bản gốc (trừ trường *_en)", () => {
    const vi = chonBanNgonNgu(TRANG_CHU_CONFIG, "vi");
    expect(vi.luoi_doi[0].tieu_de).toBe(TRANG_CHU_CONFIG.luoi_doi[0].tieu_de);
    expect(JSON.stringify(vi)).not.toMatch(/"(tieu_de|chu|phu_de_truoc|mo_ta_anh|ten)_en"/);
  });
});
