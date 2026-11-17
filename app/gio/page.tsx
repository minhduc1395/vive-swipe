import { KhungUngDung } from "@/components/KhungUngDung";

export default function TrangGio() {
  return (
    <KhungUngDung>
      <header className="px-5 pt-7">
        <h1 className="m-0 text-[28px] font-semibold">Giỏ hàng</h1>
      </header>
      <section className="px-5 pt-4">
        <div className="rounded-[22px] bg-hong-nhat p-5">
          <p className="m-0 text-[15px] text-xam-dam">
            Giỏ đang trống. Quẹt lên để thêm nhanh.
          </p>
        </div>
      </section>
    </KhungUngDung>
  );
}
