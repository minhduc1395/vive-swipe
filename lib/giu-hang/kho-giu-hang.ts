import { layAdmin, choPhepKhoTam } from "@/lib/supabase/admin";
import type { DonGiuHangChiTiet } from "./types";

declare global {
  var __VIVE_DON_GIU_HANG_DEV__: DonGiuHangChiTiet[] | undefined;
}

function layKhoGiuHangLocal(): DonGiuHangChiTiet[] {
  if (!globalThis.__VIVE_DON_GIU_HANG_DEV__) {
    // Khởi tạo các đơn mẫu thực tế cho trang nhân viên theo design/NhanVien.dc.html
    globalThis.__VIVE_DON_GIU_HANG_DEV__ = [
      {
        id: "demo-vive-4821",
        ma: "VIVE-4821",
        ten: "Lan N.",
        sdt: "0901234567",
        email: "lan.n@email.com",
        ngayDen: "ngày mai",
        hetHan: new Date(Date.now() + 86400000).toISOString(),
        trangThai: "moi",
        tongUocTinh: 1235000,
        quaDuKien: "1 ampoule LOPOE",
        taoLuc: "14:05",
        ghiChu: "Tạo lúc 14:05",
        cacDong: [
          {
            id: "combo-pink",
            ten: "COMBO PINK PDRN",
            thuongHieu: "VIVE",
            soLuong: 1,
            giaSauUuDai: 999000,
            loai: "combo",
          },
          {
            id: "LOPOE-CF",
            ten: "Sữa rửa mặt LOPOE",
            thuongHieu: "LOPOE",
            soLuong: 1,
            giaSauUuDai: 186000,
            loai: "san_pham",
          },
          {
            id: "8809459397669",
            ten: "Mặt nạ Aloe Dermal",
            thuongHieu: "Dermal",
            soLuong: 2,
            giaSauUuDai: 50000,
            loai: "san_pham",
          },
        ],
      },
      {
        id: "demo-vive-3307",
        ma: "VIVE-3307",
        ten: "Minh T.",
        sdt: "0987112112",
        email: "minh.t@email.com",
        ngayDen: "hôm nay",
        hetHan: new Date().toISOString(),
        trangThai: "moi",
        tongUocTinh: 395000,
        quaDuKien: null,
        taoLuc: "13:20",
        ghiChu: "Tạo lúc 13:20",
        cacDong: [
          {
            id: "repiel-calming",
            ten: "Sữa rửa mặt Rep!el All Day Calming",
            thuongHieu: "Rep!el",
            soLuong: 1,
            giaSauUuDai: 209000,
            loai: "san_pham",
          },
          {
            id: "LOPOE-CF",
            ten: "Sữa rửa mặt LOPOE",
            thuongHieu: "LOPOE",
            soLuong: 1,
            giaSauUuDai: 186000,
            loai: "san_pham",
          },
        ],
      },
      {
        id: "demo-vive-5190",
        ma: "VIVE-5190",
        ten: "Hà P.",
        sdt: "0912345908",
        email: "ha.p@email.com",
        ngayDen: "hôm nay",
        hetHan: new Date().toISOString(),
        trangThai: "da_soan",
        tongUocTinh: 911000,
        quaDuKien: "1 kem dưỡng LOPOE",
        taoLuc: "11:48",
        ghiChu: "Tạo lúc 11:48 · Đã soạn bởi Quầy VIVE lúc 12:00",
        cacDong: [
          {
            id: "combo-lopoe-3",
            ten: "Bộ 3 LOPOE",
            thuongHieu: "LOPOE",
            soLuong: 1,
            giaSauUuDai: 911000,
            loai: "combo",
          },
        ],
      },
      {
        id: "demo-vive-2764",
        ma: "VIVE-2764",
        ten: "Thảo V.",
        sdt: "0933222345",
        email: "thao.v@email.com",
        ngayDen: "hôm nay",
        hetHan: new Date().toISOString(),
        trangThai: "da_lay",
        tongUocTinh: 943000,
        quaDuKien: "1 sữa rửa mặt LOPOE",
        taoLuc: "10:32",
        ghiChu: "Tạo lúc 10:32 · Đã lấy bởi Quầy VIVE lúc 11:05",
        cacDong: [
          {
            id: "tiela-body-cream",
            ten: "Kem dưỡng thể Tiela Pure",
            thuongHieu: "Tiela",
            soLuong: 1,
            giaSauUuDai: 519000,
            loai: "san_pham",
          },
          {
            id: "tiela-scrub",
            ten: "Tẩy da chết Tiela Pure",
            thuongHieu: "Tiela",
            soLuong: 1,
            giaSauUuDai: 399000,
            loai: "san_pham",
          },
          {
            id: "8809459397669",
            ten: "Mặt nạ Aloe Dermal",
            thuongHieu: "Dermal",
            soLuong: 1,
            giaSauUuDai: 25000,
            loai: "san_pham",
          },
        ],
      },
      {
        id: "demo-vive-6012",
        ma: "VIVE-6012",
        ten: "Quân L.",
        sdt: "0944555220",
        email: "quan.l@email.com",
        ngayDen: "hôm qua",
        hetHan: new Date(Date.now() - 86400000).toISOString(),
        trangThai: "het_han",
        tongUocTinh: 249000,
        quaDuKien: "1 muối tắm salTherapy",
        taoLuc: "hôm qua 18:10",
        ghiChu: "Tạo lúc hôm qua 18:10 · Tự động hết hạn",
        cacDong: [
          {
            id: "LOPOE-CF",
            ten: "Sữa rửa mặt LOPOE",
            thuongHieu: "LOPOE",
            soLuong: 1,
            giaSauUuDai: 249000,
            loai: "san_pham",
          },
        ],
      },
    ];
  }
  return globalThis.__VIVE_DON_GIU_HANG_DEV__;
}

