"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { layMocVatTheTheoManHinh } from "@/lib/chien-dich/vat-the";
import type {
  MocManHinh3D,
  VatPham3D,
  VatThe3D,
} from "@/lib/chien-dich/types";

export interface CanhStage3D {
  mauNen?: string;
  vatThe: VatThe3D;
}

interface LandingStage3DProps {
  cacCanh: CanhStage3D[];
  stageProgress: number; // continuous float 0..(cacCanh.length - 1)
  stageFade?: number; // 0..1 overall opacity multiplier when scrolled to lower sections
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

function layMocManHinh(width: number): MocManHinh3D {
  if (width < 768) return "dien_thoai";
  if (width < 1024) return "may_tinh_bang";
  return "may_tinh";
}

export function LandingStage3D({
  cacCanh,
  stageProgress,
  stageFade = 1,
}: LandingStage3DProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [viewport, setViewport] = useState({ width: 390, height: 844 });
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    setMounted(true);
  }, []);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqTouch = window.matchMedia("(hover: none)");

    const syncPreferences = () => {
      setReducedMotion(mqMotion.matches);
      setIsTouch(mqTouch.matches);
    };
    syncPreferences();

    mqMotion.addEventListener("change", syncPreferences);
    mqTouch.addEventListener("change", syncPreferences);

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const updateSize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    const handleResizeDebounced = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSize, 100);
    };

    updateSize();
    window.addEventListener("resize", handleResizeDebounced, { passive: true });
    window.addEventListener("orientationchange", handleResizeDebounced, {
      passive: true,
    });

    return () => {
      mqMotion.removeEventListener("change", syncPreferences);
      mqTouch.removeEventListener("change", syncPreferences);
      window.removeEventListener("resize", handleResizeDebounced);
      window.removeEventListener("orientationchange", handleResizeDebounced);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || isTouch) return;

    function handlePointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reducedMotion, isTouch]);

  const moc = layMocManHinh(viewport.width);

  // Giải quyết tọa độ % theo mốc hiện tại cho từng cảnh
  const danhSachCanhTheoMoc = useMemo(() => {
    return cacCanh.map((c) => layMocVatTheTheoManHinh(c.vatThe, moc));
  }, [cacCanh, moc]);

  // Tập các object id duy nhất xuất hiện ở các cảnh
  const objectIds = useMemo(() => {
    const ids: string[] = [];
    for (const m of danhSachCanhTheoMoc) {
      for (const vp of m.vat_pham ?? []) {
        if (!ids.includes(vp.id)) ids.push(vp.id);
      }
    }
    return ids;
  }, [danhSachCanhTheoMoc]);

  if (danhSachCanhTheoMoc.length === 0 || objectIds.length === 0) {
    return null;
  }

  const maxStage = Math.max(0, danhSachCanhTheoMoc.length - 1);
  const clampedStage = clamp(stageProgress, 0, maxStage);
  const idxA = Math.floor(clampedStage);
  const idxB = Math.min(maxStage, idxA + 1);
  const localT = reducedMotion
    ? clampedStage - idxA >= 0.5
      ? 1
      : 0
    : smoothstep(clampedStage - idxA);

  const vw = viewport.width;
  const vh = viewport.height;
  const shortEdge = Math.min(vw, vh);
  const isMobile = vw < 768;
  const isTablet = vw >= 768 && vw < 1024;
  const nearestIdx = Math.round(clampedStage);

  const mocA = danhSachCanhTheoMoc[idxA];
  const mocB = danhSachCanhTheoMoc[idxB];

  const clusterX = lerp(mocA.x, mocB.x, localT);
  const clusterY = lerp(mocA.y, mocB.y, localT);
  const clusterCo = lerp(mocA.co, mocB.co, localT);
  const clusterXoay = lerp(mocA.xoay ?? 0, mocB.xoay ?? 0, localT);
  const clusterMo = lerp(mocA.mo ?? 0, mocB.mo ?? 0, localT);

  // Khung an toàn tránh mép 16px, thanh tab dưới điện thoại, rail trái tablet và tiêu đề khối
  let safeLeft = isTablet ? 120 : 16;
  let safeRight = vw - 16;
  const safeTop = isMobile ? 64 : 80;
  let safeBottom = isMobile || isTablet ? Math.min(vh - 96, vh * 0.43) : vh - 16;

  if (!isMobile && !isTablet) {
    // Máy tính (>= 1024px): mỗi khối có vùng an toàn tách biệt hoàn toàn khỏi cột tiêu đề
    if (nearestIdx === 0) {
      safeLeft = Math.max(vw * 0.52, 540);
    } else if (nearestIdx === 1) {
      safeRight = Math.min(vw * 0.46, vw - 540);
    } else {
      safeLeft = Math.max(vw * 0.52, 540);
      safeBottom = Math.min(vh * 0.40, vh - 16);
    }
  }

  // Dự phòng khoảng trôi nhẹ ±4px trên cảm ứng để luôn nằm trong khung an toàn
  const floatPad = isTouch && !reducedMotion ? 5 : 0;
  const clampedSafeTop = safeTop + floatPad;
  const clampedSafeBottom = Math.max(clampedSafeTop + 60, safeBottom - floatPad);

  const tiltX = reducedMotion || isTouch ? 0 : -mousePos.y * 5;
  const tiltY = reducedMotion || isTouch ? 0 : mousePos.x * 8;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-stage={nearestIdx}
      data-stage-settled={Math.abs(clampedStage - nearestIdx) < 0.12 ? "true" : "false"}
      data-viewport={`${vw}x${vh}`}
      data-moc={moc}
      data-hydrated={mounted ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-touch={isTouch ? "true" : "false"}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={{
        perspective: !reducedMotion && !isTouch ? "1200px" : undefined,
        opacity: mounted ? clamp(stageFade, 0, 1) : 0,
      }}
    >
      {/* Quầng sáng nền chỉ bật từ md trở lên để tối ưu GPU điện thoại */}
      <div
        className="hidden md:block absolute right-[-10%] top-[-10%] w-[760px] h-[760px] rounded-full blur-3xl opacity-60"
        style={{
          background:
            nearestIdx === 1
              ? "radial-gradient(circle, rgba(207,227,213,0.85) 0%, rgba(234,243,237,0.4) 50%, rgba(255,255,255,0) 75%)"
              : "radial-gradient(circle, rgba(232,210,204,0.85) 0%, rgba(247,238,235,0.4) 50%, rgba(255,255,255,0) 75%)",
        }}
      />
      <div
        className="hidden md:block absolute left-[20%] bottom-[5%] w-[560px] h-[560px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(207,227,213,0.7) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      <style>{`
        @keyframes vq-float-touch {
          0%, 100% { transform: translate3d(0, -4px, 0); }
          50% { transform: translate3d(0, 4px, 0); }
        }
      `}</style>

      {/* Khung 3D sản phẩm */}
      <div
        className="relative w-full h-full"
        style={
          !reducedMotion && !isTouch
            ? {
                transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                transformStyle: "preserve-3d",
              }
            : undefined
        }
      >
        {objectIds.map((id) => {
          const itemA: VatPham3D | undefined = mocA.vat_pham?.find((v) => v.id === id);
          const itemB: VatPham3D | undefined = mocB.vat_pham?.find((v) => v.id === id);
          const refItem = itemA ?? itemB;
          if (!refItem) return null;

          const baseA = itemA ?? { ...refItem, an: true };
          const baseB = itemB ?? { ...refItem, an: true };

          // Ẩn mượt khi mục đặt an: true (ví dụ hai ống bên ở cảnh 1 tiêu điểm)
          const visA = baseA.an ? 0 : 1;
          const visB = baseB.an ? 0 : 1;
          const opacity = clamp(lerp(visA, visB, localT), 0, 1);

          const dx = lerp(baseA.dx ?? 0, baseB.dx ?? 0, localT);
          const dy = lerp(baseA.dy ?? 0, baseB.dy ?? 0, localT);
          const tyLe = lerp(baseA.ty_le ?? 1, baseB.ty_le ?? 1, localT);
          const xoay = clusterXoay + lerp(baseA.xoay ?? 0, baseB.xoay ?? 0, localT);
          const mo = clamp(lerp(baseA.mo ?? clusterMo, baseB.mo ?? clusterMo, localT), 0, 1);
          const aspect = refItem.ty_le_khung ?? 2.5; // height / width

          // Kích thước cơ sở tính theo % cạnh ngắn khung nhìn min(vw, vh)
          const rawBodyH = Math.max(40, (clusterCo / 100) * shortEdge * tyLe);
          const rawBodyW = rawBodyH / aspect;

          // Nếu có nắp/bóp rời: chiều cao nắp ~0.38 * bodyW; độ nhấc tối đa 12% chiều cao vật thể
          const capRatio = refItem.nap_anh ? 0.38 / aspect : 0;
          const maxLiftRatio = refItem.nap_anh ? 0.12 : 0;
          const liftFraction = mo * maxLiftRatio;

          const rad = Math.abs((xoay * Math.PI) / 180);
          const rawTotalH = rawBodyH * (1 + capRatio + liftFraction);
          const rawTotalW = rawBodyW;
          const rotW = rawTotalW * Math.cos(rad) + rawTotalH * Math.sin(rad);
          const rotH = rawTotalH * Math.cos(rad) + rawTotalW * Math.sin(rad);

          const availW = Math.max(48, safeRight - safeLeft);
          const availH = Math.max(48, clampedSafeBottom - clampedSafeTop);
          const shrink = Math.min(1, availW / rotW, availH / rotH);

          const bodyH = rawBodyH * shrink;
          const bodyW = rawBodyW * shrink;
          const boxW = rotW * shrink;
          const boxH = rotH * shrink;

          // Tọa độ tâm % khung nhìn (trên điện thoại lệch ngang giữ trong 50% ± 15%)
          const rawPctX = isMobile ? clamp(clusterX + dx, 35, 65) : clusterX + dx;
          const rawPctY = clusterY + dy;

          const rawCx = (rawPctX / 100) * vw;
          const rawCy = (rawPctY / 100) * vh;

          // Kẹp hộp bao (cả thân + nắp) vào vùng an toàn
          const clampedCx = clamp(rawCx, safeLeft + boxW / 2, safeRight - boxW / 2);
          const clampedCy = clamp(
            rawCy,
            clampedSafeTop + boxH / 2,
            clampedSafeBottom - boxH / 2
          );

          const totalItemH = bodyH * (1 + capRatio + liftFraction);
          const capImgW = bodyW * 0.42;
          const capImgH = capImgW * 0.85;
          const pipetteGapPx = bodyH * liftFraction;

          return (
            <div
              key={id}
              data-object-id={id}
              data-visible={opacity > 0.05 ? "true" : "false"}
              className="absolute left-0 top-0"
              style={{
                width: `${bodyW.toFixed(1)}px`,
                height: `${totalItemH.toFixed(1)}px`,
                opacity,
                transition: "none",
                transform: `translate(${(clampedCx - bodyW / 2).toFixed(1)}px, ${(
                  clampedCy -
                  totalItemH / 2
                ).toFixed(1)}px) rotate(${xoay.toFixed(1)}deg)`,
                filter: isMobile
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
                {refItem.nap_anh ? (
                  <>
                    <div
                      className="flex flex-col items-center shrink-0"
                      style={{
                        transform: `translateY(${(-mo * 2).toFixed(1)}px) rotate(${(
                          -mo * 4
                        ).toFixed(1)}deg)`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={refItem.nap_anh}
                        srcSet={`${refItem.nap_anh} 600w, ${refItem.nap_anh} 1200w`}
                        sizes="(max-width: 767px) 90px, 140px"
                        alt=""
                        data-part="nap"
                        style={{
                          width: `${capImgW.toFixed(1)}px`,
                          height: `${capImgH.toFixed(1)}px`,
                        }}
                        className="object-contain select-none z-10"
                        loading="eager"
                      />
                      {pipetteGapPx > 1 && (
                        <div
                          className="w-[6px] md:w-[8px] rounded-b-full bg-linear-to-b from-blue-200/80 to-blue-300/40 border border-white/60 overflow-hidden"
                          style={{
                            height: `${pipetteGapPx.toFixed(1)}px`,
                            opacity: clamp(mo * 1.15, 0, 0.92),
                          }}
                        />
                      )}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={refItem.anh}
                      srcSet={`${refItem.anh} 600w, ${refItem.anh} 1200w`}
                      sizes="(max-width: 767px) 180px, 320px"
                      alt={refItem.ten || id}
                      data-part="than"
                      style={{
                        width: `${bodyW.toFixed(1)}px`,
                        height: `${bodyH.toFixed(1)}px`,
                      }}
                      className="object-contain select-none shrink-0"
                      loading="eager"
                    />
                  </>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={refItem.anh}
                    srcSet={`${refItem.anh} 600w, ${refItem.anh} 1200w`}
                    sizes="(max-width: 767px) 180px, 320px"
                    alt={refItem.ten || id}
                    data-part="than"
                    style={{
                      width: `${bodyW.toFixed(1)}px`,
                      height: `${bodyH.toFixed(1)}px`,
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
  );
}
