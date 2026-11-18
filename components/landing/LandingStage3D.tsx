"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VatThe3D } from "@/lib/chien-dich/types";

export interface CanhStage3D {
  mauNen?: string;
  vatThe: VatThe3D[];
}

interface LandingStage3DProps {
  cacCanh: CanhStage3D[];
  stageProgress: number; // continuous float 0..(cacCanh.length - 1)
  stageFade?: number; // 0..1 overall opacity multiplier when scrolled to lower card sections
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

export function LandingStage3D({
  cacCanh,
  stageProgress,
  stageFade = 1,
}: LandingStage3DProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onMqChange);

    const updateSize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize, { passive: true });

    return () => {
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    function handlePointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reducedMotion]);

  // Danh sách các object id duy nhất xuất hiện trong tất cả các cảnh từ YAML
  const objectIds = useMemo(() => {
    const ids: string[] = [];
    for (const canh of cacCanh) {
      for (const obj of canh.vatThe) {
        if (!ids.includes(obj.id)) ids.push(obj.id);
      }
    }
    return ids;
  }, [cacCanh]);

  if (cacCanh.length === 0 || objectIds.length === 0) {
    return null;
  }

  const maxStage = Math.max(0, cacCanh.length - 1);
  const clampedStage = clamp(stageProgress, 0, maxStage);
  const idxA = Math.floor(clampedStage);
  const idxB = Math.min(maxStage, idxA + 1);
  const localT = reducedMotion ? (clampedStage - idxA >= 0.5 ? 1 : 0) : smoothstep(clampedStage - idxA);

  const isMobile = viewport.width < 768;
  const halfW = isMobile
    ? clamp(viewport.width * 0.24, 72, 120)
    : clamp(viewport.width * 0.34, 240, 440);
  const halfH = isMobile
    ? clamp(viewport.height * 0.16, 70, 120)
    : clamp(viewport.height * 0.22, 130, 210);
  const mobileScaleFactor = isMobile ? 0.62 : 1;
  // Trên mobile (< 768px), đẩy vật thể 3D lên nửa trên màn hình để nhường nửa dưới cho chữ
  const stageCenterOffsetY = isMobile ? -viewport.height * 0.20 : 0;

  // Trên mobile khi đứng ở cảnh 0, căn nhóm sản phẩm giữa màn thay vì lệch phải
  const canhAOffsetMean =
    isMobile && idxA === 0 && cacCanh[0].vatThe.length > 0
      ? cacCanh[0].vatThe.reduce((s, o) => s + o.x, 0) / cacCanh[0].vatThe.length
      : 0;
  const canhBOffsetMean =
    isMobile && idxB === 0 && cacCanh[0].vatThe.length > 0
      ? cacCanh[0].vatThe.reduce((s, o) => s + o.x, 0) / cacCanh[0].vatThe.length
      : 0;

  const tiltX = reducedMotion || isMobile ? 0 : -mousePos.y * 6;
  const tiltY = reducedMotion || isMobile ? 0 : mousePos.x * 10;
  const nearestIdx = Math.round(clampedStage);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-stage={nearestIdx}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={{
        perspective: "1200px",
        opacity: clamp(stageFade, 0, 1),
      }}
    >
      {/* Background radial aura thay đổi mượt theo cảnh */}
      <div
        className="absolute right-[-10%] top-[-10%] w-[480px] md:w-[800px] h-[480px] md:h-[800px] rounded-full blur-3xl opacity-60"
        style={{
          background:
            nearestIdx === 1
              ? "radial-gradient(circle, rgba(207,227,213,0.85) 0%, rgba(234,243,237,0.4) 50%, rgba(255,255,255,0) 75%)"
              : "radial-gradient(circle, rgba(232,210,204,0.85) 0%, rgba(247,238,235,0.4) 50%, rgba(255,255,255,0) 75%)",
        }}
      />
      <div
        className="absolute left-[20%] bottom-[5%] w-[360px] md:w-[600px] h-[360px] md:h-[600px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(207,227,213,0.7) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* 3D Products Scene */}
      <div
        className="relative w-full h-full max-w-[1360px] mx-auto flex items-center justify-center"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {objectIds.map((id) => {
          const objA = cacCanh[idxA]?.vatThe.find((o) => o.id === id);
          const objB = cacCanh[idxB]?.vatThe.find((o) => o.id === id);
          const refObj = objA ?? objB;
          if (!refObj) return null;

          const baseA = objA ?? { ...refObj, scale: 0.4, x: (objB?.x ?? 0) * 1.4 };
          const baseB = objB ?? { ...refObj, scale: 0.4, x: (objA?.x ?? 0) * 1.4 };

          // Trên mobile ở cảnh 1 (tiêu điểm), căn giữa vật thể chính khi hai ống bên đã ẩn
          const ax =
            isMobile && Math.abs(baseA.x) <= 1.0
              ? idxA === 0
                ? baseA.x - canhAOffsetMean
                : 0
              : baseA.x;
          const bx =
            isMobile && Math.abs(baseB.x) <= 1.0
              ? idxB === 0
                ? baseB.x - canhBOffsetMean
                : 0
              : baseB.x;

          const x = lerp(ax, bx, localT);
          const y = lerp(baseA.y, baseB.y, localT);
          const z = lerp(baseA.z ?? 0, baseB.z ?? 0, localT);
          const rx = lerp(baseA.rx ?? 0, baseB.rx ?? 0, localT);
          const ry = lerp(baseA.ry ?? 0, baseB.ry ?? 0, localT);
          const rz = lerp(baseA.rz ?? 0, baseB.rz ?? 0, localT);
          const scale = lerp(baseA.scale, baseB.scale, localT) * mobileScaleFactor;
          const mo = lerp(baseA.mo ?? 0, baseB.mo ?? 0, localT);

          // Ẩn mượt vật thể lệch ra ngoài (|x| > 1.15) để ống không vắt ngang chữ
          const absX = Math.abs(lerp(baseA.x, baseB.x, localT));
          const presence = (objA ? 1 : 0) * (1 - localT) + (objB ? 1 : 0) * localT;
          const offstageAlpha = absX > 0.9 ? clamp(1 - (absX - 0.9) / 0.25, 0, 1) : 1;
          const opacity = clamp(presence * offstageAlpha, 0, 1);

          const pxX = x * halfW;
          const pxY = y * halfH + stageCenterOffsetY;
          const widthDesktop = refObj.rong_px ?? 150;
          const capWidthDesktop = Math.round(widthDesktop * 0.41);

          return (
            <div
              key={id}
              data-object-id={id}
              data-offstage={absX > 1.15 ? "true" : "false"}
              className="absolute flex flex-col items-center will-change-transform"
              style={{
                opacity,
                transform: `translate3d(${pxX.toFixed(1)}px, ${pxY.toFixed(
                  1
                )}px, ${z.toFixed(1)}px) rotateX(${rx.toFixed(
                  1
                )}deg) rotateY(${ry.toFixed(1)}deg) rotate(${rz.toFixed(
                  1
                )}deg) scale(${scale.toFixed(3)})`,
                filter: "drop-shadow(0 24px 30px rgba(43,43,42,0.18))",
              }}
            >
              {refObj.nap_anh ? (
                <>
                  <div
                    className="relative flex flex-col items-center"
                    style={{
                      transform: `translateY(${(-mo * 42).toFixed(1)}px) rotate(${(
                        -mo * 6
                      ).toFixed(1)}deg)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={refObj.nap_anh}
                      alt=""
                      style={{ width: `${capWidthDesktop}px` }}
                      className="h-auto object-contain select-none z-10"
                      loading="eager"
                    />
                    <div
                      className="w-[7px] md:w-[9px] h-[54px] md:h-[70px] -mt-1 rounded-b-full bg-linear-to-b from-blue-200/80 to-blue-300/40 border border-white/60"
                      style={{ opacity: clamp(mo * 1.15, 0, 0.92) }}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-blue-400/90 shadow-xs mx-auto mt-[40px] md:mt-[56px] ${
                          reducedMotion ? "" : "animate-bounce"
                        }`}
                        style={{ opacity: clamp(mo * 1.15, 0, 1) }}
                      />
                    </div>
                  </div>
                  <div className="-mt-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={refObj.anh}
                      alt={refObj.ten || id}
                      style={{ width: `${widthDesktop}px` }}
                      className="h-auto object-contain select-none"
                      loading="eager"
                    />
                  </div>
                </>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={refObj.anh}
                  alt={refObj.ten || id}
                  style={{ width: `${widthDesktop}px` }}
                  className="h-auto object-contain select-none"
                  loading="eager"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
