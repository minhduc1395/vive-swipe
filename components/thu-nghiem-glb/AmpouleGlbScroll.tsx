"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { khoiTaoCanhAmpoule, type ThongSoDoFps } from "./canh-ampoule";

const dangKyTrong = () => () => {};
const layCoFps = () =>
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("fps") === "1";

export interface MucCanhAmpoule {
  nhan: string;
  tieuDe: string;
  moTa: string;
}

export interface AmpouleGlbScrollProps {
  canhList: MucCanhAmpoule[];
  nhanTaiFallback: string;
}

export function AmpouleGlbScroll({
  canhList,
  nhanTaiFallback,
}: AmpouleGlbScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canhHienTai, setCanhHienTai] = useState<1 | 2 | 3>(1);
  const [loiWebGL, setLoiWebGL] = useState(false);
  const hienFps = useSyncExternalStore(dangKyTrong, layCoFps, () => false);
  const [thongSo, setThongSo] = useState<ThongSoDoFps | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dprParam = Number(params.get("dpr"));
    const maxDpr = Number.isFinite(dprParam) && dprParam > 0 ? dprParam : undefined;

    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !stage || !wrapper) return;

    const layTienTrinh = () => {
      const rect = wrapper.getBoundingClientRect();
      const maxScroll = Math.max(1, wrapper.offsetHeight - window.innerHeight);
      const daCuon = Math.max(0, Math.min(maxScroll, -rect.top));
      return daCuon / maxScroll;
    };

    return khoiTaoCanhAmpoule({
      canvas,
      khung: stage,
      layTienTrinh,
      maxDpr,
      onCanh: setCanhHienTai,
      onThongSo: setThongSo,
      onLoiWebGL: () => setLoiWebGL(true),
    });
  }, []);

  const muc = canhList[canhHienTai - 1] ?? canhList[0];

  return (
    <div
      ref={wrapperRef}
      data-testid="w071-scroll-wrapper"
      className="relative w-full h-[400vh] bg-nen-phu text-den"
    >
      <div
        ref={stageRef}
        className="sticky top-0 w-full h-[100svh] overflow-hidden flex items-center justify-center"
      >
        {loiWebGL ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/thu-nghiem/lopoe-3d/ampoule-than.webp"
              alt={nhanTaiFallback}
              className="w-48 h-auto object-contain"
            />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            data-testid="w071-canvas"
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        )}

        {hienFps && (
          <div
            data-testid="w071-fps-hud"
            className="absolute top-4 right-4 z-20 rounded-xl bg-trang/90 border border-vien px-3 py-2 text-[12px] font-medium text-den shadow-sm"
          >
            <div>FPS: {thongSo?.fps ?? 0}</div>
            <div>Max frame: {thongSo?.maxFrameMs ?? 0} ms</div>
            <div>DPR: {thongSo?.dpr ?? "-"}</div>
          </div>
        )}

        <div className="pointer-events-none relative z-10 w-full max-w-[1160px] h-full mx-auto px-5 md:px-10 flex flex-col justify-end md:justify-center pb-8 md:pb-0">
          <div
            data-testid="w071-canh-noi-dung"
            data-canh={canhHienTai}
            className="max-w-[360px] md:max-w-[420px] md:ml-auto rounded-2xl bg-trang/90 backdrop-blur-sm border border-vien p-5 md:p-6 shadow-sm"
          >
            <p className="m-0 text-[12px] font-semibold uppercase tracking-wider text-xam">
              {muc.nhan}
            </p>
            <h1 className="mt-1.5 mb-2 text-[22px] md:text-[28px] font-bold leading-tight text-den">
              {muc.tieuDe}
            </h1>
            <p className="m-0 text-[14px] md:text-[15px] leading-relaxed text-xam-dam">
              {muc.moTa}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
