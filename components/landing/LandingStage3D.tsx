"use client";

import { useEffect, useState, useRef } from "react";

interface LandingStage3DProps {
  currentStage: number; // 0, 1, 2
  scrollProgress: number; // 0..1
}

export function LandingStage3D({ currentStage }: LandingStage3DProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    function handlePointerMove(e: PointerEvent) {
      // Normalised coordinates -1 to +1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reducedMotion]);

  // Tilt amounts
  const tiltX = reducedMotion ? 0 : -mousePos.y * 8;
  const tiltY = reducedMotion ? 0 : mousePos.x * 12;

  // Dropper lift based on stage (stage 1 has cap lifted)
  const isCapLifted = currentStage === 1;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-500"
      style={{
        perspective: "1200px",
      }}
    >
      {/* Background radial aura */}
      <div
        className="absolute right-[-10%] top-[-10%] w-[550px] md:w-[800px] h-[550px] md:h-[800px] rounded-full blur-3xl opacity-60 transition-colors duration-700"
        style={{
          background:
            currentStage === 0
              ? "radial-gradient(circle, rgba(232,210,204,0.85) 0%, rgba(247,238,235,0.4) 50%, rgba(255,255,255,0) 75%)"
              : currentStage === 1
              ? "radial-gradient(circle, rgba(207,227,213,0.85) 0%, rgba(234,243,237,0.4) 50%, rgba(255,255,255,0) 75%)"
              : "radial-gradient(circle, rgba(232,210,204,0.8) 0%, rgba(247,238,235,0.3) 50%, rgba(255,255,255,0) 75%)",
        }}
      />
      <div
        className="absolute left-[20%] bottom-[5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(207,227,213,0.7) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* 3D Products Scene */}
      <div
        className="relative w-full h-full max-w-[1360px] mx-auto flex items-center justify-center transition-transform duration-700 ease-out"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Soft shadow base */}
        <div
          className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[340px] md:w-[520px] h-[60px] rounded-[50%] blur-xl opacity-25 bg-den transition-all duration-700"
          style={{
            transform:
              currentStage === 1
                ? "translate(-50%, 40px) scale(0.9)"
                : currentStage === 2
                ? "translate(-50%, 80px) scale(1.1)"
                : "translate(-50%, 0) scale(1)",
          }}
        />

        {/* Product 1: Sữa rửa mặt (Left tube) */}
        <div
          className="absolute transition-all duration-700 ease-out"
          style={{
            transform:
              currentStage === 0
                ? "translate3d(-180px, -20px, 40px) rotate(-14deg) scale(0.9)"
                : currentStage === 1
                ? "translate3d(-340px, -60px, -40px) rotate(-28deg) scale(0.75)"
                : "translate3d(-150px, 40px, 20px) rotate(-6deg) scale(0.85)",
            filter: "drop-shadow(0 20px 25px rgba(43,43,42,0.18))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chien-dich/lopoe-better-balance/srm.webp"
            alt="LOPOE Cleansing Foam"
            className="w-[90px] md:w-[135px] h-auto object-contain select-none"
            loading="eager"
          />
        </div>

        {/* Product 2: Ampoule (Center hero) */}
        <div
          className="absolute transition-all duration-700 ease-out flex flex-col items-center"
          style={{
            transform:
              currentStage === 0
                ? "translate3d(10px, -40px, 120px) rotate(4deg) scale(1.05)"
                : currentStage === 1
                ? "translate3d(-60px, -80px, 160px) rotate(-4deg) scale(1.2)"
                : "translate3d(0px, 30px, 80px) rotate(0deg) scale(0.95)",
            filter: "drop-shadow(0 28px 35px rgba(43,43,42,0.22))",
          }}
        >
          {/* Cap / Dropper lifting mechanism */}
          <div
            className="relative transition-transform duration-700 ease-out flex flex-col items-center"
            style={{
              transform: isCapLifted
                ? "translateY(-45px) rotate(-6deg)"
                : "translateY(0) rotate(0deg)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chien-dich/lopoe-better-balance/ampoule-nap.webp"
              alt=""
              className="w-[45px] md:w-[68px] h-auto object-contain select-none z-10"
              loading="eager"
            />
            {/* Exposed glass tube when lifted */}
            <div
              className={`w-[6px] md:w-[9px] h-[50px] md:h-[75px] -mt-1 rounded-b-full bg-linear-to-b from-blue-200/80 to-blue-300/40 border border-white/60 transition-opacity duration-500 ${
                isCapLifted ? "opacity-90" : "opacity-0"
              }`}
            >
              {/* Droplet */}
              <div
                className={`w-3 md:w-3.5 h-3 md:h-3.5 rounded-full bg-blue-400/90 shadow-xs mx-auto mt-[40px] md:mt-[60px] animate-bounce transition-opacity duration-500 ${
                  isCapLifted ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>

          {/* Bottle body */}
          <div className="-mt-1 md:-mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chien-dich/lopoe-better-balance/ampoule-than.webp"
              alt="LOPOE Better Balance Ampoule"
              className="w-[110px] md:w-[165px] h-auto object-contain select-none"
              loading="eager"
            />
          </div>
        </div>

        {/* Product 3: Kem dưỡng (Right tube) */}
        <div
          className="absolute transition-all duration-700 ease-out"
          style={{
            transform:
              currentStage === 0
                ? "translate3d(190px, 30px, 50px) rotate(12deg) scale(0.92)"
                : currentStage === 1
                ? "translate3d(320px, 80px, -30px) rotate(26deg) scale(0.78)"
                : "translate3d(150px, 50px, 30px) rotate(6deg) scale(0.85)",
            filter: "drop-shadow(0 20px 25px rgba(43,43,42,0.18))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chien-dich/lopoe-better-balance/kem.webp"
            alt="LOPOE Moisture Cream"
            className="w-[125px] md:w-[190px] h-auto object-contain select-none"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
