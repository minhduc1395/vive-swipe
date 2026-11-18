import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function TrangDangNhap() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-[480px] mx-auto min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-[#F7EEEB] flex items-center justify-center mb-4">
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
        <h1 className="text-[26px] md:text-[32px] font-bold tracking-tight mb-2">
          Đăng nhập VIVE
        </h1>
        <p className="text-[15px] text-[#5C5C5B] leading-relaxed mb-6">
          Tính năng đăng nhập tài khoản khách hàng để đồng bộ lịch sử và nhận ưu đãi riêng đang được chuẩn bị (W030).
          Hiện tại bạn có thể quẹt và giữ hàng tại booth hoàn toàn miễn phí mà không cần đăng nhập.
        </p>
        <Link
          href="/quet"
          className="h-11 px-6 rounded-full bg-den text-trang font-semibold inline-flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          Tiếp tục quẹt sản phẩm
        </Link>
      </div>
    </AppShell>
  );
}
