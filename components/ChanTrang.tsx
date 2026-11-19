import Link from "next/link";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import doanhNghiepJson from "@/lib/data/doanh-nghiep.json";
import type { DoanhNghiep } from "@/lib/data/types";

const DOANH_NGHIEP = doanhNghiepJson as DoanhNghiep;

interface ChanTrangProps {
  className?: string;
}

/**
 * Chân trang thống nhất cho mọi trang khách (W019, docs/03 mục 5 & 8).
 * Dữ liệu đơn vị vận hành đọc từ data/doanh-nghiep.yaml; ẩn SĐT nếu null.
 */
export function ChanTrang({ className = "" }: ChanTrangProps) {
  return (
    <footer
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 260px" }}
      className={`relative z-10 bg-trang border-t border-vien py-8 md:py-10 px-5 sm:px-8 md:px-12 text-[13px] md:text-[14px] text-xam ${className}`}
    >
      <div className="max-w-[1280px] mx-auto flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 flex-wrap">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/vive-logo-chu.webp"
              alt="VIVE"
              width={64}
              height={31}
              loading="lazy"
              decoding="async"
              className="w-16 h-auto object-contain"
            />
            <span className="text-[13px] text-xam leading-snug">
              {DOANH_NGHIEP.ten_cua_hang} · {DOANH_NGHIEP.dia_diem_booth} ·{" "}
              {CAU_HINH_BOOTH.gioMoCua}
            </span>
          </div>

          <nav
            aria-label="Mạng xã hội"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-den"
          >
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Facebook: VIVE - K Beauty Experience
            </a>
            <a
              href="https://instagram.com/vive.k_beauty"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Instagram: @vive.k_beauty
            </a>
            <a
              href="https://tiktok.com/@viveuniverse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              TikTok: @viveuniverse
            </a>
          </nav>
        </div>

        <div className="pt-4 border-t border-vien/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-xam">
          <span className="leading-relaxed">
            {DOANH_NGHIEP.ten_cong_ty} · MST: {DOANH_NGHIEP.ma_so_thue} ·{" "}
            {DOANH_NGHIEP.dia_chi} · Email: {DOANH_NGHIEP.email}
            {DOANH_NGHIEP.so_dien_thoai
              ? ` · SĐT: ${DOANH_NGHIEP.so_dien_thoai}`
              : ""}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/chinh-sach" prefetch={false} className="text-den font-medium hover:underline">
              Chính sách &amp; Pháp lý
            </Link>
            <span>·</span>
            <span>© 2026 VIVE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
