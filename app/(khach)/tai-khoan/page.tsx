import { NutQuayLai } from "@/components/NutQuayLai";
import { ThongTinTaiKhoan } from "@/components/tai-khoan/ThongTinTaiKhoan";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { dangNhapEmailBat } from "@/lib/tai-khoan/co";

export default async function TrangTaiKhoan() {
  // #65: tắt cờ đăng nhập email thì chưa có trang tài khoản, về trang chờ.
  if (!dangNhapEmailBat()) redirect("/dang-nhap");
  const t = await getTranslations("tai-khoan");
  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div className="max-w-[540px] w-full mx-auto px-4 md:px-6 pt-4 md:pt-8">
        <NutQuayLai fallback="/" nhan={t("chung.quayLai")} />
      </div>
      <div className="flex-1 flex flex-col items-center p-6 pt-4 max-w-[440px] w-full mx-auto min-h-[60vh]">
        <h1 className="tieu-de-trang mb-4 self-start">{t("chung.taiKhoan")}</h1>
        <ThongTinTaiKhoan />
      </div>
    </div>
  );
}
