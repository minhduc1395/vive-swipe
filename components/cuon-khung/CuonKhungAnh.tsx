"use client";

import { useEffect, useRef } from "react";

type Props = { thuMuc: string; soKhung: number; rong: number; cao: number; chieuCaoVh: number };

/**
 * Cuộn theo chuỗi ảnh (kiểu trang sản phẩm Apple): ảnh dựng sẵn, cuộn tới đâu vẽ khung đó lên canvas 2D.
 * - Vẽ chỉ khi khung đổi, không có vòng render liên tục → máy không nóng, không giật khi đứng yên.
 * - Hòa trộn 2 khung kề nhau theo phần lẻ để chuyển động mượt dù mỗi khung cách nhau ~90px cuộn.
 * - Tải khung thưa trước (mỗi 8 khung), rồi lấp dần; chưa tải thì dùng khung gần nhất đã có.
 */
export function CuonKhungAnh({ thuMuc, soKhung, rong, cao, chieuCaoVh }: Props) {
  const doan = useRef<HTMLElement>(null);
  const vas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const elDoan = doan.current!, cv = vas.current!;
    const ctx = cv.getContext("2d", { alpha: false })!;
    const anh: (HTMLImageElement | null)[] = new Array(soKhung).fill(null);
    let huy = false, raf = 0, ve = -1;

    const url = (i: number) => `${thuMuc}/${String(i).padStart(3, "0")}.webp`;
    const tai = (i: number) =>
      new Promise<void>((xong) => {
        if (anh[i] || huy) return xong();
        const im = new Image();
        im.decoding = "async";
        im.src = url(i);
        im.decode().then(() => { anh[i] = im; xong(); }, () => xong());
      });
    const gan = (i: number) => {
      for (let d = 0; d < soKhung; d++) {
        if (anh[i - d]) return anh[i - d];
        if (anh[i + d]) return anh[i + d];
      }
      return null;
    };

    const doiCo = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      ve = -1;
      yeuCauVe();
    };
    const phu = (im: HTMLImageElement, alpha: number) => {
      // object-fit: cover
      const s = Math.max(cv.width / rong, cv.height / cao);
      const w = rong * s, h = cao * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
    };
    const tienTrinh = () => {
      const r = elDoan.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    };
    const veKhung = () => {
      raf = 0;
      const f = tienTrinh() * (soKhung - 1);
      const i = Math.floor(f), t = f - i;
      const khoa = Math.round(f * 8); // đổi khi lệch ≥ 1/8 khung
      if (khoa === ve) return;
      ve = khoa;
      const a = gan(i), b = t > 0.02 ? gan(Math.min(soKhung - 1, i + 1)) : null;
      if (!a) return;
      phu(a, 1);
      if (b && b !== a) phu(b, t);
      ctx.globalAlpha = 1;
    };
    const yeuCauVe = () => { if (!raf) raf = requestAnimationFrame(veKhung); };

    // Tải: khung đầu → mỗi 8 khung → phần còn lại theo thứ tự
    (async () => {
      await tai(0);
      yeuCauVe();
      for (let i = 8; i < soKhung; i += 8) { await tai(i); }
      ve = -1; yeuCauVe();
      for (let i = 0; i < soKhung; i++) { if (!anh[i]) { await tai(i); if (i % 8 === 0) { ve = -1; yeuCauVe(); } } }
      ve = -1; yeuCauVe();
    })();

    doiCo();
    addEventListener("scroll", yeuCauVe, { passive: true });
    let w0 = innerWidth;
    const khiDoiCo = () => { if (innerWidth !== w0) { w0 = innerWidth; doiCo(); } };
    addEventListener("resize", khiDoiCo);
    return () => {
      huy = true;
      cancelAnimationFrame(raf);
      removeEventListener("scroll", yeuCauVe);
      removeEventListener("resize", khiDoiCo);
    };
  }, [thuMuc, soKhung, rong, cao]);

  return (
    <section ref={doan} aria-label="LOPOE Better Balance" className="relative" style={{ height: `${chieuCaoVh}vh` }}>
      {/* lvh: chiều cao lớn nhất, không đổi khi thanh địa chỉ ẩn/hiện → không vẽ lại canvas giữa chừng */}
      <div className="sticky top-0 h-[100lvh] overflow-hidden bg-[#f3ece8]">
        <canvas ref={vas} className="block h-full w-full" />
      </div>
    </section>
  );
}
