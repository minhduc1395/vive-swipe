import { lopNut } from "@/components/ui/Nut";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NutQuayLai } from "@/components/NutQuayLai";
import { layDonGiuHangTheoMa } from "@/lib/giu-hang/kho-giu-hang";
import { ChiTietMaGiuHang } from "./ChiTietMaGiuHang";

export const dynamic = "force-dynamic";

export default async function TrangMaGiuHang({
  params,
}: {
  params: Promise<{ ma: string }>;
}) {
  const { ma } = await params;
  const t = await getTranslations("giu-hang");
  const maChuanHoa = decodeURIComponent(ma).toUpperCase();

  const donGoc = await layDonGiuHangTheoMa(maChuanHoa);

  if (!donGoc) {
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <div className="max-w-[540px] w-full mx-auto px-4 md:px-6 pt-4 md:pt-8">
          <NutQuayLai fallback="/gio" nhan={t("chung.quayLai")} />
        </div>
        <main className="max-w-[540px] mx-auto px-6 py-12 flex flex-col items-center gap-4 text-center">
          <h1 className="m-0 text-[24px] font-bold">{t("ma.khongThay", { ma: maChuanHoa })}</h1>
          <p className="m-0 text-[15px] text-xam-dam">{t("ma.khongThayMoTa")}</p>
          <Link href="/gio" className={lopNut("phu","lon")}>{t("ma.veGio")}</Link>
        </main>
      </div>
    );
  }

  // Ai biết mã cũng mở được trang này: ẩn bớt số điện thoại, che bớt email
  const don = {
    ...donGoc,
    sdt: donGoc.sdt.replace(/^(\d{2})\d+(\d{3})$/, "$1•••••$2"),
    email: donGoc.email ? donGoc.email.replace(/^(.)[^@]*(@.*)$/, "$1•••$2") : null,
  };

  return (
    <div className="max-w-[540px] mx-auto px-4 md:px-6 py-4 md:py-8 w-full">
      <main>
        <ChiTietMaGiuHang don={don} />
      </main>
    </div>
  );
}
