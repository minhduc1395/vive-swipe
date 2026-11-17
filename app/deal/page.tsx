import { KhungUngDung } from "@/components/KhungUngDung";

export default function TrangDeal() {
  return (
    <KhungUngDung>
      <header className="px-5 pt-7">
        <h1 className="m-0 text-[28px] font-semibold">
          Deal <span className="vet-hong">cho bạn</span>
        </h1>
      </header>
      <section className="px-5 pt-4">
        <div className="rounded-[24px] bg-bac-ha-nhat p-5">
          <p className="m-0 text-[15px] text-xam-dam">
            Khung trang Deal gợi ý theo sở thích và bộ combo (W016).
          </p>
        </div>
      </section>
    </KhungUngDung>
  );
}
