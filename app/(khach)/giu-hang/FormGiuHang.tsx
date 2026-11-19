"use client";
import { lopNut } from "@/components/ui/Nut";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDuLieu } from "@/lib/du-lieu-context";
import { dinhDangTien, dinhDangTienGio } from "@/lib/dinh-dang";
import { tinhGio } from "@/lib/deals/gio-hang";
import {
  layGioHang,
  xoaToanBoGio,
  type ItemGioHang,
} from "@/lib/kho-luu-tru";
import { actionTaoGiuHang } from "./actions";

interface Props {
  gioBanDau?: ItemGioHang[];
}

export function FormGiuHang({ gioBanDau }: Props) {
  const router = useRouter();
  const { sanPham, deals, daSanSang } = useDuLieu();

  const [mounted, setMounted] = useState(false);
  const [gio, setGio] = useState<ItemGioHang[]>(gioBanDau || []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!gioBanDau || gioBanDau.length === 0) {
      setGio(layGioHang());
    }
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [gioBanDau]);

  const [ten, setTen] = useState("");
  const [sdt, setSdt] = useState("");
  const [email, setEmail] = useState("");
  const [ngayDen, setNgayDen] = useState<"hom_nay" | "ngay_mai">("ngay_mai");
  const [dongYEmail, setDongYEmail] = useState(false);
  const [dongYChinhSach, setDongYChinhSach] = useState(true);

  const [loiValidation, setLoiValidation] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Tính lại giỏ để xem trước
  const mucGioInput = gio.map((item) =>
    item.loai === "combo" && item.dealId
      ? { loai: "combo" as const, deal_id: item.dealId, so_luong: item.soLuong }
      : {
          loai: "san_pham" as const,
          san_pham_id: item.sanPhamId || "",
          so_luong: item.soLuong,
        }
  );

  const ketQua = tinhGio(mucGioInput, sanPham, deals);
  const tongSoMon = gio.reduce((acc, it) => acc + it.soLuong, 0);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-[72px] rounded-[18px] bg-hong-nhat/60" />
        <div className="h-[50px] rounded-[14px] bg-hong-nhat/40" />
        <div className="h-[50px] rounded-[14px] bg-hong-nhat/40" />
        <div className="h-[50px] rounded-[14px] bg-hong-nhat/40" />
        <div className="h-[54px] rounded-full bg-hong-nhat/70" />
      </div>
    );
  }

  if (daSanSang && gio.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-hong-nhat flex items-center justify-center text-xam mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-den mb-2">
          Giỏ hàng đang trống
        </h2>
        <p className="text-[14px] text-xam max-w-[280px] mb-6">
          Vui lòng thêm sản phẩm bạn thích vào giỏ trước khi tiến hành giữ hàng tại booth.
        </p>
        <Link
          href="/quet"
          className={lopNut("phu","lon")}
        >
          Quay lại quẹt sản phẩm
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoiValidation(null);

    if (!ten.trim()) {
      setLoiValidation("Vui lòng nhập họ và tên của bạn.");
      return;
    }

    const sdtClean = sdt.replace(/[\s.-]/g, "");
    if (!/^0[35789]\d{8}$/.test(sdtClean)) {
      setLoiValidation(
        "Số điện thoại không đúng định dạng (cần 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)."
      );
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLoiValidation("Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    if (!dongYChinhSach) {
      setLoiValidation(
        "Vui lòng đồng ý với chính sách bảo mật và giữ hàng của VIVE."
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await actionTaoGiuHang({
          ten: ten.trim(),
          sdt: sdtClean,
          email: email.trim() || undefined,
          ngayDen,
          dongYEmail,
          dongYChinhSach,
          gio,
        });

        if (!res.ok || !res.ma) {
          setLoiValidation(res.loi || "Không thể tạo đơn giữ hàng. Vui lòng thử lại.");
          return;
        }

        // Xoá giỏ sau khi giữ hàng thành công
        xoaToanBoGio();
        setGio([]);

        // Chuyển sang màn mã giữ hàng
        router.push(`/giu-hang/${res.ma}`);
      } catch {
        setLoiValidation("Lỗi kết nối. Vui lòng thử lại sau vài giây.");
      }
    });
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start gap-4">
      <div className="flex flex-col gap-4 min-w-0 order-last lg:order-first">
      {loiValidation && (
        <div
          role="alert"
          className="rounded-[14px] bg-[#FDE8E8] border border-[#F8B4B4] p-3 text-[14px] text-[#9B1C1C] flex items-start gap-2"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{loiValidation}</span>
        </div>
      )}

      {/* Form giữ hàng */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
        {/* Họ và tên */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ten" className="text-[14px] font-medium text-den">
            Họ và tên <span className="text-[#E02424]">*</span>
          </label>
          <input
            id="ten"
            name="ten"
            type="text"
            required
            autoComplete="name"
            placeholder="Tên để nhân viên gọi"
            value={ten}
            onChange={(e) => setTen(e.target.value)}
            className="h-[50px] rounded-[14px] border-[1.5px] border-hong px-3.5 text-[15px] text-den placeholder:text-xam outline-none focus:border-hong transition-colors bg-trang"
          />
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sdt" className="text-[14px] font-medium text-den">
            Số điện thoại <span className="text-[#E02424]">*</span>
          </label>
          <input
            id="sdt"
            name="sdt"
            type="tel"
            required
            autoComplete="tel"
            placeholder="09xx xxx xxx"
            value={sdt}
            onChange={(e) => setSdt(e.target.value)}
            className="h-[50px] rounded-[14px] border-[1.5px] border-hong px-3.5 text-[15px] text-den placeholder:text-xam outline-none focus:border-hong transition-colors bg-trang"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[14px] font-medium text-den">
            Email{" "}
            <span className="font-normal text-xam">
              (không bắt buộc, để nhận xác nhận)
            </span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ten@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[50px] rounded-[14px] border-[1.5px] border-hong px-3.5 text-[15px] text-den placeholder:text-xam outline-none focus:border-hong transition-colors bg-trang"
          />
        </div>

        {/* Ngày đến lấy */}
        <fieldset className="border-none m-0 p-0 flex flex-col gap-1.5">
          <legend className="text-[14px] font-medium text-den mb-1.5 p-0">
            Ngày đến lấy
          </legend>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNgayDen("hom_nay")}
              aria-pressed={ngayDen === "hom_nay"}
              className={`h-[48px] rounded-[14px] text-[15px] font-semibold transition-colors border-[1.5px] ${
                ngayDen === "hom_nay"
                  ? "bg-hong text-den border-transparent font-semibold"
                  : "bg-trang text-den border-hong hover:bg-hong-nhat/50"
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setNgayDen("ngay_mai")}
              aria-pressed={ngayDen === "ngay_mai"}
              className={`h-[48px] rounded-[14px] text-[15px] font-semibold transition-colors border-[1.5px] ${
                ngayDen === "ngay_mai"
                  ? "bg-hong text-den border-transparent font-semibold"
                  : "bg-trang text-den border-hong hover:bg-hong-nhat/50"
              }`}
            >
              Ngày mai
            </button>
          </div>
          <span className="text-[13px] text-xam mt-0.5">
            Giữ đến 21:00 {ngayDen === "hom_nay" ? "hôm nay" : "ngày mai"}
          </span>
        </fieldset>

        {/* Checkbox nhận deal và chính sách */}
        <div className="flex flex-col gap-2.5 pt-1">
          <label className="flex items-start gap-2.5 text-[14px] leading-snug cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dongYEmail}
              onChange={(e) => setDongYEmail(e.target.checked)}
              className="w-[20px] h-[20px] mt-0.5 shrink-0 accent-den cursor-pointer"
            />
            <span className="text-den">Nhận deal qua email</span>
          </label>

          <label className="flex items-start gap-2.5 text-[14px] leading-snug cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dongYChinhSach}
              onChange={(e) => setDongYChinhSach(e.target.checked)}
              className="w-[20px] h-[20px] mt-0.5 shrink-0 accent-den cursor-pointer"
            />
            <span className="text-den">
              Tôi đồng ý với{" "}
              <Link
                href="/chinh-sach"
                target="_blank"
                className="font-semibold underline text-den hover:text-black"
              >
                chính sách bảo mật và giữ hàng
              </Link>
            </span>
          </label>
        </div>

        {/* Nút xác nhận giữ hàng */}
        <div className="pt-4 pb-6 flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className={lopNut("dam","lon",true) + " h-[54px] text-[17px] shadow-sm"}
          >
            {isPending ? "Đang xử lý..." : "Xác nhận giữ hàng"}
          </button>
          <span className="text-[12px] text-xam text-center">
            Mỗi số điện thoại giữ tối đa 3 mã cùng lúc
          </span>
        </div>
      </form>
      </div>

      {/* Cột tóm tắt giỏ hàng responsive (trên đầu mobile/tablet, cột phải dính trên desktop) */}
      <aside
        aria-label="Tóm tắt giỏ giữ hàng"
        className="order-first lg:order-last flex flex-col gap-3 rounded-[18px] lg:rounded-[24px] bg-hong-nhat p-4 lg:p-6 lg:border lg:border-vien lg:sticky lg:top-6"
      >
        <div className="flex justify-between items-center gap-3 lg:hidden text-[13px]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xam-dam">Quà dự kiến</span>
            <strong className="font-semibold text-den line-clamp-1 max-w-[180px]">
              {ketQua.qua_du_kien || "Không có"}
            </strong>
          </div>
        </div>
        <h2 className="hidden lg:block m-0 text-[18px] font-bold text-den">
          Đơn giữ ({tongSoMon} món)
        </h2>
        <ul className="hidden lg:flex m-0 p-0 list-none flex-col gap-2 text-[14px] border-t border-vien pt-3">
          {ketQua.cac_dong.map((dong) => (
            <li
              key={`${dong.loai}-${dong.id}`}
              className="flex justify-between gap-2"
            >
              <span className="text-den truncate">
                {dong.so_luong > 1 ? `${dong.so_luong}× ` : ""}
                {dong.ten}
              </span>
              <strong className="shrink-0 text-den">
                {dinhDangTien(dong.gia_sau_uu_dai)}
              </strong>
            </li>
          ))}
        </ul>
        {ketQua.qua_du_kien && (
          <div className="hidden lg:block rounded-xl bg-trang p-3 text-[13px] text-den">
            Quà dự kiến: <strong>{ketQua.qua_du_kien}</strong>
          </div>
        )}
        <div className="lg:border-t lg:border-vien lg:pt-3 flex justify-between items-baseline">
          <span className="text-[13px] lg:text-[15px] font-medium lg:font-semibold text-xam-dam lg:text-den">
            {tongSoMon} món · tổng ước tính
          </span>
          <strong className="text-[18px] lg:text-[22px] font-bold text-den">
            {dinhDangTienGio(ketQua.tong_tam_tinh)}
          </strong>
        </div>
        <p className="hidden lg:block m-0 text-[12px] text-xam leading-relaxed">
          Giá và quà là ước tính. Nhân viên xác nhận khi thanh toán tại booth.
        </p>
      </aside>
    </div>
  );
}
