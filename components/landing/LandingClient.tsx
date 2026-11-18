"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChienDich } from "@/lib/chien-dich/types";
import { LandingHeader } from "./LandingHeader";
import { LandingStage3D, type CanhStage3D } from "./LandingStage3D";
import { KhoiHero } from "./khoi/KhoiHero";
import { KhoiTieuDiem } from "./khoi/KhoiTieuDiem";
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
  hienHeaderRieng?: boolean;
}

export function LandingClient({
  chienDich,
  hienHeaderRieng = true,
}: LandingClientProps) {
  const [stageProgress, setStageProgress] = useState(0);
  const [stageFade, setStageFade] = useState(1);
  const [showStageDashes, setShowStageDashes] = useState(true);

  const heroRef = useRef<HTMLDivElement>(null);
  const tieuDiemRef = useRef<HTMLDivElement>(null);
  const raMatRef = useRef<HTMLDivElement>(null);
  const phanDuoiRef = useRef<HTMLDivElement>(null);

  const heroBlock = chienDich.khoi.find((k) => k.loai === "hero");
  const tieuDiemBlock = chienDich.khoi.find((k) => k.loai === "tieu-diem");
  const marqueeBlock = chienDich.khoi.find((k) => k.loai === "bang-chu");
  const raMatBlock = chienDich.khoi.find((k) => k.loai === "ra-mat");
  const otherBlocks = chienDich.khoi.filter(
    (k) =>
      k.loai !== "hero" &&
      k.loai !== "tieu-diem" &&
      k.loai !== "bang-chu" &&
      k.loai !== "ra-mat"
  );

  // Dựng danh sách cảnh 3D từ YAML (mỗi cảnh có cấu hình 3 mốc dien_thoai / may_tinh_bang / may_tinh)
  const cacCanh: CanhStage3D[] = useMemo(() => {
    const result: CanhStage3D[] = [];
    if (heroBlock?.vat_the) {
      result.push({ mauNen: chienDich.mau.nen, vatThe: heroBlock.vat_the });
    }
    if (tieuDiemBlock?.vat_the) {
      result.push({ mauNen: chienDich.mau.nen, vatThe: tieuDiemBlock.vat_the });
    }
    if (raMatBlock?.vat_the) {
      result.push({ mauNen: chienDich.mau.nen, vatThe: raMatBlock.vat_the });
    }
    return result;
  }, [chienDich.mau.nen, heroBlock, tieuDiemBlock, raMatBlock]);

  useEffect(() => {
    let rafId = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const updateScroll = () => {
      rafId = 0;
      const scrollY = window.scrollY;
      const vh = window.innerHeight || 800;

      // Xác định mốc cuộn thực tế của từng khối trong 3 cảnh đầu
      const landmarks: number[] = [0];
      if (tieuDiemBlock && tieuDiemRef.current) {
        const top = tieuDiemRef.current.offsetTop;
        landmarks.push(Math.max(vh * 0.4, top));
      }
      if (raMatBlock && raMatRef.current) {
        const top = raMatRef.current.offsetTop;
        const prev = landmarks[landmarks.length - 1];
        landmarks.push(Math.max(prev + vh * 0.4, top));
      }

      let continuousStage = 0;
      if (landmarks.length >= 2) {
        let seg = landmarks.length - 2;
        for (let i = 0; i < landmarks.length - 1; i++) {
          if (scrollY <= landmarks[i + 1]) {
            seg = i;
            break;
          }
        }
        const a = landmarks[seg];
        const b = landmarks[seg + 1];
        const frac = b > a ? Math.min(1, Math.max(0, (scrollY - a) / (b - a))) : 0;
        continuousStage = seg + frac;
      }

      setStageProgress(continuousStage);

      // Giữ stage 3D hiện đầy đủ ở 3 khối đầu, chỉ mờ dần khi cuộn tới #phan-duoi
      const phanDuoiTop = phanDuoiRef.current?.offsetTop;
      const fadeStart =
        phanDuoiTop !== undefined
          ? Math.max(landmarks[landmarks.length - 1] + vh * 0.25, phanDuoiTop - vh * 0.7)
          : landmarks[landmarks.length - 1] + vh * 0.35;

      if (scrollY > fadeStart) {
        const fade = Math.max(0, 1 - (scrollY - fadeStart) / (vh * 0.35));
        setStageFade(fade);
        setShowStageDashes(fade > 0.2);
      } else {
        setStageFade(1);
        setShowStageDashes(true);
      }
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    const handleResizeDebounced = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateScroll, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResizeDebounced, { passive: true });
    window.addEventListener("orientationchange", handleResizeDebounced, {
      passive: true,
    });
    updateScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResizeDebounced);
      window.removeEventListener("orientationchange", handleResizeDebounced);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [tieuDiemBlock, raMatBlock]);

  const currentStage = Math.round(stageProgress);

  return (
    <div
      className="relative min-h-screen text-den overflow-x-hidden font-sans"
      style={{
        backgroundColor: chienDich.mau.nen || "#F7EEEB",
      }}
    >
      {hienHeaderRieng && <LandingHeader />}

      {/* Sân khấu 3D kẹp hộp bao trong khung nhìn an toàn, đọc từ YAML */}
      <LandingStage3D
        cacCanh={cacCanh}
        stageProgress={stageProgress}
        stageFade={stageFade}
      />

      {/* Cảnh 0: Hero */}
      <div ref={heroRef} className="relative z-10">
        {heroBlock && <KhoiHero khoi={heroBlock} />}
      </div>

      {/* Cảnh 1: Tiêu điểm sản phẩm */}
      {tieuDiemBlock && (
        <div ref={tieuDiemRef} className="relative z-10">
          <KhoiTieuDiem khoi={tieuDiemBlock} />
        </div>
      )}

      {/* Cảnh 2: Kệ ra mắt */}
      {raMatBlock && (
        <div ref={raMatRef} className="relative z-10">
          <KhoiRaMat khoi={raMatBlock} />
        </div>
      )}

      {/* Marquee Banner */}
      {marqueeBlock && <KhoiBangChu khoi={marqueeBlock} />}

      {/* Phần dưới: thẻ trắng bo tròn */}
      <div
        ref={phanDuoiRef}
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

      {/* Chỉ báo cảnh ở góc dưới trái trên màn vừa/lớn */}
      {showStageDashes && cacCanh.length > 1 && (
        <div
          aria-hidden="true"
          className="fixed left-5 sm:left-8 bottom-6 z-30 hidden sm:flex items-center gap-2 pointer-events-none transition-opacity duration-300"
        >
          {cacCanh.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                currentStage === idx ? "w-7 bg-den" : "w-2.5 bg-den/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
