import ExcelJS from "exceljs";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import { DANH_MUC_HOP_LE, type DanhMuc } from "@/lib/data/types";
import { NHAN_DANH_MUC, NHAN_LOAI_DA, NHAN_VAN_DE } from "@/lib/nhan";
import {
  NHAN_TRUONG_SAN_PHAM,
  type SanPhamKho,
  type ThayDoiSanPhamInput,
} from "./san-pham-kho";

export const GIOI_HAN_DONG_EXCEL = 2000;
export const GIOI_HAN_BYTE_EXCEL = 5 * 1024 * 1024; // 5 MB

export const COT_EXCEL_SAN_PHAM = [
  "id",
  "barcode",
  "thuong_hieu",
  "ten_goc",
  "ten_hien_thi",
  "ten_en",
  "quy_cach",
  "danh_muc",
  "gia_goc",
  "gia_ban",
  "mo_ta",
  "mo_ta_en",
  "van_de",
  "loai_da",
  "thanh_phan",
  "anh",
  "ghi_chu",
  "hien_thi",
] as const;

export type TenCotExcelSanPham = (typeof COT_EXCEL_SAN_PHAM)[number];

const BI_DANH_COT: Record<string, TenCotExcelSanPham> = {
  id: "id",
  ma_san_pham: "id",
  sku: "id",
  barcode: "barcode",
  ma_vach: "barcode",
  thuong_hieu: "thuong_hieu",
  brand: "thuong_hieu",
  ten_goc: "ten_goc",
  ten_hien_thi: "ten_hien_thi",
  ten: "ten_hien_thi",
  name: "ten_hien_thi",
  ten_en: "ten_en",
  quy_cach: "quy_cach",
  dung_tich: "quy_cach",
  danh_muc: "danh_muc",
  phan_loai: "danh_muc",
  gia_goc: "gia_goc",
  gia_ban: "gia_ban",
  mo_ta: "mo_ta",
  mo_ta_ngan: "mo_ta",
  mo_ta_en: "mo_ta_en",
  van_de: "van_de",
  loai_da: "loai_da",
  thanh_phan: "thanh_phan",
  thanh_phan_chinh: "thanh_phan",
  anh: "anh",
  hinh_anh: "anh",
  ghi_chu: "ghi_chu",
  hien_thi: "hien_thi",
};

const TRUONG_THONG_TIN_BAT_BUOC_SO_KHA: TenCotExcelSanPham[] = [
  "barcode",
  "thuong_hieu",
  "ten_goc",
  "ten_hien_thi",
  "ten_en",
  "quy_cach",
  "danh_muc",
  "gia_goc",
  "gia_ban",
  "mo_ta",
  "mo_ta_en",
  "van_de",
  "loai_da",
  "thanh_phan",
  "anh",
  "ghi_chu",
  "hien_thi",
];

const MA_DANH_MUC_SET = new Set<string>(DANH_MUC_HOP_LE);
const MA_VAN_DE_SET = new Set<string>(Object.keys(NHAN_VAN_DE));
const MA_LOAI_DA_SET = new Set<string>(Object.keys(NHAN_LOAI_DA));

export interface OSoSanhExcel {
  truong: string;
  nhanTruong: string;
  giaTriCu: string;
  giaTriMoi: string;
}

export interface DongHopLeExcel {
  soDong: number;
  id: string;
  tenHienThi: string;
  laMaMoi: boolean;
  thayDoi: ThayDoiSanPhamInput;
  soSanh: OSoSanhExcel[];
  canhBao?: string[];
}

export interface DongLoiExcel {
  soDong: number;
  id: string | null;
  lyDo: string;
}

export interface KetQuaXemTruocExcel {
  hopLe: boolean;
  loiChung: string | null;
  tenFile: string;
  tongSoDong: number;
  soMaMoi: number;
  soMaSua: number;
  soDongKhongDoi: number;
  soDongLoi: number;
  dongHopLe: DongHopLeExcel[];
  dongLoi: DongLoiExcel[];
}

