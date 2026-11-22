import { preload } from "react-dom";
import { duongDanAnh } from "@/lib/anh";
import { xepDeck } from "@/lib/goi-y/deck";
import { khoiTaoHoSo } from "@/lib/goi-y/ho-so";
import { daTungKhaoSat, layTraLoiLocal } from "@/lib/khao-sat";
import {
  layDanhSachDaBoQua,
  layDanhSachDaThich,
  layGioHang,
  layHoSoLocal,
} from "@/lib/kho-luu-tru";

/**
 * #128: tải sớm cho /quet. Chạy ngay khi mã trang chạy trên trình duyệt:
 * 1. Tải sản phẩm và deal vào cache của `lib/supabase/du-lieu` (DuLieuProvider dùng lại, khỏi chờ nó gắn xong).
 * 2. Tính thẻ đầu của deck bằng đúng hàm `xepDeck` và dữ liệu như trang (không đổi luật xếp), rồi preload
 *    ảnh thẻ đó ưu tiên cao để ảnh bắt đầu tải trước khi React vẽ thẻ.
 * Thẻ đầu (vị trí 0) không phụ thuộc phần ngẫu nhiên của deck (chỉ thẻ khám phá thứ 5 trở đi dùng ngẫu nhiên).
 * Mọi lỗi đều bỏ qua: trang vẫn tự tải dữ liệu như cũ.
 */
export function taiSomChoQuet(): void {
  if (typeof window === "undefined" || !daTungKhaoSat()) return;
  void import("@/lib/supabase/du-lieu")
    .then(async (m) => {
      const [sanPham] = await Promise.all([m.taiSanPhamTuSupabase(), m.taiDealsTuSupabase()]);
      const traLoi = layTraLoiLocal();
      let hoSo = layHoSoLocal();
      if (Object.keys(hoSo).length === 0 && traLoi) hoSo = khoiTaoHoSo(traLoi);
      const gio = layGioHang();
      const deck = xepDeck({
        sanPham,
        hoSo,
        daThich: layDanhSachDaThich(),
        daVaoGio: gio.map((g) => g.sanPhamId).filter((id): id is string => Boolean(id)),
        daBoQua: layDanhSachDaBoQua(),
      });
      const anh = duongDanAnh(deck[0]?.san_pham.anh, "the");
      if (anh && /^https?:\/\//i.test(anh)) {
        preload(anh, { as: "image", fetchPriority: "high" });
      }
    })
    .catch(() => {});
}