export class LoiKhoGiuHang extends Error {
  constructor(
    message: string,
    public ma?: string,
  ) {
    super(message);
  }
}

function canAdminHoacKhoTam() {
  const admin = layAdmin();
  if (!admin && !choPhepKhoTam()) {
    throw new LoiKhoGiuHang(
      "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY trên server",
    );
  }
  return admin;
}

export async function demSoDonDangGiuTheoSdt(sdt: string): Promise<number> {
  const admin = canAdminHoacKhoTam();
  if (admin) {
    const { count, error } = await admin
      .from("giu_hang")
      .select("id", { count: "exact", head: true })
      .eq("sdt", sdt)
      .in("trang_thai", ["moi", "da_soan"]);
    if (error) throw new LoiKhoGiuHang(error.message);
    return count ?? 0;
  }

  // Fallback local memory
  const kho = layKhoGiuHangLocal();
  return kho.filter(
    (d) =>
      d.sdt === sdt && (d.trangThai === "moi" || d.trangThai === "da_soan"),
  ).length;
}

export async function kiemTraMaDaTonTai(ma: string): Promise<boolean> {
  const admin = canAdminHoacKhoTam();
  if (admin) {
    const { data, error } = await admin
      .from("giu_hang")
      .select("id")
      .eq("ma", ma)
      .in("trang_thai", ["moi", "da_soan"]);
    if (error) throw new LoiKhoGiuHang(error.message);
    return (data?.length ?? 0) > 0;
  }

  const kho = layKhoGiuHangLocal();
  return kho.some(
    (d) => d.ma === ma && (d.trangThai === "moi" || d.trangThai === "da_soan"),
  );
}

