import { KhungUngDung } from "@/components/KhungUngDung";

export default function TrangQuet() {
  return (
    <KhungUngDung hienThanhTren>
      <div className="flex-1 px-4 pt-2 pb-4 flex flex-col">
        <div className="flex-1 rounded-[28px] bg-hong-nhat border border-vien p-6 flex flex-col items-center justify-center text-center gap-2">
          <h1 className="m-0 text-[24px] font-bold tracking-[-0.5px]">
            Deck quẹt
          </h1>
          <p className="m-0 text-[15px] text-xam-dam">
            Khung trang quẹt sản phẩm. Deck tương tác và hiệu ứng sẽ hoàn thiện ở W011.
          </p>
        </div>
      </div>
    </KhungUngDung>
  );
}
