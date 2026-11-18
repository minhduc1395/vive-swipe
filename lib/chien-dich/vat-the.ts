import type { CheDoVung3D, VatPham3D, VatThe3D } from "./types";

export interface VungVatThe {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface KetQuaDatVung {
  cx: number;
  cy: number;
  bodyW: number;
  bodyH: number;
  boxW: number;
  boxH: number;
  totalH: number;
  capImgW: number;
  capImgH: number;
  pipetteGapPx: number;
  xoayDeg: number;
  mo: number;
  an: number;
  hop: [number, number, number, number];
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Lấy danh sách mốc vật thể theo chế độ ("ngang" | "doc").
 * Nếu YAML thiếu `doc`, tự suy từ `ngang` với bố cục gọn trong dải trên.
 */
export function layVatTheTheoCheDo(
  vatThe: VatThe3D,
  cheDo: CheDoVung3D
): VatPham3D[] {
  if (cheDo === "ngang") return vatThe.ngang;
  if (vatThe.doc && vatThe.doc.length > 0) return vatThe.doc;

  return vatThe.ngang.map((vp) => ({
    ...vp,
    x: clamp(0.5 + (vp.x - 0.5) * 0.85, 0.18, 0.82),
    y: clamp(vp.y, 0.25, 0.72),
    co: Math.min(vp.co * 1.05, 0.96),
  }));
}

/**
 * Đặt một vật thể theo mốc trong vùng V, kẹp hộp bao (cả thân + nắp đang nhấc) vào trong vùng V.
 * Không đủ chỗ thì tự thu nhỏ. (Đối chiếu `datVaoVung` trong design/landing-3d/index.html)
 */
export function datVaoVung(
  item: VatPham3D,
  V: VungVatThe,
  cheDo: CheDoVung3D
): KetQuaDatVung {
  const vr = Math.max(40, V.x1 - V.x0);
  const vc = Math.max(40, V.y1 - V.y0);
  const aspect = item.ty_le_khung ?? 2.5; // height / width của thân
  const mo = clamp(item.mo ?? 0, 0, 1);
  const an = clamp(item.an ?? 0, 0, 1);
  const xoayDeg =
    item.xoay !== undefined
      ? item.xoay
      : item.rz !== undefined
      ? (-item.rz * 180) / Math.PI
      : 0;

  // Khi có nắp/bóp rời: nhấc tối đa 12% chiều cao chai ở chế độ dọc (docs: NHAC.doc ≈ 12%)
  const capRatio = item.nap_anh ? 0.38 / aspect : 0;
  const maxLiftRatio = item.nap_anh ? (cheDo === "doc" ? 0.12 : 0.28) : 0;
  const liftFrac = mo * maxLiftRatio;

  const targetTotalH = Math.max(24, item.co * vc);
  const rawBodyH = targetTotalH / (1 + capRatio + liftFrac);
  const rawBodyW = rawBodyH / aspect;

  const rad = Math.abs((xoayDeg * Math.PI) / 180);
  const rotW = rawBodyW * Math.cos(rad) + targetTotalH * Math.sin(rad);
  const rotH = targetTotalH * Math.cos(rad) + rawBodyW * Math.sin(rad);

  const shrink = Math.min(1, (vr - 4) / rotW, (vc - 4) / rotH);
  const bodyH = rawBodyH * shrink;
  const bodyW = rawBodyW * shrink;
  const totalH = targetTotalH * shrink;
  const boxW = rotW * shrink;
  const boxH = rotH * shrink;

  const cx = clamp(V.x0 + item.x * vr, V.x0 + boxW / 2, V.x1 - boxW / 2);
  const cy = clamp(V.y0 + item.y * vc, V.y0 + boxH / 2, V.y1 - boxH / 2);

  const capImgW = bodyW * 0.42;
  const capImgH = capImgW * 0.85;
  const pipetteGapPx = bodyH * liftFrac;

  return {
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
    hop: [cx - boxW / 2, cy - boxH / 2, cx + boxW / 2, cy + boxH / 2],
  };
}
