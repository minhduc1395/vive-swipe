"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { KhungUngDung } from "@/components/KhungUngDung";
import { DEALS, SAN_PHAM, type SanPham } from "@/lib/data";
import { dinhDangTien } from "@/lib/dinh-dang";
import {
  layDanhSachDealChoBan,
  trichXuatNhanGiaiThich,
  type DealChoBan,
} from "@/lib/deals/diem-deal";
import {
  layDanhSachDaThich,
  layGioHang,
  layHoSoLocal,
  themComboVaoGio,
  themVaoGio,
  type ItemGioHang,
} from "@/lib/kho-luu-tru";

const KHOA_EMAIL_DEAL = "vive_email_deal";

export default function TrangDeal() {
  const [daThich, setDaThich] = useState<string[]>([]);
  const [gioHang, setGioHang] = useState<ItemGioHang[]>([]);
  const [hoSo, setHoSo] = useState<Record<string, number>>({});
  const [emailInput, setEmailInput] = useState("");
  const [emailDaDangKy, setEmailDaDangKy] = useState<string | null>(null);
  const [thongBaoToast, setThongBaoToast] = useState<string | null>(null);
  const [daSanSang, setDaSanSang] = useState(false);

  const sanPhamMap = useMemo(
    () => new Map<string, SanPham>(SAN_PHAM.map((sp) => [sp.id, sp])),
    []
  );

  const taiDuLieu = () => {
    setDaThich(layDanhSachDaThich());
    setGioHang(layGioHang());
    setHoSo(layHoSoLocal());
    try {
      const emailLuu = window.localStorage.getItem(KHOA_EMAIL_DEAL);
      if (emailLuu) setEmailDaDangKy(emailLuu);
    } catch {
      // bỏ qua lỗi đọc storage
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    taiDuLieu();
    setDaSanSang(true);

    const handleStorage = () => taiDuLieu();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("vive_storage_update", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("vive_storage_update", handleStorage);
    };
  }, []);

  const dealsChoBan = useMemo(() => {
    if (!daSanSang) return [];
    return layDanhSachDealChoBan(
      DEALS,
      hoSo,
      sanPhamMap,
      daThich,
      gioHang
    );
  }, [daSanSang, hoSo, sanPhamMap, daThich, gioHang]);

  const nhanGiaiThich = useMemo(() => {
    if (!daSanSang) return ["Ưu đãi hot", "Cấp ẩm", "Combo tiết kiệm"];
    return trichXuatNhanGiaiThich(hoSo, daThich, sanPhamMap);
  }, [daSanSang, hoSo, daThich, sanPhamMap]);

  const hienToast = (noiDung: string) => {
    setThongBaoToast(noiDung);
    setTimeout(() => {
      setThongBaoToast((hienTai) => (hienTai === noiDung ? null : hienTai));
    }, 2200);
  };

  const handleThemCombo = (deal: DealChoBan) => {
    themComboVaoGio(deal.id, 1);
    hienToast(`Đã thêm ${deal.ten} vào giỏ!`);
  };

  const handleThemBoGoiY = (
    tenBo: string,
    danhSachId: string[]
  ) => {
    for (const id of danhSachId) {
      themVaoGio(id, 1);
    }
    hienToast(`Đã thêm bộ "${tenBo}" vào giỏ!`);
  };

  const handleDangKyEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailSach = emailInput.trim();
    if (!emailSach || !emailSach.includes("@")) {
      hienToast("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }
    try {
      window.localStorage.setItem(KHOA_EMAIL_DEAL, emailSach);
    } catch {
      // bỏ qua lỗi storage
    }
    setEmailDaDangKy(emailSach);
    setEmailInput("");
    hienToast("Đã lưu email nhận deal của bạn!");
  };

  const soLuongGio = useMemo(
    () => gioHang.reduce((sum, item) => sum + item.soLuong, 0),
    [gioHang]
  );

  return (
    <KhungUngDung
      soLuongThich={daThich.length}
      soLuongGio={soLuongGio}
    >
      <div className="w-full bg-trang text-den font-sans flex flex-col pb-28">
        {/* Toast thông báo */}
        {thongBaoToast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-den text-trang text-[13px] font-medium shadow-lg transition-all animate-bounce"
          >
            {thongBaoToast}
          </div>
        )}

        {/* Tiêu đề & Tags giải thích theo hồ sơ */}
        <header className="px-5 pt-7 pb-2 flex flex-col gap-2.5">
          <h1 className="m-0 text-[28px] font-semibold tracking-[-0.3px]">
            Deal{" "}
            <span className="bg-[#E8D2CC]/70 px-1 py-0.5 rounded-md">
              cho bạn
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
            <span className="text-[#737373]">Vì bạn thích</span>
            {nhanGiaiThich.map((nhan) => (
              <span
                key={nhan}
                className="h-[26px] px-2.5 rounded-full bg-[#F7EEEB] text-den flex items-center font-medium"
              >
                {nhan}
              </span>
            ))}
          </div>
        </header>

        {/* Danh sách Deal */}
        <main className="px-4 pt-3 flex flex-col gap-3.5">
          {dealsChoBan.length === 0 ? (
            <div className="rounded-[20px] bg-[#F7EEEB] p-6 text-center text-xam">
              Hiện chưa có deal nào đang chạy hôm nay. Vui lòng quay lại sau!
            </div>
          ) : (
            dealsChoBan.map((deal) => (
              <TheDealMuc
                key={deal.id}
                deal={deal}
                sanPhamMap={sanPhamMap}
                onThemCombo={handleThemCombo}
                onThemBoGoiY={handleThemBoGoiY}
              />
            ))
          )}

          {/* Ô đăng ký email */}
          <section
            aria-label="Đăng ký nhận deal"
            className="rounded-[22px] bg-[#F7EEEB] p-5 flex flex-col gap-2.5 mt-2"
          >
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-den shrink-0"
                aria-hidden="true"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <h2 className="m-0 text-[15px] font-semibold text-den">
                Nhận email khi món bạn thích có deal tốt
              </h2>
            </div>

            {emailDaDangKy ? (
              <div className="rounded-xl bg-trang p-3 text-[13px] text-[#2B2B2A] flex items-center justify-between gap-2 border border-vien">
                <span>
                  Đã đăng ký nhận deal tới: <strong>{emailDaDangKy}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setEmailDaDangKy(null)}
                  className="text-[12px] text-xam underline hover:text-den cursor-pointer bg-transparent border-none p-0"
                >
                  Đổi
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleDangKyEmail}
                className="flex items-center gap-2"
              >
                <label htmlFor="input-email-deal" className="sr-only">
                  Địa chỉ email nhận deal
                </label>
                <input
                  id="input-email-deal"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  required
                  className="flex-1 min-w-0 h-11 px-3.5 rounded-xl border border-transparent bg-trang text-[14px] text-den focus:outline-none focus:border-den"
                />
                <button
                  type="submit"
                  onClick={handleDangKyEmail}
                  className="h-11 px-4 rounded-xl bg-bac-ha text-den font-semibold text-[14px] cursor-pointer hover:opacity-95 shrink-0 border-none transition-opacity"
                >
                  Đăng ký
                </button>
              </form>
            )}
            <p className="m-0 text-[11px] text-xam">
              Chỉ gửi khi có ưu đãi thật sự tốt cho sản phẩm bạn quan tâm. Không spam.
            </p>
          </section>
        </main>
      </div>
    </KhungUngDung>
  );
}