function chuanHoaKhoaCot(raw: string): string {
  return chuanHoaTimKiem(raw)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function anhXaCotTieuDe(raw: string): TenCotExcelSanPham | null {
  const khoa = chuanHoaKhoaCot(raw);
  return BI_DANH_COT[khoa] ?? null;
}

function layChuoiOExcel(val: ExcelJS.CellValue): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return Number.isFinite(val) ? String(val) : "";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "object") {
    if ("richText" in val && Array.isArray(val.richText)) {
      return val.richText
        .map((part) => (typeof part?.text === "string" ? part.text : ""))
        .join("")
        .trim();
    }
    if ("result" in val) {
      return layChuoiOExcel(val.result as ExcelJS.CellValue);
    }
    if ("text" in val && typeof val.text === "string") {
      return val.text.trim();
    }
  }
  return String(val).trim();
}

function laLenhXoa(raw: string): boolean {
  return raw.trim().toLowerCase() === "[xoa]";
}

function tachDanhSachMang(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function phanTichSoNguyenDuong(
  raw: string,
): { ok: true; value: number } | { ok: false; lyDo: string } {
  const sach = raw.replace(/[\s.,_]/g, "");
  if (!/^\d+$/.test(sach)) {
    return { ok: false, lyDo: `Giá trị số không hợp lệ: "${raw}"` };
  }
  const so = Number(sach);
  if (!Number.isSafeInteger(so) || so <= 0) {
    return { ok: false, lyDo: `Giá phải là số nguyên dương: "${raw}"` };
  }
  return { ok: true, value: so };
}

function phanTichBooleanHienThi(
  raw: string,
): { ok: true; value: boolean } | { ok: false; lyDo: string } {
  const k = chuanHoaTimKiem(raw).trim();
  if (["true", "1", "co", "hien", "yes", "x"].includes(k)) {
    return { ok: true, value: true };
  }
  if (["false", "0", "khong", "an", "no"].includes(k)) {
    return { ok: true, value: false };
  }
  return {
    ok: false,
    lyDo: `Giá trị hien_thi không hợp lệ: "${raw}" (chỉ nhận true/false)`,
  };
}

function dinhDangGiaTriSoSanh(val: unknown): string {
  if (val === null || val === undefined || val === "") return "(trống)";
  if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "(trống)";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  return String(val);
}

function bangNhauMang(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, idx) => v === b[idx]);
}

function tachDongCsv(noiDung: string): string[][] {
  const sach = noiDung.replace(/^\uFEFF/, "");
  const dongDauEnd = sach.search(/\r?\n/);
  const dongDau = dongDauEnd >= 0 ? sach.slice(0, dongDauEnd) : sach;

  let phay = 0;
  let chamPhay = 0;
  let trongNgoac = false;
  for (const ch of dongDau) {
    if (ch === '"') trongNgoac = !trongNgoac;
    else if (!trongNgoac && ch === ",") phay += 1;
    else if (!trongNgoac && ch === ";") chamPhay += 1;
  }
  const sep = chamPhay > phay ? ";" : ",";

  const bang: string[][] = [];
  let dong: string[] = [];
  let o = "";
  let trongNgoacKep = false;

  for (let i = 0; i < sach.length; i += 1) {
    const kyTu = sach[i];
    if (trongNgoacKep) {
      if (kyTu === '"') {
        if (sach[i + 1] === '"') {
          o += '"';
          i += 1;
        } else {
          trongNgoacKep = false;
        }
      } else {
        o += kyTu;
      }
      continue;
    }

    if (kyTu === '"') {
      trongNgoacKep = true;
    } else if (kyTu === sep) {
      dong.push(o.trim());
      o = "";
    } else if (kyTu === "\r") {
      if (sach[i + 1] === "\n") i += 1;
      dong.push(o.trim());
      o = "";
      bang.push(dong);
      dong = [];
    } else if (kyTu === "\n") {
      dong.push(o.trim());
      o = "";
      bang.push(dong);
      dong = [];
    } else {
      o += kyTu;
    }
  }

  if (o.length > 0 || dong.length > 0) {
    dong.push(o.trim());
    bang.push(dong);
  }

  return bang.filter((r) => r.some((c) => c.trim().length > 0));
}

