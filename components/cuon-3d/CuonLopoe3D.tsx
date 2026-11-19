"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { CauHinhLopoe3D, KhoiChu3D } from "@/lib/thu-nghiem/lopoe-3d";
import { lopNut } from "@/components/ui/Nut";
import type { Canh, LoaiHat } from "./canh";

const kep = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const muot = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => muot(kep((p - a) / (b - a)));
const LECH: Record<KhoiChu3D["tu"], [number, number]> = { phai: [40, 0], trai: [-40, 0], tren: [0, -30], duoi: [0, 40] };

/** "*chữ*" → chữ nghiêng Playfair */
function chuNghieng(s: string): ReactNode {
  return s.split(/(\*[^*]+\*)/g).map((m, i) =>
    m.startsWith("*") && m.endsWith("*") ? <em key={i} className="font-serif italic font-medium text-xam">{m.slice(1, -1)}</em> : <Fragment key={i}>{m}</Fragment>
  );
}

/** Tiêu đề lớn: "|" xuống dòng có chủ đích, dòng 2 tô xanh và lùi vào. Mỗi chữ là 1 span để hiện lần lượt. */
function TuKhoa({ k }: { k: KhoiChu3D }) {
  if (!k.tu_khoa) return null;
  const dong = k.tu_khoa.split("|");
  const lop = k.co === "lon" ? "text-[64px] md:text-[clamp(76px,8vw,132px)] leading-[0.9] tracking-[-0.05em]" : "text-[36px] md:text-[clamp(44px,5.2vw,84px)] leading-none tracking-[-0.035em]";
  return (
    <h3 className={`m-0 mt-2 mb-2.5 font-bold ${lop} ${k.vi_tri === "duoi-giua" ? "md:whitespace-nowrap" : ""}`}>
      {dong.length > 1
        ? dong.map((d, j) => (
            <span key={j} className={`block whitespace-nowrap ${j ? "pl-[0.62em]" : ""} ${k.vi_tri === "duoi-giua" && j ? "md:pl-[1.2em]" : ""}`}>
              {d.trim().split(" ").map((t, i) => (
                <Fragment key={i}>{i ? " " : ""}<span data-tu className={`inline-block ${j ? "text-xanh-lopoe" : ""}`}>{t}</span></Fragment>
              ))}
            </span>
          ))
        : k.tu_khoa.split(" ").map((t, i) => {
            const xanh = (k.nhan_tu !== undefined && i >= k.nhan_tu) || (k.nhan_dau !== undefined && i < k.nhan_dau);
            return <Fragment key={i}>{i ? " " : ""}<span data-tu className={`inline-block ${xanh ? "text-xanh-lopoe" : ""}`}>{t}</span></Fragment>;
          })}
    </h3>
  );
}

const VI_TRI: Record<KhoiChu3D["vi_tri"], string> = {
  phai: "md:left-[57vw] md:top-1/2 md:w-[min(34vw,460px)] md:-translate-y-1/2",
  trai: "md:left-[max(7vw,32px)] md:top-1/2 md:w-[min(34vw,460px)] md:-translate-y-1/2",
  "tren-trai": "md:left-[max(6vw,28px)] md:top-[13vh] md:w-[min(30vw,400px)]",
  cot: "md:left-[46vw] md:top-[8vh] md:w-[min(40vw,520px)]",
  "duoi-giua": "md:left-1/2 md:bottom-[6vh] md:w-[min(84vw,980px)] md:-translate-x-1/2 md:text-center",
  "trai-duoi": "md:left-[max(7vw,32px)] md:bottom-[12vh] md:w-[min(34vw,460px)]",
};

