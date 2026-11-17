import { KhungUngDung } from "@/components/KhungUngDung";

export default function TrangDanhMuc() {
  return (
    <KhungUngDung>
      <header className="px-5 pt-7">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.4px]">
          Danh mục
        </h1>
      </header>
      <section className="px-5 pt-4">
        <div className="rounded-[24px] bg-hong-nhat p-5">
          <p className="m-0 text-[15px] text-xam-dam">
            Khung trang tìm kiếm và lọc theo loại sản phẩm, vấn đề da, thương hiệu (W026).
          </p>
        </div>
      </section>
    </KhungUngDung>
  );
}