export async function luuDonGiuHang(don: DonGiuHangChiTiet): Promise<void> {
  const admin = canAdminHoacKhoTam();
  if (!admin) {
    layKhoGiuHangLocal().unshift(don);
    return;
  }
  const { error: errGiuHang } = await admin.from("giu_hang").insert({
    id: don.id,
    ma: don.ma,
    khach_id: don.khachId || null,
    ten: don.ten,
    sdt: don.sdt,
    email: don.email || null,
    ngay_den: don.ngayDen,
    het_han: don.hetHan,
    trang_thai: don.trangThai,
    tong_uoc_tinh: don.tongUocTinh,
    qua_du_kien: don.quaDuKien || null,
    ghi_chu: don.ghiChu || null,
  });
  if (errGiuHang) {
    // P0001: trigger giới hạn 3 mã; 23505: trùng mã đang giữ; 23503: khach_id không tồn tại
    throw new LoiKhoGiuHang(errGiuHang.message, errGiuHang.code);
  }
  if (don.cacDong.length > 0) {
    const { error: errDong } = await admin.from("giu_hang_dong").insert(
      don.cacDong.map((d) => ({
        giu_hang_id: don.id,
        san_pham_id: d.loai === "san_pham" ? d.id : null,
        deal_id: d.loai === "combo" ? d.id : null,
        so_luong: d.soLuong,
        gia_uoc_tinh: d.giaSauUuDai,
      })),
    );
    if (errDong) {
      await admin.from("giu_hang").delete().eq("id", don.id);
      throw new LoiKhoGiuHang(errDong.message, errDong.code);
    }
  }
}

export async function layDonGiuHangTheoMa(
  ma: string,
): Promise<DonGiuHangChiTiet | null> {
  const admin = canAdminHoacKhoTam();
  if (!admin) {
    const kho = layKhoGiuHangLocal();
    return kho.find((d) => d.ma.toUpperCase() === ma.toUpperCase()) ?? null;
  }
  {
    {
      try {
        const { data: gh, error } = await admin
          .from("giu_hang")
          .select(
            "*, giu_hang_dong(*, san_pham(ten_hien_thi, thuong_hieu), deal(ten))",
          )
          .eq("ma", ma.toUpperCase())
          .order("tao_luc", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && gh) {
          return {
            id: gh.id,
            ma: gh.ma,
            khachId: gh.khach_id,
            ten: gh.ten,
            sdt: gh.sdt,
            email: gh.email,
            ngayDen: gh.ngay_den,
            hetHan: gh.het_han,
            trangThai: gh.trang_thai,
            tongUocTinh: gh.tong_uoc_tinh,
            quaDuKien: gh.qua_du_kien,
            ghiChu: gh.ghi_chu,
            taoLuc: gh.tao_luc,
            cacDong: (
              (gh.giu_hang_dong || []) as Array<{
                san_pham_id: string | null;
                deal_id: string | null;
                so_luong: number;
                gia_uoc_tinh: number;
                san_pham?: {
                  ten_hien_thi?: string;
                  thuong_hieu?: string;
                } | null;
                deal?: { ten?: string } | null;
              }>
            ).map((d) => ({
              id: d.san_pham_id || d.deal_id || "",
              ten:
                d.san_pham?.ten_hien_thi ||
                d.deal?.ten ||
                d.san_pham_id ||
                d.deal_id ||
                "",
              thuongHieu: d.san_pham?.thuong_hieu || "",
              soLuong: d.so_luong,
              giaSauUuDai: d.gia_uoc_tinh,
              loai: d.deal_id ? ("combo" as const) : ("san_pham" as const),
            })),
          };
        }
      } catch (e) {
        console.error("[GiuHang] Lỗi đọc mã", ma, e);
      }
    }
  }

  return null;
}

export async function capNhatHetHanCacDon(): Promise<number> {
  const admin = canAdminHoacKhoTam();
  if (admin) {
    const { data, error } = await admin.rpc("het_han_giu_hang");
    if (error) throw new LoiKhoGiuHang(error.message, error.code);
    return typeof data === "number" ? data : 0;
  }
  let soLuong = 0;
  const now = new Date();
  for (const d of layKhoGiuHangLocal()) {
    if (
      (d.trangThai === "moi" || d.trangThai === "da_soan") &&
      new Date(d.hetHan) < now
    ) {
      d.trangThai = "het_han";
      soLuong++;
    }
  }
  return soLuong;
}

export async function layDanhSachDonGiuHangHomNay(): Promise<
  DonGiuHangChiTiet[]
