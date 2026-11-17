import { describe, it, expect } from "vitest";
import { SAN_PHAM } from "@/lib/data";
import {
  NHAN_LOAI_DA,
  NHAN_VAN_DE,
  NHAN_DANH_MUC,
  layNhanLoaiDa,
  layNhanVanDe,
  layNhanDanhMuc,
  layLyDoGoiY,
} from "@/lib/nhan";

describe("lib/nhan - bảng nhãn tiếng Việt chuẩn", () => {
  it("mọi slug loai_da trong SAN_PHAM đều có nhãn tiếng Việt", () => {
    const loaiDaSet = new Set<string>();
    for (const sp of SAN_PHAM) {
      for (const ld of sp.loai_da) {
        loaiDaSet.add(ld);
      }
    }

    for (const ld of loaiDaSet) {
      expect(NHAN_LOAI_DA[ld], `Thiếu nhãn cho loại da: ${ld}`).toBeDefined();
      expect(layNhanLoaiDa(ld)).not.toBe(ld);
    }
  });

  it("mọi slug van_de trong SAN_PHAM đều có nhãn tiếng Việt", () => {
    const vanDeSet = new Set<string>();
    for (const sp of SAN_PHAM) {
      for (const vd of sp.van_de) {
        vanDeSet.add(vd);
      }
    }

    for (const vd of vanDeSet) {
      expect(NHAN_VAN_DE[vd], `Thiếu nhãn cho vấn đề: ${vd}`).toBeDefined();
      expect(layNhanVanDe(vd)).not.toBe(vd);
    }
  });

  it("mọi slug danh_muc trong SAN_PHAM đều có nhãn tiếng Việt", () => {
    const danhMucSet = new Set<string>();
    for (const sp of SAN_PHAM) {
      danhMucSet.add(sp.danh_muc);
    }

    for (const dm of danhMucSet) {
      expect(NHAN_DANH_MUC[dm], `Thiếu nhãn cho danh mục: ${dm}`).toBeDefined();
      expect(layNhanDanhMuc(dm)).not.toBe(dm);
    }
  });

  it("layLyDoGoiY không bao giờ hiển thị 'Hợp moi-loai-da'", () => {
    const lyDo1 = layLyDoGoiY([], ["moi-loai-da"]);
    expect(lyDo1).toBeUndefined();

    const lyDo2 = layLyDoGoiY(undefined, ["moi-loai-da"]);
    expect(lyDo2).toBeUndefined();

    const lyDo3 = layLyDoGoiY(["mun"], ["moi-loai-da"]);
    expect(lyDo3).toBe("Hợp với: Mụn");

    const lyDo4 = layLyDoGoiY([], ["moi-loai-da", "da-dau"]);
    expect(lyDo4).toBe("Hợp: Da dầu");
  });
});
