import yaml from "js-yaml";
import { z } from "zod";
import {
  DealSchema,
  DoanhNghiepSchema,
  SanPhamSchema,
  type Deal,
  type DoanhNghiep,
  type SanPham,
} from "./types";

const COT_SAN_PHAM_BAT_BUOC = [
  "id",
  "barcode",
  "thuong_hieu",
  "ten_goc",
  "ten_hien_thi",
  "quy_cach",
  "gia_goc",
  "gia_ban",
  "giam_tren_tag",
  "danh_muc",
  "van_de",
  "thanh_phan",
  "loai_da",
  "con_hang",
  "ton",
  "hien_thi",
  "anh",
  "ghi_chu",
] as const;

function tachDongCsv(noiDung: string): string[][] {
  const bang: string[][] = [];
  let dong: string[] = [];
  let o = "";
  let trongNgoacKep = false;
  const sach = noiDung.replace(/^\uFEFF/, "");

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
    } else if (kyTu === ",") {
      dong.push(o);
      o = "";
    } else if (kyTu === "\r") {
      if (sach[i + 1] === "\n") i += 1;
      dong.push(o);
      o = "";
      if (dong.some((gt) => gt.length > 0)) {
        bang.push(dong);
      }
      dong = [];
    } else if (kyTu === "\n") {
      dong.push(o);
      o = "";
      if (dong.some((gt) => gt.length > 0)) {
        bang.push(dong);
      }
      dong = [];
    } else {
      o += kyTu;
    }
  }

  if (trongNgoacKep) {
    throw new Error("CSV sai định dạng: thiếu dấu ngoặc kép đóng");
  }

  if (o.length > 0 || dong.length > 0) {
    dong.push(o);
    if (dong.some((gt) => gt.length > 0)) {
      bang.push(dong);
    }
  }

  return bang;
}

function docSoNguyen(giaTri: string, tenCot: string, soDong: number): number | null {
  const sach = giaTri.trim();
  if (!sach) return null;
  if (!/^-?\d+$/.test(sach)) {
    throw new Error(
      `CSV dòng ${soDong}: cột "${tenCot}" phải là số nguyên, nhận "${giaTri}"`
    );
  }
  return Number(sach);
}

function docBooleanChuoi(giaTri: string, tenCot: string, soDong: number): boolean {
  const sach = giaTri.trim();
  if (sach === "true") return true;
  if (sach === "false") return false;
  throw new Error(
    `CSV dòng ${soDong}: cột "${tenCot}" chỉ nhận "true" hoặc "false", nhận "${giaTri}"`
  );
}

function docMangPhanTach(giaTri: string): string[] {
  return giaTri
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);
}

function dinhDangLoiZod(loi: z.ZodError): string {
  return loi.issues
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("; ");
}

/**
 * Đọc và kiểm tra định dạng CSV sản phẩm theo schema Zod.
 */
export function parseProductsCsv(csvText: string): SanPham[] {
  const bang = tachDongCsv(csvText);
  if (bang.length < 2) {
    throw new Error("CSV sản phẩm rỗng hoặc thiếu dòng dữ liệu");
  }

  const tieuDe = bang[0].map((c) => c.trim());
  for (const cot of COT_SAN_PHAM_BAT_BUOC) {
    if (!tieuDe.includes(cot)) {
      throw new Error(`CSV sản phẩm thiếu cột bắt buộc "${cot}"`);
    }
  }

  const chiSo = new Map<string, number>();
  tieuDe.forEach((ten, idx) => chiSo.set(ten, idx));

  const layCot = (dong: string[], ten: string): string => {
    const idx = chiSo.get(ten);
    return idx === undefined ? "" : (dong[idx] ?? "").trim();
  };

  const danhSach: SanPham[] = [];
  const daThayId = new Set<string>();

  for (let i = 1; i < bang.length; i += 1) {
    const soDong = i + 1;
    const dong = bang[i];
    if (dong.length !== tieuDe.length) {
      throw new Error(
        `CSV dòng ${soDong}: số cột không khớp (${dong.length}/${tieuDe.length})`
      );
    }

    const id = layCot(dong, "id");
    if (daThayId.has(id)) {
      throw new Error(`CSV dòng ${soDong}: trùng id "${id}"`);
    }
    daThayId.add(id);

    const giaBan = docSoNguyen(layCot(dong, "gia_ban"), "gia_ban", soDong);
    if (giaBan === null) {
      throw new Error(`CSV dòng ${soDong} (${id}): thiếu giá bán gia_ban`);
    }

    const anhRaw = layCot(dong, "anh");
    const anh = anhRaw
      ? anhRaw.startsWith("/")
        ? anhRaw
        : `/products/${anhRaw}`
      : null;

    const moTaIdx = chiSo.get("mo_ta");
    const moTaRaw = moTaIdx !== undefined ? (dong[moTaIdx] ?? "").trim() : "";

    const rawObj = {
      id,
      barcode: layCot(dong, "barcode") || null,
      thuong_hieu: layCot(dong, "thuong_hieu"),
      ten_goc: layCot(dong, "ten_goc"),
      ten_hien_thi: layCot(dong, "ten_hien_thi"),
      quy_cach: layCot(dong, "quy_cach") || null,
      gia_goc: docSoNguyen(layCot(dong, "gia_goc"), "gia_goc", soDong),
      gia_ban: giaBan,
      giam_tren_tag: layCot(dong, "giam_tren_tag") || null,
      danh_muc: layCot(dong, "danh_muc"),
      van_de: docMangPhanTach(layCot(dong, "van_de")),
      thanh_phan: docMangPhanTach(layCot(dong, "thanh_phan")),
      loai_da: docMangPhanTach(layCot(dong, "loai_da")),
      mo_ta: moTaRaw || null,
      con_hang: layCot(dong, "con_hang"),
      ton: docSoNguyen(layCot(dong, "ton"), "ton", soDong),
      hien_thi: docBooleanChuoi(layCot(dong, "hien_thi"), "hien_thi", soDong),
      anh,
      pho_bien: 0.5,
      ghi_chu: layCot(dong, "ghi_chu") || null,
    };

    const ketQua = SanPhamSchema.safeParse(rawObj);
    if (!ketQua.success) {
      throw new Error(
        `CSV dòng ${soDong} (${id || "chưa rõ id"}): ${dinhDangLoiZod(ketQua.error)}`
      );
    }
    danhSach.push(ketQua.data);
  }

  return danhSach;
}

