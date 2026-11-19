/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Deal, DoanhNghiep } from "@/lib/data/types";
import { dinhDangGioV3, dinhDangNgan } from "@/lib/trang-chu/dinh-dang";
import type { TheCombo, TrangChuConfig } from "@/lib/trang-chu/schema";
import type { CauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";
import { CuonLopoe3D, type VeNut3D } from "@/components/cuon-3d/CuonLopoe3D";
import { hienToast } from "@/components/ui/Toast";
import { NutTrangChu } from "./NutTrangChu";
import "./trang-chu.css";

const ANH_TRONG_SUOT =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

interface TrangChuClientProps {
  cauHinh: TrangChuConfig;
  lopoe3D: CauHinhLopoe3D;
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

/** Giá và quà combo đọc từ deal (hết quà thì dùng giá, quà khi_het_qua). */
function giaVaQua(deal: Deal | undefined): { gia: string; qua: string } {
  if (!deal) return { gia: "", qua: "" };
  const hetQua = deal.het_qua && deal.khi_het_qua;
  const giaSo = hetQua ? deal.khi_het_qua?.gia_combo ?? deal.gia_combo : deal.gia_combo;
  const quaGoc = hetQua ? deal.khi_het_qua?.qua ?? null : deal.qua ?? null;
  const qua = quaGoc ? `Tặng ${quaGoc.charAt(0).toLowerCase()}${quaGoc.slice(1)}. Số lượng có hạn.` : "";
  return { gia: giaSo ? dinhDangNgan(giaSo) : "", qua };
}

export function TrangChuClient({
  cauHinh,
  lopoe3D,
  deals,
  doanhNghiep,
  gioMoCua,
}: TrangChuClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ghepRef = useRef<HTMLDivElement>(null);
  const luoiAnhRef = useRef<HTMLDivElement>(null);
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

  // Nút trong khối LOPOE 3D: dùng đúng kiểu nút trang chủ (nút đầu "chinh", sau "phu")
  const veNut3D: VeNut3D = (n, i) => (
    <NutTrangChu
      key={n.chu}
      nut={{ chu: n.chu, den: n.den, kieu: i === 0 ? "chinh" : "phu" }}
      banDoUrl={doanhNghiep.ban_do}
    />
  );

  return (
    <div ref={rootRef} className={daTaiAnhDuoi ? "tc-v3 co-serif" : "tc-v3"}>
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

        {/* Khối 2: LOPOE Better Balance cuộn 3D (W055, chữ ở data/thu-nghiem/lopoe-3d.yaml) */}
        <CuonLopoe3D cfg={lopoe3D} id="lopoe" veNut={veNut3D} />

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

        {/* Khối 4: Lưới 2 cột kiểu apple.com (Personal color · Check-in · combo LOPOE · PDRN Pink · Vampire Glow · Uniura) */}
        <div className="luoi">
          {cauHinh.luoi_doi.map((o) => {
            const dealCuaO = o.deal_id ? dealsMap.get(o.deal_id) : undefined;
            const { gia: giaNgan, qua: dongQua } = giaVaQua(dealCuaO);
            const lop = `o nen-${o.mau_nen}${o.mau_nen === "toi" ? " toi" : ""}`;

            return (
              <section key={o.id} className={lop} id={o.id}>
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
                  {o.hien_qua && dongQua && <p className="dong-nho">{dongQua}</p>}

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

                {o.anh_bo ? (
                  <div
                    className={`hinh bo bo-${o.anh_bo.length}`}
                    role="img"
                    aria-label={o.mo_ta_anh || o.tieu_de}
                  >
                    {o.anh_bo.map((a, i) => (
                      <img
                        key={`${a}-${i}`}
                        src={daTaiAnhDuoi ? a : ANH_TRONG_SUOT}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={a.includes("ampoule") ? "nho" : undefined}
                      />
                    ))}
                  </div>
                ) : o.so_lon ? (
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

        {/* Khối 5b: Hàng combo trượt ngang (W055) */}
        <HangCombo
          cauHinh={cauHinh.truot_combo}
          dealsMap={dealsMap}
          daTaiAnh={daTaiAnhDuoi}
          banDoUrl={doanhNghiep.ban_do}
        />

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

function HangCombo({
  cauHinh,
  dealsMap,
  daTaiAnh,
  banDoUrl,
}: {
  cauHinh: TrangChuConfig["truot_combo"];
  dealsMap: Map<string, Deal>;
  daTaiAnh: boolean;
  banDoUrl?: string;
}) {
  const hangRef = useRef<HTMLDivElement>(null);
  const [dau, setDau] = useState(true);
  const [cuoi, setCuoi] = useState(false);

  useEffect(() => {
    const el = hangRef.current;
    if (!el) return;
    const capNhat = () => {
      setDau(el.scrollLeft <= 4);
      setCuoi(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    capNhat();
    el.addEventListener("scroll", capNhat, { passive: true });
    window.addEventListener("resize", capNhat);
    return () => {
      el.removeEventListener("scroll", capNhat);
      window.removeEventListener("resize", capNhat);
    };
  }, []);

  const truot = (huong: 1 | -1) => {
    const el = hangRef.current;
    if (!el) return;
    const the = el.querySelector<HTMLElement>(".the-combo");
    const buoc = (the?.offsetWidth ?? 320) + 12;
    el.scrollBy({ left: huong * buoc * 2, behavior: "smooth" });
  };

  const theHienThi = cauHinh.the.filter((t: TheCombo) => {
    const d = dealsMap.get(t.deal_id);
    return d && d.hien_thi && !d.may_rui;
  });

  return (
    <section className="hang-combo" id="hang-combo" aria-label={cauHinh.tieu_de}>
      <div className="dau-hang hien">
        <div>
          <h2>{cauHinh.tieu_de}</h2>
          {cauHinh.phu_de && <p>{cauHinh.phu_de}</p>}
        </div>
        <div className="dieu-khien">
          <NutTrangChu nut={cauHinh.nut} banDoUrl={banDoUrl} />
          <button type="button" className="mui" aria-label="Combo trước" disabled={dau} onClick={() => truot(-1)}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="mui" aria-label="Combo tiếp theo" disabled={cuoi} onClick={() => truot(1)}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
      <div ref={hangRef} className="truot" tabIndex={0} aria-label="Danh sách combo, trượt ngang">
        {theHienThi.map((t) => {
          const d = dealsMap.get(t.deal_id)!;
          const { gia, qua } = giaVaQua(d);
          return (
            <Link
              key={t.deal_id}
              href={`/deal?id=${encodeURIComponent(t.deal_id)}`}
              prefetch={false}
              className={`the-combo nen-${t.mau_nen}${t.mau_nen === "toi" ? " toi" : ""}`}
            >
              <span className="nhan">{t.nhan}</span>
              <span className="ten">{t.ten}</span>
              {gia && <span className="gia">{gia}</span>}
              {qua && <span className="qua">{qua}</span>}
              <span className="hinh-the" aria-hidden="true">
                {t.anh_bo ? (
                  t.anh_bo.map((a, i) => (
                    <img
                      key={`${a}-${i}`}
                      src={daTaiAnh ? a : ANH_TRONG_SUOT}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={a.includes("ampoule") ? "nho" : a.includes("medicube") ? "rong" : undefined}
                    />
                  ))
                ) : t.so_lon ? (
                  <span className="so-the">{t.so_lon}</span>
                ) : null}
              </span>
              <span className="xem">Xem deal ›</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
