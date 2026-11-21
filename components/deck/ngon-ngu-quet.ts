import type { Deal, SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem, dinhDangGia, dinhDangTien } from "@/lib/dinh-dang";
import { layCacDealCuaSanPham, layGhiChuDeal } from "@/lib/deals/ghi-chu";

/**
 * W044: hàm hỗ trợ song ngữ cho module quet (nhãn theo mã, trường *_en, giá, ghi chú deal).
 * Từ điển ở messages/<vi|en>/quet.json. Mọi hàm thuần để dùng được ở cả client và server component.
 */

/** Dạng tối thiểu của hàm dịch (useTranslations / getTranslations) mà các hàm dưới cần. */
export type HamDich = {
  (khoa: string, giaTri?: Record<string, string | number>): string;
  has: (khoa: string) => boolean;
};

/** Ép kiểu hàm dịch của next-intl về HamDich. */
export function nhanHamDich(t: unknown): HamDich {
  return t as HamDich;
}

/** Lấy trường `<truong>_en` khi ngôn ngữ là en và có giá trị; thiếu thì dùng bản vi. */
export function truongTheoNgonNgu(
  doiTuong: object,
  truong: string,
  ngonNgu: string,
): string | undefined {
  const goc = (doiTuong as Record<string, unknown>)[truong];
  if (ngonNgu === "en") {
    const en = (doiTuong as Record<string, unknown>)[`${truong}_en`];
    if (typeof en === "string" && en.trim() !== "") return en;
  }
  return typeof goc === "string" ? goc : undefined;
}

export function tenSanPham(sp: SanPham, ngonNgu: string): string {
  const en = (sp as unknown as Record<string, unknown>).ten_en;
  return ngonNgu === "en" && typeof en === "string" && en.trim() !== "" ? en : sp.ten_hien_thi;
}

export function moTaSanPham(sp: SanPham, ngonNgu: string): string | null {
  return truongTheoNgonNgu(sp, "mo_ta", ngonNgu) ?? null;
}

/** Trả về "" khi đang xem EN nhưng sản phẩm chưa có ten_en (để test gắn nhãn data-thieu-en). */
export function thieuBanEn(sp: SanPham, ngonNgu: string): "" | undefined {
  if (ngonNgu !== "en") return undefined;
  const en = (sp as unknown as Record<string, unknown>).ten_en;
  return typeof en === "string" && en.trim() !== "" ? undefined : "";
}

/** Trả về "" khi sản phẩm có mo_ta nhưng chưa có mo_ta_en ở bản EN. */
export function moTaThieuEn(sp: SanPham, ngonNgu: string): "" | undefined {
  if (ngonNgu !== "en") return undefined;
  if (!sp.mo_ta || !sp.mo_ta.trim()) return undefined;
  const en = (sp as unknown as Record<string, unknown>).mo_ta_en;
  return typeof en === "string" && en.trim() !== "" ? undefined : "";
}

/** Số tiền trên thẻ/lưới: vi giữ dạng 349.000, en là 349,000 VND. */
export function tienKhongDon(soTien: number, ngonNgu: string): string {
  return ngonNgu === "en" ? dinhDangGia(soTien, "en") : dinhDangTien(soTien);
}

/** Số tiền có đơn vị: vi 349.000đ, en 349,000 VND. */
export function tienCoDon(soTien: number, ngonNgu: string): string {
  return dinhDangGia(soTien, ngonNgu);
}

/** Nhãn theo mã (loại da, vấn đề da, danh mục, ngân sách). Mã lạ thì hiện nguyên mã. */
export function taoNhan(t: HamDich) {
  const lay = (nhom: string, ma: string) => (t.has(`${nhom}.${ma}`) ? t(`${nhom}.${ma}`) : ma);
  return {
    loaiDa: (ma: string) => lay("loaiDa", ma),
    vanDe: (ma: string) => lay("vanDe", ma),
    danhMuc: (ma: string) => lay("danhMuc", ma),
    danhMucLoc: (ma: string) => lay("danhMucLoc", ma),
    nganSach: (ma: string) => lay("nganSach", ma),
    phuHopNhat: () => t("phuHopNhat"),
  };
}
export type BoNhan = ReturnType<typeof taoNhan>;

/** Lý do gợi ý trên thẻ deck (thay layLyDoGoiY của lib/nhan, cùng luật chọn). */
export function lyDoGoiY(
  tThe: HamDich,
  nhan: BoNhan,
  vanDeList?: string[],
  loaiDaList?: string[],
): string | undefined {
  if (vanDeList && vanDeList.length > 0) {
    return tThe("lyDoVanDe", { nhan: nhan.vanDe(vanDeList[0]) });
  }
  if (loaiDaList && loaiDaList.length > 0) {
    const hop = loaiDaList.find((ld) => ld !== "moi-loai-da");
    if (hop) return tThe("lyDoLoaiDa", { nhan: nhan.loaiDa(hop) });
  }
  return undefined;
}