function themSheetHuongDan(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet("Hướng dẫn");
  ws.columns = [
    { header: "Mục / Nhóm", key: "nhom", width: 28 },
    { header: "Mã hợp lệ / Quy tắc", key: "ma", width: 32 },
    { header: "Giải thích / Nhãn tiếng Việt", key: "mota", width: 72 },
  ];
  ws.getRow(1).font = { bold: true };

  const quyTac: Array<[string, string, string]> = [
    [
      "Ô trống",
      "Giữ nguyên dữ liệu cũ",
      "Ô để trống KHÔNG xóa dữ liệu đang có trong kho / Supabase.",
    ],
    [
      "Lệnh xóa",
      "[xoa]",
      "Gõ [xoa] vào ô tùy chọn (ten_en, mo_ta, mo_ta_en, quy_cach, barcode, van_de, loai_da, thanh_phan, anh, ghi_chu) để xóa trắng trường đó.",
    ],
    [
      "Giới hạn tệp",
      "2.000 dòng / 5 MB",
      "Hỗ trợ định dạng .xlsx và .csv (UTF-8).",
    ],
    [
      "Phân quyền kho",
      "Khóa giá & hiển thị",
      "Vai trò kho không sửa được gia_goc, gia_ban, hien_thi. Mã mới do kho tạo mặc định hien_thi = FALSE.",
    ],
    [
      "Phân cách nhiều nhãn",
      "Dấu phẩy (,)",
      "Các cột van_de, loai_da, thanh_phan viết nhiều giá trị cách nhau bởi dấu phẩy.",
    ],
  ];
  for (const row of quyTac) {
    ws.addRow({ nhom: row[0], ma: row[1], mota: row[2] });
  }

  ws.addRow({ nhom: "", ma: "", mota: "" });
  for (const dm of DANH_MUC_HOP_LE) {
    ws.addRow({
      nhom: "danh_muc (chọn 1)",
      ma: dm,
      mota: NHAN_DANH_MUC[dm] || dm,
    });
  }

  ws.addRow({ nhom: "", ma: "", mota: "" });
  for (const [ma, nhan] of Object.entries(NHAN_VAN_DE)) {
    if (ma === "co-the") continue;
    ws.addRow({
      nhom: "van_de (nhiều mã)",
      ma,
      mota: nhan,
    });
  }

  ws.addRow({ nhom: "", ma: "", mota: "" });
  for (const [ma, nhan] of Object.entries(NHAN_LOAI_DA)) {
    ws.addRow({
      nhom: "loai_da (nhiều mã)",
      ma,
      mota: nhan,
    });
  }
}

function dinhDangHeaderSheetSanPham(ws: ExcelJS.Worksheet): void {
  ws.columns = COT_EXCEL_SAN_PHAM.map((col) => ({
    header: col,
    key: col,
    width:
      col === "mo_ta" || col === "mo_ta_en" || col === "thanh_phan"
        ? 36
        : col === "ten_goc" || col === "ten_hien_thi" || col === "ten_en"
          ? 30
          : 18,
  }));
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];
}

/**
 * Tạo file Excel mẫu `.xlsx` theo docs/07 §4.2 (sheet "Sản phẩm" + sheet "Hướng dẫn").
 */
export async function taoFileExcelMau(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VIVE Quẹt";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Sản phẩm");
  dinhDangHeaderSheetSanPham(ws);

  ws.addRow({
    id: "LOPOE-CF",
    barcode: "",
    thuong_hieu: "",
    ten_goc: "",
    ten_hien_thi: "",
    ten_en: "LOPOE Better Balance Cleansing Foam 160ml",
    quy_cach: "",
    danh_muc: "",
    gia_goc: "",
    gia_ban: "",
    mo_ta: "",
    mo_ta_en: "Gentle pH-balanced daily facial cleanser.",
    van_de: "",
    loai_da: "",
    thanh_phan: "",
    anh: "",
    ghi_chu: "",
    hien_thi: "",
  });

  ws.addRow({
    id: "LOPOE-MAU-MOI",
    barcode: "8809999888777",
    thuong_hieu: "LOPOE",
    ten_goc: "LOPOE Sample Balancing Essence",
    ten_hien_thi: "Tinh chất dưỡng ẩm mẫu LOPOE",
    ten_en: "LOPOE Sample Balancing Essence 50ml",
    quy_cach: "50ml",
    danh_muc: "tinh-chat",
    gia_goc: "",
    gia_ban: "",
    mo_ta: "Tinh chất cấp ẩm dịu nhẹ mẫu thử.",
    mo_ta_en: "Soothing hydrating essence sample.",
    van_de: "cap-am, lam-diu",
    loai_da: "da-nhay-cam, moi-loai-da",
    thanh_phan: "Panthenol, Madecassoside",
    anh: "",
    ghi_chu: "Mã mẫu chờ quản trị duyệt giá",
    hien_thi: "FALSE",
  });

  themSheetHuongDan(workbook);
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