function KhoiChu({ k }: { k: KhoiChu3D }) {
  return (
    <div data-khoi={k.id} className={`absolute opacity-0 invisible max-md:left-5 max-md:right-5 max-md:bottom-[calc(4vh+72px)] ${VI_TRI[k.vi_tri]}`}>
      {k.ten_nho && <p data-con className="m-0 text-[12px] font-semibold tracking-[0.1em] uppercase text-xam">{k.ten_nho}</p>}
      {k.lon_nghieng && <p data-con className="m-0 mt-2.5 font-serif italic font-medium text-[56px] md:text-[clamp(64px,8vw,120px)] leading-[0.95] tracking-[-0.02em]">{k.lon_nghieng}</p>}
      <TuKhoa k={k} />
      {k.cau && <p data-con className={`m-0 font-medium tracking-[-0.01em] leading-[1.25] ${k.cau_lon ? "text-[24px] md:text-[clamp(28px,3vw,44px)]" : "text-[18px] md:text-[clamp(20px,2vw,28px)]"}`}>{chuNghieng(k.cau)}</p>}
      {k.chips.length > 0 && (
        <p className={`m-0 mt-4 md:mt-5 flex flex-wrap gap-2 ${k.vi_tri === "duoi-giua" ? "md:justify-center" : ""}`}>
          {k.chips.map((c) => (
            <span data-con key={c} className="text-[13px] font-medium px-3.5 py-1.5 rounded-full bg-trang/60 backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(43,43,42,0.08)]">{c}</span>
          ))}
        </p>
      )}
    </div>
  );
}

function NhanThanhPhan({ ten, loi, giua }: { ten: string; loi: string; giua: boolean }) {
  return (
    <div data-nhan className={`absolute left-0 top-0 opacity-0 whitespace-nowrap will-change-transform ${giua ? "text-center" : ""}`}>
      <b className="block text-[12px] md:text-[15px] font-semibold">{ten}</b>
      <span className="hidden md:block text-[13px] text-xam mt-0.5">{loi}</span>
    </div>
  );
}

