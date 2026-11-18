import { laySupabase } from "@/lib/supabase/client";
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

function coTheGoiSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("e2e.test") || url.includes("localhost.invalid")) {
    return false;
  }
  return true;
}

export async function demSoDonDangGiuTheoSdt(sdt: string): Promise<number> {
  if (coTheGoiSupabase()) {
    const supabase = laySupabase();
    if (supabase) {
      try {
        const { count, error } = await supabase
          .from("giu_hang")
          .select("*", { count: "exact", head: true })
          .eq("sdt", sdt)
          .in("trang_thai", ["moi", "da_soan"]);

        if (!error && typeof count === "number") {
          return count;
        }
      } catch {
        // Bỏ qua lỗi kết nối, fallback dưới
      }
    }
  }

  // Fallback local memory
  const kho = layKhoGiuHangLocal();
  return kho.filter(
    (d) => d.sdt === sdt && (d.trangThai === "moi" || d.trangThai === "da_soan")
  ).length;
}

export async function kiemTraMaDaTonTai(ma: string): Promise<boolean> {
  if (coTheGoiSupabase()) {
    const supabase = laySupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("giu_hang")
          .select("id")
          .eq("ma", ma)
          .in("trang_thai", ["moi", "da_soan"]);

        if (!error && data && data.length > 0) {
          return true;
        }
      } catch {
        // Fallback
      }
    }
  }

  const kho = layKhoGiuHangLocal();
  return kho.some(
    (d) => d.ma === ma && (d.trangThai === "moi" || d.trangThai === "da_soan")
  );
}

export async function luuDonGiuHang(don: DonGiuHangChiTiet): Promise<void> {
  // Luôn lưu bản sao vào kho local để /giu-hang/[ma] đọc nhanh
  const kho = layKhoGiuHangLocal();
  kho.unshift(don);

  if (coTheGoiSupabase()) {
    const supabase = laySupabase();
    if (supabase) {
      try {
        const { data: insertedGiuHang, error: errGiuHang } = await supabase
          .from("giu_hang")
          .insert({
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
          })
          .select()
          .single();

        if (errGiuHang) {
          console.warn("[GiuHang] Lỗi lưu giu_hang trên Supabase:", errGiuHang.message);
          return;
        }

        if (don.cacDong.length > 0 && insertedGiuHang) {
          const dongInserts = don.cacDong.map((d) => ({
            giu_hang_id: don.id,
            san_pham_id: d.loai === "san_pham" ? d.id : null,
            deal_id: d.loai === "combo" ? d.id : null,
            so_luong: d.soLuong,
            gia_uoc_tinh: d.giaSauUuDai,
          }));
          await supabase.from("giu_hang_dong").insert(dongInserts);
        }
      } catch (e) {
        console.warn("[GiuHang] Ngoại lệ lưu Supabase:", e);
      }
    }
  }
}

export async function layDonGiuHangTheoMa(
  ma: string
): Promise<DonGiuHangChiTiet | null> {
  const kho = layKhoGiuHangLocal();
  const local = kho.find((d) => d.ma.toUpperCase() === ma.toUpperCase());
  if (local) {
    return local;
  }

  if (coTheGoiSupabase()) {
    const supabase = laySupabase();
    if (supabase) {
      try {
        const { data: gh, error } = await supabase
          .from("giu_hang")
          .select("*, giu_hang_dong(*)")
          .eq("ma", ma)
          .single();

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
              }>
            ).map((d) => ({
              id: d.san_pham_id || d.deal_id || "",
              ten: d.san_pham_id || d.deal_id || "",
              thuongHieu: "",
              soLuong: d.so_luong,
              giaSauUuDai: d.gia_uoc_tinh,
              loai: d.deal_id ? ("combo" as const) : ("san_pham" as const),
            })),
          };
        }
      } catch {
        // Bỏ qua
      }
    }
  }

  return null;
}

export async function capNhatHetHanCacDon(): Promise<number> {
  let soLuong = 0;
  const now = new Date();

  // Cập nhật local
  const kho = layKhoGiuHangLocal();
  for (const d of kho) {
    if (
      (d.trangThai === "moi" || d.trangThai === "da_soan") &&
      new Date(d.hetHan) < now
    ) {
      d.trangThai = "het_han";
      soLuong++;
    }
  }

  const supabase = laySupabase();
  if (supabase) {
    try {
      // Thử gọi hàm RPC het_han_giu_hang
      const { data: rpcCount, error: rpcErr } = await supabase.rpc(
        "het_han_giu_hang"
      );
      if (!rpcErr && typeof rpcCount === "number") {
        return rpcCount;
      }

      // Fallback query update trực tiếp
      const { data, error } = await supabase
        .from("giu_hang")
        .update({ trang_thai: "het_han", cap_nhat_luc: now.toISOString() })
        .in("trang_thai", ["moi", "da_soan"])
        .lt("het_han", now.toISOString())
        .select("id");

      if (!error && data) {
        return data.length;
      }
    } catch {
      // Fallback
    }
  }

  return soLuong;
}

export async function layDanhSachDonGiuHangHomNay(): Promise<DonGiuHangChiTiet[]> {
  const kho = layKhoGiuHangLocal();
  if (coTheGoiSupabase()) {
    const supabase = laySupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("giu_hang")
          .select("*, giu_hang_dong(*)")
          .order("tao_luc", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((gh) => ({
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
              }>
            ).map((d) => ({
              id: d.san_pham_id || d.deal_id || "",
              ten: d.san_pham_id || d.deal_id || "",
              thuongHieu: "",
              soLuong: d.so_luong,
              giaSauUuDai: d.gia_uoc_tinh,
              loai: d.deal_id ? ("combo" as const) : ("san_pham" as const),
            })),
          }));
        }
      } catch {
        // Fallback
      }
    }
  }
  return [...kho];
}

export async function capNhatTrangThaiDon(
  ma: string,
  trangThai: DonGiuHangChiTiet["trangThai"],
  nguoiCapNhat = "Quầy VIVE"
): Promise<boolean> {
  const now = new Date();
  const gioPhut = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const nhanTrangThai: Record<string, string> = {
    moi: "Mới",
    da_soan: "Đã soạn",
    da_lay: "Đã lấy",
    huy: "Hủy",
    het_han: "Hết hạn",
  };
  const nhan = nhanTrangThai[trangThai] || trangThai;
  const logStr = `${nhan} bởi ${nguoiCapNhat} lúc ${gioPhut}`;

  // Cập nhật local
  const kho = layKhoGiuHangLocal();
  const don = kho.find((d) => d.ma.toUpperCase() === ma.toUpperCase());
  if (don) {
    don.trangThai = trangThai;
    don.ghiChu = don.ghiChu ? `${don.ghiChu} · ${logStr}` : logStr;
  }

  if (coTheGoiSupabase()) {
    const supabase = laySupabase();
    if (supabase) {
      try {
        await supabase
          .from("giu_hang")
          .update({
            trang_thai: trangThai,
            ghi_chu: don?.ghiChu || logStr,
            cap_nhat_luc: now.toISOString(),
          })
          .eq("ma", ma);
      } catch {
        // Fallback
      }
    }
  }

  return true;
}
