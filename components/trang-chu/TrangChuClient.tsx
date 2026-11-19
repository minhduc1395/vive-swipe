/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Deal, DoanhNghiep } from "@/lib/data/types";
import { dinhDangGioV3, dinhDangNgan } from "@/lib/trang-chu/dinh-dang";
import type { TrangChuConfig } from "@/lib/trang-chu/schema";
import { hienToast } from "@/components/ui/Toast";
import { NutTrangChu } from "./NutTrangChu";
import "./trang-chu.css";

const ANH_TRONG_SUOT =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

interface TrangChuClientProps {
  cauHinh: TrangChuConfig;
  deals: Deal[];
  doanhNghiep: DoanhNghiep;
  gioMoCua: string;
}

const HUONG_CLIP = [
  "inset(0 100% 0 0)",
  "inset(0 0 0 100%)",
  "inset(100% 0 0 0)",
  "inset(0 0 100% 0)",
] as const;

const KE_TREN_MAT_TIEN = { x: 0.37, y: 0.575, h: 0.05 };
const TY_LE_SRM = 366 / 989;
const GIOT_TINH_CHAT = [0, 1, 2, 3, 4, 5].map((i) => ({
  x: ((i % 3) - 1) * 0.28 + (i > 2 ? 0.12 : -0.06),
  tre: i * 0.06,
  cao: 0.55 + (i % 2) * 0.25,
}));

