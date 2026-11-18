import type { SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";

export interface KiotVietThayDoi {
  sanPhamId: string;
  maHang: string;
  tenHang: string;
  tonCu: number;
  tonMoi: number;
  thayDoi: number;
  giaBanMoi?: number;
}

export interface KiotVietImportResult {
  thanhCong: boolean;
  thayDoi: KiotVietThayDoi[];
  khongKhop: Array<{ maHang: string; tenHang: string; lyDo: string }>;
  soLuongKhop: number;
  soLuongVeKhong: number;
  loi?: string;
}

function phanCachDong(dongDau: string): "," | ";" {
  let phay = 0;
  let chamPhay = 0;
  let trongNgoac = false;
  for (const ch of dongDau) {
    if (ch === '"') trongNgoac = !trongNgoac;
    else if (!trongNgoac && ch === ",") phay += 1;
    else if (!trongNgoac && ch === ";") chamPhay += 1;
  }
  return chamPhay > phay ? ";" : ",";
}

function tachDongCsv(noiDung: string): string[][] {
  const sach = noiDung.replace(/^\uFEFF/, "");
  const dongDauEnd = sach.search(/\r?\n/);
  const dongDau = dongDauEnd >= 0 ? sach.slice(0, dongDauEnd) : sach;
  const sep = phanCachDong(dongDau);

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
      if (dong.some((gt) => gt.length > 0)) {
        bang.push(dong);
      }
      dong = [];
    } else if (kyTu === "\n") {
      dong.push(o.trim());
      o = "";
      if (dong.some((gt) => gt.length > 0)) {
        bang.push(dong);
      }
      dong = [];
    } else {
      o += kyTu;
    }
  }

  if (o.length > 0 || dong.length > 0) {
    dong.push(o.trim());
    if (dong.some((gt) => gt.length > 0)) {
      bang.push(dong);
    }
  }

  return bang;
}

/** Đọc file CSV tồn kho xuất từ POS KiotViet và tạo bản xem trước thay đổi. */
export function parseKiotVietCsv(
  csvContent: string,
  danhSachSanPham: SanPham[],
): KiotVietImportResult {
  const bang = tachDongCsv(csvContent);
  if (bang.length < 2) {
    return {
      thanhCong: false,
      thayDoi: [],
      khongKhop: [],
      soLuongKhop: 0,
      soLuongVeKhong: 0,
      loi: "File CSV rỗng hoặc không có dữ liệu hàng.",
    };
  }

  const tieuDe = bang[0].map((c) => chuanHoaTimKiem(c));
  const timCot = (tuKhoa: string[]): number =>
    tieuDe.findIndex((cot) =>
      tuKhoa.some((kw) => cot === kw || cot.includes(kw)),
    );

  const colMaHang = timCot(["ma hang", "ma san pham", "ma vach", "barcode", "id", "sku"]);
  const colBarcode = timCot(["ma vach", "barcode"]);
  const colTenHang = timCot(["ten hang", "ten san pham", "ten"]);
  const colTonKho = timCot(["ton kho", "ton", "so luong ton", "sl ton"]);
  const colGiaBan = timCot(["gia ban", "gia"]);

  if (colTonKho === -1) {
    return {
      thanhCong: false,
      thayDoi: [],
      khongKhop: [],
      soLuongKhop: 0,
      soLuongVeKhong: 0,
      loi: 'Không tìm thấy cột tồn kho trong file CSV ("Tồn kho", "Tồn").',
    };
  }

  const mapId = new Map<string, SanPham>();
  const mapBarcode = new Map<string, SanPham>();

  for (const sp of danhSachSanPham) {
    mapId.set(sp.id, sp);
    mapId.set(chuanHoaTimKiem(sp.id), sp);
    if (sp.barcode) {
      mapBarcode.set(sp.barcode, sp);
      mapBarcode.set(chuanHoaTimKiem(sp.barcode), sp);
    }
  }

  const thayDoi: KiotVietThayDoi[] = [];
  const khongKhop: Array<{ maHang: string; tenHang: string; lyDo: string }> = [];

  for (let i = 1; i < bang.length; i += 1) {
    const dong = bang[i];
    const maHang = colMaHang >= 0 ? (dong[colMaHang] ?? "") : "";
    const barcode = colBarcode >= 0 ? (dong[colBarcode] ?? "") : "";
    const tenHang = colTenHang >= 0 ? (dong[colTenHang] ?? "") : "";
    const tonStr = dong[colTonKho] ?? "";

    if (!maHang && !barcode && !tenHang) continue;

    const tonSo = parseInt(tonStr.replace(/[.,\s]/g, ""), 10);
    if (Number.isNaN(tonSo) || tonSo < 0) {
      khongKhop.push({
        maHang: maHang || barcode || `Dòng ${i + 1}`,
        tenHang,
        lyDo: `Số lượng tồn không hợp lệ ("${tonStr}")`,
      });
      continue;
    }

    let sp: SanPham | undefined;
    if (barcode) {
      sp = mapBarcode.get(barcode) ?? mapId.get(barcode);
    }
    if (!sp && maHang) {
      sp = mapId.get(maHang) ?? mapBarcode.get(maHang);
    }

    if (!sp) {
      khongKhop.push({
        maHang: maHang || barcode,
        tenHang,
        lyDo: "Không tìm thấy mã sản phẩm hoặc mã vạch khớp trong hệ thống",
      });
      continue;
    }

    const tonCu = sp.ton ?? 0;
    let giaBanMoi: number | undefined;
    if (colGiaBan >= 0 && dong[colGiaBan]) {
      const g = parseInt(dong[colGiaBan].replace(/[.,\s]/g, ""), 10);
      if (!Number.isNaN(g) && g > 0) giaBanMoi = g;
    }

    thayDoi.push({
      sanPhamId: sp.id,
      maHang: maHang || sp.barcode || sp.id,
      tenHang: sp.ten_hien_thi,
      tonCu,
      tonMoi: tonSo,
      thayDoi: tonSo - tonCu,
      giaBanMoi,
    });
  }

  return {
    thanhCong: true,
    thayDoi,
    khongKhop,
    soLuongKhop: thayDoi.length,
    soLuongVeKhong: thayDoi.filter((t) => t.tonMoi === 0).length,
  };
}

/** Áp dụng thay đổi tồn (và giá nếu có) cho danh sách sản phẩm trong bộ nhớ. */
export function apDungCapNhatTon(
  danhSachSanPham: SanPham[],
  thayDoi: KiotVietThayDoi[],
): SanPham[] {
  const mapThayDoi = new Map<string, KiotVietThayDoi>(
    thayDoi.map((t) => [t.sanPhamId, t]),
  );

  return danhSachSanPham.map((sp) => {
    const td = mapThayDoi.get(sp.id);
    if (!td) return sp;

    return {
      ...sp,
      ton: td.tonMoi,
      con_hang: td.tonMoi > 0 ? "true" : "false",
      gia_ban: td.giaBanMoi ?? sp.gia_ban,
    };
  });
}
