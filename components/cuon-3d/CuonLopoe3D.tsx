"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { BotNuoc, CauHinhLopoe3D, KhoiChu3D } from "@/lib/thu-nghiem/lopoe-3d";
import { lopNut } from "@/components/ui/Nut";
import { hienToast } from "@/components/ui/Toast";

type Nut3D = { chu: string; den: string | null };
/** Cách vẽ nút: trang chủ truyền NutTrangChu để giữ đúng kiểu nút landing; mặc định dùng nút chung (W040). */
export type VeNut3D = (n: Nut3D, thuTu: number) => ReactNode;

function NutMacDinh({ n, i }: { n: Nut3D; i: number }) {
  const t = useTranslations("trang-chu.chung");
  const lop = i === 0 ? lopNut("chinh", "vua") : lopNut("chu", "vua");
  return n.den ? (
    <Link href={n.den} prefetch={false} className={lop}>{n.chu}</Link>
  ) : (
    <button type="button" data-sap-co="true" onClick={() => hienToast(t("sapRaMat"))} className={lop}>{n.chu}</button>
  );
}
const veNutMacDinh: VeNut3D = (n, i) => <NutMacDinh key={n.chu} n={n} i={i} />;
import type { Canh, LoaiHat } from "./canh";
import { buocBam, khungTuP, MOC_CANH_AMP, pCanh, pTuCanh, pTuKhung, type TrangThaiPhat } from "./phat-khung";

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
            <span key={j} className="block whitespace-nowrap">
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
  "tren-giua": "max-md:!top-[8vh] max-md:!bottom-auto max-md:text-center md:left-1/2 md:top-[8vh] md:w-[min(84vw,980px)] md:-translate-x-1/2 md:text-center",
};

/** W072: đoạn 4 hoạt chất kiểu bọt nước: chữ + 2 nút cột trái, cùng mép trái (máy tính và điện thoại). */
const VI_TRI_BOT_NUOC = "left-[6vw] max-md:right-[6vw] top-[calc(max(8svh,60px)+env(safe-area-inset-top))] md:top-[max(11vh,84px)] md:w-[min(31vw,460px)]";

function KhoiChu({ k, veNut, botNuoc = false, nutThem = [] }: { k: KhoiChu3D; veNut: VeNut3D; botNuoc?: boolean; nutThem?: Nut3D[] }) {
  const giua = !botNuoc && (k.vi_tri === "duoi-giua" || k.vi_tri === "tren-giua");
  const nut = botNuoc ? nutThem : k.nut;
  return (
    <div data-khoi={k.id} className={`absolute opacity-0 invisible ${botNuoc ? VI_TRI_BOT_NUOC : `max-md:left-5 max-md:right-5 max-md:bottom-[calc(4vh+72px)] ${VI_TRI[k.vi_tri]}`}`}>
      {k.huy_hieu && (
        // eslint-disable-next-line @next/next/no-img-element
        <img data-con src={k.huy_hieu.anh} alt={k.huy_hieu.mo_ta} width={211} height={212} loading="lazy" decoding="async" className={`block w-[88px] h-auto mb-3 drop-shadow-[0_10px_24px_rgba(60,90,130,0.22)] ${giua ? "md:mx-auto" : ""} ${k.vi_tri === "duoi-giua" ? "md:absolute md:mb-0 md:w-[150px] md:left-[calc(max(16px,50vw-min(48vh,40vw)-175px)-50vw+min(42vw,490px))] md:bottom-[calc(100%+14vh)]" : "md:w-[124px]"}`} />
      )}
      {k.ten_nho && <p data-con className="m-0 text-[12px] font-semibold tracking-[0.1em] uppercase text-xam">{k.ten_nho}</p>}
      {k.lon_nghieng && <p data-con className="m-0 mt-2.5 font-serif italic font-medium text-[56px] md:text-[clamp(64px,8vw,120px)] leading-[0.95] tracking-[-0.02em]">{k.lon_nghieng}</p>}
      <TuKhoa k={k} />
      {k.cau && <p data-con className={`m-0 font-medium tracking-[-0.01em] leading-[1.25] ${k.cau_lon ? "text-[24px] md:text-[clamp(28px,3vw,44px)]" : "text-[18px] md:text-[clamp(20px,2vw,28px)]"}`}>{chuNghieng(k.cau)}</p>}
      {k.chips.length > 0 && (
        <p className={`m-0 mt-4 md:mt-5 flex flex-wrap gap-2 ${giua ? "justify-center" : ""}`}>
          {k.chips.map((c) => (
            <span data-con key={c} className="text-[13px] font-medium px-3.5 py-1.5 rounded-full bg-trang/60 backdrop-blur-md shadow-[inset_0_0_0_1px_rgba(43,43,42,0.08)]">{c}</span>
          ))}
        </p>
      )}
      {nut.length > 0 && (
        <div data-con data-nut-khoi className={`mt-5 flex flex-wrap items-center gap-3.5 pointer-events-auto ${giua ? "justify-center" : ""}`}>
          {nut.map((n, i) => veNut(n, i))}
        </div>
      )}
    </div>
  );
}

