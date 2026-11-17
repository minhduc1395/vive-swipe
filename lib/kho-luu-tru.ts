"use client";

import type { HoSoKhach } from "@/lib/goi-y/ho-so";

export const KHOA_DA_THICH = "vive_da_thich";
export const KHOA_GIO_HANG = "vive_gio_hang";
export const KHOA_DA_BO_QUA = "vive_da_bo_qua";
export const KHOA_HO_SO = "vive_ho_so";

export interface ItemGioHang {
  loai?: "san_pham" | "combo";
  sanPhamId?: string;
  dealId?: string;
  soLuong: number;
}

export interface MucBoQua {
  id: string;
  bo_qua_luc: number;
}

function docJson<T>(khoa: string, macDinh: T): T {
  if (typeof window === "undefined") return macDinh;
  try {
    const raw = window.localStorage.getItem(khoa);
    return raw ? (JSON.parse(raw) as T) : macDinh;
  } catch {
    return macDinh;
  }
}

function ghiJson<T>(khoa: string, duLieu: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(khoa, JSON.stringify(duLieu));
    window.dispatchEvent(
      new CustomEvent("vive_storage_update", { detail: { khoa } })
    );
  } catch {
    // bỏ qua lỗi storage
  }
}

// --- ĐÃ THÍCH ---
export function layDanhSachDaThich(): string[] {
  return docJson<string[]>(KHOA_DA_THICH, []);
}

export function themDaThich(id: string): void {
  const hienTai = layDanhSachDaThich();
  if (!hienTai.includes(id)) {
    ghiJson(KHOA_DA_THICH, [id, ...hienTai]);
  }
}

export function xoaDaThich(id: string): void {
  const hienTai = layDanhSachDaThich();
  ghiJson(
    KHOA_DA_THICH,
    hienTai.filter((item) => item !== id)
  );
}

// --- GIỎ HÀNG ---
export function layGioHang(): ItemGioHang[] {
  return docJson<ItemGioHang[]>(KHOA_GIO_HANG, []);
}

export function themVaoGio(sanPhamId: string, soLuong = 1): void {
  const hienTai = layGioHang();
  const viTri = hienTai.findIndex(
    (item) => (item.loai !== "combo" && item.sanPhamId === sanPhamId)
  );
  if (viTri >= 0) {
    const banSao = [...hienTai];
    banSao[viTri] = {
      ...banSao[viTri],
      soLuong: banSao[viTri].soLuong + soLuong,
    };
    ghiJson(KHOA_GIO_HANG, banSao);
  } else {
    ghiJson(KHOA_GIO_HANG, [{ loai: "san_pham", sanPhamId, soLuong }, ...hienTai]);
  }
}

export function themComboVaoGio(dealId: string, soLuong = 1): void {
  const hienTai = layGioHang();
  const viTri = hienTai.findIndex(
    (item) => item.loai === "combo" && item.dealId === dealId
  );
  if (viTri >= 0) {
    const banSao = [...hienTai];
    banSao[viTri] = {
      ...banSao[viTri],
      soLuong: banSao[viTri].soLuong + soLuong,
    };
    ghiJson(KHOA_GIO_HANG, banSao);
  } else {
    ghiJson(KHOA_GIO_HANG, [{ loai: "combo", dealId, soLuong }, ...hienTai]);
  }
}

export function capNhatSoLuongGio(
  id: string,
  soLuong: number,
  loai: "san_pham" | "combo" = "san_pham"
): void {
  const hienTai = layGioHang();
  if (soLuong <= 0) {
    xoaKhoiGio(id, loai);
    return;
  }
  const banSao = hienTai.map((item) => {
    const khop =
      loai === "combo"
        ? item.loai === "combo" && item.dealId === id
        : item.loai !== "combo" && item.sanPhamId === id;
    return khop ? { ...item, soLuong } : item;
  });
  ghiJson(KHOA_GIO_HANG, banSao);
}

export function giamSoLuongGio(
  id: string,
  loai: "san_pham" | "combo" = "san_pham"
): void {
  const hienTai = layGioHang();
  const muc = hienTai.find((item) =>
    loai === "combo"
      ? item.loai === "combo" && item.dealId === id
      : item.loai !== "combo" && item.sanPhamId === id
  );
  if (!muc) return;
  if (muc.soLuong <= 1) {
    xoaKhoiGio(id, loai);
  } else {
    capNhatSoLuongGio(id, muc.soLuong - 1, loai);
  }
}

export function xoaKhoiGio(
  id: string,
  loai: "san_pham" | "combo" = "san_pham"
): void {
  const hienTai = layGioHang();
  ghiJson(
    KHOA_GIO_HANG,
    hienTai.filter((item) => {
      if (loai === "combo") {
        return !(item.loai === "combo" && item.dealId === id);
      }
      return !(item.loai !== "combo" && item.sanPhamId === id);
    })
  );
}

export function doiSangCombo(
  dealId: string,
  thanhPhan: Array<{ id: string; so_luong: number }>
): void {
  const hienTai = layGioHang();
  let banSao = [...hienTai];

  for (const tp of thanhPhan) {
    let canTru = tp.so_luong;
    banSao = banSao
      .map((item) => {
        if (canTru <= 0) return item;
        if (item.loai !== "combo" && item.sanPhamId === tp.id) {
          const tru = Math.min(item.soLuong, canTru);
          canTru -= tru;
          return { ...item, soLuong: item.soLuong - tru };
        }
        return item;
      })
      .filter((item) => item.soLuong > 0);
  }

  // Thêm combo
  const viTriCombo = banSao.findIndex(
    (item) => item.loai === "combo" && item.dealId === dealId
  );
  if (viTriCombo >= 0) {
    banSao[viTriCombo] = {
      ...banSao[viTriCombo],
      soLuong: banSao[viTriCombo].soLuong + 1,
    };
  } else {
    banSao.unshift({ loai: "combo", dealId, soLuong: 1 });
  }

  ghiJson(KHOA_GIO_HANG, banSao);
}

export function xoaToanBoGio(): void {
  ghiJson(KHOA_GIO_HANG, []);
}

// --- BỎ QUA ---
export function layDanhSachDaBoQua(): MucBoQua[] {
  return docJson<MucBoQua[]>(KHOA_DA_BO_QUA, []);
}

export function themDaBoQua(id: string): void {
  const hienTai = layDanhSachDaBoQua();
  const conLai = hienTai.filter((item) => item.id !== id);
  ghiJson(KHOA_DA_BO_QUA, [{ id, bo_qua_luc: Date.now() }, ...conLai]);
}

export function xoaDaBoQua(id: string): void {
  const hienTai = layDanhSachDaBoQua();
  ghiJson(
    KHOA_DA_BO_QUA,
    hienTai.filter((item) => item.id !== id)
  );
}

// --- HỒ SƠ ---
export function layHoSoLocal(): HoSoKhach {
  return docJson<HoSoKhach>(KHOA_HO_SO, {});
}

export function luuHoSoLocal(hoSo: HoSoKhach): void {
  ghiJson(KHOA_HO_SO, hoSo);
}
