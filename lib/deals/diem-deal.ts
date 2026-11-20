import type { Deal, SanPham } from "@/lib/data/types";
import { chuanHoaTimKiem } from "@/lib/dinh-dang";
import { tinhHop, laHoSoRong } from "@/lib/goi-y/diem";
import type { HoSoKhach } from "@/lib/goi-y/ho-so";
import type { ItemGioHang } from "@/lib/kho-luu-tru";
import { layDealHienThi } from "./hien-thi";
import { layGiaTriQua } from "./qua";

export interface DiemDealChiTiet {
  diem_deal: number;
  lien_quan: number;
  gia_tri: number;
}

export type DealChoBan = Deal & DiemDealChiTiet;

/**
 * Tính giá trị kinh tế của deal theo docs/02 mục 6:
 * - combo: tiết kiệm / tổng giá lẻ
 * - quà theo mốc: giá trị quà / mốc (dùng bảng 4.2 bước 5)
 * - LOPOE-25: ~0.25 (giảm 25% khi mua kèm)
 * - quà khi mua / mua x tặng y: tỷ lệ giá trị quà hoặc giảm giá trên giá trị mua
 */
export function giaTriDeal(
  deal: Deal,
  sanPhamMap: Map<string, SanPham>
): number {
  if (deal.loai === "combo") {
    const thanhPhan = deal.thanh_phan ?? [];
    if (thanhPhan.length > 0) {
      let tongGiaLe = 0;
      for (const tp of thanhPhan) {
        const sp = sanPhamMap.get(tp.id);
        if (sp) {
          tongGiaLe += sp.gia_ban * tp.so_luong;
        }
      }
      const giaCombo = deal.gia_combo ?? tongGiaLe;
      if (tongGiaLe > 0 && giaCombo < tongGiaLe) {
        return (tongGiaLe - giaCombo) / tongGiaLe;
      }
    }
  }

  // Quà theo mốc (KM-08, BAC-HOA-DON)
  if (deal.moc && deal.moc.length > 0) {
    const tyLeCacMoc: number[] = [];
    for (const m of deal.moc) {
      const mocGia = m.tu ?? m.tren ?? 1;
      const giaTriQua = layGiaTriQua(m.qua);
      if (mocGia > 0 && giaTriQua > 0) {
        tyLeCacMoc.push(giaTriQua / mocGia);
      }
    }
    if (tyLeCacMoc.length > 0) {
      return Math.max(...tyLeCacMoc);
    }
  }

  if (deal.loai === "giam_khi_mua_kem") {
    return 0.25;
  }

  if (deal.id === "KM-13") {
    // Mua 1 LOPOE tặng quà (49.000 / 249.000)
    return 49_000 / 249_000;
  }

  if (deal.id === "KM-11") {
    // Combo Mask Party tặng 1 mặt nạ (99.000 / 396.000)
    return 99_000 / 396_000;
  }

  if (deal.loai === "may_rui") {
    // Vòng quay: chi phí quà trung bình 18.500 / mốc 300.000 (doc LOPOE đã chốt 20/11 mục 4)
    return 18_500 / 300_000;
  }

  if (deal.id === "DC-05") {
    // Uniura mua 4 tặng 1 (99.000 / 495.000)
    return 99_000 / 495_000;
  }

  if (deal.id === "DC-06") {
    // Age-R Booster tặng 2 hộp Uniura (198.000 / 8.900.000)
    return 198_000 / 8_900_000;
  }

  return 0.15;
}

/**
 * Lấy danh sách sản phẩm liên quan của một deal để chấm điểm liên quan.
 */
