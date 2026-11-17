import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";

export default async function TrangMaGiuHang({
  params,
}: {
  params: Promise<{ ma: string }>;
}) {
  const { ma } = await params;

  return (
    <KhungDienThoai>
      <header className="flex items-center gap-1 pt-5 px-2">
        <Link
          href="/quet"
          aria-label="Về trang quẹt"
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
        <h1 className="m-0 text-[20px] font-semibold">Mã giữ hàng</h1>
      </header>

      <main className="px-5 pt-4 flex flex-col gap-3">
        <div className="rounded-[24px] bg-hong-nhat p-6 text-center">
          <p className="m-0 text-[13px] text-xam-dam">Mã giữ hàng</p>
          <p className="mt-1 mb-0 text-[28px] font-bold tracking-tight">{ma}</p>
        </div>
      </main>
    </KhungDienThoai>
  );
}
