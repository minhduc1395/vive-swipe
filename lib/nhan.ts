/**
 * Bảng nhãn tiếng Việt chuẩn cho loại da, vấn đề da và danh mục sản phẩm (docs/01, docs/03).
 */

export const NHAN_LOAI_DA: Record<string, string> = {
  "da-dau": "Da dầu",
  "da-hon-hop": "Da hỗn hợp",
  "da-kho": "Da khô",
  "da-nhay-cam": "Da nhạy cảm",
  "moi-loai-da": "Mọi loại da",
};

export const NHAN_VAN_DE: Record<string, string> = {
  "mun": "Mụn",
  "lo-chan-long": "Lỗ chân lông",
  "sang-da": "Thâm, sáng da",
  "cap-am": "Cấp ẩm",
  "lam-diu": "Làm dịu",
  "chong-lao-hoa": "Chống lão hóa",
  "chong-nang": "Chống nắng",
  "trang-diem": "Trang điểm",
  "cham-soc-co-the": "Chăm sóc cơ thể",
  "co-the": "Chăm sóc cơ thể", // alias dự phòng
  "thiet-bi": "Thiết bị làm đẹp",
  "tay-te-bao-chet": "Tẩy tế bào chết",
  "vung-mat": "Chăm sóc vùng mắt",
};

export const NHAN_DANH_MUC: Record<string, string> = {
  "sua-rua-mat": "Sữa rửa mặt",
  "nuoc-can-bang": "Nước cân bằng",
  "toner-pad": "Toner pad",
  "tinh-chat": "Tinh chất",
  "kem-duong": "Kem dưỡng",
  "mat-na": "Mặt nạ",
  "chong-nang": "Chống nắng",
  "trang-diem": "Trang điểm",
  "duong-moi": "Dưỡng môi",
  "mieng-dan": "Miếng dán mụn",
  "duong-the": "Chăm sóc cơ thể",
  "thiet-bi": "Thiết bị làm đẹp",
  "dich-vu": "Dịch vụ",
};

/**
 * Lấy nhãn tiếng Việt của loại da từ slug.
 */
export function layNhanLoaiDa(slug: string): string {
  return NHAN_LOAI_DA[slug] || slug;
}

/**
 * Lấy nhãn tiếng Việt của vấn đề da từ slug.
 */
export function layNhanVanDe(slug: string): string {
  return NHAN_VAN_DE[slug] || slug;
}

/**
 * Lấy nhãn tiếng Việt của danh mục từ slug.
 */
export function layNhanDanhMuc(slug: string): string {
  return NHAN_DANH_MUC[slug] || slug;
}

/**
 * Lấy lý do gợi ý hiển thị trên thẻ deck.
 * Bỏ nhãn "Hợp moi-loai-da" vì không mang lại giá trị cá nhân hóa cho khách.
 */
export function layLyDoGoiY(
  vanDeList?: string[],
  loaiDaList?: string[]
): string | undefined {
  if (vanDeList && vanDeList.length > 0) {
    const vd = vanDeList[0];
    const nhan = layNhanVanDe(vd);
    return `Hợp với: ${nhan}`;
  }

  if (loaiDaList && loaiDaList.length > 0) {
    // Bỏ qua "moi-loai-da"
    const loaiDaHop = loaiDaList.find((ld) => ld !== "moi-loai-da");
    if (loaiDaHop) {
      return `Hợp: ${layNhanLoaiDa(loaiDaHop)}`;
    }
  }

  return undefined;
}
