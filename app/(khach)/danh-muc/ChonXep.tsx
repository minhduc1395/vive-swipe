"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { lopNut } from "@/components/ui/Nut";

/** Mã cách xếp; nhãn lấy từ từ điển `quet.danhMuc.xepLuaChon.<mã>` (W044). */
export const LUA_CHON_XEP = [
  { id: "goi-y" },
  { id: "giam" },
  { id: "gia-tang" },
  { id: "gia-giam" },
] as const;

/**
 * Ô "Xếp" thay <select> (W042): nút Phụ, bấm mở menu nhỏ (≥768px) hoặc bottom sheet (điện thoại).
 * Đóng bằng Esc hoặc bấm ra ngoài; điều khiển bằng mũi tên lên/xuống, Enter.
 */
export function ChonXep({ giaTri, onChon }: { giaTri: string; onChon: (id: string) => void }) {
  const t = useTranslations("quet.danhMuc");
  const [mo, setMo] = useState(false);
  const [viTri, setViTri] = useState(0);
  const khung = useRef<HTMLDivElement>(null);
  const idMenu = useId();
  const hienTai = LUA_CHON_XEP.find((l) => l.id === giaTri) ?? LUA_CHON_XEP[0];

  useEffect(() => {
    if (!mo) return;
    const ngoai = (e: MouseEvent) => { if (khung.current && !khung.current.contains(e.target as Node)) setMo(false); };
    const phim = (e: KeyboardEvent) => { if (e.key === "Escape") setMo(false); };
    document.addEventListener("mousedown", ngoai);
    window.addEventListener("keydown", phim);
    return () => { document.removeEventListener("mousedown", ngoai); window.removeEventListener("keydown", phim); };
  }, [mo]);

  const chon = (id: string) => { onChon(id); setMo(false); };

  return (
    <div ref={khung} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={mo}
        aria-controls={idMenu}
        onClick={() => { setViTri(LUA_CHON_XEP.findIndex((l) => l.id === hienTai.id)); setMo((m) => !m); }}
        className={lopNut("phu", "vua")}
      >
        <span className="text-xam font-normal">{t("xep")}</span> {t(`xepLuaChon.${hienTai.id}`)}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${mo ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {mo && (
        <>
          <div className="fixed inset-0 z-40 bg-den/30 md:hidden" aria-hidden="true" onClick={() => setMo(false)} />
          <ul
            id={idMenu}
            role="listbox"
            aria-label={t("xepAria")}
            tabIndex={-1}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setViTri((v) => (v + 1) % LUA_CHON_XEP.length); }
              if (e.key === "ArrowUp") { e.preventDefault(); setViTri((v) => (v - 1 + LUA_CHON_XEP.length) % LUA_CHON_XEP.length); }
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chon(LUA_CHON_XEP[viTri].id); }
            }}
            className="z-50 m-0 list-none p-2 bg-trang shadow-[0_12px_40px_rgba(43,43,42,0.16)] outline-none
              fixed left-0 right-0 bottom-0 rounded-t-[24px] pb-[calc(12px+env(safe-area-inset-bottom))]
              md:absolute md:left-auto md:right-0 md:bottom-auto md:top-[calc(100%+6px)] md:w-[220px] md:rounded-[16px] md:pb-2"
          >
            <li className="md:hidden px-3 pt-2 pb-3 text-[13px] font-semibold text-xam" aria-hidden="true">{t("xepTheo")}</li>
            {LUA_CHON_XEP.map((l, i) => (
              <li
                key={l.id}
                role="option"
                aria-selected={l.id === hienTai.id}
                onClick={() => chon(l.id)}
                onMouseEnter={() => setViTri(i)}
                className={`h-11 px-3 rounded-[12px] flex items-center justify-between text-[14px] cursor-pointer ${
                  i === viTri ? "bg-kem" : ""
                } ${l.id === hienTai.id ? "font-semibold" : ""}`}
              >
                {t(`xepLuaChon.${l.id}`)}
                {l.id === hienTai.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
