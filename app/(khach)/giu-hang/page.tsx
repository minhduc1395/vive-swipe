import { NutQuayLai } from "@/components/NutQuayLai";
import { FormGiuHang } from "./FormGiuHang";

export default function TrangGiuHang() {
  return (
    <div className="max-w-[540px] lg:max-w-[1040px] w-full mx-auto px-4 md:px-6 py-4 md:py-8">
      <header className="flex flex-col items-start gap-1 mb-4">
        <NutQuayLai fallback="/gio" />
        <h1 className="m-0 text-[22px] md:text-[26px] font-bold text-den">
          Giữ hàng tại booth
        </h1>
      </header>

      <main>
        <FormGiuHang />
      </main>
    </div>
  );
}
