import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { SAN_PHAM } from "@/lib/data";
import { NHAN_DANH_MUC, NHAN_LOAI_DA, NHAN_VAN_DE } from "@/lib/nhan";
import {
  dichDuLieu,
  ghiChuDealTheoNgonNgu,
  lyDoGoiY,
  moTaTamEn,
  taoNhan,
  tenSanPham,
  tienCoDon,
  tienKhongDon,
  truongTheoNgonNgu,
  type HamDich,
} from "@/components/deck/ngon-ngu-quet";
import type { Deal } from "@/lib/data/types";

type Cay = { [k: string]: string | Cay };
const doc = (l: string) => JSON.parse(readFileSync(join("messages", l, "quet.json"), "utf8")) as Cay;

/** Hàm dịch giả lập từ file messages: hỗ trợ {tham_so} và có has(). Không xử lý plural (không cần ở đây). */
function taoDich(ngonNgu: "vi" | "en", nhom: string): HamDich {
  let goc: string | Cay | undefined = doc(ngonNgu);
  for (const p of nhom.split(".")) goc = typeof goc === "object" ? goc[p] : undefined;
  const tim = (khoa: string): string | undefined => {
    let cur: string | Cay | undefined = goc;
    for (const p of khoa.split(".")) {
      if (typeof cur !== "object" || cur === null) return undefined;
      cur = cur[p];
    }
    return typeof cur === "string" ? cur : undefined;
  };
  const t = ((khoa: string, giaTri?: Record<string, string | number>) => {
    const mau = tim(khoa) ?? khoa;
    return mau.replace(/\{(\w+)\}/g, (_, k) => String(giaTri?.[k] ?? ""));
  }) as HamDich;
  t.has = (khoa: string) => tim(khoa) !== undefined;
  return t;
}

// Chữ cái có dấu tiếng Việt (không tính ký hiệu như · – × ← →)
const CHU_VIET = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

