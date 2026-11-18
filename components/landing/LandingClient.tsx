"use client";

import { useEffect, useState, useRef } from "react";
import type { ChienDich } from "@/lib/chien-dich/types";
import { LandingHeader } from "./LandingHeader";
import { LandingStage3D } from "./LandingStage3D";
import { KhoiHero } from "./khoi/KhoiHero";
import { KhoiBangChu } from "./khoi/KhoiBangChu";
import { KhoiRaMat } from "./khoi/KhoiRaMat";
import { KhoiChuongTrinh } from "./khoi/KhoiChuongTrinh";
import { KhoiDemNguoc } from "./khoi/KhoiDemNguoc";
import { KhoiDoiTac } from "./khoi/KhoiDoiTac";
import { KhoiVideo } from "./khoi/KhoiVideo";
import { KhoiBooth } from "./khoi/KhoiBooth";
import { LandingFooter } from "./LandingFooter";

interface LandingClientProps {
  chienDich: ChienDich;
}

export function LandingClient({ chienDich }: LandingClientProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showStageDashes, setShowStageDashes] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Track stage 0, 1, 2
      if (scrollY < vh * 0.7) {
        setCurrentStage(0);
        setShowStageDashes(true);
      } else if (scrollY < vh * 1.5) {
        setCurrentStage(1);
        setShowStageDashes(true);
      } else if (scrollY < vh * 2.3) {
        setCurrentStage(2);
        setShowStageDashes(true);
      } else {
        setShowStageDashes(false);
      }

      const totalDoc = document.documentElement.scrollHeight - vh;
      if (totalDoc > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollY / totalDoc)));
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Separate blocks: the first 3 sections (Hero, Product detail focus, Ra-mat shelf)
  // vs. the lower section (phan-duoi: Chuong-trinh, Doi-tac, Booth)
  const heroBlock = chienDich.khoi.find((k) => k.loai === "hero");
  const marqueeBlock = chienDich.khoi.find((k) => k.loai === "bang-chu");
  const raMatBlock = chienDich.khoi.find((k) => k.loai === "ra-mat");
  const otherBlocks = chienDich.khoi.filter(
    (k) => k.loai !== "hero" && k.loai !== "bang-chu" && k.loai !== "ra-mat"
  );

  return (
    <div
      className="relative min-h-screen text-den overflow-x-hidden font-sans"
      style={{
        backgroundColor: chienDich.mau.nen || "#F7EEEB",
      }}
    >
      <LandingHeader />

      {/* 3D Visual Stage across the first 3 sections */}
      <LandingStage3D
        currentStage={currentStage}
        scrollProgress={scrollProgress}
      />

      {/* Section 0: Hero block */}
      <div ref={heroRef} className="relative z-10">
        {heroBlock && <KhoiHero khoi={heroBlock} />}
      </div>

      {/* Section 1: Detailed Product Spotlight (Ampoule 50ml focus) */}
      <div
        ref={section1Ref}
        className="relative z-10 min-h-[80vh] md:min-h-screen flex items-center justify-end px-5 sm:px-8 md:px-16 py-16"
      >
        <div className="w-full max-w-[500px] flex flex-col gap-4 text-left">
          <span className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[12px] md:text-[13px] font-bold tracking-[1.5px] text-den shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#8FBF9F]" />
            AMPOULE · 50ML
          </span>
          <h2 className="m-0 font-bold text-[44px] sm:text-[60px] md:text-[80px] leading-[0.95] tracking-[-0.04em] text-den">
            Better Balance
            <br />
            <span className="vet-hong">Ampoule</span>
          </h2>
          <p className="m-0 text-[16px] sm:text-[18px] leading-[1.6] text-xam">
            Chai ampoule trong bộ ba Better Balance. Cấp ẩm sâu, phục hồi hàng rào bảo vệ da với kết cấu mỏng nhẹ, thấm nhanh.
          </p>
          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-[32px] sm:text-[36px] font-bold text-den">
              314.000đ
            </span>
            <span className="text-[16px] text-xam line-through">
              419.000đ
            </span>
            <span className="text-[14px] text-xam">khi mua kèm</span>
          </div>
        </div>
      </div>

      {/* Section 2: Launch shelf (Ra-mat) */}
      <div ref={section2Ref} className="relative z-10">
        {raMatBlock && <KhoiRaMat khoi={raMatBlock} />}
      </div>

      {/* Marquee Banner */}
      {marqueeBlock && <KhoiBangChu khoi={marqueeBlock} />}

      {/* Lower section: rounded white card overlaying the background */}
      <div
        id="phan-duoi"
        className="relative z-20 bg-white rounded-t-[36px] md:rounded-t-[48px] shadow-[0_-20px_60px_rgba(43,43,42,0.06)] overflow-hidden"
      >
        {otherBlocks.map((khoi, index) => {
          switch (khoi.loai) {
            case "chuong-trinh":
              return <KhoiChuongTrinh key={index} khoi={khoi} />;
            case "dem-nguoc":
              return <KhoiDemNguoc key={index} khoi={khoi} />;
            case "doi-tac":
              return <KhoiDoiTac key={index} khoi={khoi} />;
            case "video":
              return <KhoiVideo key={index} khoi={khoi} />;
            case "booth":
              return <KhoiBooth key={index} khoi={khoi} />;
            default:
              return null;
          }
        })}

        <LandingFooter />
      </div>

      {/* Floating Section Indicator Dashes (bottom-left) */}
      {showStageDashes && (
        <div
          aria-hidden="true"
          className="fixed left-5 sm:left-8 bottom-6 z-30 hidden sm:flex items-center gap-2 pointer-events-none transition-opacity duration-300"
        >
          <span
            className={`h-1 rounded-full transition-all duration-300 ${
              currentStage === 0 ? "w-7 bg-den" : "w-2.5 bg-den/20"
            }`}
          />
          <span
            className={`h-1 rounded-full transition-all duration-300 ${
              currentStage === 1 ? "w-7 bg-den" : "w-2.5 bg-den/20"
            }`}
          />
          <span
            className={`h-1 rounded-full transition-all duration-300 ${
              currentStage === 2 ? "w-7 bg-den" : "w-2.5 bg-den/20"
            }`}
          />
        </div>
      )}
    </div>
  );
}
