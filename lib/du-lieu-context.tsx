"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SAN_PHAM as SAN_PHAM_TINH, DEALS as DEALS_TINH } from "@/lib/data";
import type { SanPham, Deal } from "@/lib/data/types";
import {
  taiSanPhamTuSupabase,
  taiDealsTuSupabase,
} from "@/lib/supabase/du-lieu";

interface DuLieuContextType {
  sanPham: SanPham[];
  deals: Deal[];
  timSanPham: (id: string) => SanPham | undefined;
}

const DuLieuContext = createContext<DuLieuContextType>({
  sanPham: SAN_PHAM_TINH,
  deals: DEALS_TINH,
  timSanPham: (id: string) => SAN_PHAM_TINH.find((s) => s.id === id),
});

export function DuLieuProvider({ children }: { children: React.ReactNode }) {
  const [sanPham, setSanPham] = useState<SanPham[]>(SAN_PHAM_TINH);
  const [deals, setDeals] = useState<Deal[]>(DEALS_TINH);

  useEffect(() => {
    let mounted = true;
    void Promise.all([taiSanPhamTuSupabase(), taiDealsTuSupabase()]).then(
      ([sp, dl]) => {
        if (!mounted) return;
        if (sp && sp.length > 0 && sp !== SAN_PHAM_TINH) setSanPham(sp);
        if (dl && dl.length > 0 && dl !== DEALS_TINH) setDeals(dl);
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const timSanPham = (id: string) => sanPham.find((s) => s.id === id);

  return (
    <DuLieuContext.Provider value={{ sanPham, deals, timSanPham }}>
      {children}
    </DuLieuContext.Provider>
  );
}

export function useDuLieu() {
  return useContext(DuLieuContext);
}
