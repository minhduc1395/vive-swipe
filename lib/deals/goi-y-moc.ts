import type { Deal, SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import { layGiaTriQua } from "./qua";

export interface MocTiepTheo {
  deal_id: string;
  deal_ten: string;
  nhan_ap_dung: string[] | null;
  muc_hien_tai: number;
  moc_muc_tieu: number;
  con_thieu: number;
  qua: string;
  goi_y: SanPham[];
}

export interface GoiYDoiCombo {
  deal_id: string;
  ten: string;
  thanh_phan: Array<{ id: string; so_luong: number }>;
  gia_combo: number;
  gia_le_hien_tai: number;
  tiet_kiem: number;
}

export interface DongMonLeDeGopCombo {
  san_pham_id: string;
  so_luong: number;
  don_gia_sau_uu_dai: number;
}

const TY_LE_THIEU_TOI_DA = 0.3;

/**
 * Tìm mốc quà tiếp theo gần đạt nhất (thiếu từ 1 đến 30% mốc và có quà giá trị cao hơn quà hiện tại).
 */
export function tinhMocTiepTheo(thamSo: {
  dealsHienThi: Deal[];
  tongTamTinh: number;
  tongTheoNhanKM08: number;
  giaTriQuaHienTai: number;
  sanPhamMap: Map<string, SanPham>;
  daThich: string[];
}): MocTiepTheo | null {
  const {
    dealsHienThi,
    tongTamTinh,
    tongTheoNhanKM08,
    giaTriQuaHienTai,
    sanPhamMap,
    daThich,
  } = thamSo;

  const ungVien: Array<{
    deal: Deal;
    nhanApDung: string[] | null;
    mucHienTai: number;
    mocTu: number;
    conThieu: number;
    qua: string;
    giaTriQua: number;
  }> = [];

  for (const deal of dealsHienThi) {
    if (deal.het_qua || !deal.moc || deal.moc.length === 0) continue;
    if (deal.id !== "KM-08" && deal.id !== "BAC-HOA-DON") continue;

    const mucHienTai = deal.id === "KM-08" ? tongTheoNhanKM08 : tongTamTinh;
    const nhanApDung =
      deal.id === "KM-08" ? (deal.nhan_tinh ?? null) : null;

    for (const moc of deal.moc) {
      if (moc.tu === undefined) continue;
      const conThieu = moc.tu - mucHienTai;
      if (conThieu <= 0 || conThieu > TY_LE_THIEU_TOI_DA * moc.tu) {
        continue;
      }
      const giaTriQua = layGiaTriQua(moc.qua);
      if (giaTriQua <= giaTriQuaHienTai) {
        continue;
      }
      ungVien.push({
        deal,
        nhanApDung,
        mucHienTai,
        mocTu: moc.tu,
        conThieu,
        qua: moc.qua,
        giaTriQua,
      });
    }
  }

  if (ungVien.length === 0) return null;

  ungVien.sort((a, b) => {
    if (a.conThieu !== b.conThieu) return a.conThieu - b.conThieu;
    return b.giaTriQua - a.giaTriQua;
  });

  const chon = ungVien[0];
  const nhanChoPhep = chon.nhanApDung
    ? new Set(chon.nhanApDung.map((n) => chuanHoaTimKiem(n)))
    : null;

  const goiY = Array.from(new Set(daThich))
    .map((id) => sanPhamMap.get(id))
    .filter((sp): sp is SanPham => {
      if (!sp || !sp.hien_thi || sp.con_hang === "false") return false;
      if (sp.gia_ban < chon.conThieu) return false;
      if (nhanChoPhep) {
        return nhanChoPhep.has(chuanHoaTimKiem(sp.thuong_hieu));
      }
      return true;
    })
    .sort((a, b) => a.gia_ban - b.gia_ban)
    .slice(0, 3);

  return {
    deal_id: chon.deal.id,
    deal_ten: chon.deal.ten,
    nhan_ap_dung: chon.nhanApDung,
    muc_hien_tai: chon.mucHienTai,
    moc_muc_tieu: chon.mocTu,
    con_thieu: chon.conThieu,
    qua: chon.qua,
    goi_y: goiY,
  };
}

/**
 * Gợi ý đổi sang combo khi các món lẻ trong giỏ đủ cấu thành một combo rẻ hơn.
 * Không tự động gộp món lẻ thành combo.
 */
export function timGoiYDoiCombo(
  dealsHienThi: Deal[],
  monLeTrongGio: DongMonLeDeGopCombo[]
): GoiYDoiCombo[] {
  if (monLeTrongGio.length === 0) return [];

  const mapMonLe = new Map<string, DongMonLeDeGopCombo>();
  for (const mon of monLeTrongGio) {
    const cu = mapMonLe.get(mon.san_pham_id);
    if (cu) {
      cu.so_luong += mon.so_luong;
    } else {
      mapMonLe.set(mon.san_pham_id, { ...mon });
    }
  }

  const goiY: GoiYDoiCombo[] = [];

  for (const deal of dealsHienThi) {
    if (deal.loai !== "combo" || !deal.thanh_phan || deal.thanh_phan.length === 0) {
      continue;
    }
    const giaCombo =
      deal.het_qua && deal.khi_het_qua?.gia_combo != null
        ? deal.khi_het_qua.gia_combo
        : deal.gia_combo;
    if (giaCombo == null) continue;

    let duThanhPhan = true;
    let giaLeHienTai = 0;

    for (const tp of deal.thanh_phan) {
      const coTrongGio = mapMonLe.get(tp.id);
      if (!coTrongGio || coTrongGio.so_luong < tp.so_luong) {
        duThanhPhan = false;
        break;
      }
      giaLeHienTai += coTrongGio.don_gia_sau_uu_dai * tp.so_luong;
    }

    if (duThanhPhan && giaCombo < giaLeHienTai) {
      goiY.push({
        deal_id: deal.id,
        ten: deal.ten,
        thanh_phan: deal.thanh_phan,
        gia_combo: giaCombo,
        gia_le_hien_tai: giaLeHienTai,
        tiet_kiem: giaLeHienTai - giaCombo,
      });
    }
  }

  return goiY.sort((a, b) => b.tiet_kiem - a.tiet_kiem);
}
