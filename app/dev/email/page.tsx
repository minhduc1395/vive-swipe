import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { layDanhSachEmailDev } from "@/lib/email/store";
import { DanhSachEmailDev } from "./DanhSachEmailDev";

export const dynamic = "force-dynamic";

export default function TrangXemTruocEmailDev() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const emails = layDanhSachEmailDev();

  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-[#F7EEEB]">
          <div>
            <h1 className="m-0 text-[24px] font-bold text-den">
              Hộp thư xem trước local (`/dev/email`)
            </h1>
            <p className="mt-1 mb-0 text-[14px] text-xam">
              Chỉ bật ở môi trường development. Bắt các email giữ hàng và deal được gửi khi chạy local (docs/02 mục 9).
            </p>
          </div>
          <Link
            href="/giu-hang"
            className="text-[14px] font-semibold text-den hover:underline"
          >
            ← Về trang giữ hàng
          </Link>
        </header>

        <main>
          <DanhSachEmailDev emails={emails} />
        </main>
      </div>
    </AppShell>
  );
}
