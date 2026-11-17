import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";

export default function TrangGiuHang() {
  return (
    <KhungDienThoai>
      <header className="flex items-center gap-1 pt-5 px-2">
        <Link
          href="/gio"
          aria-label="Quay lại giỏ"
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
        <h1 className="m-0 text-[20px] font-semibold">Giữ hàng tại booth</h1>
      </header>

      <main className="px-5 pt-4 flex flex-col gap-3">
        <div className="rounded-[22px] bg-hong-nhat p-5">
          <p className="m-0 text-[15px] text-xam-dam">
            Khung form giữ hàng tại booth (W014).
          </p>
        </div>
      </main>
    </KhungDienThoai>
  );
}
