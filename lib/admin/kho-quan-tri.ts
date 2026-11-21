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
import {
  chuanHoaSanPhamKho,
  thucThiSuaSanPhamRpc,
  type LichSuSanPhamItem,
  type NguonTruongLoai,
  type SanPhamKho,
  type ThayDoiSanPhamInput,
} from "./san-pham-kho";
import {
  GIOI_HAN_BYTE_EXCEL,
  phanTichFileExcelSanPham,
  taoFileExcelMau,
  xuatFileExcelSanPham,
  type KetQuaXemTruocExcel,
} from "./excel-san-pham";

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

export interface LoNhapLieuItem {
  id: string;
  ten_file: string;
  kenh: "excel_web" | "drive_ai" | "tay";
  trang_thai: "xem_truoc" | "da_ap_dung" | "huy" | "loi";
  so_dong: number;
  so_moi: number;
  so_sua: number;
  so_loi: number;
  ket_qua: KetQuaXemTruocExcel;
  duong_dan_bucket: string | null;
  boi: string | null;
  tao_luc: string;
  ap_dung_luc: string | null;
}

interface KhoQuanTriDev {
  sanPham: SanPham[];
  sanPhamKho: SanPhamKho[];
  lichSuSanPham: LichSuSanPhamItem[];
  loNhapLieu: LoNhapLieuItem[];
  tapTinNhapLieu: Record<string, string>;
  deals: Deal[];
  lichSu: LichSuQuanTri[];
  danhSachEmail: KhachEmailItem[];
  daChinhSua: boolean;
}

declare global {
  var __VIVE_QUAN_TRI_DEV__: KhoQuanTriDev | undefined;
}

const MA_MAU_AI_DEV: Record<
  string,
  { ten_en?: string; mo_ta_en?: string; url?: string }
> = {
  "LOPOE-CF": {
    ten_en: "LOPOE Better Balance Cleansing Foam 160ml",
    url: "https://lopoe.kr/products/cleansing-foam",
  },
  "LOPOE-AMP": {
    ten_en: "LOPOE Better Balance Ampoule 50ml",
    url: "https://lopoe.kr/products/ampoule",
  },
  "LOPOE-CR": {
    ten_en: "LOPOE Better Balance Moisture Cream 80ml",
    url: "https://lopoe.kr/products/moisture-cream",
  },
};

function taoDanhSachSanPhamKhoBanDau(): SanPhamKho[] {
  return SAN_PHAM_TINH.map((sp) => {
    const mauAi = MA_MAU_AI_DEV[sp.id];
    const nguonTruong: SanPhamKho["nguon_truong"] = {
      ten_hien_thi: { nguon: "dong_bo", luc: "2026-11-18T00:00:00.000Z" },
    };
    if (mauAi?.ten_en) {
      nguonTruong.ten_en = {
        nguon: "ai",
        boi: "AI dịch (W047)",
        luc: "2026-11-19T09:00:00.000Z",
        ...(mauAi.url ? { url: mauAi.url } : {}),
      };
    }
    return {
      ...sp,
      ten_en: mauAi?.ten_en ?? null,
      mo_ta_en: mauAi?.mo_ta_en ?? null,
      nguon_truong: nguonTruong,
    };
  });
}

function dongBoKhoSanPhamCoBanTuKho(kho: KhoQuanTriDev): void {
  kho.sanPham = kho.sanPhamKho.map((sp) => ({ ...sp }));
}

function dongBoKhoSanPhamKhoTuCoBan(kho: KhoQuanTriDev): void {
  const byId = new Map(kho.sanPham.map((sp) => [sp.id, sp]));
  kho.sanPhamKho = kho.sanPhamKho.map((spKho) => {
    const sp = byId.get(spKho.id);
    if (!sp) return spKho;
    return {
      ...spKho,
      gia_goc: sp.gia_goc,
      gia_ban: sp.gia_ban,
      ton: sp.ton,
      con_hang: sp.con_hang,
      hien_thi: sp.hien_thi,
    };
  });
}

