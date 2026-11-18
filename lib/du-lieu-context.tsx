"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SAN_PHAM as SAN_PHAM_TINH, DEALS as DEALS_TINH } from "@/lib/data";
import type { SanPham, Deal } from "@/lib/data/types";
import {
  taiSanPhamTuSupabase,
  taiDealsTuSupabase,
  xoaCacheDuLieu,
} from "@/lib/supabase/du-lieu";
import { actionLayDuLieuKhachDev } from "@/app/quan-tri/actions";

interface DuLieuContextType {
  sanPham: SanPham[];
  deals: Deal[];
  timSanPham: (id: string) => SanPham | undefined;
  taiLaiDuLieu: () => Promise<void>;
  daSanSang: boolean;
}

const DuLieuContext = createContext<DuLieuContextType>({
  sanPham: SAN_PHAM_TINH,
  deals: DEALS_TINH,
  timSanPham: (id: string) => SAN_PHAM_TINH.find((s) => s.id === id),
  taiLaiDuLieu: async () => {},
  daSanSang: false,
});

export function DuLieuProvider({ children }: { children: React.ReactNode }) {
  const [sanPham, setSanPham] = useState<SanPham[]>(SAN_PHAM_TINH);
  const [deals, setDeals] = useState<Deal[]>(DEALS_TINH);
  const [daSanSang, setDaSanSang] = useState<boolean>(false);

  const layDuLieuTuNguon = useCallback(async (epBuoc: boolean) => {
    if (epBuoc) xoaCacheDuLieu();
    const [sp, dl, devOverride] = await Promise.all([
      taiSanPhamTuSupabase(),
      taiDealsTuSupabase(),
      actionLayDuLieuKhachDev().catch(() => null),
    ]);
    return { sp, dl, devOverride };
  }, []);

  const apDungKetQua = useCallback(
    (ketQua: {
      sp: SanPham[];
      dl: Deal[];
      devOverride: { sanPham: SanPham[]; deals: Deal[] } | null;
    }) => {
      if (ketQua.devOverride) {
        setSanPham(ketQua.devOverride.sanPham);
        setDeals(ketQua.devOverride.deals);
        return;
      }
      if (ketQua.sp && ketQua.sp.length > 0 && ketQua.sp !== SAN_PHAM_TINH) {
        setSanPham(ketQua.sp);
      }
      if (ketQua.dl && ketQua.dl.length > 0 && ketQua.dl !== DEALS_TINH) {
        setDeals(ketQua.dl);
      }
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) {
        setDaSanSang(true);
      }
    }, 2000);

    layDuLieuTuNguon(false)
      .then((ketQua) => {
        if (mounted) apDungKetQua(ketQua);
      })
      .catch((err) => {
        console.warn("[DuLieuProvider] Lỗi tải dữ liệu Supabase:", err);
      })
      .finally(() => {
        if (mounted) {
          clearTimeout(timer);
          setDaSanSang(true);
        }
      });

    const handleRefresh = () => {
      layDuLieuTuNguon(true)
        .then((ketQua) => {
          if (mounted) apDungKetQua(ketQua);
        })
        .catch(() => {});
    };

    window.addEventListener("vive_du_lieu_updated", handleRefresh);
    return () => {
      mounted = false;
      clearTimeout(timer);
      window.removeEventListener("vive_du_lieu_updated", handleRefresh);
    };
  }, [layDuLieuTuNguon, apDungKetQua]);

  const taiLaiDuLieu = useCallback(async () => {
    const ketQua = await layDuLieuTuNguon(true);
    apDungKetQua(ketQua);
  }, [layDuLieuTuNguon, apDungKetQua]);

  const timSanPham = (id: string) => sanPham.find((s) => s.id === id);

  return (
    <DuLieuContext.Provider
      value={{ sanPham, deals, timSanPham, taiLaiDuLieu, daSanSang }}
    >
      {children}
    </DuLieuContext.Provider>
  );
}

export function useDuLieu() {
  return useContext(DuLieuContext);
}
