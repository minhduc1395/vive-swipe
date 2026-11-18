import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { NutQuayLai } from "@/components/NutQuayLai";

export const metadata: Metadata = {
  title: "Personal Color cùng Pawlette (bản tạm) · VIVE",
  description:
    "Trải nghiệm đo tông Personal Color cùng Pawlette tại booth VIVE — tìm nhóm màu phù hợp làn da và chọn sản phẩm đúng tông.",
};

interface NhomMau {
  ten: string;
  moTa: string;
  mau: string[];
}

const BON_NHOM_MAU: NhomMau[] = [
  {
    ten: "Xuân ấm",
    moTa: "Tông ấm, sáng, trong.",
    mau: ["#F6C9A9", "#F3A683", "#F9E0A8", "#BFD8A5"],
  },
  {
    ten: "Hạ mát",
    moTa: "Tông lạnh, nhạt, dịu.",
    mau: ["#C9D6EA", "#E7C6D9", "#B8C9D9", "#D9D2E6"],
  },
  {
    ten: "Thu ấm",
    moTa: "Tông ấm, trầm, đậm.",
    mau: ["#C98B5E", "#A6683F", "#D6B46A", "#7D7A45"],
  },
  {
    ten: "Đông lạnh",
    moTa: "Tông lạnh, rõ, tương phản cao.",
    mau: ["#2F3A66", "#B3264B", "#E9E6F0", "#1F1F1F"],
  },
];

interface BuocTraiNghiem {
  so: string;
  tieuDe: string;
  moTa: string;
}

const BA_BUOC_BOOTH: BuocTraiNghiem[] = [
  {
    so: "01",
    tieuDe: "Đo tông",
    moTa: "Chuyên viên Pawlette đặt các dải vải màu sát mặt để xem tông nào làm da sáng hơn.",
  },
  {
    so: "02",
    tieuDe: "Nhận bảng màu",
    moTa: "Bạn biết mình thuộc nhóm nào và những màu nên chọn. [Nội dung gói do Pawlette xác nhận]",
  },
  {
    so: "03",
    tieuDe: "Thử ngay lớp nền",
    moTa: "Sang tủ trang điểm bên cạnh thử lớp lót và tông nền hợp nhóm màu của bạn.",
  },
];

