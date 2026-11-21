"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { ChienDich } from "@/lib/chien-dich/types";
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
import Link from "next/link";
import { CuonLopoe3D, type VeNut3D } from "@/components/cuon-3d/CuonLopoe3D";
import { lopNut } from "@/components/ui/Nut";
import type { CauHinhLopoe3D } from "@/lib/thu-nghiem/lopoe-3d";

/** Nút khối mở đầu: "Tìm hiểu thêm" ở trang chủ dẫn về /new-arrival, ở đây dẫn xuống phần combo */
const veNutLanding: VeNut3D = (n, i) => {
  const veChinhTrang = n.den === "/new-arrival";
  // Neo combo của trang chủ (#combo-lopoe-…) không có ở đây: dẫn xuống khối "Đủ bộ, đỡ tốn."
  const neoCombo = veChinhTrang || (n.den ?? "").startsWith("#combo-");
  return (
    <Link
      key={n.chu}
      href={neoCombo ? "#ke-ra-mat" : n.den || "/danh-muc"}
      prefetch={false}
      className={i === 0 ? lopNut("chinh", "vua") : lopNut("chu", "vua")}
    >
      {veChinhTrang ? "Xem combo" : n.chu}
    </Link>
  );
};

interface LandingClientProps {
  chienDich: ChienDich;
  /** W064: có cấu hình thì phần đầu là khối cuộn LOPOE như trang chủ */
  lopoe3D?: CauHinhLopoe3D;
}

export function LandingClient({
  chienDich,
  lopoe3D,
}: LandingClientProps) {
  // Dấu cho test e2e biết trang đã chạy JS (sân khấu 3D cũ tự gắn dấu này; khối cuộn LOPOE thì không)
  const daChay = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
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
      className="relative flex-1 flex flex-col text-den overflow-x-clip font-sans"
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
        @media (max-width: 759px) {
          .vq-k {
            min-height: 100svh;
            align-items: flex-start;
            justify-content: flex-start !important;
            padding: 41svh 20px 96px;
          }
          .vq-k .cot {
            width: 100%;
            max-width: 560px;
          }
        }
        @media (min-width: 760px) and (max-width: 1023px) and (orientation: portrait) {
          .vq-k {
            min-height: 100svh;
            align-items: flex-start;
            justify-content: flex-start !important;
            padding: 56svh 48px 64px;
          }
          .vq-k .cot {
            width: 100%;
            max-width: 560px;
          }
        }
      `}</style>

      {lopoe3D ? (
        <main id="trang-landing" className="relative z-10">
          <span hidden data-hydrated={daChay ? "true" : "false"} />
          <h1 className="sr-only">{chienDich.ten} · VIVE New Arrival</h1>
          <CuonLopoe3D cfg={lopoe3D} id="lopoe" veNut={veNutLanding} />
          {raMatBlock?.loai === "ra-mat" && <KhoiRaMat khoi={raMatBlock} phang />}
        </main>
      ) : (
        <>
          <LandingStage3D cacCanh={cacCanh} />
          <main id="trang-landing" className="relative z-10">
            {heroBlock && <KhoiHero khoi={heroBlock} />}
            {tieuDiemBlock && <KhoiTieuDiem khoi={tieuDiemBlock} />}
            {raMatBlock && <KhoiRaMat khoi={raMatBlock} />}
          </main>
        </>
      )}

      {marqueeBlock && <KhoiBangChu khoi={marqueeBlock} />}

      <div
        id="phan-duoi"
        className="relative z-20 bg-white rounded-t-[36px] md:rounded-t-[48px] shadow-[0_-20px_60px_rgba(43,43,42,0.06)] overflow-x-clip"
      >
        {otherBlocks.map((khoi, index) => {
          switch (khoi.loai) {
            case "chuong-trinh":
              return <KhoiChuongTrinh key={index} khoi={khoi} anhRieng={raMatBlock?.loai === "ra-mat" ? raMatBlock.anh_san_pham : undefined} />;
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