function laySanPhamCuaDeal(
  deal: Deal,
  sanPhamMap: Map<string, SanPham>,
  daThich: string[] = [],
  gioHang: ItemGioHang[] = []
): SanPham[] {
  // Với KM-08: sản phẩm 3 nhãn khách đã thích hoặc có trong giỏ (docs/02 mục 6)
  if (deal.id === "KM-08") {
    const nhanHopLe = new Set(
      (deal.nhan_tinh ?? ["Medicube", "Celimax", "SKINFOOD"]).map((n) =>
        chuanHoaTimKiem(n)
      )
    );

    const dsId = Array.from(
      new Set([
        ...daThich,
        ...gioHang
          .map((item) => (item.loai !== "combo" ? item.sanPhamId : undefined))
          .filter((id): id is string => Boolean(id)),
      ])
    );

    const spKhach = dsId
      .map((id) => sanPhamMap.get(id))
      .filter((sp): sp is SanPham => Boolean(sp && nhanHopLe.has(chuanHoaTimKiem(sp.thuong_hieu))));

    if (spKhach.length > 0) {
      return spKhach;
    }

    // Nếu khách chưa thích hoặc chưa thêm giỏ món nào thuộc 3 nhãn, lấy sản phẩm 3 nhãn trong kho
    return Array.from(sanPhamMap.values()).filter((sp) =>
      nhanHopLe.has(chuanHoaTimKiem(sp.thuong_hieu))
    );
  }

  // LOPOE-25 hoặc KM-13 hoặc combo LOPOE: sản phẩm LOPOE
  if (deal.id === "LOPOE-25" || deal.id === "KM-13" || deal.id.startsWith("LOPOE-COMBO")) {
    return Array.from(sanPhamMap.values()).filter(
      (sp) => chuanHoaTimKiem(sp.thuong_hieu) === "lopoe"
    );
  }

  // Combo: các sản phẩm thành phần
  if (deal.loai === "combo" && deal.thanh_phan && deal.thanh_phan.length > 0) {
    return deal.thanh_phan
      .map((tp) => sanPhamMap.get(tp.id))
      .filter((sp): sp is SanPham => Boolean(sp));
  }

  // Áp dụng cho danh sách cụ thể
  if (deal.ap_dung_cho && deal.ap_dung_cho.length > 0) {
    return deal.ap_dung_cho
      .map((id) => sanPhamMap.get(id))
      .filter((sp): sp is SanPham => Boolean(sp));
  }

  // Nhãn tính (nếu có)
  if (deal.nhan_tinh && deal.nhan_tinh.length > 0) {
    const nhanHopLe = new Set(deal.nhan_tinh.map((n) => chuanHoaTimKiem(n)));
    return Array.from(sanPhamMap.values()).filter((sp) =>
      nhanHopLe.has(chuanHoaTimKiem(sp.thuong_hieu))
    );
  }

  // Bậc hóa đơn chung: lấy các món khách đã thích hoặc mẫu từ kho
  const spDaThich = daThich
    .map((id) => sanPhamMap.get(id))
    .filter((sp): sp is SanPham => Boolean(sp));
  if (spDaThich.length > 0) {
    return spDaThich;
  }

  return Array.from(sanPhamMap.values()).slice(0, 10);
}

/**
 * Tính điểm liên quan lien_quan(d) theo docs/02 mục 6:
 * Trung bình 2 giá trị hop(p) cao nhất trong các sản phẩm của deal, đưa về [0; 1].
 */
export function lienQuanDeal(
  deal: Deal,
  hoSo: HoSoKhach,
  sanPhamMap: Map<string, SanPham>,
  daThich: string[] = [],
  gioHang: ItemGioHang[] = []
): number {
  if (laHoSoRong(hoSo)) {
    // Khách chưa trả lời câu hỏi và chưa thích gì: trả mức trung tính 0.5
    return 0.5;
  }

  const sanPhamDeal = laySanPhamCuaDeal(deal, sanPhamMap, daThich, gioHang);
  if (sanPhamDeal.length === 0) {
    return 0;
  }

  const dsHop = sanPhamDeal
    .map((sp) => tinhHop(sp, hoSo))
    .sort((a, b) => b - a);

  let hopTb = dsHop[0] ?? 0;
  if (dsHop.length >= 2) {
    hopTb = (dsHop[0] + dsHop[1]) / 2;
  }

  // Đưa về [0, 1]: điểm hop(p) sau 1-2 lượt thích thường trong khoảng 1.5 - 3.0
  const normalized = hopTb / 3.0;
  return Math.min(1.0, Math.max(0.0, normalized));
}

/**
 * Chấm điểm chi tiết cho một deal: diem_deal = lien_quan * gia_tri.
 */
