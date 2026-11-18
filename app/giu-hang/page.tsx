import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FormGiuHang } from "./FormGiuHang";

export default function TrangGiuHang() {
  return (
    <AppShell>
      <div className="max-w-[540px] lg:max-w-[1040px] w-full mx-auto px-4 md:px-6 py-4 md:py-8">
        <header className="flex items-center gap-2 mb-4">
          <Link
            href="/gio"
            aria-label="Quay lại giỏ"
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-hong-nhat transition-colors text-den"
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
          <h1 className="m-0 text-[20px] md:text-[22px] font-bold text-den">
            Giữ hàng tại booth
          </h1>
        </header>

        <main>
          <FormGiuHang />
        </main>
      </div>
    </AppShell>
  );
}
