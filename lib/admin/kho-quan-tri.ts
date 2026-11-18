import { layAdmin, choPhepKhoTam } from "@/lib/supabase/admin";
import { hopNhatDongDeal } from "@/lib/supabase/du-lieu";
import { SAN_PHAM as SAN_PHAM_TINH, DEALS as DEALS_TINH } from "@/lib/data";
import {
  DealSchema,
  SanPhamSchema,
  type ConHang,
  type Deal,
  type SanPham,
  type TrangThaiDeal,
} from "@/lib/data/types";
import { kiemTraBatDeal } from "./deal-rules";
import {
  apDungCapNhatTon,
  parseKiotVietCsv,
  type KiotVietImportResult,
} from "./kiotviet";

export interface ThongKeQuanTri {
  tongKhach: number;
  tongLuotQuet: number;
  tongThich: number;
  donGiuHang: number;
  donDaLay: number;
  tyLeLayPhanTram: number;
  khachDongYEmail: number;
}

export interface LichSuQuanTri {
  id: string;
  ten: string;
  moTa: string;
  taoLuc: string;
}

export interface KhachEmailItem {
  ten: string | null;
  email: string;
  taoLuc: string;
}

export interface DuLieuQuanTri {
  sanPham: SanPham[];
  deals: Deal[];
  thongKe: ThongKeQuanTri;
  lichSu: LichSuQuanTri[];
  danhSachEmail: KhachEmailItem[];
  cheDoDatabase: "supabase" | "dev_memory";
}

interface KhoQuanTriDev {
  sanPham: SanPham[];
  deals: Deal[];
  lichSu: LichSuQuanTri[];
  danhSachEmail: KhachEmailItem[];
  daChinhSua: boolean;
}

declare global {
  var __VIVE_QUAN_TRI_DEV__: KhoQuanTriDev | undefined;
}

function layKhoDev(): KhoQuanTriDev {
  if (!globalThis.__VIVE_QUAN_TRI_DEV__) {
    globalThis.__VIVE_QUAN_TRI_DEV__ = {
      sanPham: SAN_PHAM_TINH.map((sp) => ({ ...sp })),
      deals: DEALS_TINH.map((d) => ({ ...d })),
      lichSu: [],
      danhSachEmail: [
        {
          ten: "Minh Anh (mẫu)",
          email: "khach.deal@vive.vn",
          taoLuc: new Date().toISOString(),
        },
      ],
      daChinhSua: false,
    };
  }
  return globalThis.__VIVE_QUAN_TRI_DEV__;
}

/** Dữ liệu khách đọc từ server khi chạy dev/e2e chưa có Supabase thật. */
export function layDuLieuKhachDevNeuDaSua(): {
  sanPham: SanPham[];
  deals: Deal[];
} | null {
  if (layAdmin() || !choPhepKhoTam()) return null;
  const kho = layKhoDev();
  if (!kho.daChinhSua) return null;
  return {
    sanPham: kho.sanPham,
    deals: kho.deals,
  };
}

function dinhDangMoTaSuKien(ten: string, duLieu: Record<string, unknown> | null): string {
  if (!duLieu) return ten;
  const nguoi = typeof duLieu.nguoi === "string" ? duLieu.nguoi : "Quản trị";
  if (ten === "quan_tri_cap_nhat_deal") {
    return `${nguoi}: cập nhật deal ${duLieu.deal_id ?? ""} (hiển thị=${duLieu.hien_thi}, hết quà=${duLieu.het_qua})`;
  }
  if (ten === "quan_tri_cap_nhat_san_pham") {
    return `${nguoi}: cập nhật sản phẩm ${duLieu.san_pham_id ?? ""} (giá=${duLieu.gia_ban}, tồn=${duLieu.ton})`;
  }
  if (ten === "quan_tri_nhap_ton_kiotviet") {
    return `${nguoi}: nhập CSV KiotViet (${duLieu.so_luong_khop ?? 0} mã khớp, ${duLieu.so_luong_ve_khong ?? 0} mã hết hàng)`;
  }
  if (ten === "quan_tri_gui_email_deal") {
    return `${nguoi}: ${duLieu.gui_that ? "gửi email" : "gửi thử email"} "${duLieu.tieu_de ?? ""}" tới ${duLieu.email_nhan ?? ""}`;
  }
  return `${nguoi}: ${ten}`;
}

