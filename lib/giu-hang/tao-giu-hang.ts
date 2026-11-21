import { DEALS, SAN_PHAM } from "@/lib/data";
import {
  SanPhamSchema,
  DealSchema,
  type SanPham,
  type Deal,
} from "@/lib/data/types";
import { layAdmin } from "@/lib/supabase/admin";
import { hopNhatDongDeal } from "@/lib/supabase/du-lieu";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import { tinhGio, type MucGioInput } from "@/lib/deals/gio-hang";
import { guiEmailXacNhanGiuHang } from "@/lib/email/xac-nhan-giu-hang";
import {
  demSoDonDangGiuTheoSdt,
  kiemTraMaDaTonTai,
  luuDonGiuHang,
  LoiKhoGiuHang,
} from "./kho-giu-hang";
import type {
  DonGiuHangChiTiet,
  DongGiuHangXacNhan,
  KetQuaTaoGiuHang,
  ThongTinDatGiuHangInput,
} from "./types";

export function chuanHoaSoDienThoai(sdt: string): string {
  let s = (sdt || "").replace(/[\s.-]/g, "");
  if (s.startsWith("+84")) {
    s = "0" + s.slice(3);
  }
  return s;
}

export function kiemTraSoDienThoaiVN(sdt: string): boolean {
  const s = chuanHoaSoDienThoai(sdt);
  // Định dạng SĐT di động Việt Nam: 10 chữ số, đầu 03, 05, 07, 08, 09
  return /^0[35789]\d{8}$/.test(s);
}

export function kiemTraEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Tính ngày và giờ hết hạn theo giờ Việt Nam (UTC+7).
 */
export function tinhNgayVaHetHan(ngayDen: "hom_nay" | "ngay_mai"): {
  ngayDenStr: string;
  hetHanIso: string;
  hanGiuText: string;
} {
  // Lấy thời điểm hiện tại theo UTC+7
  const now = new Date();
  const utcOffset = 7 * 60; // phút
  const localOffset = now.getTimezoneOffset(); // phút âm nếu phía đông UTC
  const vnTime = new Date(now.getTime() + (utcOffset + localOffset) * 60000);

  if (ngayDen === "ngay_mai") {
    vnTime.setDate(vnTime.getDate() + 1);
  }

  const yyyy = vnTime.getFullYear();
  const mm = String(vnTime.getMonth() + 1).padStart(2, "0");
  const dd = String(vnTime.getDate()).padStart(2, "0");
  const ngayDenStr = `${yyyy}-${mm}-${dd}`;

  const gioDen = CAU_HINH_BOOTH.giuHangDenGio || "21:00";
  const hetHanIso = `${ngayDenStr}T${gioDen}:00+07:00`;
  const hanGiuText = `Giữ đến ${gioDen} ${
    ngayDen === "hom_nay" ? "hôm nay" : "ngày mai"
  }`;

  return { ngayDenStr, hetHanIso, hanGiuText };
}

/**
 * Sinh mã giữ hàng dạng VIVE-xxxx không trùng với các mã đang giữ.
 */
export async function sinhMaGiuHang(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const ngauNhien = Math.floor(1000 + Math.random() * 9000);
    const ma = `VIVE-${ngauNhien}`;
    const daCo = await kiemTraMaDaTonTai(ma);
    if (!daCo) {
      return ma;
    }
  }
  return `VIVE-${Date.now().toString().slice(-4)}`;
}

/** Giá và deal lấy từ database (quản trị sửa ở W017); máy dev không có khóa thì dùng dữ liệu tĩnh. */
async function taiGiaTuDatabase(): Promise<{
  sanPham: SanPham[];
  deals: Deal[];
}> {
  const admin = layAdmin();
  if (!admin) return { sanPham: SAN_PHAM, deals: DEALS };
  const [sp, dl] = await Promise.all([
    admin.from("san_pham").select("*"),
    admin.from("deal").select("*"),
  ]);
  if (sp.error || dl.error)
    throw new LoiKhoGiuHang((sp.error || dl.error)!.message);
  const sanPham = (sp.data ?? []).flatMap((r) => {
    const p = SanPhamSchema.safeParse(r);
    return p.success ? [p.data] : [];
  });
  const deals = (dl.data ?? []).flatMap((r) => {
    const p = DealSchema.safeParse(hopNhatDongDeal(r));
    return p.success ? [p.data] : [];
  });
  return { sanPham, deals };
}

/**
 * Server Action / Logic trung tâm tạo đơn giữ hàng tại booth.
 * Tính lại giá và quà hoàn toàn trên server; không tin giá từ trình duyệt.
 */
