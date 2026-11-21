import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import {
  SanPhamSchema,
  type ConHang,
  type DanhMuc,
  type SanPham,
} from "@/lib/data/types";

export type NguonTruongLoai = "nguoi" | "excel" | "ai" | "dong_bo";

export interface ChiTietNguonTruong {
  nguon: NguonTruongLoai;
  boi?: string;
  luc?: string;
  url?: string;
}

export type NguonTruongMap = Partial<Record<string, ChiTietNguonTruong>>;

export interface SanPhamKho extends SanPham {
  ten_en: string | null;
  mo_ta_en: string | null;
  nguon_truong: NguonTruongMap;
  cap_nhat?: string;
}

export interface LichSuSanPhamItem {
  id: number;
  san_pham_id: string;
  truong: string;
  gia_tri_cu: unknown;
  gia_tri_moi: unknown;
  nguon: NguonTruongLoai;
  boi: string | null;
  luc: string;
}

export interface ThayDoiSanPhamInput {
  barcode?: string | null;
  thuong_hieu?: string;
  ten_goc?: string;
  ten_hien_thi?: string;
  ten_en?: string | null;
  quy_cach?: string | null;
  danh_muc?: DanhMuc;
  van_de?: string[];
  thanh_phan?: string[];
  loai_da?: string[];
  mo_ta?: string | null;
  mo_ta_en?: string | null;
  anh?: string | null;
  ghi_chu?: string | null;
  gia_goc?: number | null;
  gia_ban?: number;
  hien_thi?: boolean;
  ton?: number | null;
  con_hang?: ConHang;
  da_xem?: string[];
  _vai_tro?: "kho" | "quan_tri";
  _url_truong?: Record<string, string>;
}

export interface BoLocSanPhamKho {
  tuKhoa?: string;
  thuongHieu?: string;
  thieuEn?: boolean;
  aiCanXem?: boolean;
  thieuAnh?: boolean;
}

export const CAC_TRUONG_DUOC_SUA = [
  "thuong_hieu",
  "ten_goc",
  "ten_hien_thi",
  "ten_en",
  "quy_cach",
  "danh_muc",
  "van_de",
  "thanh_phan",
  "loai_da",
  "mo_ta",
  "mo_ta_en",
  "barcode",
  "anh",
  "ghi_chu",
] as const;

export const CAC_TRUONG_LICH_SU = [
  "thuong_hieu",
  "ten_goc",
  "ten_hien_thi",
  "ten_en",
  "quy_cach",
  "danh_muc",
  "van_de",
  "thanh_phan",
  "loai_da",
  "mo_ta",
  "mo_ta_en",
  "gia_goc",
  "gia_ban",
  "hien_thi",
  "barcode",
] as const;

export const NHAN_TRUONG_SAN_PHAM: Record<string, string> = {
  thuong_hieu: "Thương hiệu",
  ten_goc: "Tên gốc",
  ten_hien_thi: "Tên hiển thị (VI)",
  ten_en: "Tên tiếng Anh (EN)",
  quy_cach: "Quy cách",
  danh_muc: "Phân loại",
  van_de: "Vấn đề da",
  thanh_phan: "Thành phần",
  loai_da: "Loại da",
  mo_ta: "Mô tả (VI)",
  mo_ta_en: "Mô tả tiếng Anh (EN)",
  gia_goc: "Giá gốc",
  gia_ban: "Giá bán",
  hien_thi: "Hiển thị",
  barcode: "Mã vạch",
  anh: "Ảnh sản phẩm",
  ghi_chu: "Ghi chú",
};

function laChuoiHoacMangCoDuLieu(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

function bangNhauGiaTri(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

export function chuanHoaNguonTruong(raw: unknown): NguonTruongMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const kq: NguonTruongMap = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!val || typeof val !== "object" || Array.isArray(val)) continue;
    const rec = val as Record<string, unknown>;
    const nguonRaw = rec.nguon;
    if (
      nguonRaw === "nguoi" ||
      nguonRaw === "excel" ||
      nguonRaw === "ai" ||
      nguonRaw === "dong_bo"
    ) {
      kq[key] = {
        nguon: nguonRaw,
        boi: typeof rec.boi === "string" ? rec.boi : undefined,
        luc: typeof rec.luc === "string" ? rec.luc : undefined,
        url: typeof rec.url === "string" ? rec.url : undefined,
      };
    }
  }
  return kq;
}