function traiPhangMergeKey(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Mỗi phần tử trong deals phải là object");
  }
  const obj = { ...(raw as Record<string, unknown>) };
  const mergeValue = obj["<<"];
  if (mergeValue !== undefined) {
    delete obj["<<"];
    if (
      typeof mergeValue === "object" &&
      mergeValue !== null &&
      !Array.isArray(mergeValue)
    ) {
      return { ...(mergeValue as Record<string, unknown>), ...obj };
    }
    throw new Error("Merge key '<<' trong deals.yaml không hợp lệ");
  }
  return obj;
}

/**
 * Đọc và kiểm tra định dạng YAML deals theo schema Zod.
 */
export function parseDealsYaml(yamlText: string): Deal[] {
  let taiLieu: unknown;
  try {
    taiLieu = yaml.load(yamlText, { schema: yaml.JSON_SCHEMA });
  } catch (err) {
    const chiTiet = err instanceof Error ? err.message : String(err);
    throw new Error(`YAML deal sai cú pháp: ${chiTiet}`);
  }

  if (
    typeof taiLieu !== "object" ||
    taiLieu === null ||
    !Array.isArray((taiLieu as { deals?: unknown }).deals)
  ) {
    throw new Error('YAML deal phải có danh sách mảng ở khóa gốc "deals"');
  }

  const rawDeals = (taiLieu as { deals: unknown[] }).deals;
  const danhSach: Deal[] = [];
  const daThayId = new Set<string>();

  for (let i = 0; i < rawDeals.length; i += 1) {
    const merged = traiPhangMergeKey(rawDeals[i]);
    const ketQua = DealSchema.safeParse(merged);
    if (!ketQua.success) {
      const id =
        typeof merged.id === "string" && merged.id ? merged.id : `vị trí ${i}`;
      throw new Error(
        `YAML deal (${id}): ${dinhDangLoiZod(ketQua.error)}`
      );
    }
    if (daThayId.has(ketQua.data.id)) {
      throw new Error(`YAML deal: trùng id "${ketQua.data.id}"`);
    }
    daThayId.add(ketQua.data.id);
    danhSach.push(ketQua.data);
  }

  return danhSach;
}

/**
 * Đọc và kiểm tra định dạng YAML thông tin doanh nghiệp theo schema Zod.
 */
export function parseDoanhNghiepYaml(yamlText: string): DoanhNghiep {
  let taiLieu: unknown;
  try {
    taiLieu = yaml.load(yamlText, { schema: yaml.JSON_SCHEMA });
  } catch (err) {
    const chiTiet = err instanceof Error ? err.message : String(err);
    throw new Error(`YAML doanh-nghiep sai cú pháp: ${chiTiet}`);
  }

  const ketQua = DoanhNghiepSchema.safeParse(taiLieu);
  if (!ketQua.success) {
    throw new Error(`YAML doanh-nghiep: ${dinhDangLoiZod(ketQua.error)}`);
  }

  return ketQua.data;
}

export { parseTrangChuYaml } from "../trang-chu/schema";