/**
 * Xuất toàn bộ danh sách sản phẩm hiện tại ra `.xlsx` để kho sửa hàng loạt rồi tải lên lại.
 */
export async function xuatFileExcelSanPham(
  danhSach: SanPhamKho[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "VIVE Quẹt";
  workbook.created = new Date();

  const ws = workbook.addWorksheet("Sản phẩm");
  dinhDangHeaderSheetSanPham(ws);

  for (const sp of danhSach) {
    ws.addRow({
      id: sp.id,
      barcode: sp.barcode ?? "",
      thuong_hieu: sp.thuong_hieu,
      ten_goc: sp.ten_goc,
      ten_hien_thi: sp.ten_hien_thi,
      ten_en: sp.ten_en ?? "",
      quy_cach: sp.quy_cach ?? "",
      danh_muc: sp.danh_muc,
      gia_goc: sp.gia_goc ?? "",
      gia_ban: sp.gia_ban,
      mo_ta: sp.mo_ta ?? "",
      mo_ta_en: sp.mo_ta_en ?? "",
      van_de: sp.van_de.join(", "),
      loai_da: sp.loai_da.join(", "),
      thanh_phan: sp.thanh_phan.join(", "),
      anh: sp.anh ?? "",
      ghi_chu: sp.ghi_chu ?? "",
      hien_thi: sp.hien_thi ? "TRUE" : "FALSE",
    });
  }

  themSheetHuongDan(workbook);
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw);
}

async function docBangTuBuffer(
  buffer: Buffer,
  tenFile: string,
): Promise<Array<{ soDong: number; o: string[] }>> {
  const duoi = tenFile.trim().toLowerCase();
  if (duoi.endsWith(".csv")) {
    const text = buffer.toString("utf8");
    const rows = tachDongCsv(text);
    return rows.map((r, idx) => ({ soDong: idx + 1, o: r }));
  }

  if (!duoi.endsWith(".xlsx")) {
    throw new Error("Chỉ hỗ trợ file Excel (.xlsx) hoặc CSV (.csv).");
  }

  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);

  const ws =
    workbook.worksheets.find((sheet) => {
      const k = chuanHoaTimKiem(sheet.name);
      return k === "san pham" || k === "products" || k === "sheet1";
    }) ?? workbook.worksheets[0];

  if (!ws) {
    throw new Error("File Excel không có sheet dữ liệu nào.");
  }

  const ketQua: Array<{ soDong: number; o: string[] }> = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells: string[] = [];
    const maxCol = Math.max(row.cellCount, ws.columnCount || 0);
    for (let c = 1; c <= maxCol; c += 1) {
      cells.push(layChuoiOExcel(row.getCell(c).value));
    }
    if (cells.some((c) => c.length > 0)) {
      ketQua.push({ soDong: rowNumber, o: cells });
    }
  });
  return ketQua;
}

function ketQuaLoiChung(
  tenFile: string,
  loiChung: string,
  tongSoDong = 0,
): KetQuaXemTruocExcel {
  return {
    hopLe: false,
    loiChung,
    tenFile,
    tongSoDong,
    soMaMoi: 0,
    soMaSua: 0,
    soDongKhongDoi: 0,
    soDongLoi: 0,
    dongHopLe: [],
    dongLoi: [],
  };
}

/**
 * Đọc file `.xlsx` hoặc `.csv` ở server, kiểm tra quy tắc docs/07 §4.2 và trả về bản xem trước.
 */
