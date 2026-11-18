import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { NutQuayLai } from "@/components/NutQuayLai";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";

export const metadata: Metadata = {
  title: "Chính sách bảo mật & giữ hàng · VIVE",
  description:
    "Quy định bảo mật dữ liệu cá nhân, giữ hàng miễn phí tại booth LL2 Union Square và thông tin đơn vị vận hành VIVE.",
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
            {CAU_HINH_BOOTH.diaChiNgan}.
          </p>
        </header>

        <main className="flex flex-col gap-4">
          <section
            aria-labelledby="muc-bao-mat"
            className="rounded-[24px] bg-hong-nhat p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2 id="muc-bao-mat" className="m-0 text-[18px] md:text-[20px] font-bold text-den">
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
                booth hoặc email hỗ trợ <span>[chờ W001]</span>.
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="muc-giu-hang"
            className="rounded-[24px] bg-bac-ha-nhat p-5 md:p-6 flex flex-col gap-2.5"
          >
            <h2 id="muc-giu-hang" className="m-0 text-[18px] md:text-[20px] font-bold text-den">
              2. Quy định giữ hàng tại booth
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>Thanh toán trực tiếp tại quầy:</strong> Việc giữ hàng trên
                web là hoàn toàn miễn phí và không thu tiền trước. Khách thanh
                toán và nhận sản phẩm tại quầy POS KiotViet ở{" "}
                {CAU_HINH_BOOTH.diaChiNgan}.
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
            <h2 id="muc-doi-tra" className="m-0 text-[18px] md:text-[20px] font-bold text-den">
              3. Đổi trả, nhãn phụ &amp; khuyến mại
            </h2>
            <ul className="m-0 pl-5 flex flex-col gap-2 text-[14px] md:text-[15px] text-xam-dam leading-relaxed">
              <li>
                <strong>Đổi trả tại quầy:</strong> Sản phẩm được kiểm tra nguyên
                trạng, tem niêm phong khi nhận và áp dụng chính sách đổi trả trực
                tiếp theo quy định của booth VIVE.{" "}
                <span>[chờ W001: chi tiết điều kiện/thời hạn đổi trả]</span>
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
              4. Thông tin đơn vị vận hành &amp; pháp lý
            </h2>
            <dl className="m-0 grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-y-2 gap-x-4 text-[14px] md:text-[15px] text-xam-dam">
              <dt className="font-semibold text-den">Địa điểm Pop-up</dt>
              <dd className="m-0">
                VIVE | K-Beauty Experience, tầng LL2 Union Square, 171 Đồng Khởi,
                Phường Sài Gòn ({CAU_HINH_BOOTH.gioMoCua})
              </dd>

              <dt className="font-semibold text-den">Tên doanh nghiệp / HKD</dt>
              <dd className="m-0">[chờ W001]</dd>

              <dt className="font-semibold text-den">Mã số thuế / Số ĐKKD</dt>
              <dd className="m-0">[chờ W001]</dd>

              <dt className="font-semibold text-den">Địa chỉ ĐKKD</dt>
              <dd className="m-0">[chờ W001]</dd>

              <dt className="font-semibold text-den">Điện thoại &amp; Email</dt>
              <dd className="m-0">[chờ W001]</dd>

              <dt className="font-semibold text-den">Thông báo Bộ Công Thương</dt>
              <dd className="m-0">[chờ W001: xác nhận nghĩa vụ theo Luật TMĐT 2025 / NĐ 248/2026]</dd>

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
