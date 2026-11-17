import { DEALS, SAN_PHAM } from "@/lib/data";
import type { Deal, SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import { chuanHoaNgay, layDealHienThi } from "./hien-thi";
import {
  timGoiYDoiCombo,
  tinhMocTiepTheo,
  type GoiYDoiCombo,
  type MocTiepTheo,
} from "./goi-y-moc";
import { layGiaTriQua } from "./qua";

export type MucGioInput =
  | {
      loai?: "san_pham";
      san_pham_id: string;
      so_luong: number;
    }
  | {
      loai: "combo";
      deal_id: string;
      so_luong: number;
    };

export interface DongGioHang {
  loai: "san_pham" | "combo";
  id: string;
  ten: string;
  thuong_hieu: string;
  so_luong: number;
  don_gia_goc: number;
  don_gia_sau_uu_dai: number;
  gia_goc_dong: number;
  gia_sau_uu_dai: number;
  deal_ap_dung: string[];
}

export interface KetQuaTinhGio {
  cac_dong: DongGioHang[];
  tong_le: number;
  tong_tam_tinh: number;
  tiet_kiem: number;
  qua_du_kien: string | null;
  qua_cong_them: string[];
  moc_tiep_theo: MocTiepTheo | null;
  goi_y_doi_combo: GoiYDoiCombo[];
  canh_bao: "uoc_tinh";
}

export interface TuyChonTinhGio {
  daThich?: string[];
}

interface UngVienQua {
  qua: string;
  giaTri: number;
  nguon: string;
}

const NHAN_LOPOE = "LOPOE";
const MA_DEAL_COMBO_LOPOE = new Set([
  "LOPOE-COMBO-2SRM",
  "LOPOE-COMBO-KEM-AMP",
  "LOPOE-COMBO-BO3",
]);

function laNhanLopoe(thuongHieu: string): boolean {
  return chuanHoaTimKiem(thuongHieu) === chuanHoaTimKiem(NHAN_LOPOE);
}

function tinhGiaGocCombo(
  deal: Deal,
  sanPhamMap: Map<string, SanPham>
): number | null {
  if (!deal.thanh_phan || deal.thanh_phan.length === 0) {
    return deal.gia_combo ?? null;
  }
  let tong = 0;
  for (const tp of deal.thanh_phan) {
    const sp = sanPhamMap.get(tp.id);
    if (!sp) return deal.gia_combo ?? null;
    tong += sp.gia_ban * tp.so_luong;
  }
  return tong;
}

function layCacNhanCombo(
  deal: Deal,
  sanPhamMap: Map<string, SanPham>
): string[] {
  if (deal.thanh_phan && deal.thanh_phan.length > 0) {
    const tapNhan = new Set<string>();
    for (const tp of deal.thanh_phan) {
      const sp = sanPhamMap.get(tp.id);
      if (sp) tapNhan.add(sp.thuong_hieu);
    }
    return Array.from(tapNhan);
  }
  if (MA_DEAL_COMBO_LOPOE.has(deal.id)) {
    return [NHAN_LOPOE];
  }
  if (deal.id === "KM-11") {
    return ["SKINFOOD"];
  }
  return [];
}

/**
 * Engine tính giỏ hàng thuần túy theo đúng 8 bước tại docs/02 mục 4.2.
 */
export function tinhGio(
  gio: MucGioInput[],
  sanPham: SanPham[] = SAN_PHAM,
  deals: Deal[] = DEALS,
  homNay: string | Date = chuanHoaNgay(new Date()),
  tuyChon: TuyChonTinhGio = {}
): KetQuaTinhGio {
  const sanPhamMap = new Map(sanPham.map((sp) => [sp.id, sp]));
  const dealTatCaMap = new Map(deals.map((d) => [d.id, d]));

  // Bước 1: chỉ lấy deal hiện được theo quy tắc 4.1
  const dealsHienThi = layDealHienThi(deals, homNay);
  const dealHienThiMap = new Map(dealsHienThi.map((d) => [d.id, d]));

  // Gom số lượng theo dòng sản phẩm lẻ và combo hợp lệ
  const soLuongSanPham = new Map<string, number>();
  const soLuongCombo = new Map<string, number>();

  for (const muc of gio) {
    const sl = Math.floor(muc.so_luong);
    if (!Number.isFinite(sl) || sl <= 0) continue;

    if (muc.loai === "combo") {
      if (dealTatCaMap.has(muc.deal_id)) {
        soLuongCombo.set(
          muc.deal_id,
          (soLuongCombo.get(muc.deal_id) ?? 0) + sl
        );
      }
      continue;
    }

    const sp = sanPhamMap.get(muc.san_pham_id);
    if (!sp || !sp.hien_thi) continue;
    soLuongSanPham.set(
      muc.san_pham_id,
      (soLuongSanPham.get(muc.san_pham_id) ?? 0) + sl
    );
  }

  // Kiểm tra có dòng ngoài LOPOE hay không (phục vụ LOPOE-25)
  let coDongNgoaiLopoe = false;
  for (const spId of soLuongSanPham.keys()) {
    const sp = sanPhamMap.get(spId);
    if (sp && !laNhanLopoe(sp.thuong_hieu)) {
      coDongNgoaiLopoe = true;
      break;
    }
  }
  if (!coDongNgoaiLopoe) {
    for (const dealId of soLuongCombo.keys()) {
      const deal = dealTatCaMap.get(dealId);
      if (!deal) continue;
      const cacNhan = layCacNhanCombo(deal, sanPhamMap);
      if (cacNhan.some((n) => !laNhanLopoe(n))) {
        coDongNgoaiLopoe = true;
        break;
      }
    }
  }

  const cacDong: DongGioHang[] = [];

  // Bước 2: dòng combo chủ động
  for (const [dealId, soLuong] of soLuongCombo.entries()) {
    const dealHien = dealHienThiMap.get(dealId);
    const dealGoc = dealTatCaMap.get(dealId);
    if (!dealGoc) continue;

    const giaGocDonVi = tinhGiaGocCombo(dealGoc, sanPhamMap);
    let donGiaSauUuDai = giaGocDonVi ?? 0;
    const dealApDung: string[] = [];

    if (dealHien) {
      const giaComboHien =
        dealHien.het_qua && dealHien.khi_het_qua?.gia_combo != null
          ? dealHien.khi_het_qua.gia_combo
          : dealHien.gia_combo;
      if (giaComboHien != null) {
        donGiaSauUuDai = giaComboHien;
        dealApDung.push(dealHien.id);
      }
    }

    const cacNhan = layCacNhanCombo(dealGoc, sanPhamMap);
    const donGiaGoc = giaGocDonVi ?? donGiaSauUuDai;

    cacDong.push({
      loai: "combo",
      id: dealId,
      ten: dealGoc.ten,
      thuong_hieu: cacNhan[0] ?? "",
      so_luong: soLuong,
      don_gia_goc: donGiaGoc,
      don_gia_sau_uu_dai: donGiaSauUuDai,
      gia_goc_dong: donGiaGoc * soLuong,
      gia_sau_uu_dai: donGiaSauUuDai * soLuong,
      deal_ap_dung: dealApDung,
    });
  }

  // Bước 3 & 4: sản phẩm lẻ (LOPOE-25 và DC-05 Uniura)
  const dealLopoe25 = dealHienThiMap.get("LOPOE-25");
  const dealDc05 = dealHienThiMap.get("DC-05");
  const maUniuraSet = new Set(dealDc05?.ap_dung_cho ?? []);

  let tongMiengUniura = 0;
  for (const [spId, soLuong] of soLuongSanPham.entries()) {
    if (dealDc05 && maUniuraSet.has(spId)) {
      tongMiengUniura += soLuong;
    }
  }
  const soBoUniura = dealDc05 ? Math.floor(tongMiengUniura / 5) : 0;
  let soMiengUniuraDuocGiamConLai = soBoUniura * 5;

  const monLeDeGopCombo: Array<{
    san_pham_id: string;
    so_luong: number;
    don_gia_sau_uu_dai: number;
  }> = [];

  for (const [spId, soLuong] of soLuongSanPham.entries()) {
    const sp = sanPhamMap.get(spId);
    if (!sp) continue;

    let giaGocDong = sp.gia_ban * soLuong;
    let giaSauUuDai = giaGocDong;
    let donGiaSauUuDai = sp.gia_ban;
    const dealApDung: string[] = [];

    // Bước 3: LOPOE-25 cho món LOPOE lẻ
    if (
      dealLopoe25 &&
      coDongNgoaiLopoe &&
      dealLopoe25.ap_dung_cho?.includes(sp.id)
    ) {
      const giaUuDai = dealLopoe25.gia_uu_dai?.[sp.id];
      if (giaUuDai != null && giaUuDai < sp.gia_ban) {
        donGiaSauUuDai = giaUuDai;
        giaSauUuDai = giaUuDai * soLuong;
        dealApDung.push(dealLopoe25.id);
      }
    }

    // Bước 4: DC-05 Uniura (5 miếng = 396.000, lẻ = 99.000/miếng)
    if (dealDc05 && maUniuraSet.has(sp.id) && soMiengUniuraDuocGiamConLai > 0) {
      const soMiengGiamDong = Math.min(soLuong, soMiengUniuraDuocGiamConLai);
      soMiengUniuraDuocGiamConLai -= soMiengGiamDong;
      const soMiengGiaThuong = soLuong - soMiengGiamDong;

      const giaDonViGiam = (dealDc05.gia_combo ?? 396_000) / 5;
      giaGocDong = sp.gia_ban * soLuong;
      giaSauUuDai = Math.round(
        soMiengGiamDong * giaDonViGiam + soMiengGiaThuong * sp.gia_ban
      );
      donGiaSauUuDai = Math.round(giaSauUuDai / soLuong);
      dealApDung.push(dealDc05.id);
    }

    cacDong.push({
      loai: "san_pham",
      id: sp.id,
      ten: sp.ten_hien_thi,
      thuong_hieu: sp.thuong_hieu,
      so_luong: soLuong,
      don_gia_goc: sp.gia_ban,
      don_gia_sau_uu_dai: donGiaSauUuDai,
      gia_goc_dong: giaGocDong,
      gia_sau_uu_dai: giaSauUuDai,
      deal_ap_dung: dealApDung,
    });

    monLeDeGopCombo.push({
      san_pham_id: sp.id,
      so_luong: soLuong,
      don_gia_sau_uu_dai: donGiaSauUuDai,
    });
  }

  const tongLe = cacDong.reduce((tong, d) => tong + d.gia_goc_dong, 0);
  const tongTamTinh = cacDong.reduce((tong, d) => tong + d.gia_sau_uu_dai, 0);
  const tietKiem = Math.max(0, tongLe - tongTamTinh);

  // Bước 5: Quà theo hóa đơn (mỗi hóa đơn chỉ 1 quà giá trị cao nhất)
  const ungVienQua: UngVienQua[] = [];

  const themUngVienQua = (qua: string | null | undefined, nguon: string) => {
    if (!qua) return;
    ungVienQua.push({
      qua,
      giaTri: layGiaTriQua(qua),
      nguon,
    });
  };

  // 5a. Quà từ các dòng combo (combo LOPOE và KM-11)
  for (const dong of cacDong) {
    if (dong.loai !== "combo") continue;
    const deal = dealHienThiMap.get(dong.id);
    if (!deal) continue;
    if (
      deal.loai === "combo" ||
      deal.nhom_qua === "hoa_don" ||
      deal.id === "KM-11"
    ) {
      const quaCombo = deal.het_qua
        ? deal.khi_het_qua?.qua ?? null
        : deal.qua ?? null;
      themUngVienQua(quaCombo, deal.id);
    }
  }

  // 5b. KM-13: giỏ có đúng 1 món LOPOE lẻ (không combo LOPOE)
  const dealKm13 = dealHienThiMap.get("KM-13");
  if (dealKm13 && !dealKm13.het_qua && dealKm13.bang_qua) {
    const coComboLopoe = cacDong.some(
      (d) => d.loai === "combo" && MA_DEAL_COMBO_LOPOE.has(d.id)
    );
    const cacDongLopoeLe = cacDong.filter(
      (d) => d.loai === "san_pham" && laNhanLopoe(d.thuong_hieu)
    );
    const tongSoLuongLopoeLe = cacDongLopoeLe.reduce(
      (tong, d) => tong + d.so_luong,
      0
    );

    if (!coComboLopoe && tongSoLuongLopoeLe === 1 && cacDongLopoeLe.length === 1) {
      const dongLopoe = cacDongLopoeLe[0];
      const khop = dealKm13.bang_qua.find(
        (m) => m.id === dongLopoe.id && m.gia_tra === dongLopoe.gia_sau_uu_dai
      );
      if (khop?.qua) {
        themUngVienQua(khop.qua, dealKm13.id);
      }
    }
  }

  // 5c. KM-08: cộng tiền sau ưu đãi của các dòng nhãn Medicube, Celimax, SKINFOOD
  const dealKm08 = dealHienThiMap.get("KM-08");
  let tongTheoNhanKM08 = 0;
  if (dealKm08) {
    const nhanTinhSet = new Set(
      (dealKm08.nhan_tinh ?? []).map((n) => chuanHoaTimKiem(n))
    );
    for (const dong of cacDong) {
      if (dong.loai === "san_pham") {
        if (nhanTinhSet.has(chuanHoaTimKiem(dong.thuong_hieu))) {
          tongTheoNhanKM08 += dong.gia_sau_uu_dai;
        }
      } else {
        const dealCombo = dealTatCaMap.get(dong.id);
        if (dealCombo) {
          const cacNhan = layCacNhanCombo(dealCombo, sanPhamMap);
          if (
            cacNhan.length > 0 &&
            cacNhan.every((n) => nhanTinhSet.has(chuanHoaTimKiem(n)))
          ) {
            tongTheoNhanKM08 += dong.gia_sau_uu_dai;
          }
        }
      }
    }

    if (!dealKm08.het_qua && dealKm08.moc) {
      const mocDatDuoc = dealKm08.moc
        .filter((m) => m.tu !== undefined && tongTheoNhanKM08 >= m.tu)
        .sort((a, b) => (b.tu ?? 0) - (a.tu ?? 0));
      if (mocDatDuoc[0]) {
        themUngVienQua(mocDatDuoc[0].qua, dealKm08.id);
      }
    }
  }

  // 5d. BAC-HOA-DON: tổng tạm tính đạt mốc (không tính dòng combo đã áp nhánh khi_het_qua có qua: null)
  const dealBacHoaDon = dealHienThiMap.get("BAC-HOA-DON");
  if (dealBacHoaDon && !dealBacHoaDon.het_qua && dealBacHoaDon.moc) {
    const tongXetBacHoaDon = cacDong.reduce((tong, d) => {
      if (d.loai === "combo") {
        const dealCombo = dealHienThiMap.get(d.id);
        if (dealCombo?.het_qua && dealCombo.khi_het_qua?.qua === null) {
          return tong;
        }
      }
      return tong + d.gia_sau_uu_dai;
    }, 0);

    const mocDatDuoc = dealBacHoaDon.moc
      .filter((m) => m.tu !== undefined && tongXetBacHoaDon >= m.tu)
      .sort((a, b) => (b.tu ?? 0) - (a.tu ?? 0));
    if (mocDatDuoc[0]) {
      themUngVienQua(mocDatDuoc[0].qua, dealBacHoaDon.id);
    }
  }

  ungVienQua.sort((a, b) => b.giaTri - a.giaTri);
  const quaDuKien = ungVienQua[0]?.qua ?? null;
  const giaTriQuaHienTai = ungVienQua[0]?.giaTri ?? 0;

  // Bước 6: Quà cộng thêm (không tính vào 1 quà theo hóa đơn)
  const quaCongThem: string[] = [];
  const dealKm09 = dealHienThiMap.get("KM-09");
  if (dealKm09 && !dealKm09.het_qua && dealKm09.moc) {
    for (const m of dealKm09.moc) {
      const datTu = m.tu !== undefined && tongTamTinh >= m.tu;
      const datTren = m.tren !== undefined && tongTamTinh > m.tren;
      if (datTu || datTren) {
        quaCongThem.push(m.qua);
      }
    }
  }

  const dealDc06 = dealHienThiMap.get("DC-06");
  if (dealDc06 && !dealDc06.het_qua && dealDc06.qua && dealDc06.ap_dung_cho) {
    const coMay = cacDong.some(
      (d) => d.loai === "san_pham" && dealDc06.ap_dung_cho?.includes(d.id)
    );
    if (coMay) {
      quaCongThem.push(dealDc06.qua);
    }
  }

  // Bước 7: Mốc tiếp theo và gợi ý đổi combo
  const mocTiepTheo = tinhMocTiepTheo({
    dealsHienThi,
    tongTamTinh,
    tongTheoNhanKM08,
    giaTriQuaHienTai,
    sanPhamMap,
    daThich: tuyChon.daThich ?? [],
  });

  const goiYDoiCombo = timGoiYDoiCombo(dealsHienThi, monLeDeGopCombo);

  // Bước 8: luôn trả cảnh báo ước tính
  return {
    cac_dong: cacDong,
    tong_le: tongLe,
    tong_tam_tinh: tongTamTinh,
    tiet_kiem: tietKiem,
    qua_du_kien: quaDuKien,
    qua_cong_them: quaCongThem,
    moc_tiep_theo: mocTiepTheo,
    goi_y_doi_combo: goiYDoiCombo,
    canh_bao: "uoc_tinh",
  };
}