export function tinhDiemDeal(
  deal: Deal,
  hoSo: HoSoKhach,
  sanPhamMap: Map<string, SanPham>,
  daThich: string[] = [],
  gioHang: ItemGioHang[] = []
): DiemDealChiTiet {
  const lien_quan = lienQuanDeal(deal, hoSo, sanPhamMap, daThich, gioHang);
  const gia_tri = giaTriDeal(deal, sanPhamMap);
  const diem_deal = lien_quan * gia_tri;

  return {
    diem_deal,
    lien_quan,
    gia_tri,
  };
}

/**
 * Lấy danh sách deal hiển thị cho khách và xếp giảm dần theo diem_deal.
 */
export function layDanhSachDealChoBan(
  deals: Deal[],
  hoSo: HoSoKhach,
  sanPhamMap: Map<string, SanPham>,
  daThich: string[] = [],
  gioHang: ItemGioHang[] = [],
  homNay: string | Date = new Date()
): DealChoBan[] {
  // Chỉ lấy deal hợp lệ hiển thị hôm nay
  const dealsHienThi = layDealHienThi(deals, homNay);

  const ketQua: DealChoBan[] = dealsHienThi.map((deal) => {
    const diem = tinhDiemDeal(deal, hoSo, sanPhamMap, daThich, gioHang);
    return {
      ...deal,
      ...diem,
    };
  });

  // Xếp giảm dần theo diem_deal, nếu hòa điểm thì xếp theo gia_tri
  ketQua.sort((a, b) => {
    if (Math.abs(b.diem_deal - a.diem_deal) > 1e-6) {
      return b.diem_deal - a.diem_deal;
    }
    return b.gia_tri - a.gia_tri;
  });

  return ketQua;
}

/**
 * Trích xuất nhãn giải thích "Vì bạn thích [tag 1], [tag 2], [tag 3]" từ hồ sơ / đã thích.
 */
export function trichXuatNhanGiaiThich(
  hoSo: HoSoKhach,
  daThich: string[],
  sanPhamMap: Map<string, SanPham>
): string[] {
  const diemNhan = new Map<string, number>();

  // 1. Phân tích các khóa có trọng số dương trong hồ sơ
  for (const [khoa, diem] of Object.entries(hoSo)) {
    if (diem <= 0) continue;

    if (khoa.startsWith("tp:")) {
      const ten = khoa.slice(3).toUpperCase();
      diemNhan.set(ten, (diemNhan.get(ten) ?? 0) + diem * 1.2);
    } else if (khoa.startsWith("vd:")) {
      const slug = khoa.slice(3);
      const nhanVd: Record<string, string> = {
        "mun": "Mụn",
        "lo-chan-long": "Lỗ chân lông",
        "sang-da": "Sáng da",
        "cap-am": "Cấp ẩm",
        "lam-diu": "Làm dịu",
        "chong-lao-hoa": "Chống lão hóa",
        "chong-nang": "Chống nắng",
      };
      const label = nhanVd[slug] ?? slug;
      diemNhan.set(label, (diemNhan.get(label) ?? 0) + diem);
    } else if (khoa.startsWith("th:")) {
      const ten = khoa.slice(3);
      diemNhan.set(ten, (diemNhan.get(ten) ?? 0) + diem * 1.1);
    }
  }

  // 2. Thêm trọng số từ danh sách đã thích
  for (const id of daThich) {
    const sp = sanPhamMap.get(id);
    if (!sp) continue;
    diemNhan.set(sp.thuong_hieu, (diemNhan.get(sp.thuong_hieu) ?? 0) + 1.5);
    for (const tp of sp.thanh_phan) {
      diemNhan.set(tp.toUpperCase(), (diemNhan.get(tp.toUpperCase()) ?? 0) + 1.0);
    }
  }

  const sapXep = Array.from(diemNhan.entries()).sort((a, b) => b[1] - a[1]);
  const ketQua = sapXep.slice(0, 3).map(([nhan]) => nhan);

  if (ketQua.length === 0) {
    return ["Ưu đãi hot", "Cấp ẩm", "Combo tiết kiệm"];
  }

  return ketQua;
}
