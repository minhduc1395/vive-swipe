import { DEALS, SAN_PHAM, laySanPhamHienThi } from "@/lib/data";
import type { Deal, SanPham } from "@/lib/data/types";
import { chuanHoaNgay, layDealHienThi } from "@/lib/deals/hien-thi";
import { laHoSoRong, tinhDiemSanPham } from "./diem";
import type { HoSoKhach } from "./ho-so";

export interface BoQuaMuc {
  id: string;
  bo_qua_luc: string | Date | number;
}

export interface TheDeck {
  san_pham: SanPham;
  diem: number;
  nguon: "goi_y" | "kham_pha" | "pho_bien";
}

export interface ThamSoXepDeck {
  sanPham?: SanPham[];
  deals?: Deal[];
  hoSo?: HoSoKhach;
  daThich?: string[];
  daVaoGio?: string[];
  daBoQua?: Array<string | BoQuaMuc>;
  daXem?: string[];
  homNay?: string | Date;
  bayGio?: number;
  ngauNhien?: () => number;
  haiTheTruocKhoiDau?: SanPham[];
}

const BAY_NGAY_MS = 7 * 24 * 60 * 60 * 1000;
const SO_TOP_LOAI_KHAM_PHA = 20;
const CHU_KY_KHAM_PHA = 5;

