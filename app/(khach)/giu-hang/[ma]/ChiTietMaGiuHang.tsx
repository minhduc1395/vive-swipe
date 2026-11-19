"use client";
import { lopNut } from "@/components/ui/Nut";

import { useState } from "react";
import Link from "next/link";
import { NutQuayLai } from "@/components/NutQuayLai";
import { dinhDangTien, dinhDangTienGio } from "@/lib/dinh-dang";
import { taoMaQrSvg } from "@/lib/qr";
import type { DonGiuHangChiTiet } from "@/lib/giu-hang/types";

interface Props {
  don: DonGiuHangChiTiet;
}

export function ChiTietMaGiuHang({ don }: Props) {
  const [thongBaoLuuAnh, setThongBaoLuuAnh] = useState(false);

  // Sinh mã QR SVG chứa URL tra cứu nhân viên
  const qrSvg = taoMaQrSvg(`/nhan-vien?ma=${don.ma}`, {
    kichThuoc: 176,
    vien: 2,
    mauTo: "#2B2B2A",
  });

  // Tạo file lịch .ics hoặc tải về
  const handleThemVaoLich = () => {
    const batDau = new Date(don.hetHan);
    batDau.setHours(batDau.getHours() - 2); // 2 tiếng trước hạn

    const formatIcsTime = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VIVE//K-Beauty Experience//VI
BEGIN:VEVENT
UID:${don.ma}@vive-swipe.local
DTSTAMP:${formatIcsTime(new Date())}
DTSTART:${formatIcsTime(batDau)}
DTEND:${formatIcsTime(new Date(don.hetHan))}
SUMMARY:Lấy đơn giữ hàng ${don.ma} tại VIVE Pop-up
DESCRIPTION:Mã giữ hàng: ${don.ma}\\nTổng ước tính: ${dinhDangTienGio(don.tongUocTinh)}\\nĐịa chỉ: LL2 Union Square, 171 Đồng Khởi
LOCATION:VIVE | K-Beauty Experience, tầng LL2 Union Square, 171 Đồng Khởi
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VIVE-${don.ma}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLuuAnh = () => {
    if (typeof window !== "undefined") {
      window.print();
      setThongBaoLuuAnh(true);
      setTimeout(() => setThongBaoLuuAnh(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-[480px] mx-auto bg-hong-nhat rounded-[28px] p-4 md:p-6 shadow-sm border border-vien">
      {/* Nút quay lại & nút về trang quẹt */}
      <header className="flex items-center justify-between gap-2 pb-1">
        <NutQuayLai fallback="/gio" />
        <Link
          href="/quet"
          className="h-[40px] px-3 flex items-center text-[14px] font-semibold text-den hover:opacity-80 transition-opacity"
        >
          Về trang quẹt →
        </Link>
      </header>

      {/* Biểu tượng và tiêu đề Đã giữ hàng */}
      <div className="flex flex-col items-center gap-2 text-center pt-1 pb-2">
        <div className="w-[60px] h-[60px] rounded-full bg-bac-ha flex items-center justify-center text-den">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2B2B2A"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="m-0 text-[26px] md:text-[28px] font-bold tracking-tight text-den">
          Đã giữ hàng
        </h1>
        <p className="m-0 text-[15px] text-xam-dam">
          Đưa mã này cho nhân viên VIVE tại quầy.
        </p>
      </div>

      {/* Thẻ mã giữ hàng & QR */}
      <section
        aria-label="Mã giữ hàng"
        className="rounded-[26px] bg-trang p-5 flex flex-col items-center gap-2.5 shadow-sm border border-vien"
      >
        <span className="text-[12px] font-semibold tracking-[1.6px] text-xam uppercase">
          MÃ GIỮ HÀNG
        </span>
        <span className="text-[34px] md:text-[38px] font-bold tracking-[3px] text-den">
          {don.ma}
        </span>

        {/* QR Code SVG */}
        <div
          className="w-[176px] h-[176px] flex items-center justify-center p-2 rounded-[14px] bg-trang border border-hong-nhat"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />

        <div className="h-[32px] px-3.5 rounded-full bg-bac-ha-nhat text-[13px] font-semibold text-den flex items-center gap-1.5 mt-1">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2B2B2A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>
            Giữ đến 21:00{" "}
            {don.ngayDen.includes("mai") ||
            new Date(don.hetHan).getDate() !== new Date().getDate()
              ? "ngày mai"
              : "hôm nay"}
          </span>
        </div>
      </section>

      {/* Thẻ món đã giữ */}
      <section
        aria-label="Món đã giữ"
        className="rounded-[22px] bg-trang p-4 md:p-5 flex flex-col gap-2.5 text-[14px] shadow-sm border border-vien"
      >
        <div className="flex flex-col gap-2">
          {don.cacDong.map((d, idx) => (
            <div
              key={`${d.id}-${idx}`}
              className="flex justify-between items-center text-den"
            >
              <span className="font-medium line-clamp-1 pr-2">
                {d.ten} × {d.soLuong}
              </span>
              <span className="shrink-0 font-medium">
                {dinhDangTien(d.giaSauUuDai)}
              </span>
            </div>
          ))}
        </div>

        <div className="h-[1px] bg-vien my-1" />

        <div className="flex justify-between items-center font-bold text-[15px] text-den">
          <span>Tổng ước tính</span>
          <span className="text-[16px]">{dinhDangTienGio(don.tongUocTinh)}</span>
        </div>

        {don.quaDuKien && (
          <div className="flex justify-between items-center text-[13px] text-xam-dam">
            <span>Quà dự kiến</span>
            <span className="font-semibold text-den">{don.quaDuKien}</span>
          </div>
        )}
      </section>

      {/* Địa chỉ và thông báo email */}
      <section className="flex flex-col gap-2 text-[13px] text-xam-dam px-2 py-1">
        <div className="flex gap-2 items-start">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2B2B2A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 mt-0.5"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            <strong className="text-den font-semibold">
              VIVE | K-Beauty Experience
            </strong>
            , tầng LL2 Union Square, 171 Đồng Khởi
          </span>
        </div>

        {don.email && (
          <div className="flex gap-2 items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2B2B2A"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            <span>
              Đã gửi xác nhận tới email <strong>{don.email}</strong>
            </span>
          </div>
        )}
      </section>

      {thongBaoLuuAnh && (
        <div className="p-2 text-center text-[13px] text-den bg-bac-ha-nhat rounded-[10px]">
          Đang mở hộp thoại lưu ảnh / in màn hình...
        </div>
      )}

      {/* Hai nút hành động: Lưu ảnh và Thêm vào lịch */}
      <div className="pt-2 pb-1 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleLuuAnh}
          className={lopNut("phu","lon",true)}
        >
          Lưu ảnh màn hình
        </button>
        <button
          type="button"
          onClick={handleThemVaoLich}
          className={lopNut("phu","lon",true)}
        >
          Thêm vào lịch
        </button>
      </div>
    </div>
  );
}