export default function TrangPersonalColor() {
  return (
    <AppShell>
      <div className="bg-trang text-den">
        {/* Khối quay lại */}
        <div className="max-w-[1360px] mx-auto px-5 md:px-8 pt-4 md:pt-6">
          <NutQuayLai fallback="/" />
        </div>

        {/* Hero theo Pawlette.dc.html */}
        <section
          aria-labelledby="personal-color-heading"
          className="max-w-[1360px] mx-auto px-5 md:px-8 pt-4 pb-12 md:pt-8 md:pb-20 flex flex-wrap items-center gap-8 md:gap-12"
        >
          <div className="flex-1 basis-[300px] md:basis-[440px] flex flex-col gap-5">
            <span className="self-start px-3.5 py-1.5 rounded-full bg-bac-ha-nhat text-den text-[12px] md:text-[13px] font-bold tracking-[1px]">
              PAWLETTE × VIVE · BẢN TẠM
            </span>

            <h1
              id="personal-color-heading"
              className="m-0 text-[52px] sm:text-[72px] md:text-[96px] leading-[0.95] font-bold tracking-[-0.04em] text-den"
            >
              Personal
              <br />
              <span
                className="inline-block px-1.5"
                style={{ boxShadow: "inset 0 -0.26em 0 #E8D2CC" }}
              >
                Color
              </span>
            </h1>

            <p className="m-0 text-[17px] md:text-[19px] leading-[1.6] text-xam-dam max-w-[460px]">
              Tìm tông màu hợp làn da, rồi chọn son, phấn, lớp nền đúng tông.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/#booth"
                className="min-h-[54px] md:h-[58px] px-7 rounded-full bg-den text-trang hover:bg-black transition-colors inline-flex items-center gap-2.5 text-[15px] md:text-[16px] font-semibold no-underline"
              >
                <span>Đặt lịch tại booth</span>
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

              <div className="flex flex-col">
                <span className="text-[13px] text-xam">Gói trải nghiệm</span>
                <span className="text-[24px] md:text-[26px] font-bold text-den leading-tight">
                  378.000đ
                </span>
              </div>
            </div>
          </div>

          {/* Vòng màu xoay bên phải (tắt animation khi prefers-reduced-motion: reduce) */}
          <div
            aria-hidden="true"
            className="relative flex-1 basis-[280px] md:basis-[460px] h-[280px] sm:h-[360px] md:h-[440px] flex items-center justify-center"
          >
            <div
              data-testid="vong-mau-xoay"
              className="vong-mau-xoay w-[250px] h-[250px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] rounded-full"
              style={{
                background:
                  "conic-gradient(#F6C9A9, #F9E0A8, #BFD8A5, #C9D6EA, #E7C6D9, #2F3A66, #B3264B, #A6683F, #C98B5E, #F6C9A9)",
              }}
            />
            <div className="absolute w-[148px] h-[148px] sm:w-[186px] sm:h-[186px] md:w-[210px] md:h-[210px] rounded-full bg-trang flex flex-col items-center justify-center gap-1 shadow-xs">
              <span className="text-[12px] md:text-[13px] font-semibold text-xam">
                Bạn là
              </span>
              <span className="text-[26px] md:text-[30px] font-bold text-den leading-none">
                ?
              </span>
            </div>
          </div>
        </section>

        {/* 4 nhóm màu */}
        <section aria-labelledby="bon-nhom-mau-heading" className="bg-hong-nhat">
          <div className="max-w-[1360px] mx-auto px-5 md:px-8 py-12 md:py-20 flex flex-col gap-7">
            <h2
              id="bon-nhom-mau-heading"
              className="m-0 text-[32px] md:text-[48px] font-bold tracking-[-0.03em] text-den"
            >
              4 nhóm màu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BON_NHOM_MAU.map((nhom) => (
                <article
                  key={nhom.ten}
                  className="rounded-[26px] bg-trang p-[18px] flex flex-col gap-3 shadow-[0_10px_26px_rgba(43,43,42,0.06)]"
                >
                  <div className="flex gap-1.5 h-[110px]" aria-hidden="true">
                    {nhom.mau.map((hex) => (
                      <span
                        key={hex}
                        className="flex-1 rounded-[12px]"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <h3 className="m-0 text-[20px] font-bold text-den">
                    {nhom.ten}
                  </h3>
                  <p className="m-0 text-[14px] leading-[1.5] text-xam-dam">
                    {nhom.moTa}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trải nghiệm tại booth */}
        <section
          aria-labelledby="trai-nghiem-booth-heading"
          className="max-w-[1360px] mx-auto px-5 md:px-8 py-12 md:py-20 flex flex-col gap-7"
        >
          <h2
            id="trai-nghiem-booth-heading"
            className="m-0 text-[32px] md:text-[48px] font-bold tracking-[-0.03em] text-den"
          >
            Trải nghiệm tại booth
          </h2>

          <ol className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-5">
            {BA_BUOC_BOOTH.map((buoc) => (
              <li
                key={buoc.so}
                className="rounded-[26px] bg-hong-nhat p-[26px] flex flex-col gap-2.5"
              >
                <span
                  aria-hidden="true"
                  className="text-[44px] font-bold leading-none text-transparent"
                  style={{ WebkitTextStroke: "1.5px #2B2B2A" }}
                >
                  {buoc.so}
                </span>
                <h3 className="m-0 text-[20px] font-bold text-den">
                  {buoc.tieuDe}
                </h3>
                <p className="m-0 text-[15px] leading-[1.55] text-xam-dam">
                  {buoc.moTa}
                </p>
              </li>
            ))}
          </ol>

          <p className="m-0 text-[14px] text-xam">
            Thời lượng, số khách mỗi khung giờ, nội dung gói: chờ Pawlette cung cấp.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
