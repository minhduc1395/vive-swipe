"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { dinhDangTien, dinhDangTienGio } from "@/lib/dinh-dang";
import type { DonGiuHangChiTiet, TrangThaiGiuHang } from "@/lib/giu-hang/types";
import type { PhienNhanVien } from "@/lib/nhan-vien/auth";
import { actionCapNhatTrangThai, actionLayDanhSachDon } from "./actions";
import { layTokenNhanVien } from "@/lib/nhan-vien/auth";

interface Props {
  phien: PhienNhanVien;
  onDangXuat: () => void;
}

type TabTrangThai = "moi" | "da_soan" | "da_lay" | "dong" | "tat_ca";

const NHAN_TRANG_THAI: Record<TrangThaiGiuHang, string> = {
  moi: "Mới",
  da_soan: "Đã soạn",
  da_lay: "Đã lấy",
  huy: "Hủy",
  het_han: "Hết hạn",
};

export function BangNhanVien({ phien, onDangXuat }: Props) {
  const searchParams = useSearchParams();
  const maTuUrl = searchParams.get("ma")?.toUpperCase();

  const [danhSach, setDanhSach] = useState<DonGiuHangChiTiet[]>([]);
  const [loiTai, setLoiTai] = useState<string | null>(null);
  const [tuKhoa, setTuKhoa] = useState(maTuUrl || "");
  const [tabHienTai, setTabHienTai] = useState<TabTrangThai>("moi");
  const [maDangChon, setMaDangChon] = useState<string>(maTuUrl || "");

  const [isPending, startTransition] = useTransition();

  // Tự làm mới danh sách mỗi 30 giây (docs/01 mục 2.9)
  useEffect(() => {
    const lamMoi = async () => {
      try {
        const moi = await actionLayDanhSachDon(await layTokenNhanVien());
        setDanhSach(moi);
        setLoiTai(null);
      } catch {
        setLoiTai(
          "Không tải được danh sách. Kiểm tra mạng hoặc đăng nhập lại.",
        );
      }
    };
    lamMoi();

    const interval = setInterval(lamMoi, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lọc theo từ khóa (Mã hoặc 4 số cuối SĐT)
  const danhSachLocTuKhoa = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();
    if (!q) return danhSach;

    return danhSach.filter((d) => {
      const khopMa = d.ma.toLowerCase().includes(q);
      const sdtClean = d.sdt.replace(/\s+/g, "");
      const khopSdt = sdtClean.endsWith(q) || sdtClean.includes(q);
      const khopTen = d.ten.toLowerCase().includes(q);
      return khopMa || khopSdt || khopTen;
    });
  }, [danhSach, tuKhoa]);

  // Đếm số lượng theo tab
  const soLuongTab = useMemo(() => {
    return {
      moi: danhSach.filter((d) => d.trangThai === "moi").length,
      da_soan: danhSach.filter((d) => d.trangThai === "da_soan").length,
      da_lay: danhSach.filter((d) => d.trangThai === "da_lay").length,
      dong: danhSach.filter(
        (d) => d.trangThai === "huy" || d.trangThai === "het_han",
      ).length,
      tat_ca: danhSach.length,
    };
  }, [danhSach]);

  // Lọc theo tab hiện tại
  const danhSachHienThi = useMemo(() => {
    if (tuKhoa.trim()) {
      // Khi có từ khóa tìm kiếm, hiển thị các kết quả khớp không giới hạn bởi tab
      return danhSachLocTuKhoa;
    }

    return danhSach.filter((d) => {
      if (tabHienTai === "tat_ca") return true;
      if (tabHienTai === "dong") {
        return d.trangThai === "huy" || d.trangThai === "het_han";
      }
      return d.trangThai === tabHienTai;
    });
  }, [danhSach, danhSachLocTuKhoa, tabHienTai, tuKhoa]);

  // Đơn hàng đang chọn để xem chi tiết
  const donDangChon = useMemo(() => {
    return (
      danhSach.find((d) => d.ma.toUpperCase() === maDangChon.toUpperCase()) ||
      danhSachHienThi[0] ||
      danhSach[0]
    );
  }, [danhSach, danhSachHienThi, maDangChon]);

  // Đổi trạng thái đơn hàng (Đã soạn / Đã lấy / Hủy)
  const handleDoiTrangThai = (trangThaiMoi: TrangThaiGiuHang) => {
    if (!donDangChon) return;

    startTransition(async () => {
      try {
        await actionCapNhatTrangThai(
          await layTokenNhanVien(),
          donDangChon.ma,
          trangThaiMoi,
        );
      } catch {
        setLoiTai("Chưa lưu được trạng thái. Thử lại hoặc đăng nhập lại.");
        return;
      }
      // Cập nhật state lạc quan
      setDanhSach((truoc) =>
        truoc.map((d) => {
          if (d.ma === donDangChon.ma) {
            const now = new Date();
            const gioPhut = now.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const logStr = `${NHAN_TRANG_THAI[trangThaiMoi]} bởi ${phien.ten} lúc ${gioPhut}`;
            return {
              ...d,
              trangThai: trangThaiMoi,
              ghiChu: d.ghiChu ? `${d.ghiChu} · ${logStr}` : logStr,
            };
          }
          return d;
        }),
      );
    });
  };

  const layBadgePill = (tt: TrangThaiGiuHang) => {
    switch (tt) {
      case "moi":
        return "bg-hong text-den";
      case "da_soan":
        return "bg-bac-ha text-den";
      case "da_lay":
        return "bg-den text-trang";
      case "huy":
      case "het_han":
      default:
        return "bg-trang text-xam border border-hong";
    }
  };

  const tabs: Array<{ key: TabTrangThai; label: string }> = [
    { key: "moi", label: `Mới (${soLuongTab.moi})` },
    { key: "da_soan", label: `Đã soạn (${soLuongTab.da_soan})` },
    { key: "da_lay", label: `Đã lấy (${soLuongTab.da_lay})` },
    { key: "dong", label: `Hủy, hết hạn (${soLuongTab.dong})` },
    { key: "tat_ca", label: `Tất cả (${soLuongTab.tat_ca})` },
  ];

  return (
    <div className="w-full max-w-[1280px] min-h-[768px] mx-auto bg-trang text-den flex flex-col border border-vien rounded-[24px] shadow-sm overflow-hidden my-4">
      {loiTai && (
        <p
          role="alert"
          className="m-0 px-6 py-3 bg-kem text-[14px] font-medium"
        >
          {loiTai}
        </p>
      )}
      {/* Header thanh trên */}
      <header className="h-[72px] px-6 border-b border-vien flex items-center gap-4 bg-trang shrink-0">
        <Image
          src="/brand/vive-logo-chu.png"
          alt="VIVE"
          width={52}
          height={20}
          className="h-auto"
        />
        <h1 className="m-0 text-[18px] font-semibold text-den">
          Giữ hàng hôm nay
        </h1>

        {/* Ô tìm kiếm */}
        <label
          htmlFor="tim"
          className="ml-auto h-[44px] w-[320px] rounded-[12px] border-[1.5px] border-hong flex items-center gap-2 px-3 focus-within:border-den transition-colors bg-trang"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-xam shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="sr-only">Tìm mã hoặc 4 số cuối SĐT</span>
          <input
            id="tim"
            type="search"
            placeholder="Tìm mã hoặc 4 số cuối SĐT"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            className="border-none outline-none flex-1 min-w-0 text-[14px] text-den placeholder:text-xam bg-transparent"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => setTuKhoa("")}
              className="text-xam hover:text-den text-[13px] px-1"
            >
              ✕
            </button>
          )}
        </label>

        {/* Thông tin nhân viên và đăng xuất */}
        <div className="flex items-center gap-3 pl-2">
          <span className="text-[14px] text-xam font-medium">{phien.ten}</span>
          <button
            type="button"
            onClick={onDangXuat}
            className="text-[13px] text-xam hover:text-den underline cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Thân 2 cột */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Cột trái: Danh sách giữ hàng */}
        <section
          aria-label="Danh sách giữ hàng"
          className="w-full md:w-[612px] p-5 flex flex-col gap-3.5 border-r border-vien shrink-0"
        >
          {/* Nhóm tab trạng thái */}
          <div
            className="flex gap-2 flex-wrap"
            role="group"
            aria-label="Lọc theo trạng thái"
          >
            {tabs.map((t) => {
              const active = tabHienTai === t.key && !tuKhoa.trim();
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTabHienTai(t.key);
                    setTuKhoa("");
                  }}
                  aria-pressed={active}
                  className={`h-[40px] px-3.5 rounded-full text-[14px] font-medium transition-colors border cursor-pointer ${
                    active
                      ? "bg-den text-trang border-den"
                      : "bg-trang text-den border-hong hover:bg-kem"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tiêu đề cột */}
          <div className="grid grid-cols-[116px_1fr_88px_104px_92px] gap-2 px-3.5 text-[12px] font-semibold tracking-[0.8px] text-xam uppercase">
            <span>MÃ</span>
            <span>KHÁCH</span>
            <span>NGÀY ĐẾN</span>
            <span className="text-right">ƯỚC TÍNH</span>
            <span>TRẠNG THÁI</span>
          </div>

          {/* Danh sách các dòng đơn */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[520px] pr-1">
            {danhSachHienThi.map((r) => {
              const dangChon = donDangChon?.ma === r.ma;
              const soMon = r.cacDong.reduce((acc, c) => acc + c.soLuong, 0);

              return (
                <button
                  key={r.ma}
                  type="button"
                  onClick={() => setMaDangChon(r.ma)}
                  className={`grid grid-cols-[116px_1fr_88px_104px_92px] gap-2 items-center min-h-[60px] p-2.5 px-3.5 rounded-[14px] transition-colors text-left cursor-pointer border ${
                    dangChon
                      ? "bg-kem border-[1.5px] border-den"
                      : "bg-trang border-vien hover:bg-kem"
                  }`}
                >
                  <strong className="text-[15px] font-bold tracking-tight text-den">
                    {r.ma}
                  </strong>
                  <span className="flex flex-col min-w-0 pr-1">
                    <span className="text-[14px] font-medium text-den truncate">
                      {r.ten}
                    </span>
                    <span className="text-[12px] text-xam truncate">
                      {r.sdt} · {soMon} món
                    </span>
                  </span>
                  <span className="text-[13px] text-den line-clamp-1">
                    {r.ngayDen}
                  </span>
                  <span className="text-[14px] font-semibold text-right text-den">
                    {dinhDangTien(r.tongUocTinh)}
                  </span>
                  <span
                    className={`h-[28px] px-2.5 rounded-full text-[12px] font-semibold inline-flex items-center justify-center shrink-0 ${layBadgePill(
                      r.trangThai,
                    )}`}
                  >
                    {NHAN_TRANG_THAI[r.trangThai]}
                  </span>
                </button>
              );
            })}

            {danhSachHienThi.length === 0 && (
              <p className="mt-8 text-center text-[14px] text-xam">
                Không có mã nào ở trạng thái này.
              </p>
            )}
          </div>

          <p className="mt-auto pt-3 text-[12px] text-xam">
            Danh sách tự làm mới mỗi 30 giây.
          </p>
        </section>

        {/* Cột phải: Chi tiết mã giữ hàng */}
        {donDangChon ? (
          <section
            aria-label="Chi tiết mã giữ hàng"
            className="flex-1 p-5 md:p-6 flex flex-col gap-3.5 bg-kem"
          >
            {/* Mã & Trạng thái */}
            <div className="flex items-center justify-between">
              <span className="text-[28px] font-bold tracking-[2px] text-den">
                {donDangChon.ma}
              </span>
              <span
                className={`h-[30px] px-3.5 rounded-full text-[13px] font-semibold inline-flex items-center justify-center ${layBadgePill(
                  donDangChon.trangThai,
                )}`}
              >
                {NHAN_TRANG_THAI[donDangChon.trangThai]}
              </span>
            </div>

            {/* 2 thẻ: Khách và Hạn giữ */}
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <div className="bg-trang rounded-[12px] p-2.5 px-3 flex flex-col gap-0.5 border border-vien">
                <span className="text-xam">Khách</span>
                <strong className="font-semibold text-den">
                  {donDangChon.ten} · {donDangChon.sdt}
                </strong>
              </div>
              <div className="bg-trang rounded-[12px] p-2.5 px-3 flex flex-col gap-0.5 border border-vien">
                <span className="text-xam">Hạn giữ</span>
                <strong className="font-semibold text-den">
                  21:00 {donDangChon.ngayDen}
                </strong>
              </div>
            </div>

            {/* Thẻ danh sách món */}
            <div className="bg-trang rounded-[16px] p-3.5 px-4 flex flex-col gap-2 text-[14px] border border-vien">
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                {donDangChon.cacDong.map((i, idx) => (
                  <div
                    key={`${i.id}-${idx}`}
                    className="flex justify-between items-center text-den"
                  >
                    <span className="line-clamp-1 pr-2">
                      {i.ten} × {i.soLuong}
                    </span>
                    <span className="font-semibold shrink-0">
                      {dinhDangTien(i.giaSauUuDai)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-[1px] bg-vien my-1" />

              <div className="flex justify-between font-bold text-[15px] text-den">
                <span>Tổng ước tính</span>
                <span>{dinhDangTienGio(donDangChon.tongUocTinh)}</span>
              </div>
              <div className="flex justify-between text-xam-dam text-[13px]">
                <span>Quà dự kiến</span>
                <span className="font-semibold text-den">
                  {donDangChon.quaDuKien || "Không có"}
                </span>
              </div>
            </div>

            <p className="m-0 text-[12px] leading-relaxed text-xam-dam">
              Tính tiền trên POS KiotViet như bình thường. Giá và quà trên đây
              là ước tính từ web.
            </p>

            {/* 3 nút chuyển trạng thái */}
            <div className="mt-auto pt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isPending || donDangChon.trangThai === "da_soan"}
                onClick={() => handleDoiTrangThai("da_soan")}
                className="h-[52px] rounded-[14px] border-[1.5px] border-den bg-bac-ha text-den font-semibold text-[15px] hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
              >
                Đã soạn
              </button>
              <button
                type="button"
                disabled={isPending || donDangChon.trangThai === "da_lay"}
                onClick={() => handleDoiTrangThai("da_lay")}
                className="h-[52px] rounded-[14px] border-none bg-den text-trang font-semibold text-[15px] hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
              >
                Đã lấy
              </button>
              <button
                type="button"
                disabled={isPending || donDangChon.trangThai === "huy"}
                onClick={() => handleDoiTrangThai("huy")}
                className="h-[52px] rounded-[14px] border-[1.5px] border-hong bg-trang text-den font-semibold text-[15px] hover:bg-kem disabled:opacity-50 transition-opacity cursor-pointer"
              >
                Hủy
              </button>
            </div>

            {/* Lịch sử cập nhật */}
            <span className="text-[12px] text-xam-dam">
              {donDangChon.ghiChu || `Tạo lúc ${donDangChon.taoLuc}`}
            </span>
          </section>
        ) : (
          <section
            aria-label="Chi tiết mã giữ hàng"
            className="flex-1 p-6 flex items-center justify-center bg-kem text-xam text-[14px]"
          >
            Chọn một đơn giữ hàng từ danh sách bên trái để xem chi tiết.
          </section>
        )}
      </div>
    </div>
  );
}
