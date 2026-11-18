"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DEALS, SAN_PHAM, type Deal, type SanPham } from "@/lib/data";
import { dinhDangTien } from "@/lib/dinh-dang";
import {
  apDungCapNhatTon,
  parseKiotVietCsv,
  type KiotVietImportResult,
  type KiotVietThayDoi,
} from "@/lib/admin/kiotviet";
import {
  capNhatHetQuaDeal,
  kiemTraBatDeal,
} from "@/lib/admin/deal-rules";

type TabQuanTri =
  | "deal"
  | "san-pham"
  | "nhap-ton"
  | "tong-quan"
  | "giu-hang"
  | "email";

const KHOA_ADMIN_DEALS = "vive_admin_deals";
const KHOA_ADMIN_SAN_PHAM = "vive_admin_san_pham";
const KHOA_ADMIN_LAN_NHAP = "vive_admin_lan_nhap_ton";

export default function TrangQuanTri() {
  const [tabHienTai, setTabHienTai] = useState<TabQuanTri>("deal");
  const [danhSachDeal, setDanhSachDeal] = useState<Deal[]>(DEALS);
  const [danhSachSanPham, setDanhSachSanPham] = useState<SanPham[]>(SAN_PHAM);
  const [ketQuaPreview, setKetQuaPreview] = useState<KiotVietImportResult | null>(null);
  const [lanNhapGanNhat, setLanNhapGanNhat] = useState<string>("POS 12/11, 14:29");
  const [thongBaoToast, setThongBaoToast] = useState<string | null>(null);
  const [timKiemSp, setTimKiemSp] = useState("");
  const [danhMucLoc, setDanhMucLoc] = useState("all");
  const [danhSachEmail, setDanhSachEmail] = useState<string[]>([]);

  // Tải dữ liệu lưu trữ
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const dealsLuu = window.localStorage.getItem(KHOA_ADMIN_DEALS);
      if (dealsLuu) {
        setDanhSachDeal(JSON.parse(dealsLuu));
      }

      const spLuu = window.localStorage.getItem(KHOA_ADMIN_SAN_PHAM);
      if (spLuu) {
        setDanhSachSanPham(JSON.parse(spLuu));
      }

      const lanNhap = window.localStorage.getItem(KHOA_ADMIN_LAN_NHAP);
      if (lanNhap) {
        setLanNhapGanNhat(lanNhap);
      }

      const emailLuu = window.localStorage.getItem("vive_email_deal");
      if (emailLuu) {
        setDanhSachEmail([emailLuu]);
      }
    } catch {
      // bỏ qua lỗi storage
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const hienToast = (noiDung: string) => {
    setThongBaoToast(noiDung);
    setTimeout(() => {
      setThongBaoToast((curr) => (curr === noiDung ? null : curr));
    }, 2500);
  };

  // Toggle bật/tắt hiển thị deal
  const handleToggleHienThiDeal = (dealId: string) => {
    const deal = danhSachDeal.find((d) => d.id === dealId);
    if (!deal) return;

    const trangThaiMoi = !deal.hien_thi;
    const kiemTra = kiemTraBatDeal(deal, trangThaiMoi);

    if (!kiemTra.hopLe) {
      hienToast(kiemTra.loi ?? "Không thể bật deal này!");
      return;
    }

    const danhSachMoi = danhSachDeal.map((d) =>
      d.id === dealId ? { ...d, hien_thi: trangThaiMoi } : d
    );
    setDanhSachDeal(danhSachMoi);
    try {
      window.localStorage.setItem(KHOA_ADMIN_DEALS, JSON.stringify(danhSachMoi));
    } catch {
      // bỏ qua lỗi storage
    }
    hienToast(`Đã ${trangThaiMoi ? "bật" : "tắt"} hiển thị deal ${deal.id}`);
  };

  // Toggle hết quà
  const handleToggleHetQuaDeal = (dealId: string) => {
    const deal = danhSachDeal.find((d) => d.id === dealId);
    if (!deal) return;

    const hetQuaMoi = !deal.het_qua;
    const danhSachMoi = danhSachDeal.map((d) =>
      d.id === dealId ? capNhatHetQuaDeal(d, hetQuaMoi) : d
    );
    setDanhSachDeal(danhSachMoi);
    try {
      window.localStorage.setItem(KHOA_ADMIN_DEALS, JSON.stringify(danhSachMoi));
    } catch {
      // bỏ qua lỗi storage
    }
    hienToast(`Đã đổi trạng thái quà của ${deal.id}: ${hetQuaMoi ? "Hết quà" : "Còn quà"}`);
  };

  // Upload file CSV KiotViet
  const handleChonFileCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const noiDung = event.target?.result as string;
      if (!noiDung) return;

      const ketQua = parseKiotVietCsv(noiDung, danhSachSanPham);
      if (!ketQua.thanhCong) {
        hienToast(ketQua.loi ?? "Lỗi đọc file CSV!");
        return;
      }

      setKetQuaPreview(ketQua);
      setTabHienTai("nhap-ton");
      hienToast(`Đã nhận diện ${ketQua.soLuongKhop} sản phẩm hợp lệ!`);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Xác nhận áp dụng tồn kho mới
  const handleXacNhanNhapTon = () => {
    if (!ketQuaPreview || ketQuaPreview.thayDoi.length === 0) return;

    const danhSachMoi = apDungCapNhatTon(danhSachSanPham, ketQuaPreview.thayDoi);
    setDanhSachSanPham(danhSachMoi);

    const gioHienTai = new Date().toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
    const lanNhapMoi = `POS ${gioHienTai}`;
    setLanNhapGanNhat(lanNhapMoi);

    try {
      window.localStorage.setItem(KHOA_ADMIN_SAN_PHAM, JSON.stringify(danhSachMoi));
      window.localStorage.setItem(KHOA_ADMIN_LAN_NHAP, lanNhapMoi);
    } catch {
      // bỏ qua lỗi storage
    }

    setKetQuaPreview(null);
    hienToast(`Đã cập nhật tồn kho cho ${ketQuaPreview.thayDoi.length} sản phẩm!`);
  };

  // Danh sách sắp hết hàng (tồn <= 3)
  const sapHetHang = useMemo(() => {
    return danhSachSanPham
      .filter((sp) => sp.ton !== null && sp.ton <= 3 && sp.hien_thi)
      .slice(0, 6);
  }, [danhSachSanPham]);

  // Lọc sản phẩm
  const sanPhamLoc = useMemo(() => {
    return danhSachSanPham.filter((sp) => {
      if (danhMucLoc !== "all" && sp.danh_muc !== danhMucLoc) return false;
      if (timKiemSp) {
        const q = timKiemSp.toLowerCase();
        return (
          sp.ten_hien_thi.toLowerCase().includes(q) ||
          sp.thuong_hieu.toLowerCase().includes(q) ||
          sp.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [danhSachSanPham, danhMucLoc, timKiemSp]);

  return (
    <div className="w-full min-h-dvh bg-trang text-den font-sans flex flex-wrap">
      {/* Toast thông báo */}
      {thongBaoToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-den text-trang text-[13px] font-medium shadow-xl transition-all animate-bounce"
        >
          {thongBaoToast}
        </div>
      )}

      {/* Menu quản trị bên trái */}
      <nav
        aria-label="Menu quản trị"
        className="flex-[1_1_220px] max-w-[260px] p-6 bg-[#F7EEEB] flex flex-col gap-1 border-r border-vien"
      >
        <div className="mb-6 px-2.5">
          <Image
            src="/brand/vive-logo-black.png"
            alt="VIVE"
            width={64}
            height={24}
            style={{ width: "64px", height: "auto" }}
            priority
          />
        </div>

        <button
          type="button"
          onClick={() => setTabHienTai("deal")}
          aria-current={tabHienTai === "deal" ? "page" : undefined}
          className={`h-11 px-3 rounded-xl flex items-center text-[15px] font-medium border-none cursor-pointer text-left transition-colors ${
            tabHienTai === "deal" ? "bg-trang font-semibold text-den shadow-sm" : "bg-transparent text-[#5C5C5B] hover:text-den"
          }`}
        >
          Deal
        </button>

        <button
          type="button"
          onClick={() => setTabHienTai("san-pham")}
          aria-current={tabHienTai === "san-pham" ? "page" : undefined}
          className={`h-11 px-3 rounded-xl flex items-center text-[15px] font-medium border-none cursor-pointer text-left transition-colors ${
            tabHienTai === "san-pham" ? "bg-trang font-semibold text-den shadow-sm" : "bg-transparent text-[#5C5C5B] hover:text-den"
          }`}
        >
          Sản phẩm
        </button>

        <button
          type="button"
          onClick={() => setTabHienTai("nhap-ton")}
          aria-current={tabHienTai === "nhap-ton" ? "page" : undefined}
          className={`h-11 px-3 rounded-xl flex items-center text-[15px] font-medium border-none cursor-pointer text-left transition-colors ${
            tabHienTai === "nhap-ton" ? "bg-trang font-semibold text-den shadow-sm" : "bg-transparent text-[#5C5C5B] hover:text-den"
          }`}
        >
          Nhập tồn KiotViet
        </button>

        <button
          type="button"
          onClick={() => setTabHienTai("tong-quan")}
          aria-current={tabHienTai === "tong-quan" ? "page" : undefined}
          className={`h-11 px-3 rounded-xl flex items-center text-[15px] font-medium border-none cursor-pointer text-left transition-colors ${
            tabHienTai === "tong-quan" ? "bg-trang font-semibold text-den shadow-sm" : "bg-transparent text-[#5C5C5B] hover:text-den"
          }`}
        >
          Tổng quan
        </button>

        <button
          type="button"
          onClick={() => setTabHienTai("giu-hang")}
          aria-current={tabHienTai === "giu-hang" ? "page" : undefined}
          className={`h-11 px-3 rounded-xl flex items-center text-[15px] font-medium border-none cursor-pointer text-left transition-colors ${
            tabHienTai === "giu-hang" ? "bg-trang font-semibold text-den shadow-sm" : "bg-transparent text-[#5C5C5B] hover:text-den"
          }`}
        >
          Giữ hàng
        </button>

        <button
          type="button"
          onClick={() => setTabHienTai("email")}
          aria-current={tabHienTai === "email" ? "page" : undefined}
          className={`h-11 px-3 rounded-xl flex items-center text-[15px] font-medium border-none cursor-pointer text-left transition-colors ${
            tabHienTai === "email" ? "bg-trang font-semibold text-den shadow-sm" : "bg-transparent text-[#5C5C5B] hover:text-den"
          }`}
        >
          Email khách
        </button>

        <div className="mt-auto pt-6 border-t border-vien/60 flex flex-col gap-2">
          <Link
            href="/quet"
            className="text-[13px] text-xam hover:text-den no-underline flex items-center gap-1.5"
          >
            ← Về web quẹt
          </Link>
          <Link
            href="/nhan-vien"
            className="text-[13px] text-xam hover:text-den no-underline flex items-center gap-1.5"
          >
            Trang nhân viên →
          </Link>
        </div>
      </nav>

      {/* Nội dung chính bên phải */}
      <main className="flex-[999_1_560px] min-w-0 p-7 lg:p-10 flex flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[28px] font-semibold tracking-[-0.3px]">
            {tabHienTai === "deal" && "Deal"}
            {tabHienTai === "san-pham" && "Sản phẩm"}
            {tabHienTai === "nhap-ton" && "Nhập tồn KiotViet"}
            {tabHienTai === "tong-quan" && "Tổng quan số liệu"}
            {tabHienTai === "giu-hang" && "Đơn giữ hàng"}
            {tabHienTai === "email" && "Email khách nhận deal"}
          </h1>
          <p className="m-0 text-[14px] leading-relaxed text-xam max-w-[760px]">
            Khách chỉ thấy chương trình Đang chạy hoặc Đã duyệt có bật &quot;Hiện&quot;. Khuyến mại may rủi bị khóa cho đến khi chủ dự án xác nhận đã đăng ký với Sở Công Thương.
          </p>
        </header>

        {/* Số liệu nhanh */}
        <section
          aria-label="Số liệu nhanh"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div className="border border-vien rounded-2xl p-4 flex flex-col gap-1 bg-trang">
            <span className="text-[13px] text-xam">Khách mở web hôm nay</span>
            <strong className="text-[26px] font-bold text-den">—</strong>
          </div>
          <div className="border border-vien rounded-2xl p-4 flex flex-col gap-1 bg-trang">
            <span className="text-[13px] text-xam">Tỷ lệ quẹt phải</span>
            <strong className="text-[26px] font-bold text-den">—</strong>
          </div>
          <div className="border border-vien rounded-2xl p-4 flex flex-col gap-1 bg-trang">
            <span className="text-[13px] text-xam">Mã giữ hàng hôm nay</span>
            <strong className="text-[26px] font-bold text-den">—</strong>
          </div>
          <div className="border border-vien rounded-2xl p-4 flex flex-col gap-1 bg-trang">
            <span className="text-[13px] text-xam">Tỷ lệ đến lấy</span>
            <strong className="text-[26px] font-bold text-den">—</strong>
          </div>
        </section>

        {/* TAB DEAL */}
        {tabHienTai === "deal" && (
          <div className="flex flex-col gap-6">
            <section aria-label="Danh sách deal" className="flex flex-col gap-2.5">
              <div className="overflow-x-auto border border-vien rounded-[18px]">
                <div className="min-w-[780px]">
                  <div className="grid grid-cols-[2.6fr_1.2fr_1fr_1.3fr_96px] gap-3 px-4 py-3 bg-[#F7EEEB] text-[12px] font-semibold text-[#5C5C5B] uppercase tracking-wider">
                    <span>DEAL</span>
                    <span>LOẠI</span>
                    <span>TRẠNG THÁI</span>
                    <span>QUÀ</span>
                    <span>HIỆN</span>
                  </div>

                  <div className="divide-y divide-vien">
                    {danhSachDeal.map((d) => {
                      const laMayRuiChuaDangKy = (d.may_rui || d.loai === "may_rui") && !d.da_dang_ky;
                      const trangThaiText =
                        laMayRuiChuaDangKy
                          ? "Chờ đăng ký"
                          : d.trang_thai === "DANG_CHAY"
                            ? "Đang chạy"
                            : d.trang_thai === "DA_DUYET"
                              ? "Đã duyệt"
                              : "Đề xuất";

                      return (
                        <div
                          key={d.id}
                          className="grid grid-cols-[2.6fr_1.2fr_1fr_1.3fr_96px] gap-3 items-center px-4 py-3 text-[14px]"
                        >
                          {/* Tên & ID */}
                          <div className="flex flex-col gap-0.5">
                            <strong className="font-semibold text-den">
                              {d.ten}
                            </strong>
                            <span className="text-[12px] text-xam">
                              {d.id}
                              {d.hook && ` · ${d.hook}`}
                            </span>
                          </div>

                          {/* Loại */}
                          <div>
                            <span className="text-[13px] text-[#5C5C5B]">
                              {d.loai === "combo" && "Combo"}
                              {d.loai === "giam_khi_mua_kem" && "Giảm khi mua kèm"}
                              {d.loai === "qua_theo_nguong_nhan" && "Quà theo mốc"}
                              {d.loai === "qua_theo_nguong_don" && "Quà hóa đơn"}
                              {d.loai === "qua_khi_mua" && "Quà khi mua"}
                              {d.loai === "mua_x_tang_y" && "Mua X tặng Y"}
                              {d.loai === "may_rui" && "May rủi"}
                              {!["combo", "giam_khi_mua_kem", "qua_theo_nguong_nhan", "qua_theo_nguong_don", "qua_khi_mua", "mua_x_tang_y", "may_rui"].includes(d.loai) && d.loai}
                            </span>
                          </div>

                          {/* Trạng thái */}
                          <div>
                            <span
                              className={`h-7 px-2.5 rounded-full text-[12px] font-semibold inline-flex items-center ${
                                laMayRuiChuaDangKy
                                  ? "bg-trang border border-[#E8D2CC] text-[#5C5C5B]"
                                  : d.trang_thai === "DANG_CHAY"
                                    ? "bg-den text-trang"
                                    : "bg-bac-ha text-den"
                              }`}
                            >
                              {trangThaiText}
                            </span>
                          </div>

                          {/* Quà */}
                          <div>
                            {d.qua || (d.moc && d.moc.length > 0) ? (
                              <button
                                type="button"
                                onClick={() => handleToggleHetQuaDeal(d.id)}
                                className={`h-7 px-2.5 rounded-full text-[12px] font-semibold border cursor-pointer transition-colors ${
                                  d.het_qua
                                    ? "bg-trang border-den text-den"
                                    : "bg-[#EAF3ED] border-bac-ha text-den"
                                }`}
                              >
                                {d.het_qua ? "Hết quà" : "Còn quà"}
                              </button>
                            ) : (
                              <span className="text-[12px] text-xam">—</span>
                            )}
                          </div>

                          {/* Switch Hiện */}
                          <div>
                            {laMayRuiChuaDangKy ? (
                              <div
                                title="Khuyến mại may rủi bị khóa cho đến khi chủ dự án xác nhận đã đăng ký với Sở Công Thương."
                                className="flex items-center gap-1 text-[11px] text-xam cursor-not-allowed"
                              >
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="false"
                                  aria-disabled="true"
                                  disabled
                                  aria-label={`Khóa deal may rủi ${d.id}`}
                                  className="w-12 h-7 rounded-full bg-[#E8D2CC] opacity-60 cursor-not-allowed p-0.5 flex items-center justify-start border-none"
                                >
                                  <span className="w-5 h-5 rounded-full bg-trang shadow-sm block" />
                                </button>
                                <span className="sr-only">Khóa</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                role="switch"
                                aria-checked={d.hien_thi ? "true" : "false"}
                                aria-label={`Bật tắt hiển thị deal ${d.id}`}
                                onClick={() => handleToggleHienThiDeal(d.id)}
                                className={`w-12 h-7 rounded-full p-0.5 flex items-center cursor-pointer border-none transition-colors ${
                                  d.hien_thi ? "bg-den justify-end" : "bg-[#E8D2CC] justify-start"
                                }`}
                              >
                                <span className="w-5 h-5 rounded-full bg-trang shadow-sm block" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Khối Nhập tồn & Sắp hết hàng */}
            <div className="flex flex-wrap gap-4">
              <section
                aria-label="Nhập tồn từ KiotViet"
                className="flex-[1_1_340px] rounded-[18px] bg-[#EAF3ED] p-5 flex flex-col gap-3"
              >
                <h2 className="m-0 text-[18px] font-semibold text-den">
                  Nhập tồn từ KiotViet
                </h2>
                <p className="m-0 text-[14px] leading-relaxed text-[#5C5C5B]">
                  Xuất file tồn kho từ POS rồi tải lên. Web cho xem trước thay đổi trước khi lưu; mã về 0 sẽ tự ẩn khỏi deck.
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <label
                    htmlFor="file-ton-deal-tab"
                    className="h-11 px-4 rounded-full bg-den text-trang text-[14px] font-semibold flex items-center gap-2 cursor-pointer hover:opacity-90"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Chọn file CSV
                  </label>
                  <input
                    id="file-ton-deal-tab"
                    type="file"
                    accept=".csv"
                    onChange={handleChonFileCsv}
                    className="sr-only"
                  />
                </div>

                <span className="text-[13px] text-[#5C5C5B]">
                  Lần nhập gần nhất: {lanNhapGanNhat}
                </span>
              </section>

              <section
                aria-label="Sắp hết hàng"
                className="flex-[1_1_340px] rounded-[18px] border border-vien p-5 flex flex-col gap-2.5 bg-trang"
              >
                <h2 className="m-0 text-[18px] font-semibold text-den">
                  Sắp hết hàng{" "}
                  <span className="text-[13px] font-normal text-xam">
                    ({lanNhapGanNhat})
                  </span>
                </h2>
                <div className="divide-y divide-vien">
                  {sapHetHang.map((sp) => (
                    <div
                      key={sp.id}
                      className="flex justify-between py-2 text-[14px]"
                    >
                      <span className="text-den truncate max-w-[260px]">
                        {sp.ten_hien_thi}
                      </span>
                      <strong className="font-semibold text-den shrink-0">
                        {sp.ton}
                      </strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB NHẬP TỒN KIOTVIET */}
        {tabHienTai === "nhap-ton" && (
          <div className="flex flex-col gap-6">
            <section className="rounded-[22px] bg-[#EAF3ED] p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="m-0 text-[20px] font-semibold text-den">
                  Nhập tồn kho từ file CSV KiotViet
                </h2>
                <p className="m-0 text-[14px] text-[#5C5C5B] max-w-[700px]">
                  Tải lên tệp CSV xuất từ phần mềm bán hàng KiotViet. Hệ thống sẽ đối soát theo mã vạch (Barcode) hoặc mã hàng, hiển thị bản xem trước chênh lệch trước khi áp dụng.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="file-ton-kiotviet"
                  className="h-11 px-5 rounded-full bg-den text-trang text-[14px] font-semibold flex items-center gap-2 cursor-pointer hover:opacity-90"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Tải lên file CSV KiotViet
                </label>
                <input
                  id="file-ton-kiotviet"
                  type="file"
                  accept=".csv"
                  onChange={handleChonFileCsv}
                  className="sr-only"
                />

                <span className="text-[13px] text-[#5C5C5B]">
                  Lần nhập gần nhất: {lanNhapGanNhat}
                </span>
              </div>
            </section>

            {/* Bảng xem trước chênh lệch tồn */}
            {ketQuaPreview && (
              <section
                aria-label="Xem trước thay đổi tồn"
                className="rounded-[22px] border border-vien p-6 flex flex-col gap-4 bg-trang shadow-sm"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="m-0 text-[18px] font-semibold text-den">
                      Xem trước thay đổi tồn kho
                    </h3>
                    <span className="text-[13px] text-xam">
                      Khớp {ketQuaPreview.soLuongKhop} sản phẩm · {ketQuaPreview.soLuongVeKhong} mã về 0 (sẽ tự ẩn)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setKetQuaPreview(null)}
                      className="h-10 px-4 rounded-xl border border-vien bg-trang text-xam text-[14px] font-medium cursor-pointer hover:text-den"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleXacNhanNhapTon}
                      className="h-10 px-5 rounded-xl bg-bac-ha text-den text-[14px] font-semibold cursor-pointer hover:opacity-95 border-none"
                    >
                      Xác nhận cập nhật tồn
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-vien rounded-xl">
                  <table className="w-full text-left text-[13px] border-collapse min-w-[640px]">
                    <thead>
                      <tr className="bg-[#F7EEEB] text-[#5C5C5B] border-b border-vien">
                        <th className="p-3">Mã hàng</th>
                        <th className="p-3">Tên sản phẩm</th>
                        <th className="p-3 text-right">Tồn cũ</th>
                        <th className="p-3 text-right">Tồn mới</th>
                        <th className="p-3 text-right">Thay đổi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vien">
                      {ketQuaPreview.thayDoi.map((td: KiotVietThayDoi) => (
                        <tr key={td.sanPhamId} className="hover:bg-black/[0.02]">
                          <td className="p-3 font-mono text-[12px] text-xam">
                            {td.maHang}
                          </td>
                          <td className="p-3 font-medium text-den">
                            {td.tenHang}
                          </td>
                          <td className="p-3 text-right text-xam">
                            {td.tonCu}
                          </td>
                          <td className="p-3 text-right font-semibold text-den">
                            {td.tonMoi}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {td.thayDoi > 0 ? (
                              <span className="text-green-600">+{td.thayDoi}</span>
                            ) : td.thayDoi < 0 ? (
                              <span className="text-red-500">{td.thayDoi}</span>
                            ) : (
                              <span className="text-xam">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB SẢN PHẨM */}
        {tabHienTai === "san-pham" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="text"
                value={timKiemSp}
                onChange={(e) => setTimKiemSp(e.target.value)}
                placeholder="Tìm theo tên, mã hoặc thương hiệu..."
                className="h-10 px-3.5 rounded-xl border border-vien bg-trang text-[14px] text-den w-full max-w-[320px] focus:outline-none focus:border-den"
              />

              <div className="flex items-center gap-2">
                <span className="text-[13px] text-xam">Danh mục:</span>
                <select
                  value={danhMucLoc}
                  onChange={(e) => setDanhMucLoc(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-vien bg-trang text-[13px] text-den focus:outline-none focus:border-den"
                >
                  <option value="all">Tất cả ({danhSachSanPham.length})</option>
                  <option value="sua-rua-mat">Sữa rửa mặt</option>
                  <option value="toner-pad">Toner pad</option>
                  <option value="tinh-chat">Tinh chất</option>
                  <option value="kem-duong">Kem dưỡng</option>
                  <option value="mat-na">Mặt nạ</option>
                  <option value="thiet-bi">Thiết bị</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-vien rounded-[18px]">
              <table className="w-full text-left text-[14px] border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#F7EEEB] text-[#5C5C5B] text-[12px] font-semibold border-b border-vien uppercase">
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3">Thương hiệu</th>
                    <th className="p-3 text-right">Giá bán</th>
                    <th className="p-3 text-right">Tồn</th>
                    <th className="p-3 text-center">Hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vien">
                  {sanPhamLoc.slice(0, 30).map((sp) => (
                    <tr key={sp.id} className="hover:bg-black/[0.02]">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {sp.anh ? (
                            <div className="w-9 h-9 rounded-lg bg-[#F7EEEB] relative overflow-hidden shrink-0">
                              <Image
                                src={sp.anh}
                                alt={sp.ten_hien_thi}
                                fill
                                sizes="36px"
                                className="object-contain p-0.5"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-[#F7EEEB] text-[9px] font-semibold flex items-center justify-center shrink-0">
                              {sp.thuong_hieu.slice(0, 3)}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-den truncate max-w-[280px]">
                              {sp.ten_hien_thi}
                            </span>
                            <span className="text-[12px] text-xam">{sp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xam">{sp.thuong_hieu}</td>
                      <td className="p-3 text-right font-semibold text-den">
                        {dinhDangTien(sp.gia_ban)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`font-semibold ${
                            sp.ton === 0 ? "text-red-500" : (sp.ton ?? 0) <= 3 ? "text-orange-500" : "text-den"
                          }`}
                        >
                          {sp.ton ?? "—"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={sp.hien_thi}
                          onChange={(e) => {
                            const moi = e.target.checked;
                            const dsMoi = danhSachSanPham.map((s) =>
                              s.id === sp.id ? { ...s, hien_thi: moi } : s
                            );
                            setDanhSachSanPham(dsMoi);
                          }}
                          className="w-4 h-4 cursor-pointer accent-den"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB EMAIL KHÁCH */}
        {tabHienTai === "email" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-[18px] border border-vien p-5 flex flex-col gap-3 bg-trang">
              <h2 className="m-0 text-[18px] font-semibold text-den">
                Danh sách email đăng ký nhận deal
              </h2>
              <p className="m-0 text-[14px] text-xam">
                Khách đã xác nhận đồng ý nhận thông báo khi có ưu đãi tốt cho sản phẩm đã quan tâm.
              </p>

              {danhSachEmail.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F7EEEB] text-center text-xam text-[14px]">
                  Chưa có email khách hàng nào đăng ký tại thiết bị này.
                </div>
              ) : (
                <div className="divide-y divide-vien border border-vien rounded-xl">
                  {danhSachEmail.map((email, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between text-[14px]"
                    >
                      <span className="font-mono text-den">{email}</span>
                      <span className="text-[12px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                        Đã đăng ký
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB TỔNG QUAN / GIỮ HÀNG */}
        {(tabHienTai === "tong-quan" || tabHienTai === "giu-hang") && (
          <div className="rounded-[18px] bg-[#F7EEEB] p-6 text-center text-xam flex flex-col items-center gap-3">
            <p className="m-0 text-[15px]">
              Dữ liệu đơn giữ hàng và vận hành tại quầy được theo dõi chi tiết tại màn hình nhân viên.
            </p>
            <Link
              href="/nhan-vien"
              className="h-10 px-5 rounded-full bg-den text-trang text-[14px] font-semibold flex items-center no-underline hover:opacity-90"
            >
              Xem trang nhân viên
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