export function chuanHoaSanPhamKho(
  row: Record<string, unknown>,
): SanPhamKho | null {
  const parsed = SanPhamSchema.safeParse(row);
  if (!parsed.success) return null;
  const tenEnRaw = typeof row.ten_en === "string" ? row.ten_en.trim() : "";
  const moTaEnRaw = typeof row.mo_ta_en === "string" ? row.mo_ta_en.trim() : "";
  return {
    ...parsed.data,
    ten_en: tenEnRaw || null,
    mo_ta_en: moTaEnRaw || null,
    nguon_truong: chuanHoaNguonTruong(row.nguon_truong),
    cap_nhat: typeof row.cap_nhat === "string" ? row.cap_nhat : undefined,
  };
}

export function laTruongDoAiDien(sp: SanPhamKho, truong: string): boolean {
  return sp.nguon_truong?.[truong]?.nguon === "ai";
}

export function coTruongAiCanXem(sp: SanPhamKho): boolean {
  return Object.values(sp.nguon_truong || {}).some((ct) => ct?.nguon === "ai");
}

export function locDanhSachSanPhamKho(
  danhSach: SanPhamKho[],
  boLoc: BoLocSanPhamKho,
): SanPhamKho[] {
  const q = chuanHoaTimKiem((boLoc.tuKhoa || "").trim());
  const thuongHieu = (boLoc.thuongHieu || "").trim();

  return danhSach.filter((sp) => {
    if (thuongHieu && thuongHieu !== "tat_ca" && sp.thuong_hieu !== thuongHieu) {
      return false;
    }
    if (boLoc.thieuEn && sp.ten_en?.trim() && sp.mo_ta_en?.trim()) {
      return false;
    }
    if (boLoc.aiCanXem && !coTruongAiCanXem(sp)) {
      return false;
    }
    if (boLoc.thieuAnh && sp.anh && sp.anh.trim().length > 0) {
      return false;
    }
    if (!q) return true;

    return (
      chuanHoaTimKiem(sp.ten_hien_thi).includes(q) ||
      chuanHoaTimKiem(sp.ten_en || "").includes(q) ||
      chuanHoaTimKiem(sp.ten_goc).includes(q) ||
      chuanHoaTimKiem(sp.id).includes(q) ||
      chuanHoaTimKiem(sp.barcode || "").includes(q) ||
      chuanHoaTimKiem(sp.thuong_hieu).includes(q)
    );
  });
}

function chuanHoaChuoiTuyChon(val: string | null | undefined): string | null {
  if (val === null || val === undefined) return null;
  const sach = val.trim();
  return sach.length > 0 ? sach : null;
}

/**
 * Thực thi logic tương đương RPC `private.sua_san_pham(p_id, p_thay_doi, p_nguon, p_boi)` trong một bước:
 * 1) Chặn `kho` / `ai` sửa giá hoặc hiển thị; mã mới do `kho` tạo luôn `hien_thi = false`.
 * 2) Áp luật ghi đè docs/07 §3: `ai` không bao giờ ghi đè trường có nguồn `nguoi` hoặc `excel`.
 * 3) Cập nhật `nguon_truong` và sinh 1 dòng trong `lich_su_san_pham` cho mỗi trường thay đổi.
 */