function chuyenMocThoiGianMs(moc: string | Date | number): number {
  if (typeof moc === "number") return moc;
  if (moc instanceof Date) return moc.getTime();
  const parsed = Date.parse(moc);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Kiểm tra sản phẩm còn bị ẩn do mới bỏ qua trong 7 ngày hay không.
 */
export function dangBiAnDoBoQua(
  daBoQua: Array<string | BoQuaMuc>,
  bayGio: number
): Set<string> {
  const tap = new Set<string>();
  for (const muc of daBoQua) {
    if (typeof muc === "string") {
      tap.add(muc);
      continue;
    }
    const thoiDiem = chuyenMocThoiGianMs(muc.bo_qua_luc);
    if (bayGio - thoiDiem < BAY_NGAY_MS) {
      tap.add(muc.id);
    }
  }
  return tap;
}

function chonKhamPhaCoTrongSo(
  ungVien: SanPham[],
  ngauNhien: () => number
): SanPham {
  let tongTrongSo = 0;
  const trongSoList = ungVien.map((sp) => {
    const w = Math.max(0.01, sp.pho_bien ?? 0.5);
    tongTrongSo += w;
    return w;
  });

  const moc = Math.min(0.999999, Math.max(0, ngauNhien())) * tongTrongSo;
  let tichLuy = 0;
  for (let i = 0; i < ungVien.length; i += 1) {
    tichLuy += trongSoList[i];
    if (moc <= tichLuy) {
      return ungVien[i];
    }
  }
  return ungVien[ungVien.length - 1];
}

function laHaiTheTruocCungThuongHieu(
  daChon: SanPham[]
): string | null {
  if (daChon.length < 2) return null;
  const cuoi1 = daChon[daChon.length - 1];
  const cuoi2 = daChon[daChon.length - 2];
  if (cuoi1.thuong_hieu === cuoi2.thuong_hieu) {
    return cuoi1.thuong_hieu;
  }
  return null;
}

/**
 * Xếp deck quẹt theo docs/02 mục 5.3:
 * - Loại sản phẩm ẩn, hết hàng, thiếu ảnh, đã thích, đã vào giỏ, bỏ qua < 7 ngày.
 * - Chống lặp: không bao giờ 3 thẻ liên tiếp cùng thương hiệu (khi còn thương hiệu khác).
 * - Khám phá: cứ 5 thẻ có 1 thẻ ngẫu nhiên ngoài top 20 chưa xem.
 */
export function xepDeck(thamSo: ThamSoXepDeck = {}): TheDeck[] {
  const {
    sanPham = SAN_PHAM,
    deals = DEALS,
    hoSo = {},
    daThich = [],
    daVaoGio = [],
    daBoQua = [],
    daXem = [],
    homNay = chuanHoaNgay(new Date()),
    bayGio = Date.now(),
    ngauNhien = Math.random,
    haiTheTruocKhoiDau = [],
  } = thamSo;

  const dealsHienThi = layDealHienThi(deals, homNay);
  const tapLoai = new Set<string>([
    ...daThich,
    ...daVaoGio,
    ...dangBiAnDoBoQua(daBoQua, bayGio),
  ]);
  const tapDaXem = new Set<string>(daXem);

  const conLai = laySanPhamHienThi(sanPham).filter(
    (sp) => !tapLoai.has(sp.id)
  );
  if (conLai.length === 0) return [];

  const hoSoDangRong = laHoSoRong(hoSo);
  const nguonMacDinh: TheDeck["nguon"] = hoSoDangRong ? "pho_bien" : "goi_y";

  const ketQua: TheDeck[] = [];
  const daChonSanPham: SanPham[] = [...haiTheTruocKhoiDau];
  let tapConLai = [...conLai];

  while (tapConLai.length > 0) {
    const viTri = ketQua.length;
    const haiTheTruoc = daChonSanPham.slice(-2);
    const thuongHieuCam = laHaiTheTruocCungThuongHieu(daChonSanPham);

    const ungVienHopLe = thuongHieuCam
      ? tapConLai.filter((sp) => sp.thuong_hieu !== thuongHieuCam)
      : tapConLai;
    const tapXet = ungVienHopLe.length > 0 ? ungVienHopLe : tapConLai;

    // Cứ 5 thẻ thì thẻ thứ 5 là thẻ khám phá ngoài top 20
    const laViTriKhamPha = (viTri + 1) % CHU_KY_KHAM_PHA === 0;
    let daChon: SanPham | null = null;
    let diemChon = 0;
    let nguonChon: TheDeck["nguon"] = nguonMacDinh;

    if (laViTriKhamPha) {
      const chuaXem = tapConLai
        .filter((sp) => !tapDaXem.has(sp.id))
        .map((sp) => ({
          sp,
          diemCoSo: tinhDiemSanPham(sp, { hoSo, dealsHienThi }),
        }))
        .sort((a, b) => b.diemCoSo - a.diemCoSo);

      const ngoaiTop20 = chuaXem
        .slice(SO_TOP_LOAI_KHAM_PHA)
        .map((x) => x.sp)
        .filter((sp) => !thuongHieuCam || sp.thuong_hieu !== thuongHieuCam);

      if (ngoaiTop20.length > 0) {
        daChon = chonKhamPhaCoTrongSo(ngoaiTop20, ngauNhien);
        diemChon = tinhDiemSanPham(daChon, { hoSo, dealsHienThi, haiTheTruoc });
        nguonChon = "kham_pha";
      }
    }

    if (!daChon) {
      let totNhat = tapXet[0];
      let diemTotNhat = tinhDiemSanPham(totNhat, {
        hoSo,
        dealsHienThi,
        haiTheTruoc,
      });

      for (let i = 1; i < tapXet.length; i += 1) {
        const sp = tapXet[i];
        const diem = tinhDiemSanPham(sp, {
          hoSo,
          dealsHienThi,
          haiTheTruoc,
        });
        if (
          diem > diemTotNhat ||
          (diem === diemTotNhat &&
            ((sp.pho_bien ?? 0.5) > (totNhat.pho_bien ?? 0.5) ||
              ((sp.pho_bien ?? 0.5) === (totNhat.pho_bien ?? 0.5) &&
                sp.id < totNhat.id)))
        ) {
          totNhat = sp;
          diemTotNhat = diem;
        }
      }

      daChon = totNhat;
      diemChon = diemTotNhat;
      nguonChon = nguonMacDinh;
    }

    ketQua.push({
      san_pham: daChon,
      diem: diemChon,
      nguon: nguonChon,
    });
    daChonSanPham.push(daChon);
    tapConLai = tapConLai.filter((sp) => sp.id !== daChon.id);
  }

  return ketQua;
}

/**
 * Xếp lại deck sau mỗi lượt quẹt:
 * giữ nguyên các thẻ tới vị trí đang hiện, chỉ xếp lại phần phía sau.
 */
export function xepLaiDeck(
  deckHienTai: TheDeck[],
  viTriHienTai: number,
  thamSo: ThamSoXepDeck = {}
): TheDeck[] {
  const soTheGiu = Math.max(0, Math.min(deckHienTai.length, viTriHienTai + 1));
  const phanGiu = deckHienTai.slice(0, soTheGiu);
  const idDaGiu = phanGiu.map((t) => t.san_pham.id);

  const phanSau = xepDeck({
    ...thamSo,
    daThich: [...(thamSo.daThich ?? []), ...idDaGiu],
    daXem: [...(thamSo.daXem ?? []), ...idDaGiu],
    haiTheTruocKhoiDau: phanGiu.slice(-2).map((t) => t.san_pham),
  });

  return [...phanGiu, ...phanSau];
}
