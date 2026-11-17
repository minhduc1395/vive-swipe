import { KhungUngDung } from "@/components/KhungUngDung";

export default function TrangDaThich() {
  return (
    <KhungUngDung>
      <header className="px-5 pt-7 flex items-baseline gap-2">
        <h1 className="m-0 text-[28px] font-semibold">Đã thích</h1>
      </header>
      <section className="px-5 pt-4">
        <div className="rounded-[24px] bg-hong-nhat p-5">
          <p className="m-0 text-[15px] text-xam-dam">
            Quẹt phải để lưu món bạn thích. Danh sách sẽ hiển thị ở W012.
          </p>
        </div>
      </section>
    </KhungUngDung>
  );
}