export async function layDuLieuQuanTriServer(): Promise<DuLieuQuanTri> {
  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    return {
      sanPham: kho.sanPham,
      deals: kho.deals,
      thongKe: {
        tongKhach: 24,
        tongLuotQuet: 312,
        tongThich: 118,
        donGiuHang: 6,
        donDaLay: 3,
        tyLeLayPhanTram: 50,
        khachDongYEmail: kho.danhSachEmail.length,
      },
      lichSu: kho.lichSu,
      danhSachEmail: kho.danhSachEmail,
      cheDoDatabase: "dev_memory",
    };
  }

  const [
    spRes,
    dealRes,
    khachCountRes,
    quetCountRes,
    thichCountRes,
    giuCountRes,
    daLayCountRes,
    emailListRes,
    suKienRes,
  ] = await Promise.all([
    admin.from("san_pham").select("*").order("id"),
    admin.from("deal").select("*").order("id"),
    admin.from("khach").select("id", { count: "exact", head: true }),
    admin.from("luot_quet").select("id", { count: "exact", head: true }),
    admin
      .from("luot_quet")
      .select("id", { count: "exact", head: true })
      .eq("hanh_dong", "thich"),
    admin.from("giu_hang").select("id", { count: "exact", head: true }),
    admin
      .from("giu_hang")
      .select("id", { count: "exact", head: true })
      .eq("trang_thai", "da_lay"),
    admin
      .from("khach")
      .select("ten, email, tao_luc")
      .eq("dong_y_email", true)
      .not("email", "is", null)
      .order("tao_luc", { ascending: false })
      .limit(100),
    admin
      .from("su_kien")
      .select("id, ten, du_lieu, tao_luc")
      .like("ten", "quan_tri_%")
      .order("tao_luc", { ascending: false })
      .limit(30),
  ]);

  if (spRes.error) throw new Error(`Lỗi đọc bảng san_pham: ${spRes.error.message}`);
  if (dealRes.error) throw new Error(`Lỗi đọc bảng deal: ${dealRes.error.message}`);

  const sanPham: SanPham[] = [];
  for (const row of spRes.data || []) {
    const parsed = SanPhamSchema.safeParse(row);
    if (parsed.success) sanPham.push(parsed.data);
  }

  const deals: Deal[] = [];
  for (const row of dealRes.data || []) {
    const parsed = DealSchema.safeParse(hopNhatDongDeal(row));
    if (parsed.success) deals.push(parsed.data);
  }

  const donGiuHang = giuCountRes.count ?? 0;
  const donDaLay = daLayCountRes.count ?? 0;
  const danhSachEmail: KhachEmailItem[] = (emailListRes.data || [])
    .filter((k) => Boolean(k.email))
    .map((k) => ({
      ten: k.ten ?? null,
      email: k.email as string,
      taoLuc: k.tao_luc ?? new Date().toISOString(),
    }));

  const lichSu: LichSuQuanTri[] = (suKienRes.data || []).map((ev) => ({
    id: String(ev.id),
    ten: ev.ten,
    moTa: dinhDangMoTaSuKien(
      ev.ten,
      (ev.du_lieu as Record<string, unknown> | null) ?? null,
    ),
    taoLuc: ev.tao_luc ?? new Date().toISOString(),
  }));

  return {
    sanPham,
    deals,
    thongKe: {
      tongKhach: khachCountRes.count ?? 0,
      tongLuotQuet: quetCountRes.count ?? 0,
      tongThich: thichCountRes.count ?? 0,
      donGiuHang,
      donDaLay,
      tyLeLayPhanTram:
        donGiuHang > 0 ? Math.round((donDaLay / donGiuHang) * 100) : 0,
      khachDongYEmail: danhSachEmail.length,
    },
    lichSu,
    danhSachEmail,
    cheDoDatabase: "supabase",
  };
}

