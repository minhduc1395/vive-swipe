import { AppShell } from "@/components/AppShell";
import { NutQuayLai } from "@/components/NutQuayLai";

export default function TrangChinhSach() {
  return (
    <AppShell>
      <div className="max-w-[760px] w-full mx-auto px-5 md:px-8 py-4 md:py-8">
        <header className="flex flex-col items-start gap-1 pb-4">
          <NutQuayLai fallback="/" />
          <h1 className="m-0 text-[24px] md:text-[28px] font-bold text-den">
            Chính sách bảo mật &amp; giữ hàng
          </h1>
        </header>

        <main>
          <div className="rounded-[22px] bg-hong-nhat p-5 md:p-6">
            <p className="m-0 text-[15px] text-xam-dam">
              Khung trang chính sách bảo mật dữ liệu, quy định giữ hàng và thông tin doanh nghiệp (W019).
            </p>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
