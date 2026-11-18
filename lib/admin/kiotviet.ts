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

/**
 * Đọc file CSV tồn kho xuất từ POS KiotViet và so sánh với danh sách sản phẩm.
 */
export function parseKiotVietCsv(
  csvContent: string,
  danhSachSanPham: SanPham[]
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

  // Nhận diện cột KiotViet
  const timCot = (tuKhoa: string[]): number => {
    return tieuDe.findIndex((cot) =>
      tuKhoa.some((kw) => cot === kw || cot.includes(kw))
    );
  };

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
      loi: 'Không tìm thấy cột tồn kho trong file CSV ("Tồn kho", "Tồn", "Tồn kho thực tế").',
    };
  }

  // Tạo map tra cứu sản phẩm theo id và barcode
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

    // Chuyển đổi số tồn
    const tonSo = parseInt(tonStr.replace(/\./g, "").replace(/,/g, ""), 10);
    if (Number.isNaN(tonSo) || tonSo < 0) {
      khongKhop.push({
        maHang: maHang || barcode || `Dòng ${i + 1}`,
        tenHang,
        lyDo: `Số lượng tồn không hợp lệ ("${tonStr}")`,
      });
      continue;
    }

    // Tìm sản phẩm khớp
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
      const g = parseInt(dong[colGiaBan].replace(/\./g, "").replace(/,/g, ""), 10);
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

  const soLuongVeKhong = thayDoi.filter((t) => t.tonMoi === 0).length;

  return {
    thanhCong: true,
    thayDoi,
    khongKhop,
    soLuongKhop: thayDoi.length,
    soLuongVeKhong,
  };
}

/**
 * Cập nhật tồn kho (và giá nếu có) cho danh sách sản phẩm từ kết quả import.
 */
export function apDungCapNhatTon(
  danhSachSanPham: SanPham[],
  thayDoi: KiotVietThayDoi[]
): SanPham[] {
  const mapThayDoi = new Map<string, KiotVietThayDoi>(
    thayDoi.map((t) => [t.sanPhamId, t])
  );

  return danhSachSanPham.map((sp) => {
    const td = mapThayDoi.get(sp.id);
    if (!td) return sp;

    return {
      ...sp,
      ton: td.tonMoi,
      con_hang: td.tonMoi > 0 ? "true" : "false",
      hien_thi: td.tonMoi === 0 ? false : sp.hien_thi,
      gia_ban: td.giaBanMoi ?? sp.gia_ban,
    };
  });
}