export async function capNhatDealServer(input: {
  id: string;
  hienThi?: boolean;
  hetQua?: boolean;
  trangThai?: TrangThaiDeal;
  nguoiThucHien: string;
}): Promise<Deal> {
  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    const idx = kho.deals.findIndex((d) => d.id === input.id);
    if (idx < 0) throw new Error(`Không tìm thấy deal ${input.id}`);

    const dealCu = kho.deals[idx];
    const hienThiMoi = input.hienThi ?? dealCu.hien_thi;
    const kt = kiemTraBatDeal(dealCu, hienThiMoi);
    if (!kt.hopLe) throw new Error(kt.loi || "Không thể bật deal may rủi");

    const dealMoi: Deal = {
      ...dealCu,
      hien_thi: hienThiMoi,
      het_qua: input.hetQua ?? dealCu.het_qua,
      trang_thai: input.trangThai ?? dealCu.trang_thai,
    };
    kho.deals[idx] = dealMoi;
    kho.daChinhSua = true;
    kho.lichSu.unshift({
      id: `dev-${Date.now()}`,
      ten: "quan_tri_cap_nhat_deal",
      moTa: dinhDangMoTaSuKien("quan_tri_cap_nhat_deal", {
        nguoi: input.nguoiThucHien,
        deal_id: dealMoi.id,
        hien_thi: dealMoi.hien_thi,
        het_qua: dealMoi.het_qua,
      }),
      taoLuc: new Date().toISOString(),
    });
    return dealMoi;
  }

  const { data: row, error: fetchErr } = await admin
    .from("deal")
    .select("*")
    .eq("id", input.id)
    .maybeSingle();

  if (fetchErr) throw new Error(`Lỗi tìm deal: ${fetchErr.message}`);
  if (!row) throw new Error(`Không tìm thấy deal ${input.id}`);

  const parsed = DealSchema.safeParse(hopNhatDongDeal(row));
  if (!parsed.success) {
    throw new Error(`Dữ liệu deal ${input.id} không hợp lệ: ${parsed.error.message}`);
  }
  const dealCu = parsed.data;
  const hienThiMoi = input.hienThi ?? dealCu.hien_thi;
  const hetQuaMoi = input.hetQua ?? dealCu.het_qua;
  const trangThaiMoi = input.trangThai ?? dealCu.trang_thai;

  const kt = kiemTraBatDeal(dealCu, hienThiMoi);
  if (!kt.hopLe) throw new Error(kt.loi || "Không thể bật deal may rủi");

  const duLieuJsonMoi = {
    ...((row.du_lieu as Record<string, unknown>) || {}),
    hien_thi: hienThiMoi,
    het_qua: hetQuaMoi,
    trang_thai: trangThaiMoi,
  };

  const { data: updatedRow, error: updateErr } = await admin
    .from("deal")
    .update({
      hien_thi: hienThiMoi,
      het_qua: hetQuaMoi,
      trang_thai: trangThaiMoi,
      du_lieu: duLieuJsonMoi,
      cap_nhat: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (updateErr) throw new Error(`Không thể lưu deal: ${updateErr.message}`);

  const { error: logErr } = await admin.from("su_kien").insert({
    ten: "quan_tri_cap_nhat_deal",
    du_lieu: {
      deal_id: input.id,
      nguoi: input.nguoiThucHien,
      hien_thi: hienThiMoi,
      het_qua: hetQuaMoi,
      trang_thai: trangThaiMoi,
    },
  });
  if (logErr) throw new Error(`Không ghi được lịch sử deal: ${logErr.message}`);

  return DealSchema.parse(hopNhatDongDeal(updatedRow));
}

export async function capNhatSanPhamServer(input: {
  id: string;
  hienThi?: boolean;
  giaBan?: number;
  ton?: number;
  conHang?: ConHang;
  nguoiThucHien: string;
}): Promise<SanPham> {
  if (input.giaBan !== undefined && (!Number.isInteger(input.giaBan) || input.giaBan <= 0)) {
    throw new Error("Giá bán phải là số nguyên dương");
  }
  if (input.ton !== undefined && (!Number.isInteger(input.ton) || input.ton < 0)) {
    throw new Error("Số lượng tồn phải >= 0");
  }

  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    const idx = kho.sanPham.findIndex((sp) => sp.id === input.id);
    if (idx < 0) throw new Error(`Không tìm thấy sản phẩm ${input.id}`);

    const spCu = kho.sanPham[idx];
    const tonMoi = input.ton !== undefined ? input.ton : spCu.ton;
    const conHangMoi: ConHang =
      input.conHang ??
      (input.ton !== undefined ? (input.ton > 0 ? "true" : "false") : spCu.con_hang);

    const spMoi: SanPham = {
      ...spCu,
      hien_thi: input.hienThi ?? spCu.hien_thi,
      gia_ban: input.giaBan ?? spCu.gia_ban,
      ton: tonMoi,
      con_hang: conHangMoi,
    };
    kho.sanPham[idx] = spMoi;
    kho.daChinhSua = true;
    kho.lichSu.unshift({
      id: `dev-${Date.now()}`,
      ten: "quan_tri_cap_nhat_san_pham",
      moTa: dinhDangMoTaSuKien("quan_tri_cap_nhat_san_pham", {
        nguoi: input.nguoiThucHien,
        san_pham_id: spMoi.id,
        gia_ban: spMoi.gia_ban,
        ton: spMoi.ton,
      }),
      taoLuc: new Date().toISOString(),
    });
    return spMoi;
  }

  const { data: row, error: fetchErr } = await admin
    .from("san_pham")
    .select("*")
    .eq("id", input.id)
    .maybeSingle();

  if (fetchErr) throw new Error(`Lỗi tìm sản phẩm: ${fetchErr.message}`);
  if (!row) throw new Error(`Không tìm thấy sản phẩm ${input.id}`);

  const spCu = SanPhamSchema.parse(row);
  const tonMoi = input.ton !== undefined ? input.ton : spCu.ton;
  const giaBanMoi = input.giaBan ?? spCu.gia_ban;
  const hienThiMoi = input.hienThi ?? spCu.hien_thi;
  const conHangMoi: ConHang =
    input.conHang ??
    (input.ton !== undefined ? (input.ton > 0 ? "true" : "false") : spCu.con_hang);

  const { data: updatedRow, error: updateErr } = await admin
    .from("san_pham")
    .update({
      hien_thi: hienThiMoi,
      gia_ban: giaBanMoi,
      ton: tonMoi,
      con_hang: conHangMoi,
      cap_nhat: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (updateErr) throw new Error(`Không thể lưu sản phẩm: ${updateErr.message}`);

  const { error: logErr } = await admin.from("su_kien").insert({
    ten: "quan_tri_cap_nhat_san_pham",
    du_lieu: {
      san_pham_id: input.id,
      nguoi: input.nguoiThucHien,
      hien_thi: hienThiMoi,
      gia_ban: giaBanMoi,
      ton: tonMoi,
      con_hang: conHangMoi,
    },
  });
  if (logErr) throw new Error(`Không ghi được lịch sử sản phẩm: ${logErr.message}`);

  return SanPhamSchema.parse(updatedRow);
}

export async function xemTruocCsvKiotVietServer(
  csvContent: string,
): Promise<KiotVietImportResult> {
  const data = await layDuLieuQuanTriServer();
  return parseKiotVietCsv(csvContent, data.sanPham);
}

export async function xacNhanNhapTonKiotVietServer(
  csvContent: string,
  nguoiThucHien: string,
): Promise<{ ketQua: KiotVietImportResult; sanPham: SanPham[] }> {
  const duLieu = await layDuLieuQuanTriServer();
  const ketQua = parseKiotVietCsv(csvContent, duLieu.sanPham);
  if (!ketQua.thanhCong) {
    throw new Error(ketQua.loi || "File CSV KiotViet không hợp lệ");
  }
  if (ketQua.thayDoi.length === 0) {
    throw new Error("Không có mã sản phẩm nào khớp để cập nhật");
  }

  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    kho.sanPham = apDungCapNhatTon(kho.sanPham, ketQua.thayDoi);
    kho.daChinhSua = true;
    kho.lichSu.unshift({
      id: `dev-${Date.now()}`,
      ten: "quan_tri_nhap_ton_kiotviet",
      moTa: dinhDangMoTaSuKien("quan_tri_nhap_ton_kiotviet", {
        nguoi: nguoiThucHien,
        so_luong_khop: ketQua.soLuongKhop,
        so_luong_ve_khong: ketQua.soLuongVeKhong,
      }),
      taoLuc: new Date().toISOString(),
    });
    return { ketQua, sanPham: kho.sanPham };
  }

  const now = new Date().toISOString();
  for (const td of ketQua.thayDoi) {
    const updateBody: Record<string, unknown> = {
      ton: td.tonMoi,
      con_hang: td.tonMoi > 0 ? "true" : "false",
      cap_nhat: now,
    };
    if (td.giaBanMoi !== undefined) {
      updateBody.gia_ban = td.giaBanMoi;
    }

    const { error: upErr } = await admin
      .from("san_pham")
      .update(updateBody)
      .eq("id", td.sanPhamId);

    if (upErr) {
      throw new Error(`Lỗi cập nhật tồn mã ${td.sanPhamId}: ${upErr.message}`);
    }
  }

  const { error: logErr } = await admin.from("su_kien").insert({
    ten: "quan_tri_nhap_ton_kiotviet",
    du_lieu: {
      nguoi: nguoiThucHien,
      so_luong_khop: ketQua.soLuongKhop,
      so_luong_ve_khong: ketQua.soLuongVeKhong,
    },
  });
  if (logErr) throw new Error(`Không ghi được lịch sử nhập CSV: ${logErr.message}`);

  const duLieuMoi = await layDuLieuQuanTriServer();
  return { ketQua, sanPham: duLieuMoi.sanPham };
}

export async function ghiNhanGuiEmailQuanTriServer(input: {
  tieuDe: string;
  noiDung: string;
  emailNhan: string;
  guiThat: boolean;
  nguoiThucHien: string;
}): Promise<{ ok: true; thongBao: string }> {
  if (!input.tieuDe.trim() || !input.noiDung.trim() || !input.emailNhan.trim()) {
    throw new Error("Vui lòng nhập đủ tiêu đề, nội dung và email nhận.");
  }

  if (process.env.VIVE_BAT_GUI_EMAIL !== "1") {
    throw new Error("Chưa gửi được email: cần tên miền và task W018.");
  }

  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    kho.lichSu.unshift({
      id: `dev-${Date.now()}`,
      ten: "quan_tri_gui_email_deal",
      moTa: dinhDangMoTaSuKien("quan_tri_gui_email_deal", {
        nguoi: input.nguoiThucHien,
        tieu_de: input.tieuDe,
        email_nhan: input.emailNhan,
        gui_that: input.guiThat,
      }),
      taoLuc: new Date().toISOString(),
    });
    return {
      ok: true,
      thongBao: input.guiThat
        ? `Đã ghi nhận yêu cầu gửi email deal tới ${input.emailNhan} (chế độ thử dev).`
        : `Đã gửi thử xem trước tới ${input.emailNhan} (chế độ thử dev).`,
    };
  }

  const { error: logErr } = await admin.from("su_kien").insert({
    ten: "quan_tri_gui_email_deal",
    du_lieu: {
      nguoi: input.nguoiThucHien,
      tieu_de: input.tieuDe,
      noi_dung_do_dai: input.noiDung.length,
      email_nhan: input.emailNhan,
      gui_that: input.guiThat,
    },
  });
  if (logErr) throw new Error(`Lỗi ghi sự kiện gửi email: ${logErr.message}`);

  return {
    ok: true,
    thongBao: input.guiThat
      ? `Đã lưu chiến dịch email "${input.tieuDe}" (sẵn sàng phát qua Resend/SMTP đã cấu hình).`
      : `Đã ghi nhận bản gửi thử tới ${input.emailNhan}.`,
  };
}