export async function phanTichFileExcelSanPham(params: {
  buffer: Buffer;
  tenFile: string;
  danhSachHienTai: SanPhamKho[];
  vaiTro: "kho" | "quan_tri";
}): Promise<KetQuaXemTruocExcel> {
  const { buffer, tenFile, danhSachHienTai, vaiTro } = params;

  if (!buffer || buffer.byteLength === 0) {
    return ketQuaLoiChung(tenFile, "File tải lên bị rỗng.");
  }
  if (buffer.byteLength > GIOI_HAN_BYTE_EXCEL) {
    return ketQuaLoiChung(
      tenFile,
      `Dung lượng file vượt quá giới hạn 5 MB (${(
        buffer.byteLength /
        (1024 * 1024)
      ).toFixed(2)} MB).`,
    );
  }

  let bang: Array<{ soDong: number; o: string[] }>;
  try {
    bang = await docBangTuBuffer(buffer, tenFile);
  } catch (err) {
    return ketQuaLoiChung(
      tenFile,
      err instanceof Error ? err.message : "Không đọc được file Excel/CSV.",
    );
  }

  if (bang.length < 2) {
    return ketQuaLoiChung(
      tenFile,
      "File không có dữ liệu (cần ít nhất 1 dòng tiêu đề và 1 dòng sản phẩm).",
    );
  }

  const dongTieuDe = bang[0];
  const viTriCot = new Map<TenCotExcelSanPham, number>();
  for (let i = 0; i < dongTieuDe.o.length; i += 1) {
    const cot = anhXaCotTieuDe(dongTieuDe.o[i]);
    if (cot && !viTriCot.has(cot)) {
      viTriCot.set(cot, i);
    }
  }

  const coDinhDanh = viTriCot.has("id") || viTriCot.has("barcode");
  const coCotThongTin = TRUONG_THONG_TIN_BAT_BUOC_SO_KHA.some((c) =>
    viTriCot.has(c),
  );

  if (!coDinhDanh || !coCotThongTin) {
    const thieu: string[] = [];
    if (!coDinhDanh) thieu.push("id hoặc barcode");
    if (!coCotThongTin) thieu.push("cột dữ liệu sản phẩm (ten_hien_thi, ten_en, danh_muc...)");
    return ketQuaLoiChung(
      tenFile,
      `File thiếu cột bắt buộc: ${thieu.join("; ")}. Vui lòng tải file mẫu để đúng cấu trúc cột.`,
    );
  }

  const cacDongDuLieu = bang.slice(1);
  if (cacDongDuLieu.length > GIOI_HAN_DONG_EXCEL) {
    return ketQuaLoiChung(
      tenFile,
      `Số dòng vượt quá giới hạn ${GIOI_HAN_DONG_EXCEL.toLocaleString("vi-VN")} dòng (hiện có ${cacDongDuLieu.length} dòng).`,
      cacDongDuLieu.length,
    );
  }

  const theoId = new Map<string, SanPhamKho>();
  const theoBarcode = new Map<string, SanPhamKho>();
  for (const sp of danhSachHienTai) {
    theoId.set(sp.id, sp);
    if (sp.barcode?.trim()) {
      theoBarcode.set(sp.barcode.trim(), sp);
    }
  }

  const seenIds = new Set<string>();
  const seenBarcodes = new Map<string, { soDong: number; id: string }>();

  const dongHopLe: DongHopLeExcel[] = [];
  const dongLoi: DongLoiExcel[] = [];
  let soDongKhongDoi = 0;

  const docO = (row: string[], cot: TenCotExcelSanPham): string => {
    const idx = viTriCot.get(cot);
    return idx === undefined ? "" : (row[idx] ?? "").trim();
  };

  for (const dong of cacDongDuLieu) {
    const soDong = dong.soDong;
    const rawId = docO(dong.o, "id");
    const rawBarcode = docO(dong.o, "barcode");
    const barcodeKhacXoa =
      rawBarcode && !laLenhXoa(rawBarcode) ? rawBarcode : "";

    // Xác định sản phẩm hiện có
    let spCu: SanPhamKho | undefined;
    if (rawId) {
      spCu = theoId.get(rawId);
    } else if (barcodeKhacXoa) {
      spCu = theoBarcode.get(barcodeKhacXoa);
    }

    const maIdHienThi = rawId || spCu?.id || "";

    if (!rawId && !barcodeKhacXoa) {
      dongLoi.push({
        soDong,
        id: null,
        lyDo: "Thiếu cả mã sản phẩm (id) lẫn mã vạch (barcode).",
      });
      continue;
    }

    if (spCu && rawId && barcodeKhacXoa) {
      const spTrungBarcode = theoBarcode.get(barcodeKhacXoa);
      if (spTrungBarcode && spTrungBarcode.id !== spCu.id) {
        dongLoi.push({
          soDong,
          id: maIdHienThi,
          lyDo: `Trùng mã vạch "${barcodeKhacXoa}" với sản phẩm ${spTrungBarcode.id}.`,
        });
        continue;
      }
    } else if (!spCu && barcodeKhacXoa) {
      const spTrungBarcode = theoBarcode.get(barcodeKhacXoa);
      if (spTrungBarcode) {
        dongLoi.push({
          soDong,
          id: rawId || null,
          lyDo: `Mã vạch "${barcodeKhacXoa}" đã tồn tại ở sản phẩm ${spTrungBarcode.id}.`,
        });
        continue;
      }
    }

    if (maIdHienThi) {
      if (seenIds.has(maIdHienThi)) {
        dongLoi.push({
          soDong,
          id: maIdHienThi,
          lyDo: `Trùng mã sản phẩm (id) "${maIdHienThi}" ngay trong file.`,
        });
        continue;
      }
      seenIds.add(maIdHienThi);
    }

    if (barcodeKhacXoa) {
      const trungTrongFile = seenBarcodes.get(barcodeKhacXoa);
      if (trungTrongFile) {
        dongLoi.push({
          soDong,
          id: maIdHienThi || null,
          lyDo: `Trùng mã vạch "${barcodeKhacXoa}" với dòng ${trungTrongFile.soDong} (${trungTrongFile.id || "chưa rõ id"}) trong cùng file.`,
        });
        continue;
      }
      seenBarcodes.set(barcodeKhacXoa, { soDong, id: maIdHienThi });
    }

    const laMaMoi = !spCu;
    if (laMaMoi && !rawId) {
      dongLoi.push({
        soDong,
        id: null,
        lyDo: `Không tìm thấy sản phẩm có mã vạch "${barcodeKhacXoa}" và dòng chưa điền cột id để tạo mã mới.`,
      });
      continue;
    }

    const errorsDong: string[] = [];
    const canhBaoDong: string[] = [];
    const thayDoi: ThayDoiSanPhamInput = {};
    const soSanh: OSoSanhExcel[] = [];

    const ghiNhanThayDoiChuoi = (
      truong:
        | "barcode"
        | "thuong_hieu"
        | "ten_goc"
        | "ten_hien_thi"
        | "ten_en"
        | "quy_cach"
        | "mo_ta"
        | "mo_ta_en"
        | "anh"
        | "ghi_chu",
      batBuoc: boolean,
    ) => {
      const raw = docO(dong.o, truong);
      if (!raw) return; // Ô trống KHÔNG xóa dữ liệu cũ

      if (laLenhXoa(raw)) {
        if (batBuoc) {
          errorsDong.push(`Không thể dùng [xoa] ở trường bắt buộc "${truong}".`);
          return;
        }
        const giaTriCu = spCu ? ((spCu[truong] as string | null) ?? null) : null;
        if (spCu && giaTriCu !== null) {
          (thayDoi as Record<string, unknown>)[truong] = null;
          soSanh.push({
            truong,
            nhanTruong: NHAN_TRUONG_SAN_PHAM[truong] || truong,
            giaTriCu: dinhDangGiaTriSoSanh(giaTriCu),
            giaTriMoi: "(đã xóa)",
          });
        }
        return;
      }

      const giaTriCu = spCu ? ((spCu[truong] as string | null) ?? null) : null;
      if (!spCu || giaTriCu !== raw) {
        thayDoi[truong] = raw;
        soSanh.push({
          truong,
          nhanTruong: NHAN_TRUONG_SAN_PHAM[truong] || truong,
          giaTriCu: dinhDangGiaTriSoSanh(giaTriCu),
          giaTriMoi: raw,
        });
      }
    };

    ghiNhanThayDoiChuoi("barcode", false);
    ghiNhanThayDoiChuoi("thuong_hieu", true);
    ghiNhanThayDoiChuoi("ten_goc", true);
    ghiNhanThayDoiChuoi("ten_hien_thi", true);
    ghiNhanThayDoiChuoi("ten_en", false);
    ghiNhanThayDoiChuoi("quy_cach", false);
    ghiNhanThayDoiChuoi("mo_ta", false);
    ghiNhanThayDoiChuoi("mo_ta_en", false);
    ghiNhanThayDoiChuoi("anh", false);
    ghiNhanThayDoiChuoi("ghi_chu", false);

    // Nếu tạo mã mới dùng cột alias `ten` mà chưa điền `ten_goc`, dùng `ten_hien_thi` làm `ten_goc`
    if (laMaMoi && !thayDoi.ten_goc && thayDoi.ten_hien_thi) {
      thayDoi.ten_goc = thayDoi.ten_hien_thi;
    } else if (laMaMoi && !thayDoi.ten_hien_thi && thayDoi.ten_goc) {
      thayDoi.ten_hien_thi = thayDoi.ten_goc;
    }

    // Kiểm tra danh_muc
    const rawDanhMuc = docO(dong.o, "danh_muc");
    if (rawDanhMuc) {
      if (laLenhXoa(rawDanhMuc)) {
        errorsDong.push('Không thể dùng [xoa] ở trường bắt buộc "danh_muc".');
      } else {
        const dm = chuanHoaTimKiem(rawDanhMuc)
          .replace(/\s+/g, "-")
          .toLowerCase();
        if (!MA_DANH_MUC_SET.has(dm)) {
          errorsDong.push(`Mã phân loại (danh_muc) không hợp lệ: "${rawDanhMuc}".`);
        } else if (!spCu || spCu.danh_muc !== dm) {
          thayDoi.danh_muc = dm as DanhMuc;
          soSanh.push({
            truong: "danh_muc",
            nhanTruong: NHAN_TRUONG_SAN_PHAM.danh_muc,
            giaTriCu: spCu ? spCu.danh_muc : "(trống)",
            giaTriMoi: dm,
          });
        }
      }
    }

    // Kiểm tra van_de, loai_da, thanh_phan
    const xuLyTruongMang = (
      truong: "van_de" | "loai_da" | "thanh_phan",
      tapHopLe: Set<string> | null,
      nhanLoi: string,
    ) => {
      const raw = docO(dong.o, truong);
      if (!raw) return;

      if (laLenhXoa(raw)) {
        const giaTriCu = spCu ? spCu[truong] : [];
        if (spCu && giaTriCu.length > 0) {
          thayDoi[truong] = [];
          soSanh.push({
            truong,
            nhanTruong: NHAN_TRUONG_SAN_PHAM[truong] || truong,
            giaTriCu: dinhDangGiaTriSoSanh(giaTriCu),
            giaTriMoi: "(đã xóa)",
          });
        }
        return;
      }

      const items = tachDanhSachMang(raw).map((v) =>
        tapHopLe ? v.toLowerCase() : v,
      );
      if (tapHopLe) {
        const sai = items.filter((v) => !tapHopLe.has(v));
        if (sai.length > 0) {
          errorsDong.push(`${nhanLoi} không hợp lệ: ${sai.join(", ")}.`);
          return;
        }
      }

      const giaTriCu = spCu ? spCu[truong] : [];
      if (!spCu || !bangNhauMang(giaTriCu, items)) {
        thayDoi[truong] = items;
        soSanh.push({
          truong,
          nhanTruong: NHAN_TRUONG_SAN_PHAM[truong] || truong,
          giaTriCu: dinhDangGiaTriSoSanh(giaTriCu),
          giaTriMoi: items.join(", "),
        });
      }
    };

    xuLyTruongMang("van_de", MA_VAN_DE_SET, "Mã vấn đề da (van_de)");
    xuLyTruongMang("loai_da", MA_LOAI_DA_SET, "Mã loại da (loai_da)");
    xuLyTruongMang("thanh_phan", null, "Thành phần");

    // Giá và hiển thị (chỉ quan_tri được phép sửa)
    const rawGiaGoc = docO(dong.o, "gia_goc");
    const rawGiaBan = docO(dong.o, "gia_ban");
    const rawHienThi = docO(dong.o, "hien_thi");

    if (vaiTro === "quan_tri") {
      if (rawGiaGoc) {
        if (laLenhXoa(rawGiaGoc)) {
          if (spCu && spCu.gia_goc !== null) {
            thayDoi.gia_goc = null;
            soSanh.push({
              truong: "gia_goc",
              nhanTruong: NHAN_TRUONG_SAN_PHAM.gia_goc,
              giaTriCu: dinhDangGiaTriSoSanh(spCu.gia_goc),
              giaTriMoi: "(đã xóa)",
            });
          }
        } else {
          const parsed = phanTichSoNguyenDuong(rawGiaGoc);
          if (!parsed.ok) {
            errorsDong.push(parsed.lyDo);
          } else if (!spCu || spCu.gia_goc !== parsed.value) {
            thayDoi.gia_goc = parsed.value;
            soSanh.push({
              truong: "gia_goc",
              nhanTruong: NHAN_TRUONG_SAN_PHAM.gia_goc,
              giaTriCu: spCu ? dinhDangGiaTriSoSanh(spCu.gia_goc) : "(trống)",
              giaTriMoi: String(parsed.value),
            });
          }
        }
      }

      if (rawGiaBan) {
        if (laLenhXoa(rawGiaBan)) {
          errorsDong.push('Không thể dùng [xoa] ở trường "gia_ban".');
        } else {
          const parsed = phanTichSoNguyenDuong(rawGiaBan);
          if (!parsed.ok) {
            errorsDong.push(parsed.lyDo);
          } else if (!spCu || spCu.gia_ban !== parsed.value) {
            thayDoi.gia_ban = parsed.value;
            soSanh.push({
              truong: "gia_ban",
              nhanTruong: NHAN_TRUONG_SAN_PHAM.gia_ban,
              giaTriCu: spCu ? dinhDangGiaTriSoSanh(spCu.gia_ban) : "(trống)",
              giaTriMoi: String(parsed.value),
            });
          }
        }
      }

      if (rawHienThi) {
        const parsed = phanTichBooleanHienThi(rawHienThi);
        if (!parsed.ok) {
          errorsDong.push(parsed.lyDo);
        } else if (!spCu || spCu.hien_thi !== parsed.value) {
          thayDoi.hien_thi = parsed.value;
          soSanh.push({
            truong: "hien_thi",
            nhanTruong: NHAN_TRUONG_SAN_PHAM.hien_thi,
            giaTriCu: spCu ? dinhDangGiaTriSoSanh(spCu.hien_thi) : "(trống)",
            giaTriMoi: parsed.value ? "TRUE" : "FALSE",
          });
        }
      }
    } else {
      // Tài khoản kho: bỏ qua nếu có giá trị khác với hiện tại trên giá hoặc hiển thị
      let daBoQuaQuyen = false;
      if (rawGiaGoc) {
        if (spCu) {
          const cuStr = spCu.gia_goc === null ? "" : String(spCu.gia_goc);
          if (rawGiaGoc !== cuStr) daBoQuaQuyen = true;
        } else {
          daBoQuaQuyen = true;
        }
      }
      if (rawGiaBan) {
        if (spCu) {
          if (rawGiaBan !== String(spCu.gia_ban)) daBoQuaQuyen = true;
        } else {
          daBoQuaQuyen = true;
        }
      }
      if (rawHienThi) {
        const parsedHt = phanTichBooleanHienThi(rawHienThi);
        if (!parsedHt.ok) {
          daBoQuaQuyen = true;
        } else if (spCu && spCu.hien_thi !== parsedHt.value) {
          daBoQuaQuyen = true;
        } else if (!spCu && parsedHt.value === true) {
          daBoQuaQuyen = true;
        }
      }
      if (daBoQuaQuyen) {
        canhBaoDong.push(
          "Đã bỏ qua cột gia_goc / gia_ban / hien_thi (vai trò kho không sửa được giá & hiển thị).",
        );
      }
    }

    // Yêu cầu tối thiểu cho mã mới
    if (laMaMoi) {
      const thieuMoi: string[] = [];
      if (!thayDoi.thuong_hieu) thieuMoi.push("thuong_hieu");
      if (!thayDoi.ten_hien_thi && !thayDoi.ten_goc) thieuMoi.push("ten_hien_thi");
      if (!thayDoi.danh_muc) thieuMoi.push("danh_muc");
      if (thieuMoi.length > 0) {
        errorsDong.push(`Mã mới thiếu trường bắt buộc: ${thieuMoi.join(", ")}.`);
      }
    }

    if (errorsDong.length > 0) {
      dongLoi.push({
        soDong,
        id: maIdHienThi || null,
        lyDo: errorsDong.join(" "),
      });
      continue;
    }

    if (soSanh.length === 0) {
      soDongKhongDoi += 1;
      continue;
    }

    dongHopLe.push({
      soDong,
      id: spCu ? spCu.id : rawId,
      tenHienThi: thayDoi.ten_hien_thi || spCu?.ten_hien_thi || rawId,
      laMaMoi,
      thayDoi,
      soSanh,
      ...(canhBaoDong.length > 0 ? { canhBao: canhBaoDong } : {}),
    });
  }

  const soMaMoi = dongHopLe.filter((d) => d.laMaMoi).length;
  const soMaSua = dongHopLe.filter((d) => !d.laMaMoi).length;

  return {
    hopLe: dongLoi.length === 0,
    loiChung: null,
    tenFile,
    tongSoDong: cacDongDuLieu.length,
    soMaMoi,
    soMaSua,
    soDongKhongDoi,
    soDongLoi: dongLoi.length,
    dongHopLe,
    dongLoi,
  };
}
