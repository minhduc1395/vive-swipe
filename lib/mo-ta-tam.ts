import type { SanPham } from "@/lib/data/types";
import { layNhanDanhMuc, layNhanLoaiDa, layNhanVanDe } from "@/lib/nhan";

/**
 * Mô tả tạm cho sản phẩm chưa có `mo_ta` (W047 đang làm mô tả thật).
 * Chỉ ghép từ dữ liệu đã có (nhãn, loại, quy cách, thành phần, loại da, vấn đề), không thêm công dụng hay claim.
 * Có `mo_ta` thật thì không dùng hàm này.
 */
export function moTaTam(sp: SanPham): string {
  const loai = layNhanDanhMuc(sp.danh_muc).toLowerCase();
  const cau: string[] = [];
  cau.push(`${loai.charAt(0).toUpperCase()}${loai.slice(1)} của ${sp.thuong_hieu}${sp.quy_cach ? `, ${sp.quy_cach}` : ""}.`);
  if (sp.thanh_phan?.length) cau.push(`Thành phần nổi bật: ${sp.thanh_phan.slice(0, 4).join(", ")}.`);
  const da = (sp.loai_da ?? []).filter((d) => d !== "moi-loai-da").map((d) => layNhanLoaiDa(d).toLowerCase());
  if (da.length) cau.push(`Dành cho ${da.join(", ")}.`);
  else if ((sp.loai_da ?? []).includes("moi-loai-da")) cau.push("Dùng được cho mọi loại da.");
  const vd = (sp.van_de ?? []).map((v) => layNhanVanDe(v).toLowerCase()).filter((v) => v !== loai);
  if (vd.length) cau.push(`Hợp với ai đang quan tâm ${vd.slice(0, 3).join(", ")}.`);
  cau.push("Hàng nội địa Hàn, có tại VIVE Union Square để bạn thử trực tiếp.");
  return cau.join(" ");
}
