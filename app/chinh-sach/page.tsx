import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { NutQuayLai } from "@/components/NutQuayLai";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import { DOANH_NGHIEP } from "@/lib/data";

export const metadata: Metadata = {
  title: `Chính sách bảo mật & giữ hàng · ${DOANH_NGHIEP.ten_cua_hang}`,
  description: `Quy định bảo mật dữ liệu cá nhân, giữ hàng miễn phí tại ${DOANH_NGHIEP.dia_diem_booth} và thông tin ${DOANH_NGHIEP.ten_cong_ty}.`,
};

export default function TrangChinhSach() {
  return (
    <AppShell>
      <div className="max-w-[820px] w-full mx-auto px-5 md:px-8 py-5 md:py-10 flex flex-col gap-6">
        <header className="flex flex-col items-start gap-1">
          <NutQuayLai fallback="/" />
          <h1 className="m-0 text-[26px] md:text-[34px] font-bold tracking-tight text-den">
            Chính sách bảo mật &amp; giữ hàng
          </h1>
          <p className="m-0 text-[15px] text-xam leading-relaxed">
            Áp dụng cho web trải nghiệm sản phẩm VIVE và quầy giữ hàng tại{" "}
            {DOANH_NGHIEP.dia_diem_booth}.
          </p>
        </header>

        <main className="flex flex-col gap-4">
          <section
            aria-labelledby="muc-bao-mat"
            className="rounded-[24px] bg-hong-nhat p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-bao-mat"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              1. Bảo mật dữ liệu cá nhân
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>Thu thập tối thiểu:</strong> VIVE chỉ thu thập họ tên, số
                điện thoại để tạo và đối chiếu mã giữ hàng tại quầy; cùng câu
                trả lời khảo sát da và lượt quẹt để sắp xếp gợi ý phù hợp hơn.
              </li>
              <li>
                <strong>Email ưu đãi theo lựa chọn riêng:</strong> Việc đồng ý
                nhận thông báo deal được tách riêng bằng ô chọn không đánh dấu
                sẵn. Bạn có thể hủy nhận email bất cứ lúc nào chỉ với 1 chạm qua
                liên kết cuối mỗi thư.
              </li>
              <li>
                <strong>Quyền xóa &amp; kiểm tra dữ liệu:</strong> Khách hàng có
                quyền yêu cầu xem hoặc xóa lịch sử cá nhân thông qua nhân viên tại
                booth hoặc email{" "}
                <a
                  href={`mailto:${DOANH_NGHIEP.email}`}
                  className="text-den underline"
                >
                  {DOANH_NGHIEP.email}
                </a>
                .
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="muc-giu-hang"
            className="rounded-[24px] bg-bac-ha-nhat p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-giu-hang"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              2. Quy định giữ hàng tại booth
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>Thanh toán trực tiếp tại quầy:</strong> Việc giữ hàng trên
                web là hoàn toàn miễn phí và không thu tiền trước. Khách thanh
                toán và nhận sản phẩm tại quầy POS KiotViet ở{" "}
                {DOANH_NGHIEP.dia_diem_booth}.
              </li>
              <li>
                <strong>Giá &amp; quà ước tính:</strong> Tổng tiền và quà tặng
                trên web là ước tính theo chương trình đang chạy tại thời điểm
                tạo mã và được nhân viên xác nhận lại khi thanh toán thực tế.
              </li>
              <li>
                <strong>Hạn giữ hàng &amp; hủy tự động:</strong> Mã giữ hàng có
                hiệu lực đến {CAU_HINH_BOOTH.giuHangDenGio} của ngày hẹn lấy. Quá
                thời hạn này, đơn tự động hết hạn để nhường tồn kho cho khách
                tại quầy.
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="muc-doi-tra"
            className="rounded-[24px] bg-trang border border-vien p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-doi-tra"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              3. Đổi trả, nhãn phụ &amp; khuyến mại
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>Đổi trả tại quầy:</strong> Khách kiểm tra nguyên trạng sản
                phẩm và tem niêm phong khi nhận hàng; mọi yêu cầu đổi trả được xử
                lý trực tiếp tại quầy {DOANH_NGHIEP.ten_cua_hang} hoặc qua{" "}
                {DOANH_NGHIEP.email}.
              </li>
              <li>
                <strong>Nhãn phụ tiếng Việt:</strong> Sản phẩm mỹ phẩm nội địa
                Hàn nhập khẩu và quà tặng kèm được gắn đầy đủ nhãn phụ tiếng Việt
                tại quầy trước khi bàn giao cho khách.
              </li>
              <li>
                <strong>Khuyến mại minh bạch:</strong> Chương trình khuyến mại
                chỉ áp dụng khi đang trong thời gian hiệu lực và đủ điều kiện;
                khuyến mại may rủi chỉ công khai sau khi hoàn tất đăng ký với Sở
                Công Thương.
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="muc-doanh-nghiep"
            className="rounded-[24px] bg-trang border border-vien p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2
              id="muc-doanh-nghiep"
              className="m-0 text-[18px] md:text-[20px] font-bold text-den"
            >
              4. Thông tin doanh nghiệp
            </h2>
            <dl className="m-0 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-y-2.5 gap-x-4 text-[14px] md:text-[15px] text-xam-dam">
              <dt className="font-semibold text-den">Tên doanh nghiệp</dt>
              <dd className="m-0">{DOANH_NGHIEP.ten_cong_ty}</dd>

              <dt className="font-semibold text-den">Mã số thuế</dt>
              <dd className="m-0">{DOANH_NGHIEP.ma_so_thue}</dd>

              <dt className="font-semibold text-den">Địa chỉ doanh nghiệp</dt>
              <dd className="m-0">{DOANH_NGHIEP.dia_chi}</dd>

              <dt className="font-semibold text-den">Email liên hệ</dt>
              <dd className="m-0">
                <a
                  href={`mailto:${DOANH_NGHIEP.email}`}
                  className="text-den underline"
                >
                  {DOANH_NGHIEP.email}
                </a>
              </dd>

              {DOANH_NGHIEP.so_dien_thoai && (
                <>
                  <dt className="font-semibold text-den">Số điện thoại</dt>
                  <dd className="m-0">{DOANH_NGHIEP.so_dien_thoai}</dd>
                </>
              )}

              <dt className="font-semibold text-den">Cửa hàng pop-up</dt>
              <dd className="m-0">
                {DOANH_NGHIEP.ten_cua_hang} · {DOANH_NGHIEP.dia_diem_booth} (
                {CAU_HINH_BOOTH.gioMoCua})
              </dd>

              <dt className="font-semibold text-den">Kênh chính thức</dt>
              <dd className="m-0">
                Facebook: VIVE - K Beauty Experience · Instagram: @vive.k_beauty
                · TikTok: @viveuniverse
              </dd>
            </dl>
          </section>
        </main>
      </div>
    </AppShell>
  );
}
