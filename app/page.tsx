import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";

export default function TrangChao() {
  return (
    <KhungDienThoai>
      <div className="relative h-[460px] shrink-0 bg-hong-nhat rounded-b-[44px] overflow-hidden flex flex-col items-center justify-between pt-11 pb-10 px-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vive-logo-black.png"
          alt="VIVE"
          className="w-[100px] h-auto"
        />

        <div className="w-[192px] h-[240px] rounded-[30px] bg-trang shadow-[0_18px_40px_rgba(43,43,42,0.12)] flex items-center justify-center p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/products/8809369850521.webp"
            alt="Sản phẩm nổi bật tại VIVE"
            className="w-[160px] h-[160px] object-contain"
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col px-7 pt-8 pb-7">
        <h1 className="m-0 text-center font-bold text-[40px] leading-[1.15] tracking-[-1.2px] text-den">
          Thích thì
          <br />
          <span className="vet-hong-lon">quẹt phải</span>
        </h1>
        <p className="mt-3 mb-0 text-center text-[15px] leading-relaxed text-xam">
          Quẹt phải món hợp da. VIVE tìm deal cho bạn.
        </p>

        <div className="mt-auto pt-6 flex flex-col items-center gap-2">
          <Link
            href="/bat-dau"
            className="w-full h-[58px] rounded-full bg-den text-trang no-underline flex items-center justify-center gap-2.5 font-semibold text-[16px] tracking-[0.2px]"
          >
            Bắt đầu quẹt
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          <Link
            href="/danh-muc"
            className="h-11 inline-flex items-center gap-2 text-[15px] font-semibold text-den no-underline"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Xem theo danh mục
          </Link>

          <p className="m-0 pt-1 text-center text-[13px] text-xam">
            {CAU_HINH_BOOTH.diaChiDayDu} · {CAU_HINH_BOOTH.gioMoCua}
          </p>
        </div>
      </main>
    </KhungDienThoai>
  );
}
