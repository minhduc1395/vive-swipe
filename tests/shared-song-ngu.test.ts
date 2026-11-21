import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Job #96: phần dùng chung (thanh trên, thanh tab, chân trang, toast, trang /chinh-sach) song ngữ VI | EN.
 * (1) Khóa vi và en khớp nhau. (2) Code hiển thị không còn chữ tiếng Việt có dấu (bỏ chú thích).
 */
const GOC = process.cwd();
type Cay = { [k: string]: string | Cay };

function lietKeKhoa(cay: Cay, tienTo = ""): string[] {
  return Object.entries(cay).flatMap(([k, v]) =>
    typeof v === "string" ? [tienTo + k] : lietKeKhoa(v, `${tienTo}${k}.`)
  );
}

function docJson(ngon: string, khoi: string): Cay {
  return JSON.parse(readFileSync(join(GOC, "messages", ngon, `${khoi}.json`), "utf8")) as Cay;
}

const CO_DAU =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

/** Bỏ chú thích `//`, `/* *​/`, `{/* *​/}` nhưng giữ nguyên nội dung trong chuỗi. */
function boChuThich(ma: string): string {
  let kq = "";
  let i = 0;
  while (i < ma.length) {
    const c = ma[i];
    const c2 = ma[i + 1];
    if (c === "/" && c2 === "*") {
      const het = ma.indexOf("*/", i + 2);
      i = het === -1 ? ma.length : het + 2;
    } else if (c === "/" && c2 === "/" && ma[i - 1] !== ":") {
      const het = ma.indexOf("\n", i);
      i = het === -1 ? ma.length : het;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < ma.length && ma[j] !== c && (c === "`" || ma[j] !== "\n")) {
        if (ma[j] === "\\") j++;
        j++;
      }
      kq += ma.slice(i, j + 1);
      i = j + 1;
    } else {
      kq += c;
      i++;
    }
  }
  return kq;
}

const FILE_RIENG = [
  "components/AppShell.tsx",
  "components/ThanhTrenDesktop.tsx",
  "components/ThanhTren.tsx",
  "components/ThanhDocTablet.tsx",
  "components/ThanhTab.tsx",
  "components/ChanTrang.tsx",
  "components/NutQuayLai.tsx",
  "components/KhungDienThoai.tsx",
  "components/LogoVive.tsx",
  "components/KhoiTaoSupabase.tsx",
  "app/(khach)/chinh-sach/page.tsx",
];
const FILE_UI = readdirSync(join(GOC, "components/ui"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => `components/ui/${f}`);

describe("shared song ngữ: từ điển", () => {
  for (const khoi of ["chung", "chinh-sach"]) {
    it(`khóa ${khoi} ở vi và en khớp nhau`, () => {
      const vi = lietKeKhoa(docJson("vi", khoi)).sort();
      const en = lietKeKhoa(docJson("en", khoi)).sort();
      expect(en).toEqual(vi);
    });
  }

  it("bản en không còn ký tự tiếng Việt có dấu", () => {
    for (const khoi of ["chung", "chinh-sach"]) {
      const nhieu = JSON.stringify(docJson("en", khoi));
      expect(nhieu.match(CO_DAU)).toBeNull();
    }
  });
});

describe("shared song ngữ: không còn chữ Việt gõ cứng", () => {
  for (const file of [...FILE_RIENG, ...FILE_UI]) {
    it(file, () => {
      const ma = boChuThich(readFileSync(join(GOC, file), "utf8"));
      const dong = ma.split("\n").filter((d) => CO_DAU.test(d));
      expect(dong).toEqual([]);
    });
  }
});