function NhanThanhPhan({ ten, loi, giua }: { ten: string; loi: string; giua: boolean }) {
  return (
    <div data-nhan className={`absolute left-0 top-0 opacity-0 whitespace-nowrap will-change-transform rounded-2xl bg-trang/75 backdrop-blur-md shadow-[0_6px_20px_rgba(43,43,42,0.08)] px-3 py-1.5 md:px-4 md:py-2.5 ${giua ? "text-center" : ""}`}>
      <b className="block text-[15px] md:text-[21px] font-bold tracking-[-0.01em] leading-tight text-den">{ten}</b>
      <span className="block text-[12px] md:text-[15px] font-medium text-den/75 mt-0.5">{loi}</span>
    </div>
  );
}

/** Ảnh bọt của 1 hoạt chất: ảnh DES (bot_nuoc.anh), thiếu thì ảnh thành phần cũ. */
const anhBot = (cfg: CauHinhLopoe3D, bn: BotNuoc, loai: string) =>
  bn.anh[loai as keyof BotNuoc["anh"]] ?? cfg.anh_thanh_phan[loai as keyof CauHinhLopoe3D["anh_thanh_phan"]];

function ChuBot({ ten, loi }: { ten: string; loi: string }) {
  return (
    <span data-bot-chu className="block mt-1.5 md:mt-0 max-w-full md:max-w-[min(17vw,240px)]">
      <b className="block text-[13px] md:text-[clamp(16px,1.45vw,21px)] font-bold tracking-[-0.01em] leading-tight text-den">{ten}</b>
      <span className="block text-[12px] md:text-[clamp(13px,1.05vw,15px)] font-medium leading-tight md:leading-snug text-den/75 mt-0.5">{loi}</span>
    </span>
  );
}

/**
 * W072: 4 bọt nước (ảnh + tên + công dụng) cho đoạn 4 hoạt chất, là HTML trên canvas / chuỗi ảnh khung.
 * Máy tính: vòng cung bên phải chai; điện thoại: lưới 2×2 dưới chai. Bọt đứng yên đúng chỗ, độ mờ theo cuộn (capNhatChu).
 */
function LopBotNuoc({ cfg, bn }: { cfg: CauHinhLopoe3D; bn: BotNuoc }) {
  const m = bn.may_tinh, d = bn.dien_thoai;
  const R = `min(${m.ban_kinh[0]}vw, ${m.ban_kinh[1]}vh)`;
  const caoHang = `((100% - ${d.tren}% - ${d.duoi}px) / 2)`;
  const goc: CSSProperties = { ["--bn-s" as string]: `min(${m.co[0]}vw, ${m.co[1]}vh)`, ["--bn-sd" as string]: `min(${d.co[0]}vw, ${d.co[1]}vh)` };
  return (
    <div data-bot-nuoc className="absolute inset-0" style={goc}>
      {cfg.thanh_phan.ampoule.map((t, i) => {
        const g = (m.goc[i] * Math.PI) / 180;
        const vt: CSSProperties = {
          ["--bn-x" as string]: `calc(${m.tam[0]}% + ${Math.cos(g).toFixed(4)} * ${R} - var(--bn-s) / 2)`,
          ["--bn-y" as string]: `calc(${m.tam[1]}% + ${Math.sin(g).toFixed(4)} * ${R} - var(--bn-s) / 2)`,
          ["--bn-xd" as string]: `${6 + (i % 2) * 44}%`,
          ["--bn-yd" as string]: `calc(${d.tren}% + ${Math.floor(i / 2)} * ${caoHang})`,
          ["--bn-hd" as string]: `calc${caoHang}`,
        };
        const anh = anhBot(cfg, bn, t.loai);
        return (
          <div key={t.loai + i} data-bot={t.loai} style={vt}
            className="absolute opacity-0 invisible left-[var(--bn-xd)] top-[var(--bn-yd)] w-[44%] h-[var(--bn-hd)] flex flex-col items-center justify-start text-center md:left-[var(--bn-x)] md:top-[var(--bn-y)] md:w-auto md:h-auto md:flex-row md:justify-start md:text-left md:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {anh && <img data-bot-anh src={anh} alt="" width={512} height={512} loading="lazy" decoding="async" className="block shrink-0 w-[var(--bn-sd)] h-auto md:w-[var(--bn-s)]" />}
            <ChuBot ten={t.ten} loi={t.loi} />
          </div>
        );
      })}
    </div>
  );
}