export function thucThiSuaSanPhamRpc(
  danhSachHienTai: SanPhamKho[],
  lichSuHienTai: LichSuSanPhamItem[],
  params: {
    id: string;
    thayDoi: ThayDoiSanPhamInput;
    nguon: NguonTruongLoai;
    boi: string;
    vaiTro?: "kho" | "quan_tri";
    now?: string;
  },
): {
  sanPham: SanPhamKho;
  danhSachMoi: SanPhamKho[];
  lichSuMoi: LichSuSanPhamItem[];
  cacTruongBoQua: string[];
} {
  const id = params.id.trim();
  if (!id) {
    throw new Error("Thiếu mã sản phẩm (id)");
  }

  const vaiTro = params.vaiTro ?? params.thayDoi._vai_tro ?? "quan_tri";
  const nguon = params.nguon;
  const boi = params.boi;
  const now = params.now ?? new Date().toISOString();
  const thayDoi = params.thayDoi;

  if (
    (nguon === "ai" || vaiTro === "kho") &&
    (thayDoi.gia_goc !== undefined ||
      thayDoi.gia_ban !== undefined ||
      thayDoi.hien_thi !== undefined)
  ) {
    throw new Error(
      "Vai trò kho hoặc AI không có quyền sửa giá và trạng thái hiển thị",
    );
  }

  const nextHistoryIdStart =
    lichSuHienTai.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  let seq = nextHistoryIdStart;
  const dongLichSuMoi: LichSuSanPhamItem[] = [];
  const cacTruongBoQua: string[] = [];

  const idx = danhSachHienTai.findIndex((sp) => sp.id === id);

  if (idx < 0) {
    // Tạo mới sản phẩm
    const hienThiMoi =
      vaiTro === "quan_tri" && nguon !== "ai"
        ? Boolean(thayDoi.hien_thi ?? false)
        : false;

    const tenHienThi =
      chuanHoaChuoiTuyChon(thayDoi.ten_hien_thi) ??
      chuanHoaChuoiTuyChon(thayDoi.ten_goc) ??
      id;
    const tenGoc = chuanHoaChuoiTuyChon(thayDoi.ten_goc) ?? tenHienThi;
    const giaBan = thayDoi.gia_ban ?? 1000;
    const giaGoc = thayDoi.gia_goc ?? null;

    const spMoiTho: Record<string, unknown> = {
      id,
      barcode: chuanHoaChuoiTuyChon(thayDoi.barcode),
      thuong_hieu: chuanHoaChuoiTuyChon(thayDoi.thuong_hieu) ?? "LOPOE",
      ten_goc: tenGoc,
      ten_hien_thi: tenHienThi,
      ten_en: chuanHoaChuoiTuyChon(thayDoi.ten_en),
      quy_cach: chuanHoaChuoiTuyChon(thayDoi.quy_cach),
      gia_goc: giaGoc,
      gia_ban: giaBan,
      giam_tren_tag: null,
      danh_muc: thayDoi.danh_muc ?? "tinh-chat",
      van_de: Array.isArray(thayDoi.van_de) ? [...thayDoi.van_de] : [],
      thanh_phan: Array.isArray(thayDoi.thanh_phan)
        ? [...thayDoi.thanh_phan]
        : [],
      loai_da: Array.isArray(thayDoi.loai_da) ? [...thayDoi.loai_da] : [],
      mo_ta: chuanHoaChuoiTuyChon(thayDoi.mo_ta),
      mo_ta_en: chuanHoaChuoiTuyChon(thayDoi.mo_ta_en),
      con_hang: thayDoi.con_hang ?? "true",
      ton: thayDoi.ton ?? 0,
      hien_thi: hienThiMoi,
      anh: chuanHoaChuoiTuyChon(thayDoi.anh),
      pho_bien: 0.5,
      ghi_chu: chuanHoaChuoiTuyChon(thayDoi.ghi_chu),
    };

    const validated = SanPhamSchema.parse(spMoiTho);
    const nguonTruongMoi: NguonTruongMap = {};
    for (const truong of CAC_TRUONG_DUOC_SUA) {
      if ((thayDoi as Record<string, unknown>)[truong] !== undefined) {
        const val = (spMoiTho as Record<string, unknown>)[truong];
        if (val !== null && val !== undefined) {
          const url = thayDoi._url_truong?.[truong];
          nguonTruongMoi[truong] = {
            nguon,
            boi,
            luc: now,
            ...(url ? { url } : {}),
          };
        }
      }
    }

    const spKhoMoi: SanPhamKho = {
      ...validated,
      ten_en: (spMoiTho.ten_en as string | null) ?? null,
      mo_ta_en: (spMoiTho.mo_ta_en as string | null) ?? null,
      nguon_truong: nguonTruongMoi,
      cap_nhat: now,
    };

    for (const truong of CAC_TRUONG_LICH_SU) {
      if ((thayDoi as Record<string, unknown>)[truong] !== undefined) {
        const giaTriMoi = (spKhoMoi as unknown as Record<string, unknown>)[
          truong
        ];
        if (giaTriMoi !== null && giaTriMoi !== undefined) {
          dongLichSuMoi.push({
            id: seq++,
            san_pham_id: id,
            truong,
            gia_tri_cu: null,
            gia_tri_moi: giaTriMoi,
            nguon,
            boi,
            luc: now,
          });
        }
      }
    }

    return {
      sanPham: spKhoMoi,
      danhSachMoi: [spKhoMoi, ...danhSachHienTai],
      lichSuMoi: [...dongLichSuMoi, ...lichSuHienTai],
      cacTruongBoQua,
    };
  }

  const spCu = danhSachHienTai[idx];
  const spCuRecord = spCu as unknown as Record<string, unknown>;
  const banCapNhat: Record<string, unknown> = { ...spCu };
  const nguonTruongMoi: NguonTruongMap = { ...(spCu.nguon_truong || {}) };

  for (const truong of CAC_TRUONG_DUOC_SUA) {
    const rawVal = (thayDoi as Record<string, unknown>)[truong];
    if (rawVal === undefined) continue;

    const nguonCu = nguonTruongMoi[truong]?.nguon ?? "dong_bo";
    const coDuLieuCu = laChuoiHoacMangCoDuLieu(spCuRecord[truong]);

    if (
      nguon === "ai" &&
      (nguonCu === "nguoi" || nguonCu === "excel") &&
      coDuLieuCu
    ) {
      cacTruongBoQua.push(truong);
      continue;
    }

    let giaTriChuan: unknown = rawVal;
    if (
      truong === "ten_en" ||
      truong === "mo_ta_en" ||
      truong === "mo_ta" ||
      truong === "quy_cach" ||
      truong === "barcode" ||
      truong === "anh" ||
      truong === "ghi_chu"
    ) {
      giaTriChuan = chuanHoaChuoiTuyChon(rawVal as string | null | undefined);
    } else if (
      truong === "thuong_hieu" ||
      truong === "ten_goc" ||
      truong === "ten_hien_thi"
    ) {
      const s = chuanHoaChuoiTuyChon(rawVal as string | null | undefined);
      giaTriChuan = s ?? spCuRecord[truong];
    } else if (
      truong === "van_de" ||
      truong === "thanh_phan" ||
      truong === "loai_da"
    ) {
      giaTriChuan = Array.isArray(rawVal)
        ? rawVal.map((x) => String(x).trim()).filter(Boolean)
        : [];
    }

    banCapNhat[truong] = giaTriChuan;
    const url = thayDoi._url_truong?.[truong] ?? nguonTruongMoi[truong]?.url;
    nguonTruongMoi[truong] = {
      nguon,
      boi,
      luc: now,
      ...(url ? { url } : {}),
    };
  }

  // Trường giá/tồn/hiển thị (chỉ quản trị được phép qua gate ở trên)
  if (thayDoi.gia_goc !== undefined) banCapNhat.gia_goc = thayDoi.gia_goc;
  if (thayDoi.gia_ban !== undefined) banCapNhat.gia_ban = thayDoi.gia_ban;
  if (thayDoi.hien_thi !== undefined) banCapNhat.hien_thi = thayDoi.hien_thi;
  if (thayDoi.ton !== undefined) banCapNhat.ton = thayDoi.ton;
  if (thayDoi.con_hang !== undefined) banCapNhat.con_hang = thayDoi.con_hang;

  // Đánh dấu "Đã xem" cho trường AI -> chuyển nguồn thành "nguoi"
  if (Array.isArray(thayDoi.da_xem)) {
    for (const truong of thayDoi.da_xem) {
      if (
        (CAC_TRUONG_DUOC_SUA as readonly string[]).includes(truong)
      ) {
        const urlCu = nguonTruongMoi[truong]?.url;
        nguonTruongMoi[truong] = {
          nguon: "nguoi",
          boi,
          luc: now,
          ...(urlCu ? { url: urlCu } : {}),
        };
      }
    }
  }

  const parsed = SanPhamSchema.parse(banCapNhat);
  const spMoi: SanPhamKho = {
    ...parsed,
    ten_en: (banCapNhat.ten_en as string | null) ?? null,
    mo_ta_en: (banCapNhat.mo_ta_en as string | null) ?? null,
    nguon_truong: nguonTruongMoi,
    cap_nhat: now,
  };

  const spMoiRecord = spMoi as unknown as Record<string, unknown>;
  for (const truong of CAC_TRUONG_LICH_SU) {
    if (!bangNhauGiaTri(spCuRecord[truong], spMoiRecord[truong])) {
      dongLichSuMoi.push({
        id: seq++,
        san_pham_id: id,
        truong,
        gia_tri_cu: spCuRecord[truong] ?? null,
        gia_tri_moi: spMoiRecord[truong] ?? null,
        nguon,
        boi,
        luc: now,
      });
    }
  }

  const danhSachMoi = [...danhSachHienTai];
  danhSachMoi[idx] = spMoi;

  return {
    sanPham: spMoi,
    danhSachMoi,
    lichSuMoi: [...dongLichSuMoi, ...lichSuHienTai],
    cacTruongBoQua,
  };
}
