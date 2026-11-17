import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";

export default function TrangChinhSach() {
  return (
    <KhungDienThoai>
      <header className="flex items-center gap-1 pt-5 px-2">
        <Link
          href="/"
          aria-label="Quay lại"
          className="w-11 h-11 flex items-center justify-center rounded-full"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="m-0 text-[20px] font-semibold">
          Chính sách bảo mật &amp; giữ hàng
        </h1>
      </header>

      <main className="px-5 pt-4">
        <div className="rounded-[22px] bg-hong-nhat p-5">
          <p className="m-0 text-[15px] text-xam-dam">
            Khung trang chính sách bảo mật dữ liệu, quy định giữ hàng và thông tin doanh nghiệp (W019).
          </p>
        </div>
      </main>
    </KhungDienThoai>
  );
}
