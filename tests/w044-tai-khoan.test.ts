import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { LOI } from "@/lib/tai-khoan/loi";

type Cay = { [k: string]: string | Cay };
const doc = (l: string) => JSON.parse(readFileSync(join("messages", l, "tai-khoan.json"), "utf8")) as Cay;

function layTep(thuMuc: string): string[] {
  return readdirSync(thuMuc).flatMap((ten) => {
    const p = join(thuMuc, ten);
    if (statSync(p).isDirectory()) return layTep(p);
    return /\.tsx?$/.test(p) ? [p] : [];
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
    // Log cho lập trình viên, khách không thấy
    if (/console\.(warn|error|log)/.test(d)) continue;
    if (CHU_VIET.test(d)) ra.push(dong.trim());
  }
  return ra;
}

describe("W044 · module tai-khoan song ngữ", () => {
  it("file của module không còn chữ có dấu tiếng Việt ngoài comment", () => {
    const tep = [
      ...layTep(join("app", "(khach)", "dang-nhap")),
      ...layTep(join("app", "(khach)", "tai-khoan")),
      ...layTep(join("components", "tai-khoan")),
      ...layTep(join("lib", "tai-khoan")),
    ];
    expect(tep.length).toBeGreaterThanOrEqual(10);
    const loi = tep.flatMap((t) => dongCoChuViet(readFileSync(t, "utf8")).map((d) => `${t}: ${d}`));
    expect(loi).toEqual([]);
  });

  it("bộ quét bắt được chữ Việt trong JSX và bỏ qua comment", () => {
    expect(dongCoChuViet("<p>Đăng nhập</p>")).toHaveLength(1);
    expect(dongCoChuViet("// Đăng nhập\n{/* Tài khoản */}\n/* a\n Gửi */\n<b>{a} × 2</b>")).toEqual([]);
  });

  it("mỗi mã lỗi có chữ ở cả vi và en", () => {
    for (const l of ["vi", "en"]) {
      const loi = doc(l).loi as Cay;
      for (const ma of Object.values(LOI)) expect(typeof loi[ma]).toBe("string");
    }
  });

  it("en khác vi ở các chữ chính", () => {
    const vi = doc("vi");
    const en = doc("en");
    for (const nhom of ["form", "thongTin", "loi"]) {
      for (const [k, v] of Object.entries(vi[nhom] as Cay)) {
        if (k === "email" || k === "bieuMau") continue;
        expect((en[nhom] as Cay)[k], `${nhom}.${k}`).not.toBe(v);
      }
    }
  });
});
