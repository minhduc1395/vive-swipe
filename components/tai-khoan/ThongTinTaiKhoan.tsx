"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Nut, NutLink } from "@/components/ui/Nut";
import { dangXuat } from "@/lib/tai-khoan/dang-nhap";
import { useTaiKhoan } from "@/lib/tai-khoan/use-tai-khoan";
import { cheEmail } from "@/lib/tai-khoan/kiem-tra";

const LIEN_KET = [
  { href: "/da-thich", nhan: "Đã thích" },
  { href: "/gio", nhan: "Giỏ hàng" },
  { href: "/giu-hang", nhan: "Đơn giữ hàng" },
];

export function ThongTinTaiKhoan() {
  const router = useRouter();
  const { daTai, daDangNhap, email } = useTaiKhoan();
  const [dangThoat, setDangThoat] = useState(false);

  useEffect(() => {
    if (daTai && !daDangNhap && !dangThoat) router.replace("/dang-nhap");
  }, [daTai, daDangNhap, dangThoat, router]);

  async function thoat() {
    setDangThoat(true);
    await dangXuat();
    router.replace("/");
  }

  if (!daTai || !daDangNhap || !email) {
    return <p className="text-[15px] text-xam">Đang tải…</p>;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <section className="rounded-2xl bg-hong-nhat px-5 py-4 text-left">
        <p className="text-[13px] text-xam-dam">Đăng nhập bằng email</p>
        <p data-testid="email-tai-khoan" className="text-[17px] font-semibold text-den break-all">
          {cheEmail(email)}
        </p>
      </section>

      <nav aria-label="Của bạn" className="flex flex-col gap-2">
        {LIEN_KET.map((l) => (
          <NutLink key={l.href} href={l.href} bien="phu" co="lon" rong>
            <span>{l.nhan}</span>
            <span aria-hidden="true">›</span>
          </NutLink>
        ))}
      </nav>

      <Nut bien="chu" className="self-center min-h-11" disabled={dangThoat} onClick={() => void thoat()}>
        {dangThoat ? "Đang đăng xuất…" : "Đăng xuất"}
      </Nut>
    </div>
  );
}
