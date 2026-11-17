import { notFound } from "next/navigation";
import { KhungDienThoai } from "@/components/KhungDienThoai";

export const dynamic = "force-dynamic";

export default function TrangXemTruocEmailDev() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <KhungDienThoai>
      <main className="px-5 py-7 flex flex-col gap-3">
        <h1 className="m-0 text-[24px] font-bold">
          Xem trước email (chế độ local)
        </h1>
        <div className="rounded-[22px] bg-hong-nhat p-5">
          <p className="m-0 text-[15px] text-xam-dam">
            Trang chỉ bật ở môi trường development để xem email mẫu khi chạy local (docs/02 mục 9).
          </p>
        </div>
      </main>
    </KhungDienThoai>
  );
}
