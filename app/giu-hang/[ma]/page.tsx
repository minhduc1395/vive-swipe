import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { layDonGiuHangTheoMa } from "@/lib/giu-hang/kho-giu-hang";
import { ChiTietMaGiuHang } from "./ChiTietMaGiuHang";

export const dynamic = "force-dynamic";

export default async function TrangMaGiuHang({
  params,
}: {
  params: Promise<{ ma: string }>;
}) {
  const { ma } = await params;
  const maChuanHoa = decodeURIComponent(ma).toUpperCase();

  const donGoc = await layDonGiuHangTheoMa(maChuanHoa);

  if (!donGoc) {
    return (
      <AppShell>
        <main className="max-w-[540px] mx-auto px-6 py-16 flex flex-col items-center gap-4 text-center">
          <h1 className="m-0 text-[24px] font-bold">Không tìm thấy mã {maChuanHoa}</h1>
          <p className="m-0 text-[15px] text-[#5C5C5B]">Mã có thể đã hết hạn hoặc gõ sai. Bạn kiểm tra lại email xác nhận hoặc hỏi nhân viên tại booth.</p>
          <Link href="/gio" className="h-12 px-6 rounded-full bg-den text-trang flex items-center font-semibold">Về giỏ hàng</Link>
        </main>
      </AppShell>
    );
  }

  // Ai biết mã cũng mở được trang này: ẩn bớt số điện thoại, che bớt email
  const don = {
    ...donGoc,
    sdt: donGoc.sdt.replace(/^(\d{2})\d+(\d{3})$/, "$1•••••$2"),
    email: donGoc.email ? donGoc.email.replace(/^(.)[^@]*(@.*)$/, "$1•••$2") : null,
  };

  return (
    <AppShell>
      <div className="max-w-[540px] mx-auto px-4 md:px-6 py-4 md:py-8">
        <main>
          <ChiTietMaGiuHang don={don} />
        </main>
      </div>
    </AppShell>
  );
}