/** Bản dự phòng: không có WebGL hoặc người dùng giảm chuyển động → ảnh tĩnh + chữ, không dính đoạn dài. */
function BanTinh({ cfg, id, botNuoc, veNut }: { cfg: CauHinhLopoe3D; id?: string; botNuoc: BotNuoc | null; veNut: VeNut3D }) {
  const anh: Record<string, string> = { srm: cfg.tai_san.sua_rua_mat, amp: cfg.tai_san.ampoule_than, kem: cfg.tai_san.kem_duong };
  return (
    <section id={id} aria-label="LOPOE Better Balance" className="bg-lopoe-nen px-5 md:px-16 py-16 flex flex-col gap-16">
      {cfg.khoi.map((k) => {
        const sp = k.id.startsWith("srm") ? "srm" : k.id.startsWith("amp") ? "amp" : "kem";
        if (botNuoc && k.id === "amp-thanh-phan") {
          // W072, giảm chuyển động: chữ + 2 nút căn trái, 4 bọt hiện sẵn (không mờ dần, không bay)
          const nut = cfg.khoi.find((x) => x.id === "ket")?.nut ?? [];
          return (
            <div key={k.id} data-khoi={k.id} className="max-w-[980px] mx-auto w-full">
              <div className="grid md:grid-cols-[200px_1fr] gap-6 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={anh[sp]} alt="" className="h-[220px] w-auto object-contain mx-auto" />
                <div>
                  {k.ten_nho && <p className="m-0 text-[12px] font-semibold tracking-[0.1em] uppercase text-xam">{k.ten_nho}</p>}
                  {k.tu_khoa && <h3 className="m-0 mt-2 text-[40px] font-bold tracking-[-0.03em] leading-none">{k.tu_khoa.replace("|", " ")}</h3>}
                  {k.cau && <p className="m-0 mt-2 text-[20px] font-medium">{chuNghieng(k.cau)}</p>}
                  {nut.length > 0 && <div data-nut-khoi className="mt-5 flex flex-wrap items-center gap-3.5">{nut.map((n, i) => veNut(n, i))}</div>}
                </div>
              </div>
              <div data-bot-nuoc className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
                {cfg.thanh_phan.ampoule.map((t, i) => {
                  const a = anhBot(cfg, botNuoc, t.loai);
                  return (
                    <div key={t.loai + i} data-bot={t.loai} className="flex flex-col items-center text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {a && <img data-bot-anh src={a} alt="" width={512} height={512} loading="lazy" decoding="async" className="block w-[min(36vw,160px)] h-auto" />}
                      <ChuBot ten={t.ten} loi={t.loi} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
        return (
          <div key={k.id} className="grid md:grid-cols-[200px_1fr] gap-6 items-center max-w-[980px] mx-auto w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anh[sp]} alt="" className="h-[220px] w-auto object-contain mx-auto" />
            <div>
              {k.huy_hieu && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={k.huy_hieu.anh} alt={k.huy_hieu.mo_ta} width={211} height={212} loading="lazy" className="block w-[96px] h-auto mb-3" />
              )}
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

export function CuonLopoe3D({ cfg, id, veNut = veNutMacDinh }: { cfg: CauHinhLopoe3D; id?: string; veNut?: VeNut3D }) {
  const tTienTrinh = useTranslations("trang-chu.lopoe.tienTrinh");
  const doan = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lop = useRef<HTMLDivElement>(null);
  const [cheDo, setCheDo] = useState<"cho" | "3d" | "khung" | "tinh">("cho");
  const [daTai, setDaTai] = useState(false);
  // W072: bố cục bọt nước cho đoạn 4 hoạt chất: bật bằng yaml (bot_nuoc.bat) hoặc ?bot-nuoc=1 (xem trước, đọc phía client)
  const [botNuoc, setBotNuoc] = useState(!!cfg.bot_nuoc?.bat);
  const bn = botNuoc && cfg.bot_nuoc ? cfg.bot_nuoc : null;

  useEffect(() => {
    const giam = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let coWebGL = false;
    try { coWebGL = !!document.createElement("canvas").getContext("webgl2"); } catch { coWebGL = false; }
    // ?ba-chieu=1: ép chạy three.js trên điện thoại (chỉ dùng khi chụp lại chuỗi ảnh khung)
    const thamSo = new URLSearchParams(location.search);
    const epBaChieu = thamSo.has("ba-chieu");
    const dungKhung = !!cfg.khung_dien_thoai && innerWidth < 768 && !epBaChieu;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheDo(giam ? "tinh" : dungKhung ? "khung" : coWebGL ? "3d" : "tinh");
    if (cfg.bot_nuoc && (cfg.bot_nuoc.bat || thamSo.get("bot-nuoc") === "1")) setBotNuoc(true);
  }, [cfg.khung_dien_thoai, cfg.bot_nuoc]);

  useEffect(() => {
    if ((cheDo !== "3d" && cheDo !== "khung") || !canvas.current || !doan.current || !lop.current) return;
    let canh: Canh | null = null;
    const kd = cheDo === "khung" ? cfg.khung_dien_thoai! : null;
    // Ảnh nén (blob) giữ hết (~3 MB); ảnh đã giải mã (ImageBitmap) chỉ giữ một cửa sổ quanh vị trí cuộn:
    // trình duyệt tự bỏ ảnh đã giải mã của <img> nên vẽ lại phải giải mã lại (~30ms/khung trên máy chậm) → giật.
    const blobKhung: (Blob | null)[] = kd ? new Array(kd.so).fill(null) : [];
    const anhKhung: (ImageBitmap | null)[] = kd ? new Array(kd.so).fill(null) : [];
    const dangGiai = new Set<number>();
    let tamCuaSo = 0, huongCuon = 1;
    let nhanKhung: ({ srm: (number[] | 0)[]; amp: (number[] | 0)[] })[] = [];
    let pKhung: number[] = []; // tiến trình p của từng khung (khung dày ở đoạn hình đổi nhiều, thưa ở đoạn đứng yên)
    let ctx2d: CanvasRenderingContext2D | null = null, khoaVe = -1;
    let raf = 0, hien = false, huy = false, p = 0, pc = 0, truoc = performance.now(), dangTai = false;
    let phat: TrangThaiPhat | null = null; // null = nhảy thẳng tới đích ở lần vẽ tới
    const elDoan = doan.current, elLop = lop.current, elCanvas = canvas.current;
    const chupKhung = new URLSearchParams(location.search).has("ba-chieu"); // ?ba-chieu=1: chế độ chụp lại chuỗi ảnh khung
    // W072: mốc yaml của đoạn 4 hoạt chất đã nới; cảnh 3D và ảnh khung vẫn theo mốc gốc → đổi p sang pc (tiến trình cảnh).
    // Bọt nước trên điện thoại: ảnh khung đứng ở khung chưa có hạt + đường kẻ cũ suốt đoạn (giu).
    const kAmp = cfg.khoi.find((k) => k.id === "amp-thanh-phan");
    const aAmp = kAmp?.a ?? MOC_CANH_AMP.a, bAmp = kAmp?.b ?? MOC_CANH_AMP.b;
    const giu = !!kd && botNuoc;
    const sangCanh = (q: number) => pCanh(q, aAmp, bAmp, giu);
    const bot = [...elLop.querySelectorAll<HTMLElement>("[data-bot]")];

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
    const capNhatChu = (p: number, pc: number) => {
      if (moDau) {
        const o = 1 - seg(pc, 0.025, 0.045);
        moDau.style.opacity = String(o);
        moDau.style.transform = `translateY(${-30 * (1 - o)}px)`;
        moDau.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
      for (const { k, el, tus, con } of khoi) {
        // khối cuối (b = 1) giữ nguyên tới khi nhả khung dính
        const vao = seg(p, k.a - 0.012, k.a + 0.012), ra = k.b >= 1 ? 1 : 1 - seg(p, k.b - 0.014, k.b + 0.006), op = Math.min(vao, ra);
        el.style.opacity = op > 0.01 ? "1" : "0";
        el.style.visibility = op < 0.01 ? "hidden" : "visible";
        if (op < 0.01) continue;
        const [dx, dy] = LECH[k.tu];
        const t = kep((p - k.a + 0.014) / 0.032);
        tus.forEach((w, i) => { const e = muot(kep(t * 1.6 - i * 0.18)) * ra; w.style.opacity = String(e); w.style.transform = `translate(${dx * (1 - e) * 0.5}px,${(dy || 18) * (1 - e)}px)`; });
        con.forEach((c, i) => { const e = muot(kep(t * 1.4 - 0.1 - i * 0.09)) * ra; c.style.opacity = String(e); c.style.transform = `translate(${dx * (1 - e)}px,${dy * (1 - e)}px)`; });
      }
      // Bọt nước: hiện mờ dần lần lượt đầu đoạn, mờ cùng khối chữ cuối đoạn (chưa bay, job sau)
      if (bot.length && kAmp) {
        const ra = 1 - seg(p, bAmp - 0.014, bAmp + 0.006);
        bot.forEach((el, i) => {
          const e = seg(p, aAmp + 0.008 + i * 0.01, aAmp + 0.03 + i * 0.01) * ra;
          el.style.opacity = String(e);
          el.style.visibility = e < 0.01 ? "hidden" : "visible";
        });
      }
      // thanh tiến trình bên phải theo mốc cảnh
      const khoang = [[0.045, 0.37], [0.37, 0.72], [0.72, 0.87]];
      const tt = elLop.querySelector<HTMLElement>("[data-tien-trinh]");
      if (tt) tt.style.opacity = String(seg(pc, 0.05, 0.08) * (1 - seg(pc, 0.87, 0.9)));
      khoang.forEach(([a, b], i) => { if (vach[i]) vach[i].style.transform = `scaleY(${kep((pc - a) / (b - a))})`; dong[i]?.classList.toggle("font-semibold", pc >= a && pc < b); });
    };
    const datNhan = (els: HTMLElement[], vt: { x: number; y: number; o: number }[], dx: number, dy: number, giua: boolean) => {
      els.forEach((el, i) => {
        const v = vt[i];
        if (!v || v.o < 0.01) { el.style.opacity = "0"; return; }
        el.style.opacity = String(v.o);
        el.style.textAlign = giua ? "center" : "left";
        el.style.transform = `translate(${v.x + dx}px,${v.y + dy}px) translate(${giua ? "-50%" : "0"},-50%)`;
      });
    };

    let soKhungRanh = 0, sanSangVe = false;
    const khung = (time: number) => {
      if (huy) return;
      const dich = tienTrinh();
      // Đứng yên (không cuộn): vẽ 1/4 số khung để máy đỡ nóng và không giật
      if (kd) {
        // Chế độ khung ảnh: khung bám vị trí cuộn bằng lò xo giảm chấn (~0,1 giây): theo tay ngay, dừng khi trang dừng,
        // tốc độ hình đổi liền mạch nên đổi nhịp tay hay nhấc tay không làm hình giật cục
        const dt = Math.min(0.1, (time - truoc) / 1000);
        truoc = time;
        const dichCanh = sangCanh(dich);
        if (pKhung.length < 2 || !phat) {
          // lần đầu hoặc vừa quay lại khối: hiện đúng chỗ đang cuộn
          if (pKhung.length >= 2) phat = { f: khungTuP(pKhung, dichCanh), v: 0 };
          pc = dichCanh;
          p = dich;
        } else {
          phat = buocBam(phat, khungTuP(pKhung, dichCanh), dt);
          pc = pTuKhung(pKhung, phat.f);
          // đang đứng khung ở đoạn bọt nước: chữ theo vị trí cuộn
          p = giu && pc >= MOC_CANH_AMP.a && pc <= MOC_CANH_AMP.het ? kep(dich, aAmp, bAmp) : pTuCanh(pc, aAmp, bAmp, giu);
        }
        veAnh(pc);
        capNhatChu(p, pc);
        if (hien) raf = requestAnimationFrame(khung);
        return;
      }
      if (Math.abs(dich - p) < 1e-5 && sanSangVe) {
        soKhungRanh += 1;
        if (soKhungRanh % 4 !== 0) { if (hien) raf = requestAnimationFrame(khung); return; }
      } else soKhungRanh = 0;
      const dt = Math.min(0.1, (time - truoc) / 1000);
      truoc = time;
      p += (dich - p) * (1 - Math.exp(-dt * 6));
      if (Math.abs(dich - p) < 1e-5) p = dich;
      const ep = (window as unknown as { __p?: number }).__p; // chỉ dùng khi kiểm thử
      if (typeof ep === "number") p = ep;
      pc = sangCanh(p);
      if (canh) {
        const vt = canh.ve(pc, time);
        if (chupKhung) (window as unknown as { __vt?: unknown }).__vt = vt;
        const dienThoai = innerWidth < 768;
        datNhan(nhanSrm, vt.srm, 0, dienThoai ? 40 : 72, true);
        // Điện thoại: nhãn nằm dưới từng hạt, canh giữa; máy tính: nhãn bên phải hạt
        datNhan(nhanAmp, vt.amp, dienThoai ? 0 : 48, dienThoai ? 46 : 0, dienThoai);
      }
      capNhatChu(p, pc);
      if (hien) raf = requestAnimationFrame(khung);
    };

    const gan = (i: number) => {
      for (let d = 0; d < anhKhung.length; d++) { if (anhKhung[i - d]) return anhKhung[i - d]; if (anhKhung[i + d]) return anhKhung[i + d]; }
      return null;
    };
    const doiCoKhung = () => {
      const dpr = 2; // canvas đúng cỡ ảnh gốc (780 = 390×2): vẽ không phải co giãn ảnh, rẻ nhất
      elCanvas.width = Math.round(elCanvas.clientWidth * dpr);
      elCanvas.height = Math.round(elCanvas.clientHeight * dpr);
      khoaVe = -1; anhDaVe = null;
    };
    /** Khung có p ≤ pp (tìm nhị phân) */
    const timKhung = (pp: number) => {
      let lo = 0, hi = pKhung.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (pKhung[m] <= pp) lo = m; else hi = m - 1; }
      return lo;
    };
    const veAnh = (pp: number) => {
      if (!kd || !ctx2d || pKhung.length < 2) return;
      const i = timKhung(pp), j = Math.min(pKhung.length - 1, i + 1);
      const t = j > i ? kep((pp - pKhung[i]) / (pKhung[j] - pKhung[i])) : 0;
      const gan1 = t < 0.5 ? i : j; // khung gần nhất, không hoà trộn (hoà trộn tạo bóng mờ khi dừng giữa 2 khung)
      if (gan1 !== tamCuaSo) { huongCuon = gan1 > tamCuaSo ? 1 : -1; tamCuaSo = gan1; capNhatCuaSo(); }
      const khoa = gan1 * 1000 + Math.round(t * 20); // nhãn vẫn nội suy mượt giữa 2 khung
      if (khoa === khoaVe) return;
      const a = gan(gan1);
      if (a && a !== anhDaVe) {
        const W = elCanvas.width, H = elCanvas.height;
        const s = Math.max(W / kd.rong, H / kd.cao), w = kd.rong * s, h = kd.cao * s;
        ctx2d.drawImage(a, (W - w) / 2, (H - h) / 2, w, h);
        anhDaVe = a;
        if (!daVeDau) { daVeDau = true; setDaTai(true); }
      }
      khoaVe = khoa;
      const n0 = nhanKhung[i], n1 = nhanKhung[j] ?? n0;
      if (!n0) return;
      const sc = Math.max(elCanvas.clientWidth / kd.vp_rong, elCanvas.clientHeight / kd.vp_cao);
      const cx = (elCanvas.clientWidth - kd.vp_rong * sc) / 2, cy = (elCanvas.clientHeight - kd.vp_cao * sc) / 2;
      const noi = (A: (number[] | 0)[], B: (number[] | 0)[]) => A.map((v, k) => {
        const u = B[k];
        if (!v && !u) return { x: 0, y: 0, o: 0 };
        const va = v || (u as number[]), vb = u || va;
        const o = (v ? (v as number[])[2] : 0) * (1 - t) + (u ? (u as number[])[2] : 0) * t;
        return { x: cx + (va[0] * (1 - t) + vb[0] * t) * sc, y: cy + (va[1] * (1 - t) + vb[1] * t) * sc, o };
      });
      datNhan(nhanSrm, noi(n0.srm, n1.srm), 0, 0, true);
      datNhan(nhanAmp, noi(n0.amp, n1.amp), 0, 0, true);
    };
    let anhDaVe: ImageBitmap | null = null;
    let daVeDau = false;
    const TRUOC = 14, SAU = 5; // giải mã trước 14 khung theo hướng cuộn, 5 khung phía sau; còn lại bỏ (mỗi khung ~5 MB khi giải mã, giữ ~20 khung ≈ 100 MB)
    const ngoaiCuaSo = (i: number) => (i - tamCuaSo) * huongCuon > TRUOC + 2 || (tamCuaSo - i) * huongCuon > SAU + 2;
    const giaiMa = (i: number) => {
      const bl = blobKhung[i];
      if (!bl || anhKhung[i] || dangGiai.has(i) || huy || dangGiai.size >= 4) return;
      dangGiai.add(i);
      createImageBitmap(bl).then((bm) => {
        dangGiai.delete(i);
        if (huy || ngoaiCuaSo(i)) { bm.close(); } else { anhKhung[i] = bm; khoaVe = -1; }
        capNhatCuaSo();
      }, () => dangGiai.delete(i));
    };
    const capNhatCuaSo = () => {
      if (!kd) return;
      const c = tamCuaSo;
      for (let i = 0; i < kd.so; i++) {
        if (anhKhung[i] && ngoaiCuaSo(i) && i !== 0) { anhKhung[i]!.close(); anhKhung[i] = null; }
      }
      // gần trước, rồi xa dần, ưu tiên hướng đang cuộn
      for (let d = 0; d <= TRUOC; d++) {
        const a = c + d * huongCuon, b = c - d * huongCuon;
        if (a >= 0 && a < kd.so) giaiMa(a);
        if (d <= SAU && b >= 0 && b < kd.so) giaiMa(b);
      }
    };
    const taiAnhKhung = () => {
      if (!kd || dangTai) return;
      dangTai = true;
      ctx2d = elCanvas.getContext("2d", { alpha: false });
      doiCoKhung();
      const url = (i: number) => `${kd.thu_muc}/${String(i).padStart(3, "0")}.webp`;
      const tai = (i: number) =>
        blobKhung[i] || huy ? Promise.resolve() :
        fetch(url(i)).then((r) => r.blob()).then((bl) => { blobKhung[i] = bl; capNhatCuaSo(); }, () => {});
      (async () => {
        try { const j = await (await fetch(kd.nhan)).json(); pKhung = j.p; nhanKhung = j.nhan; khoaVe = -1; } catch { return; }
        tamCuaSo = timKhung(pc);
        await tai(0);
        // tải các khung gần vị trí hiện tại trước, sau đó lấp hết (song song 4 luồng)
        const thuTu = Array.from({ length: kd.so }, (_, i) => i).sort((a, b) => Math.abs(a - tamCuaSo) - Math.abs(b - tamCuaSo));
        let k = 0;
        const luong = async () => { while (k < thuTu.length && !huy) await tai(thuTu[k++]); };
        await Promise.all([luong(), luong(), luong(), luong()]);
      })();
    };

    // Tải three.js + mô hình khi khối sắp vào khung nhìn (không tranh tải với ảnh đầu trang)
    const taiCanh = () => {
      if (dangTai) return;
      dangTai = true;
      import("./canh").then(({ taoCanh }) => {
        if (huy) return;
        canh = taoCanh(elCanvas, {
          taiSan: cfg.tai_san,
          hatSrm: cfg.thanh_phan.sua_rua_mat.map((t) => t.loai as LoaiHat),
          hatAmp: cfg.thanh_phan.ampoule.map((t) => t.loai as LoaiHat),
          anhHat: cfg.anh_thanh_phan,
          so1: cfg.so_1,
          hienSo1: cfg.khoi.some((k) => k.id === "amp-giai-thuong"),
          giamChuyenDong: false,
          thoiGianTheoP: chupKhung,
          anHatAmp: botNuoc,
          onSanSang: () => { sanSangVe = true; setDaTai(true); },
        });
        p = tienTrinh();
      });
    };
    // Điều kiện: khối đã gần khung nhìn VÀ (người dùng đã tương tác hoặc trang rảnh 3s sau khi tải xong)
    let ganKhung = false, sanSang = false;
    const thu = () => { if (!ganKhung || !sanSang) return; if (kd) taiAnhKhung(); else taiCanh(); };
    const ioTai = new IntersectionObserver(([e]) => { ganKhung = e.isIntersecting; if (ganKhung) thu(); if (dangTai) ioTai.disconnect(); }, { rootMargin: "120% 0px" });
    ioTai.observe(elDoan);
    const suKien = ["scroll", "wheel", "touchstart", "keydown", "pointerdown"] as const;
    const kichHoat = () => { sanSang = true; suKien.forEach((t) => removeEventListener(t, kichHoat)); thu(); };
    suKien.forEach((t) => addEventListener(t, kichHoat, { passive: true }));
    let henRanh = 0;
    const khiTaiXong = () => { henRanh = window.setTimeout(kichHoat, 3000); };
    if (document.readyState === "complete") khiTaiXong(); else addEventListener("load", khiTaiXong, { once: true });

    // Chỉ vẽ khi khối đang trong khung nhìn
    const io = new IntersectionObserver(([e]) => {
      const truocDo = hien;
      hien = e.isIntersecting;
      if (hien && !truocDo) { truoc = performance.now(); phat = null; raf = requestAnimationFrame(khung); }
    });
    io.observe(elDoan);

    let wTruoc = innerWidth, hTruoc = innerHeight;
    const doiCo = () => {
      // Thanh địa chỉ điện thoại ẩn/hiện làm innerHeight đổi vài chục px: bỏ qua để canvas không vẽ lại, tránh giật
      if (innerWidth === wTruoc && Math.abs(innerHeight - hTruoc) < 140) return;
      wTruoc = innerWidth; hTruoc = innerHeight;
      if (kd) doiCoKhung(); else canh?.doiCo();
    };
    addEventListener("resize", doiCo);

    return () => {
      huy = true;
      anhKhung.forEach((b) => b?.close());
      cancelAnimationFrame(raf);
      io.disconnect();
      ioTai.disconnect();
      suKien.forEach((t) => removeEventListener(t, kichHoat));
      removeEventListener("load", khiTaiXong);
      clearTimeout(henRanh);
      removeEventListener("resize", doiCo);
      canh?.huy();
    };
  }, [cheDo, cfg, botNuoc]);

  if (cheDo === "tinh") return <BanTinh cfg={cfg} id={id} botNuoc={bn} veNut={veNut} />;
  const nutKet = cfg.khoi.find((k) => k.id === "ket")?.nut ?? [];

  return (
    <section ref={doan} id={id} aria-label="LOPOE Better Balance" data-bot-nuoc-bat={bn ? "1" : undefined} className="relative h-[1600vh] md:h-[1500vh] bg-lopoe-nen">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvas} aria-hidden="true" className={`absolute inset-0 w-full h-full block transition-opacity duration-700 ${daTai ? "opacity-100" : "opacity-0"}`} />
        {/* Ảnh tĩnh bộ 3 trong lúc tải cảnh 3D, cùng vị trí với khung đầu của cảnh */}
        <div aria-hidden="true" className={`absolute inset-x-0 bottom-[33vh] md:bottom-[18vh] flex items-end justify-center gap-[3vw] md:gap-[6.5vw] transition-opacity duration-700 ${daTai ? "opacity-0" : "opacity-100"}`}>
          {/* eslint-disable @next/next/no-img-element */}
          <img src={cfg.tai_san.sua_rua_mat} alt="" width={366} height={989} loading="lazy" decoding="async" className="h-[33vh] md:h-[47vh] w-auto" />
          <span className="relative flex flex-col items-center">
            {/* Ảnh nắp gồm cả ống nhỏ giọt: chỉ lộ phần nắp (365/1227 chiều cao), ống nằm sau thân */}
            <span className="block overflow-hidden h-[12.2vh] md:h-[17.3vh]">
              <img src={cfg.tai_san.ampoule_nap} alt="" width={294} height={975} loading="lazy" decoding="async" className="h-[32.5vh] md:h-[46.2vh] w-auto" />
            </span>
            <img src={cfg.tai_san.ampoule_than} alt="" width={294} height={654} loading="lazy" decoding="async" className="h-[21.8vh] md:h-[31vh] w-auto -mt-[0.3vh]" />
          </span>
          <img src={cfg.tai_san.kem_duong} alt="" width={368} height={980} loading="lazy" decoding="async" className="h-[33vh] md:h-[47vh] w-auto" />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        <div ref={lop} className="absolute inset-0 pointer-events-none">
          <div data-mo-dau className="absolute left-0 right-0 top-[8vh] md:top-[9vh] text-center px-6">
            <p className="m-0 mb-1.5 text-[15px] md:text-[17px] text-xam font-medium">{cfg.mo_dau.nho}</p>
            <h2 className="m-0 text-[34px] md:text-[56px] font-semibold tracking-[-0.015em] leading-[1.07]">{cfg.mo_dau.tieu_de}</h2>
            <p className="m-0 mt-1.5 text-[19px] md:text-[28px] leading-[1.14]">{chuNghieng(cfg.mo_dau.cau)}</p>
            <div className="mt-[18px] flex justify-center items-center gap-3.5 flex-wrap pointer-events-auto">
              {cfg.mo_dau.nut.map((n, i) => veNut(n, i))}
            </div>
          </div>
          {cfg.khoi.map((k) => {
            const kieuBot = !!bn && k.id === "amp-thanh-phan";
            return <KhoiChu key={k.id} k={k} veNut={veNut} botNuoc={kieuBot} nutThem={kieuBot ? nutKet : []} />;
          })}
          {bn && <LopBotNuoc cfg={cfg} bn={bn} />}
          <div data-nhom-nhan="srm">{cfg.thanh_phan.sua_rua_mat.map((t) => <NhanThanhPhan key={t.ten} ten={t.ten} loi={t.loi} giua />)}</div>
          {!bn && <div data-nhom-nhan="amp">{cfg.thanh_phan.ampoule.map((t) => <NhanThanhPhan key={t.ten} ten={t.ten} loi={t.loi} giua={false} />)}</div>}
          <div data-tien-trinh aria-hidden="true" className="hidden md:grid absolute right-7 top-1/2 -translate-y-1/2 gap-3.5 opacity-0">
            {[tTienTrinh("suaRuaMat"), tTienTrinh("ampoule"), tTienTrinh("kemDuong")].map((t) => (
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
