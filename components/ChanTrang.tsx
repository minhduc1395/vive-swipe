import type { CSSProperties } from "react";
import Link from "next/link";
import { CAU_HINH_BOOTH } from "@/lib/cau-hinh";
import doanhNghiepJson from "@/lib/data/doanh-nghiep.json";
import type { DoanhNghiep } from "@/lib/data/types";
import "./chan-trang.css";

// Đọc thẳng JSON (không qua "@/lib/data") để trang chủ không kéo zod vào gói JS đầu (W050, LCP).
const DOANH_NGHIEP = doanhNghiepJson as DoanhNghiep;

interface ChanTrangProps {
  className?: string;
}

/**
 * Toàn bộ nhãn hiển thị trong chân trang (tách riêng để W044 dễ chuyển sang messages/*.json).
 */
const CHU_CHAN_TRANG = {
  moTa: "Mỹ phẩm nội địa Hàn, thử và mua tại booth.",
  tieuDeGheBooth: "Ghé booth",
  moCuaPrefix: "Mở cửa",
  chiDuong: "Chỉ đường",
  tieuDeHoTro: "Hỗ trợ",
  lienKetHoTro: [
    { nhan: "Giữ hàng tại booth", den: "/chinh-sach#muc-giu-hang" },
    { nhan: "Đổi trả", den: "/chinh-sach#muc-doi-tra" },
    { nhan: "Bảo mật dữ liệu", den: "/chinh-sach#muc-bao-mat" },
  ],
  tieuDeDonViVanHanh: "Đơn vị vận hành",
  mstPrefix: "MST",
  sdtPrefix: "SĐT:",
  banQuyen: "© 2026 VIVE",
  nhanFooter: "Thông tin VIVE",
  nhanMangXaHoi: "Mạng xã hội",
} as const;

const ICON_MXH_PATH: Record<string, string> = {
  facebook: "/icons/mxh/facebook.svg",
  instagram: "/icons/mxh/instagram.svg",
  tiktok: "/icons/mxh/tiktok.svg",
};

function dinhDangGioMoCua(gio: string): string {
  return gio.replace(/\s*[-–]\s*/g, " – ").trim();
}

function tachDiaChi(diaChi: string): [string, string | null] {
  const idx = diaChi.indexOf(", Phường ");
  if (idx === -1) return [diaChi, null];
  return [diaChi.slice(0, idx + 1), diaChi.slice(idx + 2)];
}

/**
 * Chân trang thống nhất cho mọi trang khách (W049 bản 2, mẫu design/ChanTrang.html).
 * Đọc toàn bộ thông tin doanh nghiệp, địa chỉ booth, bản đồ và mạng xã hội từ data/doanh-nghiep.yaml.
 */
export function ChanTrang({ className = "" }: ChanTrangProps) {
  const gioHienThi = dinhDangGioMoCua(CAU_HINH_BOOTH.gioMoCua);
  const diaChiBooth =
    DOANH_NGHIEP.dia_chi_booth || DOANH_NGHIEP.dia_diem_booth;
  const [diaChiDong1, diaChiDong2] = tachDiaChi(DOANH_NGHIEP.dia_chi);
  const danhSachMxh = DOANH_NGHIEP.mang_xa_hoi ?? [];

  return (
    <footer
      aria-label={CHU_CHAN_TRANG.nhanFooter}
      className={`ct-chan relative z-10 ${className}`.trim()}
    >
      <div className="ct-khung">
        <div className="ct-cum-chinh">
          {/* Cụm 1: Thương hiệu + mạng xã hội */}
          <section className="ct-cum ct-thuong-hieu" aria-label="VIVE">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="ct-logo"
                src="/brand/vive-logo-chu.webp"
                alt="VIVE"
                width={54}
                height={26}
                loading="lazy"
                decoding="async"
              />
              <p className="ct-cau">{CHU_CHAN_TRANG.moTa}</p>
            </div>
            <nav className="ct-mxh" aria-label={CHU_CHAN_TRANG.nhanMangXaHoi}>
              {danhSachMxh.map((mxh) => {
                const key = mxh.ten.toLowerCase();
                const iconUrl =
                  ICON_MXH_PATH[key] || `/icons/mxh/${key}.svg`;
                const nhanDayDu = `${mxh.ten} ${mxh.tai_khoan}`;

                return (
                  <a
                    key={mxh.ten}
                    href={mxh.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={nhanDayDu}
                    title={`${mxh.ten} · ${mxh.tai_khoan}`}
                  >
                    <i
                      aria-hidden="true"
                      style={
                        { "--ct-icon": `url(${iconUrl})` } as CSSProperties
                      }
                    />
                  </a>
                );
              })}
            </nav>
          </section>

          {/* Cụm 2: Ghé booth */}
          <section
            className="ct-cum ct-booth"
            aria-label={CHU_CHAN_TRANG.tieuDeGheBooth}
          >
            <h3>{CHU_CHAN_TRANG.tieuDeGheBooth}</h3>
            <b>{DOANH_NGHIEP.ten_cua_hang}</b>
            <p>{diaChiBooth}</p>
            <p className="ct-gio">
              {CHU_CHAN_TRANG.moCuaPrefix} {gioHienThi}
            </p>
            {DOANH_NGHIEP.ban_do && (
              <a
                className="ct-lien-ket"
                href={DOANH_NGHIEP.ban_do}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CHU_CHAN_TRANG.chiDuong}
              </a>
            )}
          </section>

          {/* Cụm 3: Hỗ trợ */}
          <section
            className="ct-cum ct-ho-tro"
            aria-label={CHU_CHAN_TRANG.tieuDeHoTro}
          >
            <h3>{CHU_CHAN_TRANG.tieuDeHoTro}</h3>
            <ul className="ct-ds">
              {CHU_CHAN_TRANG.lienKetHoTro.map((muc) => (
                <li key={muc.den}>
                  <Link href={muc.den}>{muc.nhan}</Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Cụm 4: Đơn vị vận hành */}
          <section
            className="ct-cum ct-cong-ty"
            aria-label={CHU_CHAN_TRANG.tieuDeDonViVanHanh}
          >
            <h3>{CHU_CHAN_TRANG.tieuDeDonViVanHanh}</h3>
            <p className="ct-ten">{DOANH_NGHIEP.ten_cong_ty}</p>
            <p>
              {CHU_CHAN_TRANG.mstPrefix} {DOANH_NGHIEP.ma_so_thue}
            </p>
            <p>
              {diaChiDong1}
              {diaChiDong2 && (
                <>
                  <br />
                  {diaChiDong2}
                </>
              )}
            </p>
            <p>
              <a href={`mailto:${DOANH_NGHIEP.email}`}>{DOANH_NGHIEP.email}</a>
            </p>
            {DOANH_NGHIEP.so_dien_thoai && (
              <p>
                {CHU_CHAN_TRANG.sdtPrefix} {DOANH_NGHIEP.so_dien_thoai}
              </p>
            )}
          </section>
        </div>

        <p className="ct-ban-quyen">
          <span className="ct-ban-quyen-chu">{CHU_CHAN_TRANG.banQuyen}</span>
        </p>
      </div>
    </footer>
  );
}