export function TrangChuClient({
  cauHinh,
  deals,
  doanhNghiep,
  gioMoCua,
}: TrangChuClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ghepRef = useRef<HTMLDivElement>(null);
  const luoiAnhRef = useRef<HTMLDivElement>(null);
  const lopoeKhoiRef = useRef<HTMLElement>(null);
  const boBaRef = useRef<HTMLDivElement>(null);
  const quangRef = useRef<HTMLSpanElement>(null);
  const bayRef = useRef<HTMLDivElement>(null);
  const dichBayRef = useRef<HTMLImageElement>(null);
  const spGiuaRef = useRef<HTMLImageElement>(null);
  const spPhaiRef = useRef<HTMLImageElement>(null);
  const giotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tuongLogoRef = useRef<HTMLDivElement>(null);
  const [daTaiAnhDuoi, setDaTaiAnhDuoi] = useState(false);

  // Chỉ tải ảnh các khối dưới (2..6) khi bắt đầu cuộn, tương tác hoặc rảnh sau sơn LCP đầu tiên
  useEffect(() => {
    if (daTaiAnhDuoi) return;
    const bat = () => setDaTaiAnhDuoi(true);
    const onScroll = () => {
      if (window.scrollY > 2) bat();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", bat, { passive: true, once: true });
    window.addEventListener("touchmove", bat, { passive: true, once: true });
    window.addEventListener("keydown", bat, { passive: true, once: true });
    const timer = window.setTimeout(bat, 2500);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && tuongLogoRef.current) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) bat();
        },
        { rootMargin: "120px" }
      );
      io.observe(tuongLogoRef.current);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", bat);
      window.removeEventListener("touchmove", bat);
      window.removeEventListener("keydown", bat);
      window.clearTimeout(timer);
      io?.disconnect();
    };
  }, [daTaiAnhDuoi]);

  const dealsMap = useMemo(() => {
    return new Map<string, Deal>(deals.map((d) => [d.id, d]));
  }, [deals]);

  // Chữ và số liệu lấy trực tiếp từ data/ (không gõ tay)
  const km13 = dealsMap.get(cauHinh.dai_thong_bao.deal_id);
  const chuDaiKhuyenMai = km13?.hook || cauHinh.dai_thong_bao.mac_dinh_chu;

  const km08 = dealsMap.get(cauHinh.qua_lopoe.deal_id);
  const mocDauKm08 = km08?.moc?.[0]?.tu ? dinhDangNgan(km08.moc[0].tu) : "";
  const tieuDeQuaLopoe = `${cauHinh.qua_lopoe.tien_to_tieu_de}${mocDauKm08}${cauHinh.qua_lopoe.hau_to_tieu_de}`;
  const nhanTinhKm08 = km08?.nhan_tinh?.length
    ? `${km08.nhan_tinh.join(". ")}.`
    : "";

  const gioHienThi = dinhDangGioV3(gioMoCua);

  const cot = cauHinh.cua_hang.cot;
  const hang = cauHinh.cua_hang.hang;
  const danhSachManh = useMemo(() => {
    const kq: { r: number; c: number; pos: string }[] = [];
    for (let r = 0; r < hang; r += 1) {
      for (let c = 0; c < cot; c += 1) {
        kq.push({
          r,
          c,
          pos: `${(c / Math.max(1, cot - 1)) * 100}% ${(r / Math.max(1, hang - 1)) * 100}%`,
        });
      }
    }
    return kq;
  }, [cot, hang]);

  // 1. IntersectionObserver cho hiệu ứng hiện dần khi cuộn
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const giamChuyenDong = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const targets = root.querySelectorAll(".hien, .o");
    if (giamChuyenDong || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("da"));
      tuongLogoRef.current?.classList.add("da");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("da");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => io.observe(el));

    const tuongEl = tuongLogoRef.current;
    let ioLogo: IntersectionObserver | null = null;
    if (tuongEl) {
      ioLogo = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("da");
              ioLogo?.unobserve(e.target);
            }
          }
        },
        { threshold: 0.35 }
      );
      ioLogo.observe(tuongEl);
    }

    return () => {
      io.disconnect();
      ioLogo?.disconnect();
    };
  }, []);

  // 2. Mặt tiền ghép mảnh đổi ngẫu nhiên (6x4)
  useEffect(() => {
    const luoiEl = luoiAnhRef.current;
    const khungGhepEl = ghepRef.current;
    if (!luoiEl || !khungGhepEl) return;

    const danhSachAnh = cauHinh.cua_hang.anh_mat_tien;
    if (danhSachAnh.length <= 1) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timeouts = new Set<number>();

    const henGio = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        if (!daHuy) fn();
      }, ms);
      timeouts.add(id);
      return id;
    };

    // Trì hoãn tải trước ảnh mặt tiền phụ để không tranh băng thông với ảnh LCP đầu tiên
    henGio(() => {
      for (const url of danhSachAnh.slice(1)) {
        const im = new Image();
        im.src = url;
      }
    }, 1500);

    const manhEls = Array.from(luoiEl.querySelectorAll<HTMLDivElement>(".manh"));
    const trangThaiManh = manhEls.map((el, idx) => ({
      el,
      r: Math.floor(idx / cot),
      c: idx % cot,
      posStyle:
        el.querySelector("i")?.style.backgroundPosition ||
        `${((idx % cot) / Math.max(1, cot - 1)) * 100}% ${(Math.floor(idx / cot) / Math.max(1, hang - 1)) * 100}%`,
      hien: 0,
    }));

    let daHuy = false;
    let chay = false;
    let dangLap = false;
    let chinh = 0;

    const ngu = (ms: number) =>
      new Promise<void>((resolve) => {
        henGio(resolve, ms);
      });

    const doiManh = (m: (typeof trangThaiManh)[number], k: number) => {
      if (daHuy || m.hien === k) return;
      m.hien = k;
      const layer = document.createElement("i");
      layer.style.backgroundImage = `url(${danhSachAnh[k]})`;
      layer.style.backgroundPosition = m.posStyle;
      layer.style.clipPath = HUONG_CLIP[(Math.random() * 4) | 0];
      m.el.appendChild(layer);
      // Force reflow để clip-path chuyển mượt từ biên vào
      void layer.getBoundingClientRect();
      layer.style.clipPath = "inset(0 0 0 0)";

      const donLopCu = () => {
        let prev = layer.previousElementSibling;
        while (prev) {
          const nextPrev = prev.previousElementSibling;
          prev.remove();
          prev = nextPrev;
        }
      };
      layer.addEventListener("transitionend", donLopCu, { once: true });
      henGio(donLopCu, 900);
    };

    const lap = async () => {
      if (dangLap || daHuy) return;
      dangLap = true;
      while (chay && !daHuy) {
        await ngu(1800);
        for (let b = 0; b < 6 && chay && !daHuy; b += 1) {
          for (let n = 0; n < 4; n += 1) {
            const m =
              trangThaiManh[(Math.random() * trangThaiManh.length) | 0];
            if (!m) continue;
            let k = m.hien;
            let thu = 0;
            while (k === m.hien && thu < 10) {
              k = (Math.random() * danhSachAnh.length) | 0;
              thu += 1;
            }
            doiManh(m, k);
          }
          await ngu(420);
        }
        if (!chay || daHuy) break;
        chinh = (chinh + 1) % danhSachAnh.length;
        for (const m of trangThaiManh) {
          henGio(() => doiManh(m, chinh), (m.c + m.r) * 75);
        }
        await ngu((cot + hang) * 75 + 800);
      }
      dangLap = false;
    };

    const io = new IntersectionObserver((entries) => {
      chay = Boolean(entries[0]?.isIntersecting) && !document.hidden;
      if (chay) void lap();
    });
    io.observe(khungGhepEl);

    const onVisibilityChange = () => {
      chay = !document.hidden;
      if (chay) void lap();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      daHuy = true;
      chay = false;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      for (const id of timeouts) {
        window.clearTimeout(id);
      }
      timeouts.clear();
    };
  }, [cauHinh.cua_hang.anh_mat_tien, cot, hang]);

  // 3. Hoạt ảnh khối LOPOE theo cuộn 2 chiều (lăn xuống tới, lăn lên lùi)
  useEffect(() => {
    const bay = bayRef.current;
    const trai = dichBayRef.current;
    const giua = spGiuaRef.current;
    const phai = spPhaiRef.current;
    const khoi = lopoeKhoiRef.current;
    const boBa = boBaRef.current;
    const quang = quangRef.current;
    const anhMatTien = luoiAnhRef.current;

    if (
      !bay ||
      !trai ||
      !giua ||
      !phai ||
      !khoi ||
      !boBa ||
      !quang ||
      !anhMatTien
    ) {
      return;
    }

    const giamChuyenDong = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (giamChuyenDong) {
      quang.style.opacity = "1";
      quang.style.transform = "scale(1)";
      trai.style.opacity = "1";
      giua.style.opacity = "1";
      giua.style.transform = "none";
      phai.style.opacity = "1";
      phai.style.transform = "none";
      bay.style.display = "none";
      bay.style.opacity = "0";
      return;
    }

    const de = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const ra = (t: number) => 1 - Math.pow(1 - t, 3);
    const kep = (v: number, min = 0, max = 1) =>
      Math.max(min, Math.min(max, v));
    const doan = (p: number, a: number, b: number) => kep((p - a) / (b - a));

    const ve = () => {
      const H = window.innerHeight;
      const k = khoi.getBoundingClientRect();
      const b = boBa.getBoundingClientRect();
      const A = H - k.top;
      const B = b.top + b.height / 2 - H / 2;
      const p = A <= 0 ? 0 : B <= 0 ? 1 : A / (A + B);

      const q = de(doan(p, 0.25, 1));
      quang.style.opacity = String(q);
      quang.style.transform = `scale(${0.3 + 0.7 * q})`;

      const g = de(doan(p, 0.3, 0.9));
      giua.style.opacity = String(doan(p, 0.3, 0.45));
      giua.style.transform = `translateY(${(1 - g) * 160}px) rotate(${(1 - g) * 18}deg) scale(${0.75 + 0.25 * g})`;

      const f = de(doan(p, 0.2, 0.85));
      phai.style.opacity = String(doan(p, 0.2, 0.35));
      phai.style.transform = `translateX(${(1 - f) * Math.min(window.innerWidth * 0.35, 320)}px) rotate(${(1 - f) * 22}deg)`;

      giotRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = GIOT_TINH_CHAT[i];
        const t = doan(p, 0.35 + o.tre, 0.95);
        el.style.left = `calc(50% + ${o.x * b.width}px)`;
        el.style.bottom = `${60 + ra(t) * b.height * o.cao}px`;
        el.style.opacity =
          t > 0 && t < 1 ? String(Math.sin(Math.PI * t)) : "0";
        el.style.transform = `scale(${0.6 + t * 0.8})`;
      });

      const a = anhMatTien.getBoundingClientRect();
      const d = trai.getBoundingClientRect();
      if (window.scrollY <= 2 || p <= 0 || p >= 1) {
        bay.style.display = "none";
        bay.style.opacity = "0";
        trai.style.opacity = p >= 1 ? "1" : "0";
        return;
      }
      bay.style.display = "block";
      trai.style.opacity = "0";

      const sx = a.left + a.width * KE_TREN_MAT_TIEN.x;
      const sy = a.top + a.height * KE_TREN_MAT_TIEN.y;
      const sh = a.height * KE_TREN_MAT_TIEN.h;
      const nho = de(doan(p, 0, 0.15));
      const e = de(doan(p, 0.15, 1));
      const h0 = sh * (1 + 1.6 * nho);
      const y0 = sy - sh * 0.5 * nho;
      const ex = d.left + d.width / 2;
      const ey = d.bottom;
      const vong =
        Math.sin(Math.PI * e) *
        Math.min(window.innerWidth * 0.2, 240) *
        (sx < ex ? -1 : 1);
      const x = sx + (ex - sx) * e + vong;
      const y = y0 + (ey - y0) * e;
      const h = h0 + (d.height - h0) * e;

      bay.style.height = `${h}px`;
      bay.style.transform = `translate(${x - (h * TY_LE_SRM) / 2}px, ${y - h}px) rotate(${Math.sin(Math.PI * e) * -16}deg)`;
      bay.style.opacity = String(kep(p / 0.03));
    };

    let cho = false;
    let rafId = 0;
    const lich = () => {
      if (!cho) {
        cho = true;
        rafId = window.requestAnimationFrame(() => {
          cho = false;
          ve();
        });
      }
    };

    window.addEventListener("scroll", lich, { passive: true });
    window.addEventListener("resize", lich);
    window.addEventListener("load", ve);
    ve();

    return () => {
      window.removeEventListener("scroll", lich);
      window.removeEventListener("resize", lich);
      window.removeEventListener("load", ve);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={rootRef} className={daTaiAnhDuoi ? "tc-v3 co-serif" : "tc-v3"}>
      {/* Tuýp sữa rửa mặt bay từ kệ trên mặt tiền xuống khối LOPOE */}
      <div ref={bayRef} id="bay" aria-hidden="true">
        <img
          src={daTaiAnhDuoi ? cauHinh.lopoe.anh_trai : ANH_TRONG_SUOT}
          alt=""
          fetchPriority="low"
          decoding="async"
        />
      </div>

      {/* Dải khuyến mãi trên cùng */}
      <div className="dai">
        <span>{chuDaiKhuyenMai}. </span>
        {cauHinh.dai_thong_bao.nut.sap_co || !cauHinh.dai_thong_bao.nut.den ? (
          <button
            type="button"
            data-sap-co="true"
            onClick={() => hienToast("Tính năng sắp ra mắt")}
            className="cursor-pointer border-0 bg-transparent font-[inherit]"
          >
            {cauHinh.dai_thong_bao.nut.chu}
          </button>
        ) : (
          <Link href={cauHinh.dai_thong_bao.nut.den} prefetch={false}>
            {cauHinh.dai_thong_bao.nut.chu}
          </Link>
        )}
      </div>

      <main>
        {/* Khối 1: Cửa hàng hero + mặt tiền 6x4 ghép mảnh */}
        <section className="o lon" id="cua-hang">
          <div className="hien da">
            <h1>
              <img
                src="/brand/vive-logo-chu.webp"
                alt="VIVE"
                width={175}
                height={84}
                fetchPriority="low"
                decoding="async"
              />
            </h1>
            <p>{cauHinh.cua_hang.phu_de}</p>
            <div className="nut">
              {cauHinh.cua_hang.nut.map((n) => (
                <NutTrangChu
                  key={n.chu}
                  nut={n}
                  banDoUrl={doanhNghiep.ban_do}
                />
              ))}
            </div>
          </div>
          <div className="hinh">
            <div
              ref={ghepRef}
              id="ghep"
              role="img"
              aria-label={cauHinh.cua_hang.mo_ta_anh}
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/trang-chu/mt/0-mobile.webp"
                  type="image/webp"
                />
                <img
                  src={cauHinh.cua_hang.anh_mat_tien[0]}
                  alt={cauHinh.cua_hang.mo_ta_anh}
                  width={1600}
                  height={891}
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  className="anh-mat-tien-goc"
                />
              </picture>
              <div ref={luoiAnhRef} className="luoi-anh">
                {danhSachManh.map((m) => (
                  <div key={`${m.r}-${m.c}`} className="manh" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Khối 2: LOPOE Better Balance */}
        <section ref={lopoeKhoiRef} className="o lon" id="lopoe">
          <div className="hien">
            <h2>{cauHinh.lopoe.tieu_de}</h2>
            <p>{cauHinh.lopoe.phu_de}</p>
            <div className="nut">
              {cauHinh.lopoe.nut.map((n) => (
                <NutTrangChu
                  key={n.chu}
                  nut={n}
                  banDoUrl={doanhNghiep.ban_do}
                />
              ))}
            </div>
          </div>
          <div
            ref={boBaRef}
            className="hinh bo-ba"
            aria-label={cauHinh.lopoe.mo_ta_bo}
            role="img"
          >
            <span ref={quangRef} className="quang" aria-hidden="true" />
            {GIOT_TINH_CHAT.map((_, idx) => (
              <span
                key={idx}
                ref={(el) => {
                  giotRefs.current[idx] = el;
                }}
                className="giot"
                aria-hidden="true"
              />
            ))}
            <img
              ref={dichBayRef}
              id="dich-bay"
              src={daTaiAnhDuoi ? cauHinh.lopoe.anh_trai : ANH_TRONG_SUOT}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              ref={spGiuaRef}
              id="sp-giua"
              className="giua"
              src={daTaiAnhDuoi ? cauHinh.lopoe.anh_giua : ANH_TRONG_SUOT}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              ref={spPhaiRef}
              id="sp-phai"
              src={daTaiAnhDuoi ? cauHinh.lopoe.anh_phai : ANH_TRONG_SUOT}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        {/* Khối 3: Người Hàn chọn kỹ. [VIVE] mang về. + tường 16 logo */}
        <section className="o lon" id="chon-loc">
          <div className="hien">
            <h2>{cauHinh.thuong_hieu.tieu_de}</h2>
            <p className="co-logo">
              <img
                src="/brand/vive-logo-chu.webp"
                alt="VIVE"
                width={350}
                height={168}
                loading="lazy"
                decoding="async"
              />{" "}
              <span>{cauHinh.thuong_hieu.dong_logo_hau}</span>
            </p>
          </div>
          <div
            ref={tuongLogoRef}
            className="tuong-logo"
            aria-label={cauHinh.thuong_hieu.nhan_aria}
          >
            <div className="chay">
              <div className="nhom">
                {cauHinh.thuong_hieu.danh_sach.map((th) => (
                  <Link
                    key={th.ten}
                    href={th.den}
                    prefetch={false}
                    aria-label={th.ten}
                    className={th.logo ? "lg" : "lg chu"}
                  >
                    {th.logo ? (
                      <img
                        src={daTaiAnhDuoi ? th.logo : ANH_TRONG_SUOT}
                        alt={th.ten}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      th.ten
                    )}
                  </Link>
                ))}
              </div>
              <div className="nhom" aria-hidden="true">
                {cauHinh.thuong_hieu.danh_sach.map((th) => (
                  <Link
                    key={`dup-${th.ten}`}
                    href={th.den}
                    prefetch={false}
                    tabIndex={-1}
                    className={th.logo ? "lg" : "lg chu"}
                  >
                    {th.logo ? (
                      <img
                        src={daTaiAnhDuoi ? th.logo : ANH_TRONG_SUOT}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      th.ten
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Khối 4: Lưới 2 cột (Personal color · Check-in · Combo PDRN Pink · Mặt nạ Uniura) */}
        <div className="luoi">
          {cauHinh.luoi_doi.map((o) => {
            const dealCuaO = o.deal_id ? dealsMap.get(o.deal_id) : undefined;
            const giaNgan = dealCuaO?.gia_combo
              ? dinhDangNgan(dealCuaO.gia_combo)
              : "";

            return (
              <section key={o.id} className="o" id={o.id}>
                <div className="hien">
                  <h2>{o.tieu_de}</h2>
                  {o.co_logo ? (
                    <p className="co-logo">
                      <span>{o.phu_de_truoc}</span>
                      <img
                        src="/brand/vive-logo-chu.webp"
                        alt="VIVE"
                        width={350}
                        height={168}
                        loading="lazy"
                        decoding="async"
                      />
                    </p>
                  ) : o.phu_de_nghieng ? (
                    <p>
                      {o.phu_de_truoc}
                      <em>{o.phu_de_nghieng}</em>
                      {o.phu_de_sau}
                    </p>
                  ) : o.nhan_thuong_hieu ? (
                    <p>
                      {o.nhan_thuong_hieu}
                      {giaNgan ? ` · ${giaNgan}` : ""}
                    </p>
                  ) : null}

                  <div className="nut">
                    {o.nut.map((n) => (
                      <NutTrangChu
                        key={n.chu}
                        nut={n}
                        banDoUrl={doanhNghiep.ban_do}
                      />
                    ))}
                  </div>
                </div>

                {o.so_lon ? (
                  <div className="so-lon hien" aria-hidden="true">
                    {o.so_lon}
                  </div>
                ) : o.anh ? (
                  <div className={o.anh_sp ? "hinh sp" : "hinh"}>
                    <img
                      src={daTaiAnhDuoi ? o.anh : ANH_TRONG_SUOT}
                      alt={o.mo_ta_anh || o.tieu_de}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        {/* Khối 5: Hàng rộng "Từ 700K, tặng LOPOE" */}
        <section className="o lon" id="qua-lopoe">
          <div className="hien">
            <h2>{tieuDeQuaLopoe}</h2>
            {nhanTinhKm08 && <p>{nhanTinhKm08}</p>}
            <div className="nut">
              {cauHinh.qua_lopoe.nut.map((n) => (
                <NutTrangChu
                  key={n.chu}
                  nut={n}
                  banDoUrl={doanhNghiep.ban_do}
                />
              ))}
            </div>
          </div>
          <div className="hinh">
            <img
              src={daTaiAnhDuoi ? cauHinh.qua_lopoe.anh : ANH_TRONG_SUOT}
              alt={cauHinh.qua_lopoe.mo_ta_anh}
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        {/* Khối 6: Ô tối "Ghé [logo]" */}
        <section className="o lon toi" id="ghe-vive">
          <div className="hien">
            <h2 className="ghe">
              <span>{cauHinh.ghe_vive.tien_to_tieu_de}</span>
              <img
                src="/brand/vive-logo-chu.webp"
                alt="VIVE"
                width={350}
                height={168}
                loading="lazy"
                decoding="async"
              />
            </h2>
            <p>
              {cauHinh.ghe_vive.dia_diem_ngan}. {gioHienThi}.
            </p>
            <div className="nut">
              {cauHinh.ghe_vive.nut.map((n) => (
                <NutTrangChu
                  key={n.chu}
                  nut={n}
                  banDoUrl={doanhNghiep.ban_do}
                />
              ))}
            </div>
          </div>
          <div className="so-lon hien" aria-hidden="true">
            {cauHinh.ghe_vive.chu_lon}
          </div>
        </section>
      </main>
    </div>
  );
}