function layKhoDev(): KhoQuanTriDev {
  if (!globalThis.__VIVE_QUAN_TRI_DEV__) {
    const sanPhamKho = taoDanhSachSanPhamKhoBanDau();
    globalThis.__VIVE_QUAN_TRI_DEV__ = {
      sanPham: sanPhamKho.map((sp) => ({ ...sp })),
      sanPhamKho,
      lichSuSanPham: [],
      loNhapLieu: [],
      tapTinNhapLieu: {},
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
  if (!globalThis.__VIVE_QUAN_TRI_DEV__.loNhapLieu) {
    globalThis.__VIVE_QUAN_TRI_DEV__.loNhapLieu = [];
  }
  if (!globalThis.__VIVE_QUAN_TRI_DEV__.tapTinNhapLieu) {
    globalThis.__VIVE_QUAN_TRI_DEV__.tapTinNhapLieu = {};
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
    dongBoKhoSanPhamKhoTuCoBan(kho);
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
    dongBoKhoSanPhamKhoTuCoBan(kho);
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

export async function layDanhSachSanPhamKhoServer(): Promise<{
  sanPham: SanPhamKho[];
  lichSu: LichSuSanPhamItem[];
  cheDoDatabase: "supabase" | "dev_memory";
}> {
  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    return {
      sanPham: kho.sanPhamKho,
      lichSu: kho.lichSuSanPham,
      cheDoDatabase: "dev_memory",
    };
  }

  const [spRes, lsRes] = await Promise.all([
    admin.from("san_pham").select("*").order("id"),
    admin
      .from("lich_su_san_pham")
      .select("id, san_pham_id, truong, gia_tri_cu, gia_tri_moi, nguon, boi, luc")
      .order("luc", { ascending: false })
      .limit(200),
  ]);

  if (spRes.error) {
    throw new Error(`Lỗi đọc bảng san_pham: ${spRes.error.message}`);
  }
  if (lsRes.error) {
    throw new Error(`Lỗi đọc bảng lich_su_san_pham: ${lsRes.error.message}`);
  }

  const sanPham: SanPhamKho[] = [];
  for (const row of spRes.data || []) {
    const sp = chuanHoaSanPhamKho(row as Record<string, unknown>);
    if (sp) sanPham.push(sp);
  }

  const lichSu: LichSuSanPhamItem[] = (lsRes.data || []).map((r) => ({
    id: Number(r.id),
    san_pham_id: String(r.san_pham_id),
    truong: String(r.truong),
    gia_tri_cu: r.gia_tri_cu,
    gia_tri_moi: r.gia_tri_moi,
    nguon: (r.nguon as NguonTruongLoai) || "dong_bo",
    boi: r.boi ? String(r.boi) : null,
    luc: String(r.luc || new Date().toISOString()),
  }));

  return { sanPham, lichSu, cheDoDatabase: "supabase" };
}

export async function layLichSuSanPhamServer(
  sanPhamId: string,
): Promise<LichSuSanPhamItem[]> {
  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    return layKhoDev().lichSuSanPham.filter((ls) => ls.san_pham_id === sanPhamId);
  }

  const { data, error } = await admin
    .from("lich_su_san_pham")
    .select("id, san_pham_id, truong, gia_tri_cu, gia_tri_moi, nguon, boi, luc")
    .eq("san_pham_id", sanPhamId)
    .order("luc", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Lỗi đọc lịch sử sản phẩm ${sanPhamId}: ${error.message}`);
  }

  return (data || []).map((r) => ({
    id: Number(r.id),
    san_pham_id: String(r.san_pham_id),
    truong: String(r.truong),
    gia_tri_cu: r.gia_tri_cu,
    gia_tri_moi: r.gia_tri_moi,
    nguon: (r.nguon as NguonTruongLoai) || "dong_bo",
    boi: r.boi ? String(r.boi) : null,
    luc: String(r.luc || new Date().toISOString()),
  }));
}

export async function suaSanPhamKhoServer(params: {
  id: string;
  thayDoi: ThayDoiSanPhamInput;
  nguon: NguonTruongLoai;
  boi: string;
  vaiTro: "kho" | "quan_tri";
}): Promise<{
  sanPham: SanPhamKho;
  lichSu: LichSuSanPhamItem[];
}> {
  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    const kq = thucThiSuaSanPhamRpc(kho.sanPhamKho, kho.lichSuSanPham, {
      id: params.id,
      thayDoi: params.thayDoi,
      nguon: params.nguon,
      boi: params.boi,
      vaiTro: params.vaiTro,
    });
    kho.sanPhamKho = kq.danhSachMoi;
    kho.lichSuSanPham = kq.lichSuMoi;
    dongBoKhoSanPhamCoBanTuKho(kho);
    kho.daChinhSua = true;
    kho.lichSu.unshift({
      id: `dev-kho-${Date.now()}`,
      ten: "quan_tri_sua_san_pham_kho",
      moTa: `${params.boi} (${params.vaiTro}): cập nhật thông tin ${kq.sanPham.id}`,
      taoLuc: new Date().toISOString(),
    });
    return {
      sanPham: kq.sanPham,
      lichSu: kq.lichSuMoi.filter((ls) => ls.san_pham_id === kq.sanPham.id),
    };
  }

  const { data, error } = await admin.rpc("sua_san_pham", {
    p_id: params.id,
    p_thay_doi: {
      ...params.thayDoi,
      _vai_tro: params.vaiTro,
    },
    p_nguon: params.nguon,
    p_boi: params.boi,
  });

  if (error) {
    throw new Error(`Lỗi RPC sua_san_pham: ${error.message}`);
  }

  const spMoi = chuanHoaSanPhamKho(data as Record<string, unknown>);
  if (!spMoi) {
    throw new Error(`Dữ liệu trả về từ sua_san_pham không hợp lệ cho mã ${params.id}`);
  }

  const lichSu = await layLichSuSanPhamServer(params.id);
  return { sanPham: spMoi, lichSu };
}

function lamSachTenFileNhapLieu(tenFile: string): string {
  return tenFile
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "nhap-lieu.xlsx";
}

function chuanHoaDongLoNhapLieu(row: Record<string, unknown>): LoNhapLieuItem {
  const ketQuaRaw = (row.ket_qua && typeof row.ket_qua === "object"
    ? row.ket_qua
    : {}) as Partial<KetQuaXemTruocExcel> & { duong_dan_bucket?: string };

  const tenFile = String(row.ten_file || "nhap-lieu.xlsx");
  return {
    id: String(row.id),
    ten_file: tenFile,
    kenh: (row.kenh as LoNhapLieuItem["kenh"]) || "excel_web",
    trang_thai: (row.trang_thai as LoNhapLieuItem["trang_thai"]) || "xem_truoc",
    so_dong: Number(row.so_dong ?? ketQuaRaw.tongSoDong ?? 0),
    so_moi: Number(row.so_moi ?? ketQuaRaw.soMaMoi ?? 0),
    so_sua: Number(row.so_sua ?? ketQuaRaw.soMaSua ?? 0),
    so_loi: Number(row.so_loi ?? ketQuaRaw.soDongLoi ?? 0),
    ket_qua: {
      hopLe: Boolean(ketQuaRaw.hopLe ?? false),
      loiChung: ketQuaRaw.loiChung ?? null,
      tenFile: ketQuaRaw.tenFile || tenFile,
      tongSoDong: Number(ketQuaRaw.tongSoDong ?? row.so_dong ?? 0),
      soMaMoi: Number(ketQuaRaw.soMaMoi ?? row.so_moi ?? 0),
      soMaSua: Number(ketQuaRaw.soMaSua ?? row.so_sua ?? 0),
      soDongKhongDoi: Number(ketQuaRaw.soDongKhongDoi ?? 0),
      soDongLoi: Number(ketQuaRaw.soDongLoi ?? row.so_loi ?? 0),
      dongHopLe: Array.isArray(ketQuaRaw.dongHopLe) ? ketQuaRaw.dongHopLe : [],
      dongLoi: Array.isArray(ketQuaRaw.dongLoi) ? ketQuaRaw.dongLoi : [],
    },
    duong_dan_bucket: ketQuaRaw.duong_dan_bucket ?? null,
    boi: row.boi ? String(row.boi) : null,
    tao_luc: String(row.tao_luc || new Date().toISOString()),
    ap_dung_luc: row.ap_dung_luc ? String(row.ap_dung_luc) : null,
  };
}

export async function taoBufferFileExcelMauServer(): Promise<Buffer> {
  return taoFileExcelMau();
}

export async function xuatBufferFileExcelSanPhamServer(): Promise<{
  buffer: Buffer;
  soSanPham: number;
}> {
  const { sanPham } = await layDanhSachSanPhamKhoServer();
  const buffer = await xuatFileExcelSanPham(sanPham);
  return { buffer, soSanPham: sanPham.length };
}

export async function layDanhSachLoNhapLieuServer(): Promise<LoNhapLieuItem[]> {
  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    return layKhoDev().loNhapLieu.slice(0, 30);
  }

  const { data, error } = await admin
    .from("lo_nhap_lieu")
    .select(
      "id, ten_file, kenh, trang_thai, so_dong, so_moi, so_sua, so_loi, ket_qua, boi, tao_luc, ap_dung_luc",
    )
    .order("tao_luc", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Lỗi đọc bảng lo_nhap_lieu: ${error.message}`);
  }
  return (data || []).map((r) =>
    chuanHoaDongLoNhapLieu(r as Record<string, unknown>),
  );
}

export async function taoLoXemTruocExcelServer(params: {
  tenFile: string;
  buffer: Buffer;
  boi: string;
  vaiTro: "kho" | "quan_tri";
}): Promise<LoNhapLieuItem> {
  const tenFile = params.tenFile.trim() || "san-pham.xlsx";
  if (params.buffer.byteLength > GIOI_HAN_BYTE_EXCEL) {
    throw new Error("Dung lượng file vượt quá giới hạn 5 MB.");
  }
  const tenLower = tenFile.toLowerCase();
  if (!tenLower.endsWith(".xlsx") && !tenLower.endsWith(".csv")) {
    throw new Error("Chỉ hỗ trợ file định dạng .xlsx hoặc .csv.");
  }

  const { sanPham } = await layDanhSachSanPhamKhoServer();
  const ketQua = await phanTichFileExcelSanPham({
    buffer: params.buffer,
    tenFile,
    danhSachHienTai: sanPham,
    vaiTro: params.vaiTro,
  });

  const trangThai: LoNhapLieuItem["trang_thai"] =
    !ketQua.loiChung && ketQua.dongHopLe.length > 0 ? "xem_truoc" : "loi";
  const now = new Date().toISOString();
  const duongDanBucket = `excel/${now.slice(0, 7)}/${Date.now()}_${lamSachTenFileNhapLieu(tenFile)}`;

  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    const maLo = `lo-dev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    kho.tapTinNhapLieu[duongDanBucket] = params.buffer.toString("base64");
    const loMoi: LoNhapLieuItem = {
      id: maLo,
      ten_file: tenFile,
      kenh: "excel_web",
      trang_thai: trangThai,
      so_dong: ketQua.tongSoDong,
      so_moi: ketQua.soMaMoi,
      so_sua: ketQua.soMaSua,
      so_loi: ketQua.soDongLoi,
      ket_qua: ketQua,
      duong_dan_bucket: duongDanBucket,
      boi: params.boi,
      tao_luc: now,
      ap_dung_luc: null,
    };
    kho.loNhapLieu.unshift(loMoi);
    return loMoi;
  }

  const contentType = tenLower.endsWith(".csv")
    ? "text/csv"
    : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const { error: uploadErr } = await admin.storage
    .from("nhap-lieu")
    .upload(duongDanBucket, params.buffer, {
      contentType,
      upsert: false,
    });
  if (uploadErr) {
    throw new Error(`Không lưu được file vào bucket nhap-lieu: ${uploadErr.message}`);
  }

  const { data: loRow, error: insErr } = await admin
    .from("lo_nhap_lieu")
    .insert({
      ten_file: tenFile,
      kenh: "excel_web",
      trang_thai: trangThai,
      so_dong: ketQua.tongSoDong,
      so_moi: ketQua.soMaMoi,
      so_sua: ketQua.soMaSua,
      so_loi: ketQua.soDongLoi,
      ket_qua: {
        ...ketQua,
        duong_dan_bucket: duongDanBucket,
      },
      boi: params.boi,
    })
    .select(
      "id, ten_file, kenh, trang_thai, so_dong, so_moi, so_sua, so_loi, ket_qua, boi, tao_luc, ap_dung_luc",
    )
    .single();

  if (insErr) {
    throw new Error(`Không ghi được bản ghi lo_nhap_lieu: ${insErr.message}`);
  }

  return chuanHoaDongLoNhapLieu(loRow as Record<string, unknown>);
}

export async function apDungLoExcelServer(params: {
  maLo: string;
  boi: string;
  vaiTro: "kho" | "quan_tri";
}): Promise<{
  lo: LoNhapLieuItem;
  soMaDaGhi: number;
}> {
  const maLo = params.maLo.trim();
  if (!maLo) {
    throw new Error("Thiếu mã lô nhập liệu.");
  }

  const admin = layAdmin();
  if (!admin) {
    if (!choPhepKhoTam()) {
      throw new Error("Chưa cấu hình khóa dịch vụ Supabase (layAdmin)");
    }
    const kho = layKhoDev();
    const lo = kho.loNhapLieu.find((item) => item.id === maLo);
    if (!lo) {
      throw new Error(`Không tìm thấy lô nhập liệu ${maLo}.`);
    }
    if (lo.trang_thai === "da_ap_dung") {
      throw new Error("Lô nhập liệu này đã được áp dụng trước đó.");
    }
    if (lo.ket_qua.loiChung || lo.ket_qua.dongHopLe.length === 0) {
      throw new Error("Lô nhập liệu không có dòng hợp lệ nào để áp dụng.");
    }

    // Áp dụng nguyên khối (atomic): lỗi ở bất kỳ dòng nào sẽ giữ nguyên trạng thái kho cũ
    const now = new Date().toISOString();
    let dsTam = [...kho.sanPhamKho];
    let lsTam = [...kho.lichSuSanPham];

    for (const dong of lo.ket_qua.dongHopLe) {
      const kq = thucThiSuaSanPhamRpc(dsTam, lsTam, {
        id: dong.id,
        thayDoi: dong.thayDoi,
        nguon: "excel",
        boi: params.boi,
        vaiTro: params.vaiTro,
        now,
      });
      dsTam = kq.danhSachMoi;
      lsTam = kq.lichSuMoi;
    }

    kho.sanPhamKho = dsTam;
    kho.lichSuSanPham = lsTam;
    dongBoKhoSanPhamCoBanTuKho(kho);
    kho.daChinhSua = true;
    lo.trang_thai = "da_ap_dung";
    lo.ap_dung_luc = now;
    kho.lichSu.unshift({
      id: `dev-excel-${Date.now()}`,
      ten: "quan_tri_nhap_excel_san_pham",
      moTa: `${params.boi} (${params.vaiTro}): áp dụng lô Excel ${lo.ten_file} (${lo.ket_qua.dongHopLe.length} mã)`,
      taoLuc: now,
    });

    return {
      lo,
      soMaDaGhi: lo.ket_qua.dongHopLe.length,
    };
  }

  const { data: loRow, error: loErr } = await admin
    .from("lo_nhap_lieu")
    .select(
      "id, ten_file, kenh, trang_thai, so_dong, so_moi, so_sua, so_loi, ket_qua, boi, tao_luc, ap_dung_luc",
    )
    .eq("id", maLo)
    .single();

  if (loErr || !loRow) {
    throw new Error(`Không tìm thấy lô nhập liệu ${maLo}: ${loErr?.message || ""}`);
  }

  const lo = chuanHoaDongLoNhapLieu(loRow as Record<string, unknown>);
  if (lo.trang_thai === "da_ap_dung") {
    throw new Error("Lô nhập liệu này đã được áp dụng trước đó.");
  }
  if (lo.ket_qua.loiChung || lo.ket_qua.dongHopLe.length === 0) {
    throw new Error("Lô nhập liệu không có dòng hợp lệ nào để áp dụng.");
  }

  const danhSachRpc = lo.ket_qua.dongHopLe.map((dong) => ({
    id: dong.id,
    thay_doi: dong.thayDoi,
  }));

  const { error: rpcErr } = await admin.rpc("ap_dung_lo_excel", {
    p_lo_id: maLo,
    p_danh_sach: danhSachRpc,
    p_vai_tro: params.vaiTro,
    p_boi: params.boi,
  });

  if (rpcErr) {
    throw new Error(`Lỗi áp dụng lô Excel (rollback toàn bộ): ${rpcErr.message}`);
  }

  const { data: loSau } = await admin
    .from("lo_nhap_lieu")
    .select(
      "id, ten_file, kenh, trang_thai, so_dong, so_moi, so_sua, so_loi, ket_qua, boi, tao_luc, ap_dung_luc",
    )
    .eq("id", maLo)
    .single();

  return {
    lo: loSau
      ? chuanHoaDongLoNhapLieu(loSau as Record<string, unknown>)
      : { ...lo, trang_thai: "da_ap_dung", ap_dung_luc: new Date().toISOString() },
    soMaDaGhi: lo.ket_qua.dongHopLe.length,
  };
}
