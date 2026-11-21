import type { NgonNgu } from "./ngon-ngu";

/**
 * W044: từ điển tách theo module để các job đội coder không sửa chung 1 file.
 * Mỗi module một cặp messages/vi/<ten>.json + messages/en/<ten>.json, khóa gốc = tên module.
 * Thêm module mới: thêm 1 dòng vào CAC_KHOI và tạo 2 file. Khóa thiếu bản en thì hiện bản vi.
 */
export const CAC_KHOI = ["chung", "trang-chu", "quet", "deal", "giu-hang", "tai-khoan"] as const;
export type KhoiTuDien = (typeof CAC_KHOI)[number];

type CayChu = { [k: string]: string | CayChu };

async function docKhoi(ngonNgu: NgonNgu, khoi: KhoiTuDien): Promise<CayChu> {
  return (await import(`../messages/${ngonNgu}/${khoi}.json`)).default as CayChu;
}

function tronSau(goc: CayChu, de: CayChu): CayChu {
  const kq: CayChu = { ...goc };
  for (const [k, v] of Object.entries(de)) {
    const cu = kq[k];
    kq[k] = typeof v === "object" && typeof cu === "object" ? tronSau(cu, v) : v;
  }
  return kq;
}

/** Từ điển đầy đủ cho một ngôn ngữ: bản vi làm nền, bản en đè lên (khóa thiếu en vẫn có chữ vi). */
export async function layTuDien(ngonNgu: NgonNgu): Promise<CayChu> {
  const kq: CayChu = {};
  for (const khoi of CAC_KHOI) {
    const vi = await docKhoi("vi", khoi);
    kq[khoi] = ngonNgu === "vi" ? vi : tronSau(vi, await docKhoi("en", khoi));
  }
  return kq;
}
