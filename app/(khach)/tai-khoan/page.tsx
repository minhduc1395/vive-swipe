import { NutQuayLai } from "@/components/NutQuayLai";
import { ThongTinTaiKhoan } from "@/components/tai-khoan/ThongTinTaiKhoan";

export default function TrangTaiKhoan() {
  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div className="max-w-[540px] w-full mx-auto px-4 md:px-6 pt-4 md:pt-8">
        <NutQuayLai fallback="/" />
      </div>
      <div className="flex-1 flex flex-col items-center p-6 pt-4 max-w-[440px] w-full mx-auto min-h-[60vh]">
        <h1 className="tieu-de-trang mb-4 self-start">Tài khoản</h1>
        <ThongTinTaiKhoan />
      </div>
    </div>
  );
}
