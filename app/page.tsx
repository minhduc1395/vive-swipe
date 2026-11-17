import Link from "next/link";
import { KhungDienThoai } from "@/components/KhungDienThoai";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";

export default function TrangChao() {
  return (
    <KhungDienThoai>
      <div className="relative h-[530px] shrink-0 bg-hong-nhat rounded-b-[44px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/vive-logo-black.png"
          alt="VIVE"
          className="absolute left-1/2 top-11 w-[92px] h-auto -translate-x-1/2"
        />

        <div aria-hidden="true">
          <div className="absolute left-[28px] top-[178px] w-[164px] h-[222px] rounded-[26px] bg-trang -rotate-12 shadow-[0_10px_28px_rgba(43,43,42,0.10)] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/products/8809369850262.webp"
              alt=""
              className="w-[142px] h-[142px] object-contain"
            />
            <div className="absolute -left-2 -top-2 w-[42px] h-[42px] rounded-full bg-trang border-[1.5px] border-den flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2B2B2A"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
          </div>

          <div className="absolute right-[28px] top-[178px] w-[164px] h-[222px] rounded-[26px] bg-trang rotate-12 shadow-[0_10px_28px_rgba(43,43,42,0.10)] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/products/8809369850248.webp"
              alt=""
              className="w-[142px] h-[142px] object-contain"
            />
          </div>

          <div className="absolute left-1/2 top-[140px] -translate-x-1/2 w-[192px] h-[260px] rounded-[30px] bg-trang shadow-[0_18px_40px_rgba(43,43,42,0.16)] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/products/8809369850521.webp"
              alt=""
              className="w-[170px] h-[170px] object-contain"
            />
            <div className="absolute -right-3.5 -top-3.5 w-[50px] h-[50px] rounded-full bg-den flex items-center justify-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col px-7 pt-[34px] pb-[26px]">
        <h1 className="m-0 text-center font-bold text-[40px] leading-[1.15] tracking-[-1.2px] text-den">
          Thích thì
          <br />
          <span className="vet-hong-lon">quẹt phải</span>
        </h1>

        <div className="mt-auto pt-5 flex flex-col items-center gap-1.5">
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

          <p className="m-0 flex items-center gap-1.5 text-center text-[13px] text-xam">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {CAU_HINH_BOOTH.diaChiNgan} · {CAU_HINH_BOOTH.gioMoCua}
          </p>
        </div>
      </main>
    </KhungDienThoai>
  );
}
