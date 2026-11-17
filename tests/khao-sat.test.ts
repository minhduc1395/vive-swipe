import { describe, it, expect, beforeEach } from "vitest";
import { SAN_PHAM } from "@/lib/data";
import { khoiTaoHoSo } from "@/lib/goi-y/ho-so";
import { trichXuatDacTrung } from "@/lib/goi-y/dac-trung";
import {
  layTraLoiLocal,
  luuTraLoiLocal,
  daTungKhaoSat,
  danhDauBoQuaKhaoSat,
  xoaDuLieuKhaoSat,
  KHOA_TRA_LOI,
  KHOA_DA_KHAO_SAT,
} from "@/lib/khao-sat";

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

describe("lib/khao-sat - lưu trữ câu trả lời khảo sát ban đầu", () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    // Giả lập window và localStorage trong node environment
    (globalThis as unknown as { window: { localStorage: Storage } }).window = {
      localStorage: mockStorage,
    };
  });

  it("trả về null và false khi chưa có dữ liệu trong storage", () => {
    expect(layTraLoiLocal()).toBeNull();
    expect(daTungKhaoSat()).toBe(false);
  });

  it("lưu và đọc lại câu trả lời đầy đủ", () => {
    luuTraLoiLocal({
      loai_da: "da-dau",
      van_de: ["mun", "lo-chan-long"],
      ngan_sach: "200k-500k",
    });

    const ketQua = layTraLoiLocal();
    expect(ketQua).toEqual({
      loai_da: "da-dau",
      van_de: ["mun", "lo-chan-long"],
      ngan_sach: "200k-500k",
    });
    expect(daTungKhaoSat()).toBe(true);
    expect(mockStorage.getItem(KHOA_DA_KHAO_SAT)).toBe("true");
    expect(mockStorage.getItem(KHOA_TRA_LOI)).not.toBeNull();
  });

  it("đánh dấu bỏ qua khảo sát vẫn ghi nhận đã từng khảo sát", () => {
    danhDauBoQuaKhaoSat();
    expect(daTungKhaoSat()).toBe(true);
  });

  it("xoaDuLieuKhaoSat xóa sạch toàn bộ khóa", () => {
    luuTraLoiLocal({ loai_da: "da-kho" });
    expect(daTungKhaoSat()).toBe(true);

    xoaDuLieuKhaoSat();
    expect(layTraLoiLocal()).toBeNull();
    expect(daTungKhaoSat()).toBe(false);
  });

  it("mọi id của 3 câu hỏi khảo sát đi qua khoiTaoHoSo đều ra khóa có trong đặc trưng của ít nhất 1 sản phẩm", () => {
    // Tập hợp toàn bộ đặc trưng xuất hiện trong SAN_PHAM
    const tapDacTrung = new Set<string>();
    for (const sp of SAN_PHAM) {
      const ds = trichXuatDacTrung(sp);
      for (const d of ds) {
        tapDacTrung.add(d.khoa);
      }
    }

    const DANH_SACH_LOAI_DA = [
      "da-dau",
      "da-kho",
      "da-hon-hop",
      "da-nhay-cam",
      "da-thuong",
      "chua-ro",
    ];

    const DANH_SACH_MOI_QUAN_TAM = [
      "mun",
      "lo-chan-long",
      "sang-da",
      "cap-am",
      "lam-diu",
      "chong-lao-hoa",
      "chong-nang",
      "trang-diem",
      "cham-soc-co-the",
      "thiet-bi",
    ];

    const DANH_SACH_NGAN_SACH = [
      "duoi-200k",
      "200k-500k",
      "tren-500k",
      "khong-quan-trong",
    ];

    // Kiểm tra câu 1: Loại da
    for (const id of DANH_SACH_LOAI_DA) {
      const hs = khoiTaoHoSo({ loai_da: id });
      const keys = Object.keys(hs);
      if (id === "chua-ro") {
        expect(keys.length).toBe(0);
      } else {
        expect(keys.length).toBeGreaterThan(0);
        for (const k of keys) {
          expect(
            tapDacTrung.has(k),
            `Khóa '${k}' từ loại da '${id}' không có trong bất kỳ sản phẩm nào`
          ).toBe(true);
        }
      }
    }

    // Kiểm tra câu 2: Mối quan tâm
    for (const id of DANH_SACH_MOI_QUAN_TAM) {
      const hs = khoiTaoHoSo({ van_de: [id] });
      const keys = Object.keys(hs);
      expect(keys.length).toBeGreaterThan(0);
      for (const k of keys) {
        expect(
          tapDacTrung.has(k),
          `Khóa '${k}' từ mối quan tâm '${id}' không có trong bất kỳ sản phẩm nào`
        ).toBe(true);
      }
    }

    // Kiểm tra câu 3: Ngân sách
    for (const id of DANH_SACH_NGAN_SACH) {
      const hs = khoiTaoHoSo({ ngan_sach: id });
      const keys = Object.keys(hs);
      if (id === "khong-quan-trong") {
        expect(keys.length).toBe(0);
      } else {
        expect(keys.length).toBeGreaterThan(0);
        for (const k of keys) {
          expect(
            tapDacTrung.has(k),
            `Khóa '${k}' từ ngân sách '${id}' không có trong bất kỳ sản phẩm nào`
          ).toBe(true);
        }
      }
    }
  });
});