> {
  const admin = canAdminHoacKhoTam();
  if (!admin) return [...layKhoGiuHangLocal()];
  // Đơn còn liên quan: ngày đến từ hôm qua trở đi (giờ Việt Nam)
  const homQua = new Date(Date.now() + 7 * 3600000 - 86400000)
    .toISOString()
    .slice(0, 10);
  const { data, error } = await admin
    .from("giu_hang")
    .select(
      "*, giu_hang_dong(*, san_pham(ten_hien_thi, thuong_hieu), deal(ten))",
    )
    .gte("ngay_den", homQua)
    .order("tao_luc", { ascending: false })
    .limit(300);
  if (error) throw new LoiKhoGiuHang(error.message, error.code);
  return (data ?? []).map((gh) => ({
    id: gh.id,
    ma: gh.ma,
    khachId: gh.khach_id,
    ten: gh.ten,
    sdt: gh.sdt,
    email: gh.email,
    ngayDen: gh.ngay_den,
    hetHan: gh.het_han,
    trangThai: gh.trang_thai,
    tongUocTinh: gh.tong_uoc_tinh,
    quaDuKien: gh.qua_du_kien,
    ghiChu: gh.ghi_chu,
    taoLuc: gh.tao_luc,
    cacDong: (
      (gh.giu_hang_dong || []) as Array<{
        san_pham_id: string | null;
        deal_id: string | null;
        so_luong: number;
        gia_uoc_tinh: number;
        san_pham?: { ten_hien_thi?: string; thuong_hieu?: string } | null;
        deal?: { ten?: string } | null;
      }>
    ).map((d) => ({
      id: d.san_pham_id || d.deal_id || "",
      ten:
        d.san_pham?.ten_hien_thi ||
        d.deal?.ten ||
        d.san_pham_id ||
        d.deal_id ||
        "",
      thuongHieu: d.san_pham?.thuong_hieu || "",
      soLuong: d.so_luong,
      giaSauUuDai: d.gia_uoc_tinh,
      loai: d.deal_id ? ("combo" as const) : ("san_pham" as const),
    })),
  }));
}

export async function capNhatTrangThaiDon(
  ma: string,
  trangThai: DonGiuHangChiTiet["trangThai"],
  nguoiCapNhat = "Quầy VIVE",
  nguoiCapNhatId: string | null = null,
): Promise<boolean> {
  const now = new Date();
  const gioPhut = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const nhanTrangThai: Record<string, string> = {
    moi: "Mới",
    da_soan: "Đã soạn",
    da_lay: "Đã lấy",
    huy: "Hủy",
    het_han: "Hết hạn",
  };
  const logStr = `${nhanTrangThai[trangThai] || trangThai} bởi ${nguoiCapNhat} lúc ${gioPhut}`;

  const admin = canAdminHoacKhoTam();
  if (!admin) {
    const don = layKhoGiuHangLocal().find(
      (d) => d.ma.toUpperCase() === ma.toUpperCase(),
    );
    if (!don) return false;
    don.trangThai = trangThai;
    don.ghiChu = don.ghiChu ? `${don.ghiChu} · ${logStr}` : logStr;
    return true;
  }
  // Chỉ đổi đơn đang hiệu lực mới nhất mang mã này (mã 4 số có thể được dùng lại sau khi hết hạn)
  const { data: don, error: errDoc } = await admin
    .from("giu_hang")
    .select("id, ghi_chu")
    .eq("ma", ma.toUpperCase())
    .order("tao_luc", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (errDoc) throw new LoiKhoGiuHang(errDoc.message, errDoc.code);
  if (!don) return false;
  const { error } = await admin
    .from("giu_hang")
    .update({
      trang_thai: trangThai,
      ghi_chu: don.ghi_chu ? `${don.ghi_chu} · ${logStr}` : logStr,
      cap_nhat_luc: now.toISOString(),
      cap_nhat_boi: nguoiCapNhatId,
    })
    .eq("id", don.id);
  if (error) throw new LoiKhoGiuHang(error.message, error.code);
  return true;
}
