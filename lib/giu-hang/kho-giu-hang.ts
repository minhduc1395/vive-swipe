import { layAdmin, choPhepKhoTam } from "@/lib/supabase/admin";
import type { DonGiuHangChiTiet } from "./types";

declare global {
  var __VIVE_DON_GIU_HANG_DEV__: DonGiuHangChiTiet[] | undefined;
}

function layKhoGiuHangLocal(): DonGiuHangChiTiet[] {
  if (!globalThis.__VIVE_DON_GIU_HANG_DEV__) {
    // Khởi tạo sẵn một đơn mẫu VIVE-4821 cho màn demo nếu có
    globalThis.__VIVE_DON_GIU_HANG_DEV__ = [
      {
        id: "demo-vive-4821",
        ma: "VIVE-4821",
        ten: "Khách trải nghiệm",
        sdt: "0901234567",
        email: "khach@email.com",
        ngayDen: "2026-11-27",
        hetHan: "2026-11-27T21:00:00+07:00",
        trangThai: "moi",
        tongUocTinh: 1235000,
        quaDuKien: "1 ampoule LOPOE",
        taoLuc: new Date().toISOString(),
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
