import { getTranslations } from "next-intl/server";
import { NutQuayLai } from "@/components/NutQuayLai";
import { FormGiuHang } from "./FormGiuHang";

export default async function TrangGiuHang() {
  const t = await getTranslations("giu-hang");
  return (
    <div className="max-w-[540px] lg:max-w-[1040px] w-full mx-auto px-4 md:px-6 py-4 md:py-8">
      <header className="flex flex-col items-start gap-1 mb-4">
        <NutQuayLai fallback="/gio" nhan={t("chung.quayLai")} />
        <h1 className="tieu-de-trang">
          {t("trang.tieuDe")}
        </h1>
      </header>

      <main>
        <FormGiuHang />
      </main>
    </div>
  );
}
