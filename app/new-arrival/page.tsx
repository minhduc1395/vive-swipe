import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function TrangNewArrival() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-[640px] mx-auto min-h-[60vh]">
        <span className="text-[12px] font-bold tracking-wider text-[#737373] uppercase mb-2">
          Chiến dịch mới
        </span>
        <h1 className="text-[28px] md:text-[36px] font-bold tracking-tight mb-3">
          New Arrival: LOPOE Better Balance
        </h1>
        <p className="text-[15px] md:text-[16px] text-[#5C5C5B] leading-relaxed mb-6">
          Bộ sản phẩm cân bằng da chuyên sâu từ Hàn Quốc. Trang chiến dịch với trải nghiệm 3D đang được hoàn thiện (W027).
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/quet"
            className="h-11 px-6 rounded-full bg-den text-trang font-semibold inline-flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            Bắt đầu quẹt sản phẩm
          </Link>
          <Link
            href="/danh-muc?thuong_hieu=LOPOE"
            className="h-11 px-6 rounded-full border border-[#E8D2CC] text-den font-semibold inline-flex items-center justify-center hover:bg-[#F7EEEB] transition-colors"
          >
            Xem bộ sản phẩm LOPOE
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
