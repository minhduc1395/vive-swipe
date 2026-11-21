"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { SanPham, Deal } from "@/lib/data";
import { KhungChiTiet } from "@/components/ui/KhungChiTiet";
import { lopChip } from "@/components/ui/Nhan";
import { TheDeal, tenNhom, nhomCuaDeal, type NhomDeal } from "@/components/deal/TheDeal";
import { NganKeoDeal } from "@/components/deal/NganKeoDeal";
import { useDuLieu } from "@/lib/du-lieu-context";
import { tenDeal } from "@/lib/deals/ngon-ngu";
import {
  layDanhSachDealChoBan,
  trichXuatNhanGiaiThich,
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

function NoiDungDeal() {
  const t = useTranslations("deal");
  const nn = useLocale();
  const { sanPham, deals } = useDuLieu();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idUrl = searchParams.get("id") || "";
  const nhomUrl = (searchParams.get("nhom") || "") as NhomDeal | "";
  const moTuTrang = useRef(false);
  const [daThich, setDaThich] = useState<string[]>([]);
  const [gioHang, setGioHang] = useState<ItemGioHang[]>([]);
  const [hoSo, setHoSo] = useState<Record<string, number>>({});
  const [emailInput, setEmailInput] = useState("");
  const [emailDaDangKy, setEmailDaDangKy] = useState<string | null>(null);
  const [thongBaoToast, setThongBaoToast] = useState<string | null>(null);
  const [daSanSang, setDaSanSang] = useState(false);

  const sanPhamMap = useMemo(
    () => new Map<string, SanPham>(sanPham.map((sp) => [sp.id, sp])),
    [sanPham]
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

  // W032: hiện thẻ ngay từ HTML server (hồ sơ rỗng), sắp lại theo hồ sơ sau khi đọc bộ nhớ, tránh nhảy bố cục (CLS)
  const dealsChoBan = useMemo(() => {
    if (!daSanSang) return layDanhSachDealChoBan(deals, {}, sanPhamMap, [], []);
    return layDanhSachDealChoBan(
      deals,
      hoSo,
      sanPhamMap,
      daThich,
      gioHang
    );
  }, [daSanSang, hoSo, sanPhamMap, daThich, gioHang, deals]);

  const nhanGiaiThich = useMemo(() => {
    if (!daSanSang) return [t("nhanGiaiThich.hot"), t("vanDe.cap-am"), t("nhanGiaiThich.combo")];
    return trichXuatNhanGiaiThich(hoSo, daThich, sanPhamMap, t);
  }, [daSanSang, hoSo, daThich, sanPhamMap, t]);

  const hienToast = (noiDung: string) => {
    setThongBaoToast(noiDung);
    setTimeout(() => {
      setThongBaoToast((hienTai) => (hienTai === noiDung ? null : hienTai));
    }, 2200);
  };

  const handleThemCombo = (deal: Deal) => {
    themComboVaoGio(deal.id, 1);
    hienToast(t("toast.daThemCombo", { ten: tenDeal(deal, nn) }));
  };

  const handleThemBoGoiY = (
    tenBo: string,
    danhSachId: string[]
  ) => {
    for (const id of danhSachId) {
      themVaoGio(id, 1);
    }
    hienToast(t("toast.daThemBo", { ten: tenBo }));
  };

  // Bộ lọc + ?id= (W041): mở ngăn kéo chi tiết, cuộn tới thẻ; đóng hoặc Back thì bỏ id
  const doiUrl = (moi: { id?: string; nhom?: string }, thay = false) => {
    const q = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(moi)) { if (v) q.set(k, v); else q.delete(k); }
    const dich = `/deal${q.toString() ? `?${q}` : ""}`;
    if (thay) router.replace(dich, { scroll: false }); else router.push(dich, { scroll: false });
  };
  const moDeal = (d: Deal) => { moTuTrang.current = true; doiUrl({ id: d.id }); };
  const dongDeal = () => {
    if (moTuTrang.current) { moTuTrang.current = false; router.back(); }
    else doiUrl({ id: "" }, true);
  };
  const dealDangMo = idUrl ? deals.find((d) => d.id === idUrl && d.hien_thi && !(d.may_rui && !d.da_dang_ky)) ?? null : null;
  const dealsHienThi = nhomUrl ? dealsChoBan.filter((d) => nhomCuaDeal(d) === nhomUrl) : dealsChoBan;

  // Vào thẳng /deal?id=… : cuộn tới thẻ đó
  useEffect(() => {
    if (!idUrl || !daSanSang) return;
    const t = setTimeout(() => document.getElementById(`deal-${idUrl}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 150);
    return () => clearTimeout(t);
  }, [idUrl, daSanSang]);

  const handleDangKyEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailSach = emailInput.trim();
    if (!emailSach || !emailSach.includes("@")) {
      hienToast(t("toast.emailKhongHopLe"));
      return;
    }
    try {
      window.localStorage.setItem(KHOA_EMAIL_DEAL, emailSach);
    } catch {
      // bỏ qua lỗi storage
    }
    setEmailDaDangKy(emailSach);
    setEmailInput("");
    hienToast(t("toast.daLuuEmail"));
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-trang text-den font-sans flex flex-col pb-28 md:pb-12">
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
        <header className="px-5 md:px-8 pt-7 pb-2 flex flex-col gap-2.5">
          <h1 className="tieu-de-trang">
            {t("trang.tieuDe")}{" "}
            <span className="bg-oliu-nhat px-1 py-0.5 rounded-md">
              {t("trang.tieuDeNhan")}
            </span>
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
            <span className="text-xam">{t("trang.viBanThich")}</span>
            {nhanGiaiThich.map((nhan) => (
              <span
                key={nhan}
                className="h-[26px] px-2.5 rounded-full bg-kem text-den flex items-center font-medium"
              >
                {nhan}
              </span>
            ))}
          </div>
        </header>

        {/* Bộ lọc theo nhóm */}
        <div className="px-5 md:px-8 pt-2 pb-1 flex gap-2 overflow-x-auto [scrollbar-width:none]" role="group" aria-label={t("trang.locDeal")}>
          {(["", "qua", "combo", "giam"] as const).map((n) => {
            const on = nhomUrl === n;
            const dem = n ? dealsChoBan.filter((d) => nhomCuaDeal(d) === n).length : dealsChoBan.length;
            if (n && dem === 0) return null;
            return (
              <button key={n || "tat-ca"} type="button" aria-pressed={on} onClick={() => doiUrl({ nhom: n }, true)} className={lopChip(on)}>
                {n ? tenNhom(n, t) : t("trang.tatCa")} · {dem}
              </button>
            );
          })}
        </div>

        {/* Lưới thẻ deal: 1 cột điện thoại, 2 cột từ 768, 3 cột từ 1280 */}
        <div className="px-4 md:px-8 pt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          {dealsHienThi.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-[20px] bg-kem p-6 text-center text-xam">
              {t("trang.chuaCoDeal")}
            </div>
          ) : (
            dealsHienThi.map((deal) => (
              <TheDeal
                key={deal.id}
                deal={deal}
                sanPhamMap={sanPhamMap}
                noiBat={deal.id === idUrl}
                onMo={moDeal}
                onThemCombo={handleThemCombo}
                onThemBo={handleThemBoGoiY}
              />
            ))
          )}

          {/* Ô đăng ký email */}
          <section
            aria-label={t("email.nhan")}
            className="md:col-span-2 xl:col-span-3 rounded-[22px] bg-kem p-5 flex flex-col gap-2.5 mt-2"
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
                {t("email.tieuDe")}
              </h2>
            </div>

            {emailDaDangKy ? (
              <div className="rounded-xl bg-trang p-3 text-[13px] text-den flex items-center justify-between gap-2 border border-vien">
                <span>
                  {t("email.daDangKy")} <strong>{emailDaDangKy}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setEmailDaDangKy(null)}
                  className="text-[12px] text-xam underline hover:text-den cursor-pointer bg-transparent border-none p-0"
                >
                  {t("email.doi")}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleDangKyEmail}
                className="flex items-center gap-2"
              >
                <label htmlFor="input-email-deal" className="sr-only">
                  {t("email.nhanO")}
                </label>
                <input
                  id="input-email-deal"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={t("email.goiY")}
                  required
                  className="flex-1 min-w-0 h-11 px-3.5 rounded-xl border border-transparent bg-trang text-[14px] text-den focus:outline-none focus:border-hong"
                />
                <button
                  type="submit"
                  onClick={handleDangKyEmail}
                  className="h-11 px-4 rounded-xl bg-be text-den font-semibold text-[14px] cursor-pointer hover:opacity-95 shrink-0 border-none transition-opacity"
                >
                  {t("email.dangKy")}
                </button>
              </form>
            )}
            <p className="m-0 text-[11px] text-xam">
              {t("email.luuY")}
            </p>
          </section>
        </div>

        <KhungChiTiet mo={dealDangMo !== null} onDong={dongDeal} nhan={dealDangMo ? t("trang.chiTietDeal", { ten: tenDeal(dealDangMo, nn) }) : t("trang.chiTietDealChung")}>
          {dealDangMo && (
            <NganKeoDeal deal={dealDangMo} sanPhamMap={sanPhamMap} onDong={dongDeal} onThemCombo={handleThemCombo} onThemBo={handleThemBoGoiY} />
          )}
        </KhungChiTiet>
      </div>
  );
}

export default function TrangDeal() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
      <NoiDungDeal />
    </Suspense>
  );
}