/** Bản dự phòng: không có WebGL hoặc người dùng giảm chuyển động → ảnh tĩnh + chữ, không dính đoạn dài. */
function BanTinh({ cfg }: { cfg: CauHinhLopoe3D }) {
  const anh: Record<string, string> = { srm: cfg.tai_san.sua_rua_mat, amp: "/chien-dich/lopoe-better-balance/ampoule-than.webp", kem: cfg.tai_san.kem_duong };
  return (
    <section aria-label="LOPOE Better Balance" className="bg-hong-nhat px-5 md:px-16 py-16 flex flex-col gap-16">
      {cfg.khoi.map((k) => {
        const sp = k.id.startsWith("srm") ? "srm" : k.id.startsWith("amp") ? "amp" : "kem";
        return (
          <div key={k.id} className="grid md:grid-cols-[200px_1fr] gap-6 items-center max-w-[980px] mx-auto w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anh[sp]} alt="" className="h-[220px] w-auto object-contain mx-auto" />
            <div>
              {k.ten_nho && <p className="m-0 text-[12px] font-semibold tracking-[0.1em] uppercase text-xam">{k.ten_nho}</p>}
              {k.lon_nghieng && <p className="m-0 font-serif italic text-[56px] leading-none">{k.lon_nghieng}</p>}
              {k.tu_khoa && <h3 className="m-0 mt-2 text-[40px] font-bold tracking-[-0.03em] leading-none">{k.tu_khoa.replace("|", " ")}</h3>}
              {k.cau && <p className="m-0 mt-2 text-[20px] font-medium">{chuNghieng(k.cau)}</p>}
              {k.chips.length > 0 && <p className="m-0 mt-3 flex flex-wrap gap-2">{k.chips.map((c) => <span key={c} className="text-[13px] px-3 py-1 rounded-full bg-trang">{c}</span>)}</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function CuonLopoe3D({ cfg }: { cfg: CauHinhLopoe3D }) {
  const doan = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lop = useRef<HTMLDivElement>(null);
  const [cheDo, setCheDo] = useState<"cho" | "3d" | "tinh">("cho");
  const [daTai, setDaTai] = useState(false);

  useEffect(() => {
    const giam = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let coWebGL = false;
    try { coWebGL = !!document.createElement("canvas").getContext("webgl2"); } catch { coWebGL = false; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheDo(giam || !coWebGL ? "tinh" : "3d");
  }, []);

  useEffect(() => {
    if (cheDo !== "3d" || !canvas.current || !doan.current || !lop.current) return;
    let canh: Canh | null = null;
    let raf = 0, hien = false, huy = false, p = 0, truoc = performance.now();
    const elDoan = doan.current, elLop = lop.current, elCanvas = canvas.current;

    const moDau = elLop.querySelector<HTMLElement>("[data-mo-dau]");
    const khoi = cfg.khoi.map((k) => {
      const el = elLop.querySelector<HTMLElement>(`[data-khoi="${k.id}"]`)!;
      return { k, el, tus: [...el.querySelectorAll<HTMLElement>("[data-tu]")], con: [...el.querySelectorAll<HTMLElement>("[data-con]")] };
    });
    const nhanSrm = [...elLop.querySelectorAll<HTMLElement>("[data-nhom-nhan=srm] [data-nhan]")];
    const nhanAmp = [...elLop.querySelectorAll<HTMLElement>("[data-nhom-nhan=amp] [data-nhan]")];
    const vach = [...elLop.querySelectorAll<HTMLElement>("[data-vach]")];
    const dong = [...elLop.querySelectorAll<HTMLElement>("[data-dong]")];

    const tienTrinh = () => { const r = elDoan.getBoundingClientRect(); return kep(-r.top / (r.height - innerHeight)); };
    const capNhatChu = (p: number) => {
      if (moDau) {
        const o = 1 - seg(p, 0.025, 0.045);
        moDau.style.opacity = String(o);
        moDau.style.transform = `translateY(${-30 * (1 - o)}px)`;
        moDau.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
      for (const { k, el, tus, con } of khoi) {
        const vao = seg(p, k.a - 0.012, k.a + 0.012), ra = 1 - seg(p, k.b - 0.014, k.b + 0.006), op = Math.min(vao, ra);
        el.style.opacity = op > 0.01 ? "1" : "0";
        el.style.visibility = op < 0.01 ? "hidden" : "visible";
        if (op < 0.01) continue;
        const [dx, dy] = LECH[k.tu];
        const t = kep((p - k.a + 0.014) / 0.032);
        tus.forEach((w, i) => { const e = muot(kep(t * 1.6 - i * 0.18)) * ra; w.style.opacity = String(e); w.style.transform = `translate(${dx * (1 - e) * 0.5}px,${(dy || 18) * (1 - e)}px)`; });
        con.forEach((c, i) => { const e = muot(kep(t * 1.4 - 0.1 - i * 0.09)) * ra; c.style.opacity = String(e); c.style.transform = `translate(${dx * (1 - e)}px,${dy * (1 - e)}px)`; });
      }
      const khoang = [[0.045, 0.37], [0.37, 0.72], [0.72, 0.87]];
      const tt = elLop.querySelector<HTMLElement>("[data-tien-trinh]");
      if (tt) tt.style.opacity = String(seg(p, 0.05, 0.08) * (1 - seg(p, 0.87, 0.9)));
      khoang.forEach(([a, b], i) => { if (vach[i]) vach[i].style.transform = `scaleY(${kep((p - a) / (b - a))})`; dong[i]?.classList.toggle("font-semibold", p >= a && p < b); });
    };
    const datNhan = (els: HTMLElement[], vt: { x: number; y: number; o: number }[], dx: number, dy: number, giua: boolean) => {
      els.forEach((el, i) => {
        const v = vt[i];
        if (!v || v.o < 0.01) { el.style.opacity = "0"; return; }
        el.style.opacity = String(v.o);
        el.style.transform = `translate(${v.x + dx}px,${v.y + dy}px) translate(${giua ? "-50%" : "0"},-50%)`;
      });
    };

    const khung = (time: number) => {
      if (huy) return;
      const dich = tienTrinh();
      const dt = Math.min(0.1, (time - truoc) / 1000);
      truoc = time;
      p += (dich - p) * (1 - Math.exp(-dt * 6));
      if (Math.abs(dich - p) < 1e-5) p = dich;
      const ep = (window as unknown as { __p?: number }).__p; // chỉ dùng khi kiểm thử
      if (typeof ep === "number") p = ep;
      if (canh) {
        const vt = canh.ve(p, time);
        const dienThoai = innerWidth < 768;
        datNhan(nhanSrm, vt.srm, 0, dienThoai ? 32 : 58, true);
        datNhan(nhanAmp, vt.amp, 40, 0, false);
      }
      capNhatChu(p);
      if (hien) raf = requestAnimationFrame(khung);
    };

    // Chỉ vẽ khi khối đang trong khung nhìn
    const io = new IntersectionObserver(([e]) => {
      const truocDo = hien;
      hien = e.isIntersecting;
      if (hien && !truocDo) { truoc = performance.now(); raf = requestAnimationFrame(khung); }
    });
    io.observe(elDoan);

    import("./canh").then(({ taoCanh }) => {
      if (huy) return;
      canh = taoCanh(elCanvas, {
        taiSan: cfg.tai_san,
        hatSrm: cfg.thanh_phan.sua_rua_mat.map((t) => t.loai as LoaiHat),
        hatAmp: cfg.thanh_phan.ampoule.map((t) => t.loai as LoaiHat),
        so1: cfg.so_1,
        giamChuyenDong: false,
        onSanSang: () => setDaTai(true),
      });
      p = tienTrinh();
    });
    const doiCo = () => canh?.doiCo();
    addEventListener("resize", doiCo);

    return () => {
      huy = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", doiCo);
      canh?.huy();
    };
  }, [cheDo, cfg]);

  if (cheDo === "tinh") return <BanTinh cfg={cfg} />;

  return (
    <section ref={doan} aria-label="LOPOE Better Balance" className="relative h-[1600vh] md:h-[1500vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 w-full h-full block" />
        {!daTai && <div className="absolute inset-0 grid place-items-center text-[13px] text-xam">Đang tải…</div>}
        <div ref={lop} className="absolute inset-0 pointer-events-none">
          <div data-mo-dau className="absolute left-0 right-0 top-[9vh] md:top-[11vh] text-center px-6">
            <p className="m-0 mb-1.5 text-[15px] text-xam font-medium">{cfg.mo_dau.nho}</p>
            <h2 className="m-0 text-[36px] md:text-[clamp(36px,5.4vw,64px)] font-bold tracking-[-0.025em] leading-[1.04]">{cfg.mo_dau.tieu_de}</h2>
            <p className="m-0 mt-2.5 text-[18px] md:text-[clamp(18px,2vw,24px)]">{chuNghieng(cfg.mo_dau.cau)}</p>
            <div className="mt-5 flex justify-center items-center gap-5 pointer-events-auto">
              {cfg.mo_dau.nut.map((n, i) => (
                <Link key={n.den} href={n.den} className={i === 0 ? lopNut("chinh", "vua") : lopNut("chu", "vua")}>{n.chu}</Link>
              ))}
            </div>
          </div>
          {cfg.khoi.map((k) => <KhoiChu key={k.id} k={k} />)}
          <div data-nhom-nhan="srm">{cfg.thanh_phan.sua_rua_mat.map((t) => <NhanThanhPhan key={t.ten} ten={t.ten} loi={t.loi} giua />)}</div>
          <div data-nhom-nhan="amp">{cfg.thanh_phan.ampoule.map((t) => <NhanThanhPhan key={t.ten} ten={t.ten} loi={t.loi} giua={false} />)}</div>
          <div data-tien-trinh aria-hidden="true" className="hidden md:grid absolute right-7 top-1/2 -translate-y-1/2 gap-3.5 opacity-0">
            {["Sữa rửa mặt", "Ampoule", "Kem dưỡng"].map((t) => (
              <div key={t} data-dong className="flex items-center justify-end gap-2.5 text-[11px] tracking-[0.06em] text-xam">
                {t}
                <i className="relative w-[3px] h-[34px] rounded-sm bg-den/15 overflow-hidden"><span data-vach className="absolute inset-0 bg-den origin-top scale-y-0" /></i>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