interface TheDealMucProps {
  deal: DealChoBan;
  sanPhamMap: Map<string, SanPham>;
  onThemCombo: (deal: DealChoBan) => void;
  onThemBoGoiY: (tenBo: string, danhSachId: string[]) => void;
}

function TheDealMuc({
  deal,
  sanPhamMap,
  onThemCombo,
  onThemBoGoiY,
}: TheDealMucProps) {
  // 1. Quà theo mốc hóa đơn / thương hiệu (KM-08, BAC-HOA-DON)
  if (deal.moc && deal.moc.length > 0) {
    const boGoiYDau = deal.goi_y && deal.goi_y.length > 0 ? deal.goi_y[0] : null;

    return (
      <article
        aria-label={deal.ten}
        className="rounded-[24px] bg-[#F7EEEB] p-5 flex flex-col gap-3.5"
      >
        <div className="flex items-center justify-between">
          <span className="h-7 px-3 rounded-full bg-den text-trang text-[12px] font-semibold flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 12v10H4V12" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            Quà theo hóa đơn
          </span>
          <span className="text-[12px] text-[#5C5C5B]">Số lượng có hạn</span>
        </div>

        <h2 className="m-0 text-[19px] leading-[1.3] font-semibold text-den">
          {deal.hook ?? deal.ten}
        </h2>

        {/* Các mốc quà */}
        <div
          className={`grid gap-1.5 ${
            deal.moc.length >= 3 ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {deal.moc.map((m, idx) => {
            const mocTien = m.tu ?? m.tren ?? 0;
            const tenMoc =
              mocTien >= 1_000_000
                ? `Từ ${(mocTien / 1_000_000).toString().replace(".", ",")} triệu`
                : `Từ ${dinhDangTien(mocTien)}`;
            return (
              <div
                key={idx}
                className="rounded-[14px] bg-trang p-2.5 flex flex-col gap-0.5"
              >
                <span className="text-[11px] text-[#5C5C5B]">{tenMoc}</span>
                <strong className="text-[12px] font-semibold text-den line-clamp-1">
                  {m.qua.replace(/^\d+\s*/, "")}
                </strong>
              </div>
            );
          })}
        </div>

        {/* Bộ gợi ý vừa mốc */}
        {deal.goi_y && deal.goi_y.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            <span className="text-[13px] font-semibold text-den">
              Bộ gợi ý vừa mốc
            </span>
            {deal.goi_y.slice(0, 2).map((bo) => {
              const spDau = sanPhamMap.get(bo.san_pham[0]);
              return (
                <div
                  key={bo.id}
                  className="rounded-[14px] bg-trang p-2.5 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {spDau?.anh ? (
                      <div className="w-11 h-11 rounded-[10px] bg-[#F7EEEB] relative overflow-hidden shrink-0">
                        <Image
                          src={spDau.anh}
                          alt={bo.ten}
                          fill
                          sizes="44px"
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-[10px] bg-[#F7EEEB] text-[10px] font-semibold flex items-center justify-center shrink-0">
                        SET
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <strong className="text-[13px] font-semibold text-den truncate">
                        {bo.ten} · {dinhDangTien(bo.gia)}
                      </strong>
                      <span className="text-[12px] text-[#5C5C5B]">
                        Đạt mốc tặng quà
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onThemBoGoiY(bo.ten, bo.san_pham)}
                    className="h-8 px-3 rounded-full bg-den text-trang text-[12px] font-medium shrink-0 cursor-pointer hover:opacity-90 border-none"
                  >
                    Thêm bộ
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút hành động chính */}
        {boGoiYDau && (
          <button
            type="button"
            onClick={() => onThemBoGoiY(boGoiYDau.ten, boGoiYDau.san_pham)}
            className="w-full h-12 rounded-full bg-den text-trang font-semibold text-[15px] flex items-center justify-center cursor-pointer hover:opacity-90 border-none mt-1 transition-opacity"
          >
            Thêm {boGoiYDau.ten} vào giỏ
          </button>
        )}
      </article>
    );
  }

  // 2. Combo (loai === 'combo')
  if (deal.loai === "combo") {
    const thanhPhan = deal.thanh_phan ?? [];
    let tongLe = 0;
    const sanPhamTrongCombo: SanPham[] = [];

    for (const tp of thanhPhan) {
      const sp = sanPhamMap.get(tp.id);
      if (sp) {
        tongLe += sp.gia_ban * tp.so_luong;
        sanPhamTrongCombo.push(sp);
      }
    }

    const giaCombo = deal.gia_combo ?? tongLe;
    const tietKiem = Math.max(0, tongLe - giaCombo);

    return (
      <article
        aria-label={deal.ten}
        className="rounded-[24px] border border-[#E8D2CC] p-[18px] bg-trang flex flex-col gap-3"
      >
        <div className="flex items-center gap-3">
          {/* Ảnh các món chồng nhau */}
          <div className="flex shrink-0">
            {sanPhamTrongCombo.map((sp, idx) => (
              <div
                key={sp.id}
                className={`w-[56px] h-[56px] rounded-[14px] bg-[#F7EEEB] border-2 border-trang relative overflow-hidden shrink-0 ${
                  idx > 0 ? "-ml-4" : ""
                }`}
              >
                {sp.anh ? (
                  <Image
                    src={sp.anh}
                    alt={sp.ten_hien_thi}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-semibold text-xam">
                    {sp.thuong_hieu.slice(0, 4)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-xam uppercase tracking-wider">
              Combo ưu đãi
            </span>
            <h2 className="m-0 text-[16px] font-semibold text-den line-clamp-1">
              {deal.ten}
            </h2>
            <span className="text-[12px] text-xam line-clamp-1">
              {sanPhamTrongCombo.map((s) => s.ten_hien_thi).join(" + ")}
            </span>
          </div>
        </div>

        {/* Giá & Tiết kiệm */}
        <div className="flex items-baseline justify-between pt-1 border-t border-[#F2E4E0]">
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-bold text-den">
              {dinhDangTien(giaCombo)}
            </span>
            {tongLe > giaCombo && (
              <span className="text-[13px] text-xam line-through">
                {dinhDangTien(tongLe)}
              </span>
            )}
          </div>
          {tietKiem > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-bac-ha text-den text-[12px] font-semibold">
              Tiết kiệm {dinhDangTien(tietKiem)}
            </span>
          ) : deal.qua ? (
            <span className="px-2.5 py-0.5 rounded-full bg-bac-ha text-den text-[12px] font-semibold line-clamp-1">
              Tặng quà
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onThemCombo(deal)}
          className="w-full h-11 rounded-full bg-den text-trang font-semibold text-[14px] flex items-center justify-center cursor-pointer hover:opacity-90 border-none transition-opacity"
        >
          Thêm combo vào giỏ
        </button>
      </article>
    );
  }

  // 3. Giảm khi mua kèm (LOPOE-25)
  if (deal.loai === "giam_khi_mua_kem") {
    const dsId = deal.ap_dung_cho ?? [];
    const dsSanPham = dsId
      .map((id) => sanPhamMap.get(id))
      .filter((sp): sp is SanPham => Boolean(sp));

    return (
      <article
        aria-label={deal.ten}
        className="rounded-[24px] border border-[#E8D2CC] p-[18px] bg-trang flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <span className="h-6 px-2.5 rounded-full bg-bac-ha text-den text-[12px] font-semibold flex items-center">
            Giảm 25% khi mua kèm
          </span>
          <span className="text-[12px] text-xam">Ưu đãi kèm</span>
        </div>

        <h2 className="m-0 text-[17px] font-semibold text-den">
          {deal.hook ?? deal.ten}
        </h2>
        {deal.dieu_kien && (
          <p className="m-0 text-[13px] text-xam-dam">{deal.dieu_kien}</p>
        )}

        {/* Danh sách món ưu đãi */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[#F2E4E0]">
          {dsSanPham.map((sp) => {
            const giaUuDai = deal.gia_uu_dai?.[sp.id] ?? Math.round(sp.gia_ban * 0.75);
            return (
              <div
                key={sp.id}
                className="flex items-center justify-between py-1 text-[13px]"
              >
                <span className="text-den truncate max-w-[200px]">
                  {sp.ten_hien_thi}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xam line-through text-[12px]">
                    {dinhDangTien(sp.gia_ban)}
                  </span>
                  <strong className="text-den font-semibold">
                    {dinhDangTien(giaUuDai)}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href="/danh-muc"
          className="w-full h-11 rounded-full border border-den/30 text-den font-semibold text-[14px] flex items-center justify-center no-underline hover:bg-black/5 transition-colors"
        >
          Chọn món để mua kèm
        </Link>
      </article>
    );
  }

  // 4. Các loại deal khác (mua_x_tang_y, qua_khi_mua)
  return (
    <article
      aria-label={deal.ten}
      className="rounded-[24px] border border-[#E8D2CC] p-[18px] bg-trang flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="h-6 px-2.5 rounded-full bg-[#F7EEEB] text-den text-[12px] font-semibold flex items-center">
          Ưu đãi đặc biệt
        </span>
        {deal.gioi_han && (
          <span className="text-[12px] text-xam">Số lượng có hạn</span>
        )}
      </div>

      <h2 className="m-0 text-[17px] font-semibold text-den">
        {deal.hook ?? deal.ten}
      </h2>

      {deal.dieu_kien && (
        <p className="m-0 text-[13px] text-xam-dam">{deal.dieu_kien}</p>
      )}

      {deal.qua && (
        <div className="rounded-xl bg-[#F7EEEB] p-2.5 text-[13px] text-den flex items-center gap-2">
          <span className="font-semibold text-bac-ha bg-den px-1.5 py-0.5 rounded text-[11px]">
            QUÀ TẶNG
          </span>
          <span className="line-clamp-1">{deal.qua}</span>
        </div>
      )}

      <Link
        href="/danh-muc"
        className="w-full h-11 rounded-full bg-den text-trang font-semibold text-[14px] flex items-center justify-center no-underline hover:opacity-90 transition-opacity"
      >
        Xem sản phẩm áp dụng
      </Link>
    </article>
  );
}
