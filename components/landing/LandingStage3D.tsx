"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { datVaoVung, layVatTheTheoCheDo, type KetQuaDatVung, type VungVatThe } from "@/lib/chien-dich/vat-the";
import type { CheDoVung3D, VatPham3D, VatThe3D } from "@/lib/chien-dich/types";

export interface CanhStage3D {
  mauNen?: string;
  vatThe: VatThe3D;
}

interface LandingStage3DProps {
  cacCanh: CanhStage3D[];
}

interface BoCucVungRender {
  cheDo: CheDoVung3D;
  vw: number;
  vh: number;
  vuot: number;
  hienKhung: boolean;
  vung: VungVatThe;
  stageIdx: number;
  items: Array<{
    item: VatPham3D;
    dat: KetQuaDatVung;
  }>;
}

declare global {
  interface Window {
    __viveBo?: {
      V: VungVatThe;
      cheDo: CheDoVung3D;
      [key: string]:
        | VungVatThe
        | CheDoVung3D
        | { hop: [number, number, number, number]; an: number }
        | undefined;
    };
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

function khoaTenKhoi(id: string): string {
  if (id === "ampoule" || id === "A") return "A";
  if (id === "srm" || id === "S") return "S";
  if (id === "kem" || id === "K") return "K";
  return id;
}

export function LandingStage3D({ cacCanh }: LandingStage3DProps) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [renderState, setRenderState] = useState<BoCucVungRender | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const tinhBoCuc = useCallback(() => {
    if (typeof window === "undefined" || cacCanh.length === 0) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cheDo: CheDoVung3D =
      vw < 760 || (vw < 1024 && vh >= vw) ? "doc" : "ngang";

    const headerEl = Array.from(
      document.querySelectorAll<HTMLElement>("header, [role='banner']")
    ).find(
      (el) =>
        getComputedStyle(el).display !== "none" &&
        el.getBoundingClientRect().height > 0
    );
    const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
    const tabletRail = document.querySelector<HTMLElement>(
      'nav[aria-label="Điều hướng máy tính bảng"]'
    );
    const railRight =
      tabletRail && getComputedStyle(tabletRail).display !== "none"
        ? tabletRail.getBoundingClientRect().right
        : 0;
    const bottomNav = Array.from(document.querySelectorAll<HTMLElement>("nav")).find(
      (n) => {
        const r = n.getBoundingClientRect();
        return getComputedStyle(n).display !== "none" && r.top > vh * 0.5 && r.height > 20;
      }
    );
    const tabTop = bottomNav ? bottomNav.getBoundingClientRect().top : vh;
    const xMin = Math.max(16, railRight + 16);

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[data-k]")
    );

    const tinhVungChoKhoi = (k: number): VungVatThe => {
      const sec = sections[k];
      if (!sec) {
        return {
          x0: xMin,
          x1: vw - 16,
          y0: Math.max(16, headerBottom + 8),
          y1: Math.max(120, vh * 0.44),
        };
      }
      const tren = Math.max(16, headerBottom + 8);
      if (cheDo === "doc") {
        const padTop =
          parseFloat(getComputedStyle(sec).paddingTop) ||
          (vw >= 760 ? vh * 0.56 : vh * 0.46);
        const yMax = Math.min(tabTop - 8, Math.max(tren + 80, padTop - 8));
        return { x0: xMin, x1: vw - 16, y0: tren, y1: yMax };
      }

      const cot = sec.querySelector<HTMLElement>(".cot");
      const r = cot?.getBoundingClientRect();
      const duoi = vh - 56;
      if (sec.classList.contains("phai") && r) {
        return {
          x0: xMin,
          x1: Math.max(xMin + 80, r.left - 32),
          y0: tren,
          y1: Math.max(tren + 80, duoi),
        };
      }
      if (r) {
        return {
          x0: Math.max(xMin, r.right + 32),
          x1: vw - 16,
          y0: tren,
          y1: Math.max(tren + 80, duoi),
        };
      }
      return {
        x0: vw * 0.5,
        x1: vw - 16,
        y0: tren,
        y1: Math.max(tren + 80, duoi),
      };
    };

    // Theo dõi tiến trình cuộn giống design/landing-3d/index.html
    const giua = vh * 0.5;
    let k = 0;
    let f = 0;
    for (let i = 0; i < sections.length; i++) {
      const r = sections[i].getBoundingClientRect();
      if (r.top <= giua) {
        k = i;
        f = clamp((giua - r.top) / Math.max(1, r.height), 0, 1);
      }
    }

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextIdx = Math.min(k + 1, Math.max(0, cacCanh.length - 1));
    const rawT = clamp((f - 0.52) / 0.48, 0, 1);
    const t = mqReduce ? (rawT >= 0.5 ? 1 : 0) : smoothstep(rawT);

    const kClamp = Math.min(k, cacCanh.length - 1);
    const VA = tinhVungChoKhoi(kClamp);
    const VB = tinhVungChoKhoi(nextIdx);
    const VActive = t > 0.5 ? VB : VA;

    const listA = layVatTheTheoCheDo(cacCanh[kClamp].vatThe, cheDo);
    const listB = layVatTheTheoCheDo(cacCanh[nextIdx].vatThe, cheDo);

    const day3 =
      sections[sections.length - 1]?.getBoundingClientRect().bottom ?? vh * 3;
    const vuot = Math.max(0, vh - day3);
    const hienKhung = new URLSearchParams(window.location.search).has("khung");

    const renderedItems: BoCucVungRender["items"] = [];
    const ids: string[] = [];
    for (const obj of listA) if (!ids.includes(obj.id)) ids.push(obj.id);
    for (const obj of listB) if (!ids.includes(obj.id)) ids.push(obj.id);

    const viveBoObj: NonNullable<Window["__viveBo"]> = {
      V: { ...VActive },
      cheDo,
    };

    for (const id of ids) {
      const a = listA.find((x) => x.id === id) ?? listB.find((x) => x.id === id);
      const b = listB.find((x) => x.id === id) ?? a;
      if (!a || !b) continue;

      const datA = datVaoVung(a, VA, cheDo);
      const datB = datVaoVung(b, VB, cheDo);

      const cx = lerp(datA.cx, datB.cx, t);
      const cy = lerp(datA.cy, datB.cy, t);
      const bodyW = lerp(datA.bodyW, datB.bodyW, t);
      const bodyH = lerp(datA.bodyH, datB.bodyH, t);
      const boxW = lerp(datA.boxW, datB.boxW, t);
      const boxH = lerp(datA.boxH, datB.boxH, t);
      const totalH = lerp(datA.totalH, datB.totalH, t);
      const capImgW = lerp(datA.capImgW, datB.capImgW, t);
      const capImgH = lerp(datA.capImgH, datB.capImgH, t);
      const pipetteGapPx = lerp(datA.pipetteGapPx, datB.pipetteGapPx, t);
      const xoayDeg = lerp(datA.xoayDeg, datB.xoayDeg, t);
      const mo = lerp(datA.mo, datB.mo, t);
      const an = lerp(datA.an, datB.an, t);

      const hop: [number, number, number, number] = [
        cx - boxW / 2,
        cy - boxH / 2 - vuot,
        cx + boxW / 2,
        cy + boxH / 2 - vuot,
      ];

      const key = khoaTenKhoi(id);
      viveBoObj[key] = { hop, an };

      renderedItems.push({
        item: a,
        dat: {
          cx,
          cy,
          bodyW,
          bodyH,
          boxW,
          boxH,
          totalH,
          capImgW,
          capImgH,
          pipetteGapPx,
          xoayDeg,
          mo,
          an,
          hop,
        },
      });
    }

    window.__viveBo = viveBoObj;

    setRenderState({
      cheDo,
      vw,
      vh,
      vuot,
      hienKhung,
      vung: VActive,
      stageIdx: t > 0.5 ? nextIdx : kClamp,
      items: renderedItems,
    });
  }, [cacCanh]);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    tinhBoCuc();
  }, [tinhBoCuc]);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqTouch = window.matchMedia("(hover: none)");

    const syncPrefs = () => {
      setReducedMotion(mqMotion.matches);
      setIsTouch(mqTouch.matches);
      tinhBoCuc();
    };
    syncPrefs();
    mqMotion.addEventListener("change", syncPrefs);
    mqTouch.addEventListener("change", syncPrefs);

    let rafId = 0;
    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          tinhBoCuc();
        });
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        tinhBoCuc();
      }, 100);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    return () => {
      mqMotion.removeEventListener("change", syncPrefs);
      mqTouch.removeEventListener("change", syncPrefs);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [tinhBoCuc]);

  useEffect(() => {
    if (reducedMotion || isTouch) return;
    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    }
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reducedMotion, isTouch]);

  const cheDo = renderState?.cheDo ?? "doc";
  const stageIdx = renderState?.stageIdx ?? 0;
  const vuot = renderState?.vuot ?? 0;
  const vh = renderState?.vh ?? 800;
  const vw = renderState?.vw ?? 390;
  const hiddenPastShelf = vuot > vh * 1.2;

  const tiltX = reducedMotion || isTouch ? 0 : -mousePos.y * 5;
  const tiltY = reducedMotion || isTouch ? 0 : mousePos.x * 8;

  return (
    <>
      <div
        id="canh"
        ref={stageRef}
        aria-hidden="true"
        data-stage={stageIdx}
        data-che-do={cheDo}
        data-viewport={`${vw}x${vh}`}
        data-hydrated={mounted ? "true" : "false"}
        data-reduced-motion={reducedMotion ? "true" : "false"}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: 1,
          pointerEvents: "none",
          overflow: "hidden",
          visibility: hiddenPastShelf ? "hidden" : "visible",
          opacity: mounted ? 1 : 0,
          perspective: !reducedMotion && !isTouch ? "1200px" : undefined,
          transition: "none",
        }}
      >
        {/* Quầng sáng nền chỉ hiện trên màn vừa/lớn để tối ưu điện thoại */}
        <div
          className="hidden md:block absolute right-[-10%] top-[-10%] w-[760px] h-[760px] rounded-full blur-3xl opacity-60"
          style={{
            background:
              stageIdx === 1
                ? "radial-gradient(circle, rgba(207,227,213,0.85) 0%, rgba(234,243,237,0.4) 50%, rgba(255,255,255,0) 75%)"
                : "radial-gradient(circle, rgba(232,210,204,0.85) 0%, rgba(247,238,235,0.4) 50%, rgba(255,255,255,0) 75%)",
          }}
        />

        <style>{`
          @keyframes vq-float-touch {
            0%, 100% { transform: translate3d(0, -3px, 0); }
            50% { transform: translate3d(0, 3px, 0); }
          }
        `}</style>

        <div
          className="relative w-full h-full"
          style={{
            transform: `${
              !reducedMotion && !isTouch
                ? `rotateX(${tiltX}deg) rotateY(${tiltY}deg) `
                : ""
            }translateY(${(-vuot).toFixed(1)}px)`,
            transformStyle: !reducedMotion && !isTouch ? "preserve-3d" : undefined,
          }}
        >
          {renderState?.items.map(({ item, dat }) => {
            const opacity = clamp(1 - dat.an, 0, 1);
            const showDroplet = cheDo === "ngang" && dat.mo > 0.9;

            return (
              <div
                key={item.id}
                data-object-id={item.id}
                data-visible={dat.an <= 0.5 ? "true" : "false"}
                className="absolute left-0 top-0"
                style={{
                  width: `${dat.bodyW.toFixed(1)}px`,
                  height: `${dat.totalH.toFixed(1)}px`,
                  opacity,
                  transition: "none",
                  transform: `translate(${(dat.cx - dat.bodyW / 2).toFixed(1)}px, ${(
                    dat.cy -
                    dat.totalH / 2
                  ).toFixed(1)}px) rotate(${dat.xoayDeg.toFixed(1)}deg)`,
                  filter:
                    cheDo === "doc"
                      ? "drop-shadow(0 12px 16px rgba(43,43,42,0.14))"
                      : "drop-shadow(0 24px 30px rgba(43,43,42,0.18))",
                }}
              >
                <div
                  className="w-full h-full flex flex-col items-center justify-end"
                  style={{
                    animation:
                      isTouch && !reducedMotion
                        ? "vq-float-touch 4.2s ease-in-out infinite"
                        : undefined,
                  }}
                >
                  {item.nap_anh ? (
                    <>
                      <div
                        className="flex flex-col items-center shrink-0"
                        style={{
                          transform: `translateY(${(-dat.mo * 2).toFixed(
                            1
                          )}px) rotate(${(-dat.mo * (cheDo === "doc" ? 3 : 6)).toFixed(
                            1
                          )}deg)`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.nap_anh}
                          srcSet={`${item.nap_anh} 600w, ${item.nap_anh} 1200w`}
                          sizes="(max-width: 759px) 90px, 140px"
                          alt=""
                          data-part="nap"
                          style={{
                            width: `${dat.capImgW.toFixed(1)}px`,
                            height: `${dat.capImgH.toFixed(1)}px`,
                          }}
                          className="object-contain select-none z-10"
                          loading="eager"
                        />
                        {dat.pipetteGapPx > 1 && (
                          <div
                            className="w-[6px] md:w-[8px] rounded-b-full bg-linear-to-b from-blue-200/80 to-blue-300/40 border border-white/60 overflow-hidden"
                            style={{
                              height: `${dat.pipetteGapPx.toFixed(1)}px`,
                              opacity: clamp(dat.mo * 1.15, 0, 0.92),
                            }}
                          >
                            {showDroplet && (
                              <div className="w-3 h-3 rounded-full bg-blue-400/90 shadow-xs mx-auto mt-auto mb-1" />
                            )}
                          </div>
                        )}
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.anh}
                        srcSet={`${item.anh} 600w, ${item.anh} 1200w`}
                        sizes="(max-width: 759px) 180px, 320px"
                        alt={item.ten || item.id}
                        data-part="than"
                        style={{
                          width: `${dat.bodyW.toFixed(1)}px`,
                          height: `${dat.bodyH.toFixed(1)}px`,
                        }}
                        className="object-contain select-none shrink-0"
                        loading="eager"
                      />
                    </>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.anh}
                      srcSet={`${item.anh} 600w, ${item.anh} 1200w`}
                      sizes="(max-width: 759px) 180px, 320px"
                      alt={item.ten || item.id}
                      data-part="than"
                      style={{
                        width: `${dat.bodyW.toFixed(1)}px`,
                        height: `${dat.bodyH.toFixed(1)}px`,
                      }}
                      className="object-contain select-none shrink-0"
                      loading="eager"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ?khung=1: hiện khung vùng vật thể để đối chiếu giống bản mẫu */}
      {renderState?.hienKhung && vuot === 0 && (
        <div
          id="khung-vung"
          aria-hidden="true"
          style={{
            position: "fixed",
            zIndex: 4,
            pointerEvents: "none",
            outline: "2px dashed #D9534F",
            left: `${renderState.vung.x0}px`,
            top: `${renderState.vung.y0}px`,
            width: `${renderState.vung.x1 - renderState.vung.x0}px`,
            height: `${renderState.vung.y1 - renderState.vung.y0}px`,
          }}
        />
      )}
    </>
  );
}
