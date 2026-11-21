"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Nut } from "@/components/ui/Nut";
import { guiMa, xacNhanMa, type NhanhDangNhap } from "@/lib/tai-khoan/dang-nhap";
import { useTaiKhoan } from "@/lib/tai-khoan/use-tai-khoan";
import {
  giayConLaiGuiLai,
  laEmailHopLe,
  laMaHopLe,
  lamSachMa,
} from "@/lib/tai-khoan/kiem-tra";
import { LOI, type MaLoi } from "@/lib/tai-khoan/loi";

const LOP_O_NHAP =
  "w-full h-12 px-4 rounded-2xl border border-vien bg-trang text-[16px] text-den placeholder:text-xam focus:outline-2 focus:outline-den";

export function FormDangNhap() {
  const router = useRouter();
  const t = useTranslations("tai-khoan");
  const { daTai, daDangNhap } = useTaiKhoan();
  const [buoc, setBuoc] = useState<1 | 2>(1);
  const [emailDaGui, setEmailDaGui] = useState("");
  const [ma, setMa] = useState("");
  const [nhanh, setNhanh] = useState<NhanhDangNhap>("email_change");
  const [guiLuc, setGuiLuc] = useState<number | null>(null);
  const [bayGio, setBayGio] = useState(() => Date.now());
  const [loi, setLoi] = useState<MaLoi | null>(null);
  const [dangXuLy, setDangXuLy] = useState(false);
  const oMa = useRef<HTMLInputElement>(null);
  const oEmail = useRef<HTMLInputElement>(null);
  // Khóa nút gửi tới khi hydrate xong: bấm sớm sẽ submit form gốc và tải lại trang.
  const [sanSang, setSanSang] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSanSang(true);
  }, []);
  const daXong = useRef(false);

  // Đã đăng nhập sẵn thì sang trang tài khoản.
  useEffect(() => {
    if (daTai && daDangNhap) router.replace("/tai-khoan");
  }, [daTai, daDangNhap, router]);

  const conLai = giayConLaiGuiLai(guiLuc, bayGio);
  useEffect(() => {
    if (conLai <= 0) return;
    const id = window.setInterval(() => setBayGio(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [conLai]);

  useEffect(() => {
    if (buoc === 2) oMa.current?.focus();
  }, [buoc]);

  async function gui() {
    // Ô email không điều khiển: chữ gõ trước khi hydrate vẫn còn trong DOM.
    const email = oEmail.current?.value ?? emailDaGui;
    setEmailDaGui(email);
    if (!laEmailHopLe(email)) {
      setLoi(LOI.emailSai);
      return;
    }
    setDangXuLy(true);
    setLoi(null);
    const kq = await guiMa(email);
    setDangXuLy(false);
    if (!kq.ok) {
      setLoi(kq.loi);
      return;
    }
    setNhanh(kq.nhanh);
    const luc = Date.now();
    setGuiLuc(luc);
    setBayGio(luc);
    setMa("");
    setBuoc(2);
  }

  async function xacNhan() {
    if (!laMaHopLe(ma)) {
      setLoi(LOI.maSai);
      return;
    }
    setDangXuLy(true);
    setLoi(null);
    const giay = guiLuc ? Math.floor((Date.now() - guiLuc) / 1000) : 0;
    const kq = await xacNhanMa(emailDaGui, ma, nhanh, giay);
    if (!kq.ok) {
      setDangXuLy(false);
      setLoi(kq.loi);
      return;
    }
    daXong.current = true;
    router.replace("/tai-khoan");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (dangXuLy || daXong.current) return;
    void (buoc === 1 ? gui() : xacNhan());
  }

  function deSau() {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full flex flex-col gap-4" aria-label={t("form.bieuMau")}>
      {buoc === 1 ? (
        <>
          <p className="text-[15px] text-xam-dam leading-relaxed">
            {t("form.moTaBuoc1")}
          </p>
          <label className="flex flex-col gap-2 text-left">
            <span className="text-[14px] font-medium text-den">{t("form.email")}</span>
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("form.emailGoiY")}
              ref={oEmail}
              defaultValue={emailDaGui}
              className={LOP_O_NHAP}
            />
          </label>
        </>
      ) : (
        <>
          <p className="text-[15px] text-xam-dam leading-relaxed">
            {t("form.moTaBuoc2")}
          </p>
          <label className="flex flex-col gap-2 text-left">
            <span className="text-[14px] font-medium text-den">{t("form.ma")}</span>
            <input
              ref={oMa}
              type="text"
              name="ma"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="••••••"
              value={ma}
              onChange={(e) => setMa(lamSachMa(e.target.value))}
              className={`${LOP_O_NHAP} tracking-[0.5em] text-center font-semibold`}
            />
          </label>
        </>
      )}

      {loi && (
        <p role="alert" data-testid="loi-dang-nhap" className="text-[14px] text-loi bg-loi-nen border border-loi-vien rounded-xl px-3 py-2 text-left">
          {t(`loi.${loi}`)}
        </p>
      )}

      <Nut type="submit" co="lon" rong disabled={dangXuLy || !sanSang}>
        {buoc === 1
          ? dangXuLy ? t("form.dangGui") : t("form.guiMa")
          : dangXuLy ? t("form.dangKiemTra") : t("form.dangNhap")}
      </Nut>

      {buoc === 2 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Nut
            bien="phu"
            className="min-h-11"
            disabled={dangXuLy || conLai > 0}
            onClick={() => void gui()}
          >
            {conLai > 0 ? t("form.guiLaiCoDem", { giay: conLai }) : t("form.guiLai")}
          </Nut>
          <Nut
            bien="chu"
            className="min-h-11"
            onClick={() => {
              setBuoc(1);
              setLoi(null);
            }}
          >
            {t("form.doiEmail")}
          </Nut>
        </div>
      )}

      <Nut bien="chu" className="self-center min-h-11" onClick={deSau}>
        {t("form.deSau")}
      </Nut>
    </form>
  );
}
