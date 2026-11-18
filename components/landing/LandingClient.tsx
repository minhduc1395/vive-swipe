"use client";

import { useMemo } from "react";
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

  return (
    <div
      className="relative min-h-screen text-den overflow-x-hidden font-sans"
      style={{
        backgroundColor: chienDich.mau.nen || "#F7EEEB",
      }}
    >
      {/* Quy tắc co giãn vùng 3D & cột chữ đối xứng theo design/landing-3d/index.html */}
      <style>{`
        .vq-k {
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding: 96px clamp(20px, 6vw, 96px);
        }
        .vq-k.trai { justify-content: flex-start; }
        .vq-k.phai { justify-content: flex-end; }
        .vq-k .cot {
          width: min(520px, 46vw);
          max-width: 100%;
        }
        @media (max-width: 759px), (max-width: 1023px) and (orientation: portrait) {
          .vq-k {
            min-height: 100svh;
            align-items: flex-start;
            justify-content: flex-start !important;
            padding: 46svh 20px 64px;
          }
          .vq-k .cot {
            width: 100%;
            max-width: 560px;
          }
        }
        @media (min-width: 760px) and (max-width: 1023px) and (orientation: portrait) {
          .vq-k {
            padding: 56svh 48px 64px;
          }
        }
      `}</style>

      {hienHeaderRieng && <LandingHeader />}

      <LandingStage3D cacCanh={cacCanh} />

      <main id="trang-landing" className="relative z-10">
        {heroBlock && <KhoiHero khoi={heroBlock} />}
        {tieuDiemBlock && <KhoiTieuDiem khoi={tieuDiemBlock} />}
        {raMatBlock && <KhoiRaMat khoi={raMatBlock} />}
      </main>

      {marqueeBlock && <KhoiBangChu khoi={marqueeBlock} />}

      <div
        id="phan-duoi"
        className="relative z-20 bg-white rounded-t-[36px] md:rounded-t-[48px] shadow-[0_-20px_60px_rgba(43,43,42,0.06)] overflow-x-clip"
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
    </div>
  );
}