/** Ghi chú deal ngắn trên thẻ (cùng luật ưu tiên với lib/deals/ghi-chu). vi dùng thẳng bản gốc. */
export function ghiChuDealTheoNgonNgu(
  tGhiChu: HamDich,
  ngonNgu: string,
  sp: SanPham,
  deals: Deal[],
): string | undefined {
  if (ngonNgu !== "en") return layGhiChuDeal(sp, deals);
  const lienQuan = layCacDealCuaSanPham(sp, deals);
  if (lienQuan.length === 0) return undefined;
  const ten = (d: Deal) => truongTheoNgonNgu(d, "ten", ngonNgu) ?? d.ten;

  const muaKem = lienQuan.find((d) => d.loai === "giam_khi_mua_kem");
  if (muaKem && muaKem.gia_uu_dai && muaKem.gia_uu_dai[sp.id]) {
    return tGhiChu("muaKem", { gia: tienCoDon(muaKem.gia_uu_dai[sp.id], ngonNgu) });
  }
  const combo = lienQuan.find((d) => d.loai === "combo");
  if (combo) {
    return combo.gia_combo
      ? tGhiChu("coTrongGia", { ten: ten(combo), gia: tienCoDon(combo.gia_combo, ngonNgu) })
      : tGhiChu("coTrong", { ten: ten(combo) });
  }
  return ten(lienQuan[0]);
}

/** Mô tả tạm bản en (bản vi dùng moTaTam của lib/mo-ta-tam), ghép từ dữ liệu như bản vi. */
export function moTaTamEn(sp: SanPham, tMoTa: HamDich, nhan: BoNhan, tNhan: HamDich): string {
  const loai = nhan.danhMuc(sp.danh_muc).toLowerCase();
  const cau: string[] = [];
  cau.push(
    tMoTa("dau", {
      loai: `${loai.charAt(0).toUpperCase()}${loai.slice(1)}`,
      thuongHieu: sp.thuong_hieu,
      quyCach: sp.quy_cach ? `, ${sp.quy_cach}` : "",
    }),
  );
  if (sp.thanh_phan?.length) cau.push(tMoTa("thanhPhan", { ds: sp.thanh_phan.slice(0, 4).map((tp) => dichDuLieu(tNhan, "thanhPhan", tp, "en")).join(", ") }));
  const da = (sp.loai_da ?? []).filter((d) => d !== "moi-loai-da").map((d) => nhan.loaiDa(d).toLowerCase());
  if (da.length) cau.push(tMoTa("loaiDa", { ds: da.join(", ") }));
  else if ((sp.loai_da ?? []).includes("moi-loai-da")) cau.push(tMoTa("moiLoaiDa"));
  const vd = (sp.van_de ?? []).map((v) => nhan.vanDe(v).toLowerCase()).filter((v) => v !== loai);
  if (vd.length) cau.push(tMoTa("vanDe", { ds: vd.slice(0, 3).join(", ") }));
  cau.push(tMoTa("cuoi"));
  return cau.join(" ");
}

/**
 * Dịch chữ nằm trong dữ liệu sản phẩm (thành phần, quy cách, nhãn giảm) bằng từ điển `quet.nhan.<nhóm>`.
 * Khóa = chuỗi gốc bỏ dấu, chữ thường, số thay bằng "n", ký tự lạ thành "-". Số gốc đưa vào {a}, {b}.
 * Chỉ dịch khi ngôn ngữ là en và có khóa; ngược lại giữ nguyên chuỗi gốc.
 */
export function dichDuLieu(
  tNhan: HamDich,
  nhom: "thanhPhan" | "quyCach" | "nhanGiam",
  chuoi: string,
  ngonNgu: string,
): string {
  if (ngonNgu !== "en") return chuoi;
  const so = chuoi.match(/\d+(?:[.,]\d+)?/g) ?? [];
  const khoa = chuanHoaTimKiem(chuoi)
    .replace(/\d+(?:[.,]\d+)?/g, "n")
    .replace(/[^a-z]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const duong = `${nhom}.${khoa}`;
  if (!tNhan.has(duong)) return chuoi;
  // Số tiền trong nhãn giảm: 31.000 -> 31,000 (kiểu en)
  const doi = (x: string) => (nhom === "nhanGiam" ? x.replace(/\./g, ",") : x);
  return tNhan(duong, { a: doi(so[0] ?? ""), b: doi(so[1] ?? "") });
}
