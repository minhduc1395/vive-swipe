import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";

export default function TrangBatDau() {
  return (
    <KhungDienThoai>
      <header className="flex items-center gap-3 pt-5 px-4 pb-2">
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

        <div
          className="flex-1 grid grid-cols-3 gap-1.5"
          role="img"
          aria-label="Câu 1 trên 3"
        >
          <div className="h-1 rounded bg-den" />
          <div className="h-1 rounded bg-hong-nhat" />
          <div className="h-1 rounded bg-hong-nhat" />
        </div>

        <Link
          href="/quet"
          className="text-[15px] font-medium no-underline px-2 py-2.5"
        >
          Bỏ qua
        </Link>
      </header>

      <main className="flex-1 px-6 pt-5 pb-7 flex flex-col gap-3">
        <span className="text-[13px] font-semibold tracking-[1.2px] text-xam">
          CÂU 1/3
        </span>
        <h1 className="m-0 text-[28px] leading-[1.2] font-semibold">
          Da bạn thuộc <span className="vet-hong">loại nào?</span>
        </h1>
        <p className="m-0 text-[15px] leading-relaxed text-xam">
          Khung 3 câu hỏi khởi tạo. Nội dung tương tác sẽ được nối ở W010.
        </p>

        <div className="mt-auto">
          <Link
            href="/quet"
            className="w-full h-[56px] rounded-full bg-den text-trang no-underline flex items-center justify-center font-semibold text-[16px]"
          >
            Vào quẹt ngay
          </Link>
        </div>
      </main>
    </KhungDienThoai>
  );
}
