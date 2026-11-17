import { describe, it, expect, beforeEach } from "vitest";
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
});
