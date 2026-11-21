import { lopNut } from "@/components/ui/Nut";
import Link from "next/link";
import { NutQuayLai } from "@/components/NutQuayLai";
import { FormDangNhap } from "@/components/tai-khoan/FormDangNhap";
import { dangNhapEmailBat } from "@/lib/tai-khoan/co";

export default function TrangDangNhap() {
  // #65: bật cờ NEXT_PUBLIC_DANG_NHAP_EMAIL=1 mới hiện form email + mã; tắt cờ giữ trang chờ.
  if (dangNhapEmailBat()) {
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <div className="max-w-[540px] w-full mx-auto px-4 md:px-6 pt-4 md:pt-8">
          <NutQuayLai fallback="/" />
        </div>
        <div className="flex-1 flex flex-col items-center p-6 pt-4 text-center max-w-[440px] w-full mx-auto min-h-[60vh]">
          <h1 className="tieu-de-trang mb-4">Đăng nhập VIVE</h1>
          <FormDangNhap />
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div className="max-w-[540px] w-full mx-auto px-4 md:px-6 pt-4 md:pt-8">
        <NutQuayLai fallback="/" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-[480px] mx-auto min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-hong-nhat flex items-center justify-center mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2B2B2A"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className="tieu-de-trang mb-3">
          Đăng nhập VIVE
        </h1>
        <p className="text-[15px] text-xam-dam leading-relaxed mb-6">
          Tính năng đăng nhập tài khoản khách hàng để đồng bộ lịch sử và nhận ưu đãi riêng đang được chuẩn bị (W030).
          Hiện tại bạn có thể quẹt và giữ hàng tại booth hoàn toàn miễn phí mà không cần đăng nhập.
        </p>
        <Link
          href="/quet"
          className={lopNut("chinh")}
        >
          Tiếp tục quẹt sản phẩm
        </Link>
      </div>
    </div>
  );
}