export async function xuLyTaoGiuHang(
  input: ThongTinDatGiuHangInput,
): Promise<KetQuaTaoGiuHang> {
  const { ten, sdt, email, ngayDen, dongYChinhSach, gio, khachId } = input;

  // 1. Kiểm tra chính sách
  if (!dongYChinhSach) {
    return {
      ok: false,
      loi: "Vui lòng đồng ý với chính sách bảo mật và giữ hàng của VIVE.",
      maLoi: "chinh_sach",
    };
  }

  // 2. Kiểm tra họ và tên
  const tenClean = (ten || "").trim();
  if (!tenClean) {
    return {
      ok: false,
      loi: "Vui lòng nhập họ và tên để nhân viên liên hệ.",
      maLoi: "ten",
    };
  }

  // 3. Kiểm tra số điện thoại
  const sdtChuanHoa = chuanHoaSoDienThoai(sdt);
  if (!kiemTraSoDienThoaiVN(sdtChuanHoa)) {
    return {
      ok: false,
      loi: "Số điện thoại không đúng định dạng di động Việt Nam (cần 10 chữ số, ví dụ: 09xx xxx xxx).",
      maLoi: "sdt",
    };
  }

  // 4. Kiểm tra email (nếu có nhập)
  const emailClean = (email || "").trim();
  if (emailClean && !kiemTraEmail(emailClean)) {
    return {
      ok: false,
      loi: "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại hoặc để trống.",
      maLoi: "email",
    };
  }

  // 5. Kiểm tra giỏ hàng
  if (!gio || gio.length === 0) {
    return {
      ok: false,
      loi: "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi giữ hàng.",
      maLoi: "gio_trong",
    };
  }

  try {
    // 6. Kiểm tra giới hạn 3 mã đang giữ cho số điện thoại này
    const soDonDangGiu = await demSoDonDangGiuTheoSdt(sdtChuanHoa);
    if (soDonDangGiu >= 3) {
      return {
        ok: false,
        loi: "Mỗi số điện thoại giữ tối đa 3 mã cùng lúc tại booth. Vui lòng lấy các món đã giữ trước đó hoặc chờ đơn hết hạn.",
        maLoi: "gioi_han",
      };
    }

    // 7. Tính lại giá toàn bộ trên server bằng tinhGio
    const mucGioInput: MucGioInput[] = gio.map((item) => {
      if (item.loai === "combo" && item.dealId) {
        return {
          loai: "combo",
          deal_id: item.dealId,
          so_luong: item.soLuong,
        };
      }
      return {
        loai: "san_pham",
        san_pham_id: item.sanPhamId || "",
        so_luong: item.soLuong,
      };
    });

    const { sanPham, deals } = await taiGiaTuDatabase();
    const ketQuaGio = tinhGio(mucGioInput, sanPham, deals);

    if (ketQuaGio.cac_dong.length === 0) {
      return {
        ok: false,
        loi: "Không có sản phẩm hợp lệ trong giỏ hàng.",
        maLoi: "khong_hop_le",
      };
    }

    // 8. Chuẩn bị thông tin đơn giữ hàng
    let ma = await sinhMaGiuHang();
    const { ngayDenStr, hetHanIso, hanGiuText } = tinhNgayVaHetHan(ngayDen);
    const diaChi = CAU_HINH_BOOTH.diaChiDayDu;

    const cacDongXacNhan: DongGiuHangXacNhan[] = ketQuaGio.cac_dong.map(
      (d) => ({
        id: d.id,
        ten: d.ten,
        thuongHieu: d.thuong_hieu,
        soLuong: d.so_luong,
        giaSauUuDai: d.gia_sau_uu_dai,
        loai: d.loai,
      }),
    );

    const donMoi: DonGiuHangChiTiet = {
      id: crypto.randomUUID(),
      ma,
      khachId: khachId || null,
      ten: tenClean,
      sdt: sdtChuanHoa,
      email: emailClean || null,
      ngayDen: ngayDenStr,
      hetHan: hetHanIso,
      trangThai: "moi",
      tongUocTinh: ketQuaGio.tong_tam_tinh,
      quaDuKien: ketQuaGio.qua_du_kien,
      ghiChu: null,
      taoLuc: new Date().toISOString(),
      cacDong: cacDongXacNhan,
    };

    // 9. Lưu vào database; trùng mã (23505) thì sinh mã khác, thử tối đa 3 lần
    for (let lan = 0; ; lan++) {
      try {
        await luuDonGiuHang(donMoi);
        break;
      } catch (e) {
        if (e instanceof LoiKhoGiuHang && e.ma === "23505" && lan < 2) {
          ma = await sinhMaGiuHang();
          donMoi.ma = ma;
          continue;
        }
        throw e;
      }
    }

    // 10. Gửi email xác nhận nếu có email
    if (emailClean) {
      await guiEmailXacNhanGiuHang({
        to: emailClean,
        ten: tenClean,
        ma,
        hanGiuText,
        tongTien: ketQuaGio.tong_tam_tinh,
        quaDuKien: ketQuaGio.qua_du_kien,
        diaChi,
        cacDong: cacDongXacNhan.map((d) => ({
          ten: d.ten,
          so_luong: d.soLuong,
          gia_sau_uu_dai: d.giaSauUuDai,
        })),
      });
    }

    return {
      ok: true,
      ma,
      ngayDenStr,
      hetHanIso,
      hanGiuText,
      tongUocTinh: ketQuaGio.tong_tam_tinh,
      quaDuKien: ketQuaGio.qua_du_kien,
      cacDong: cacDongXacNhan,
      diaChi,
      ten: tenClean,
      sdt: sdtChuanHoa,
      email: emailClean,
    };
  } catch (e) {
    if (e instanceof LoiKhoGiuHang && e.ma === "P0001") {
      return {
        ok: false,
        loi: "Mỗi số điện thoại giữ tối đa 3 mã cùng lúc tại booth. Vui lòng lấy các món đã giữ trước đó hoặc chờ đơn hết hạn.",
        maLoi: "gioi_han",
      };
    }
    console.error("[GiuHang] Không lưu được đơn giữ hàng:", e);
    return {
      ok: false,
      loi: "Chưa giữ hàng được do lỗi hệ thống. Bạn thử lại sau ít phút hoặc đến thẳng booth để nhân viên hỗ trợ.",
      maLoi: "he_thong",
    };
  }
}