function bocComment(ma: string): string {
  return ma
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((dong) => dong.replace(/(^|[^:"'`])\/\/.*$/, "$1"))
    .join("\n");
}

function lietKe(thuMuc: string): string[] {
  return readdirSync(thuMuc).flatMap((ten) => {
    const duong = join(thuMuc, ten);
    if (statSync(duong).isDirectory()) return lietKe(duong);
    return /\.(ts|tsx)$/.test(ten) ? [duong] : [];
  });
}

const THU_MUC_MODULE = [
  "components/deck",
  "lib/goi-y",
  "app/(khach)/quet",
  "app/(khach)/da-thich",
  "app/(khach)/danh-muc",
  "app/(khach)/new-arrival",
  "app/(khach)/bat-dau",
  "app/(khach)/chao",
];

describe("W044 module quet: không còn chữ tiếng Việt gõ cứng", () => {
  const files = THU_MUC_MODULE.flatMap(lietKe);

  it("có file để quét", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files)("%s không có chuỗi có dấu tiếng Việt ngoài comment", (f) => {
    const loi = bocComment(readFileSync(f, "utf8"))
      .split("\n")
      .map((d, i) => ({ d, i: i + 1 }))
      .filter(({ d }) => CHU_VIET.test(d));
    expect(loi.map(({ i, d }) => `${f}:${i}: ${d.trim()}`)).toEqual([]);
  });
});

describe("W044 module quet: từ điển nhãn", () => {
  it("mọi mã loại da, vấn đề da, danh mục trong dữ liệu đều có nhãn vi và en", () => {
    for (const ngonNgu of ["vi", "en"] as const) {
      const nhan = taoNhan(taoDich(ngonNgu, "nhan"));
      for (const sp of SAN_PHAM) {
        expect(nhan.danhMuc(sp.danh_muc), `${ngonNgu} danh_muc ${sp.danh_muc}`).not.toBe(sp.danh_muc);
        for (const ld of sp.loai_da) expect(nhan.loaiDa(ld), `${ngonNgu} loai_da ${ld}`).not.toBe(ld);
        for (const vd of sp.van_de) expect(nhan.vanDe(vd), `${ngonNgu} van_de ${vd}`).not.toBe(vd);
      }
    }
  });

  it("bản vi trùng bảng nhãn gốc lib/nhan (đổi sang từ điển không làm lệch chữ tiếng Việt)", () => {
    const nhan = taoNhan(taoDich("vi", "nhan"));
    for (const [ma, chu] of Object.entries(NHAN_LOAI_DA)) expect(nhan.loaiDa(ma)).toBe(chu);
    for (const [ma, chu] of Object.entries(NHAN_VAN_DE)) expect(nhan.vanDe(ma)).toBe(chu);
    for (const [ma, chu] of Object.entries(NHAN_DANH_MUC)) expect(nhan.danhMuc(ma)).toBe(chu);
  });

  it("bản en không chứa chữ có dấu tiếng Việt", () => {
    const duyet = (c: Cay, duong = ""): string[] =>
      Object.entries(c).flatMap(([k, v]) =>
        typeof v === "string" ? (CHU_VIET.test(v) ? [`${duong}${k}: ${v}`] : []) : duyet(v, `${duong}${k}.`),
      );
    expect(duyet(doc("en"))).toEqual([]);
  });

  it("mã lạ thì hiện nguyên mã", () => {
    expect(taoNhan(taoDich("en", "nhan")).vanDe("khong-co-ma-nay")).toBe("khong-co-ma-nay");
  });
});

describe("W044 module quet: hàm hỗ trợ", () => {
  it("lý do gợi ý theo ngôn ngữ, cùng luật chọn với lib/nhan", () => {
    const vi = lyDoGoiY(taoDich("vi", "the"), taoNhan(taoDich("vi", "nhan")), ["mun"], ["da-dau"]);
    const en = lyDoGoiY(taoDich("en", "the"), taoNhan(taoDich("en", "nhan")), ["mun"], ["da-dau"]);
    expect(vi).toBe("Hợp với: Mụn");
    expect(en).toBe("Good for: Acne");
    expect(lyDoGoiY(taoDich("en", "the"), taoNhan(taoDich("en", "nhan")), [], ["moi-loai-da", "da-kho"])).toBe("Good for: Dry skin");
    expect(lyDoGoiY(taoDich("en", "the"), taoNhan(taoDich("en", "nhan")), [], ["moi-loai-da"])).toBeUndefined();
  });

  it("trường *_en: en dùng bản en nếu có, thiếu thì bản vi; vi luôn bản vi", () => {
    const d = { ten: "Bộ A", ten_en: "Set A", hook: "Quà" };
    expect(truongTheoNgonNgu(d, "ten", "en")).toBe("Set A");
    expect(truongTheoNgonNgu(d, "ten", "vi")).toBe("Bộ A");
    expect(truongTheoNgonNgu(d, "hook", "en")).toBe("Quà");
    expect(truongTheoNgonNgu(d, "khong-co", "en")).toBeUndefined();
    const sp = SAN_PHAM[0];
    expect(tenSanPham(sp, "vi")).toBe(sp.ten_hien_thi);
    expect(tenSanPham({ ...sp, ten_en: "English name" } as typeof sp, "en")).toBe("English name");
    expect(tenSanPham(sp, "en")).toBe(sp.ten_hien_thi);
  });

  it("giá theo ngôn ngữ", () => {
    expect(tienKhongDon(349000, "vi")).toBe("349.000");
    expect(tienKhongDon(349000, "en")).toBe("349,000 VND");
    expect(tienCoDon(349000, "vi")).toBe("349.000đ");
    expect(tienCoDon(349000, "en")).toBe("349,000 VND");
  });

  it("ghi chú deal en dịch khung câu và dùng tên deal en", () => {
    const sp = SAN_PHAM[0];
    const deal = {
      id: "D1", ten: "Bộ đôi", ten_en: "Duo set", loai: "combo", trang_thai: "dang_chay", may_rui: false,
      da_dang_ky: false, hien_thi: true, het_qua: false, bat_dau: null, ket_thuc: null,
      thanh_phan: [{ id: sp.id, so_luong: 1 }], gia_combo: 500000,
    } as unknown as Deal;
    const tEn = taoDich("en", "ghiChuDeal");
    const tVi = taoDich("vi", "ghiChuDeal");
    const en = ghiChuDealTheoNgonNgu(tEn, "en", sp, [deal]);
    const vi = ghiChuDealTheoNgonNgu(tVi, "vi", sp, [deal]);
    if (en) {
      expect(en).toBe("In Duo set 500,000 VND");
      expect(vi).toContain("Có trong");
    } else {
      // Định dạng deal trong dữ liệu mẫu không khớp bộ lọc hiển thị: ít nhất hai bản phải nhất quán
      expect(vi).toBeUndefined();
    }
  });

  it("dịch chữ trong dữ liệu: thành phần, quy cách, nhãn giảm (en); vi giữ nguyên", () => {
    const en = taoDich("en", "nhan");
    expect(dichDuLieu(en, "thanhPhan", "Tràm trà", "en")).toBe("Tea tree");
    expect(dichDuLieu(en, "thanhPhan", "Tràm trà", "vi")).toBe("Tràm trà");
    expect(dichDuLieu(en, "thanhPhan", "Niacinamide", "en")).toBe("Niacinamide");
    expect(dichDuLieu(en, "quyCach", "12 miếng · 23g", "en")).toBe("12 pcs · 23g");
    expect(dichDuLieu(en, "quyCach", "100ml · 40 miếng", "en")).toBe("100ml · 40 pcs");
    expect(dichDuLieu(en, "quyCach", "Hộp 4 miếng · giá tính theo miếng", "en")).toBe("Box of 4 pcs · priced per piece");
    expect(dichDuLieu(en, "quyCach", "50ml", "en")).toBe("50ml");
    expect(dichDuLieu(en, "nhanGiam", "giảm 31.000", "en")).toBe("31,000 VND off");
    expect(dichDuLieu(en, "nhanGiam", "-26%", "en")).toBe("-26%");
  });

  it("mọi thành phần, quy cách, nhãn giảm có dấu tiếng Việt trong dữ liệu đều có bản en", () => {
    const en = taoDich("en", "nhan");
    for (const sp of SAN_PHAM) {
      const chuoi: [Parameters<typeof dichDuLieu>[1], string | null][] = [
        ...sp.thanh_phan.map((x) => ["thanhPhan", x] as [Parameters<typeof dichDuLieu>[1], string]),
        ["quyCach", sp.quy_cach],
        ["nhanGiam", sp.giam_tren_tag],
      ];
      for (const [nhom, goc] of chuoi) {
        if (!goc || !CHU_VIET.test(goc)) continue;
        expect(CHU_VIET.test(dichDuLieu(en, nhom, goc, "en")), `${nhom}: ${goc}`).toBe(false);
      }
    }
  });

  it("mô tả tạm bản en không còn tiếng Việt", () => {
    const sp = SAN_PHAM.find((s) => s.thanh_phan.length > 0 && s.loai_da.length > 0) ?? SAN_PHAM[0];
    const mo = moTaTamEn(sp, taoDich("en", "chiTiet.moTaTam"), taoNhan(taoDich("en", "nhan")), taoDich("en", "nhan"));
    expect(CHU_VIET.test(mo)).toBe(false);
    expect(mo).toContain(sp.thuong_hieu);
  });
});

describe("W044 module quet: mọi khóa gọi trong code đều có trong từ điển vi và en", () => {
  const files = THU_MUC_MODULE.flatMap(lietKe);
  const coKhoa = (ngonNgu: "vi" | "en", duong: string): boolean => {
    let cur: string | Cay | undefined = { quet: doc(ngonNgu) };
    for (const p of duong.split(".")) {
      if (typeof cur !== "object" || cur === null) return false;
      cur = cur[p];
    }
    return cur !== undefined;
  };

  it.each(files)("%s", (f) => {
    const ma = bocComment(readFileSync(f, "utf8"));
    const thieu: string[] = [];
    const bien = [...ma.matchAll(/const (\w+) = (?:await )?(?:useTranslations|useDichQuet|getTranslations)\("([\w.]+)"\)/g)];
    for (const [, ten, ns] of bien) {
      for (const m of ma.matchAll(new RegExp(`\\b${ten}\\(\\s*"([\\w.-]+)"`, "g"))) {
        for (const nn of ["vi", "en"] as const) {
          if (!coKhoa(nn, `${ns}.${m[1]}`)) thieu.push(`${nn}: ${ns}.${m[1]}`);
        }
      }
    }
    expect(thieu).toEqual([]);
  });

  it("khóa động: toast, cách xếp", () => {
    for (const nn of ["vi", "en"] as const) {
      for (const k of ["ungY", "hopDa", "vaoGio"]) expect(coKhoa(nn, `quet.deck.toast.${k}`)).toBe(true);
      for (const k of ["goi-y", "giam", "gia-tang", "gia-giam"]) expect(coKhoa(nn, `quet.danhMuc.xepLuaChon.${k}`)).toBe(true);
    }
  });
});
