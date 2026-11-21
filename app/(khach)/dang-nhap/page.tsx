import { NutQuayLai } from "@/components/NutQuayLai";
import { FormDangNhap } from "@/components/tai-khoan/FormDangNhap";

export default function TrangDangNhap() {
  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div className="max-w-[540px] w-full mx-auto px-4 md:px-6 pt-4 md:pt-8">
        <NutQuayLai fallback="/" />
      </div>
      <div className="flex-1 flex flex-col items-center p-6 pt-4 text-center max-w-[440px] w-full mx-auto min-h-[60vh]">
        <h1 className="tieu-de-trang mb-4">Đăng nhập VIVE</h1>
        <FormDangNhap />
      </div>
    </div>
  );
}
