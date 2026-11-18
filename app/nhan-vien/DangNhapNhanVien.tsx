"use client";

import { useState } from "react";
import Image from "next/image";
import {
  cheDoThu,
  dangNhapNhanVien,
  type PhienNhanVien,
} from "@/lib/nhan-vien/auth";

interface Props {
  onDangNhapThanhCong: (phien: PhienNhanVien) => void;
}

export function DangNhapNhanVien({ onDangNhapThanhCong }: Props) {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loi, setLoi] = useState<string | null>(null);
  const [dangXuLy, setDangXuLy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangXuLy(true);

    try {
      const res = await dangNhapNhanVien(email, matKhau);
      if (res.ok && res.phien) {
        onDangNhapThanhCong(res.phien);
      } else {
        setLoi(
          res.loi || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        );
      }
    } catch {
      setLoi("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setDangXuLy(false);
    }
  };

  const handleDangNhapNhanh = async () => {
    setDangXuLy(true);
    setLoi(null);
    const res = await dangNhapNhanVien("booth@vive.vn", "booth123");
    if (res.ok && res.phien) {
      onDangNhapThanhCong(res.phien);
    }
    setDangXuLy(false);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto my-12 bg-trang rounded-[24px] p-6 md:p-8 border border-[#E8D2CC] shadow-sm flex flex-col items-center">
      <Image
        src="/brand/vive-logo-chu.png"
        alt="VIVE"
        width={76}
        height={28}
        className="h-auto mb-4"
      />
      <h1 className="text-[22px] font-bold text-den m-0 text-center">
        Quầy nhân viên VIVE
      </h1>
      <p className="text-[14px] text-xam mt-1 mb-6 text-center">
        Trang dành riêng cho nhân viên điều phối giữ hàng tại booth LL2 Union
        Square.
      </p>

      {loi && (
        <div
          role="alert"
          className="w-full rounded-[14px] bg-[#FDE8E8] border border-[#F8B4B4] p-3 text-[14px] text-[#9B1C1C] mb-4 text-center"
        >
          {loi}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="staff-email"
            className="text-[14px] font-semibold text-den"
          >
            Email nhân viên
          </label>
          <input
            id="staff-email"
            type="email"
            required
            autoComplete="username"
            placeholder="nhanvien@vive.vn hoặc booth@vive.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[48px] rounded-[14px] border-[1.5px] border-[#E8D2CC] px-3.5 text-[15px] text-den outline-none focus:border-den transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="staff-password"
            className="text-[14px] font-semibold text-den"
          >
            Mật khẩu
          </label>
          <input
            id="staff-password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            className="h-[48px] rounded-[14px] border-[1.5px] border-[#E8D2CC] px-3.5 text-[15px] text-den outline-none focus:border-den transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={dangXuLy}
          className="w-full h-[50px] mt-2 rounded-full bg-den text-trang font-semibold text-[16px] flex items-center justify-center hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer shadow-sm"
        >
          {dangXuLy ? "Đang xác thực..." : "Đăng nhập quầy"}
        </button>

        {cheDoThu() && (
          <button
            type="button"
            onClick={handleDangNhapNhanh}
            className="w-full h-[46px] rounded-full border border-[#E8D2CC] bg-hong-nhat text-den font-medium text-[14px] flex items-center justify-center hover:bg-[#ebdcd7] transition-colors cursor-pointer"
          >
            Đăng nhập thử (chỉ máy dev)
          </button>
        )}
      </form>
    </div>
  );
}
