import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { datSupabaseMock } from "@/lib/supabase/client";
import {
  cheEmail,
  chuanHoaEmail,
  giayConLaiGuiLai,
  laEmailHopLe,
  laMaHopLe,
  lamSachMa,
  GIAY_HAN_MA,
} from "@/lib/tai-khoan/kiem-tra";
import { LOI, dichLoi } from "@/lib/tai-khoan/loi";
import { dangXuat, guiMa, laDaDangNhap, xacNhanMa } from "@/lib/tai-khoan/dang-nhap";
import { dangNhapEmailBat } from "@/lib/tai-khoan/co";

type UserGia = { id: string; is_anonymous: boolean; email?: string };

function taoSupabaseGia(user: UserGia | null) {
  const upsert = vi.fn(async () => ({ error: null }));
  const auth = {
    getSession: vi.fn(async () => ({
      data: { session: user ? { user } : null },
      error: null,
    })),
    signInAnonymously: vi.fn(async () => ({
      data: { user: { id: "an-danh-moi", is_anonymous: true } },
      error: null,
    })),
    updateUser: vi.fn(async () => ({ data: { user }, error: null as unknown })),
    signInWithOtp: vi.fn(async () => ({ data: {}, error: null as unknown })),
    verifyOtp: vi.fn(async () => ({
      data: {
        user: { id: user?.id ?? "u", is_anonymous: false, email: "khach@gmail.com" },
        session: { user: { id: user?.id ?? "u", is_anonymous: false, email: "khach@gmail.com" } },
      },
      error: null as unknown,
    })),
    refreshSession: vi.fn(async () => ({ data: { session: null }, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
  };
  const from = vi.fn(() => ({ upsert }));
  return { client: { auth, from } as unknown as SupabaseClient, auth, from, upsert };
}

const loiApi = (code: string, status: number, message = "x") => ({
  name: "AuthApiError",
  code,
  status,
  message,
});

beforeEach(() => {
  const store: Record<string, string> = {};
  const localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => void (store[k] = v),
    removeItem: (k: string) => void delete store[k],
  };
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", { localStorage, dispatchEvent: vi.fn() });
});

afterEach(() => {
  datSupabaseMock(null);
  vi.unstubAllGlobals();
});

describe("tai-khoan · kiểm tra đầu vào", () => {
  it("email hợp lệ / không hợp lệ", () => {
    expect(laEmailHopLe("khach@gmail.com")).toBe(true);
    expect(laEmailHopLe("  Khach.Vive+1@Mail.vn ")).toBe(true);
    expect(laEmailHopLe("khach@gmail")).toBe(false);
    expect(laEmailHopLe("khach gmail.com")).toBe(false);
    expect(laEmailHopLe("@gmail.com")).toBe(false);
    expect(laEmailHopLe("")).toBe(false);
    expect(chuanHoaEmail("  A@B.COM ")).toBe("a@b.com");
  });

  it("mã 6 số", () => {
    expect(laMaHopLe("123456")).toBe(true);
    expect(laMaHopLe("12345")).toBe(false);
    expect(laMaHopLe("12345a")).toBe(false);
    expect(lamSachMa("12 34-56789")).toBe("123456");
  });

  it("che giữa email", () => {
    expect(cheEmail("minhduc@gmail.com")).toBe("m***c@gmail.com");
    expect(cheEmail("ab@x.vn")).toBe("a***@x.vn");
    expect(cheEmail("khongcoemail")).toBe("***");
  });

  it("đếm ngược gửi lại 60 giây", () => {
    const t0 = 1_000_000;
    expect(giayConLaiGuiLai(null, t0)).toBe(0);
    expect(giayConLaiGuiLai(t0, t0)).toBe(60);
    expect(giayConLaiGuiLai(t0, t0 + 500)).toBe(60);
    expect(giayConLaiGuiLai(t0, t0 + 1_000)).toBe(59);
    expect(giayConLaiGuiLai(t0, t0 + 59_001)).toBe(1);
    expect(giayConLaiGuiLai(t0, t0 + 60_000)).toBe(0);
    expect(giayConLaiGuiLai(t0, t0 + 999_000)).toBe(0);
  });
});

describe("tai-khoan · dịch lỗi tiếng Việt", () => {
  it("sai mã, hết hạn, quá nhiều lần, mất mạng", () => {
    expect(dichLoi(loiApi("otp_expired", 403), { giayTuLucGui: 30 })).toBe(LOI.maSai);
    expect(dichLoi(loiApi("otp_expired", 403), { giayTuLucGui: GIAY_HAN_MA })).toBe(LOI.maHetHan);
    expect(dichLoi(loiApi("over_email_send_rate_limit", 429))).toBe(LOI.quaNhieu);
    expect(dichLoi({ name: "AuthRetryableFetchError", status: 0, message: "Failed to fetch" })).toBe(LOI.matMang);
    expect(dichLoi(loiApi("email_address_invalid", 400))).toBe(LOI.emailSai);
    expect(dichLoi(loiApi("unexpected_failure", 500))).toBe(LOI.chung);
  });
});

describe("tai-khoan · chọn nhánh đăng nhập", () => {
  it("khách ẩn danh → updateUser + nhánh email_change (giữ uid)", async () => {
    const gia = taoSupabaseGia({ id: "an-danh-1", is_anonymous: true });
    datSupabaseMock(gia.client);
    const kq = await guiMa(" Khach@Gmail.com ");
    expect(kq).toEqual({ ok: true, nhanh: "email_change" });
    expect(gia.auth.updateUser).toHaveBeenCalledWith({ email: "khach@gmail.com" });
    expect(gia.auth.signInWithOtp).not.toHaveBeenCalled();
    expect(gia.auth.signInAnonymously).not.toHaveBeenCalled();
  });

  it("email đã có tài khoản → signInWithOtp(shouldCreateUser:false) + nhánh email", async () => {
    const gia = taoSupabaseGia({ id: "an-danh-1", is_anonymous: true });
    gia.auth.updateUser.mockResolvedValueOnce({
      data: { user: null },
      error: loiApi("email_exists", 422, "A user with this email address has already been registered"),
    });
    datSupabaseMock(gia.client);
    const kq = await guiMa("khach@gmail.com");
    expect(kq).toEqual({ ok: true, nhanh: "email" });
    expect(gia.auth.signInWithOtp).toHaveBeenCalledWith({
      email: "khach@gmail.com",
      options: { shouldCreateUser: false },
    });
  });

  it("email sai → không gọi Supabase", async () => {
    const gia = taoSupabaseGia({ id: "an-danh-1", is_anonymous: true });
    datSupabaseMock(gia.client);
    expect(await guiMa("khach@")).toEqual({ ok: false, loi: LOI.emailSai });
    expect(gia.auth.updateUser).not.toHaveBeenCalled();
  });

  it("gửi quá nhiều lần → lỗi tiếng Việt", async () => {
    const gia = taoSupabaseGia({ id: "an-danh-1", is_anonymous: true });
    gia.auth.updateUser.mockResolvedValueOnce({
      data: { user: null },
      error: loiApi("over_email_send_rate_limit", 429),
    });
    datSupabaseMock(gia.client);
    expect(await guiMa("khach@gmail.com")).toEqual({ ok: false, loi: LOI.quaNhieu });
  });

  it("xác nhận mã đúng nhánh, ghi email vào khach của chính mình", async () => {
    const gia = taoSupabaseGia({ id: "an-danh-1", is_anonymous: true });
    datSupabaseMock(gia.client);
    const kq = await xacNhanMa("khach@gmail.com", "123456", "email_change");
    expect(kq).toEqual({ ok: true });
    expect(gia.auth.verifyOtp).toHaveBeenCalledWith({
      email: "khach@gmail.com",
      token: "123456",
      type: "email_change",
    });
    expect(gia.from).toHaveBeenCalledWith("khach");
    expect(gia.upsert).toHaveBeenCalledWith(
      { id: "an-danh-1", email: "khach@gmail.com" },
      { onConflict: "id" }
    );
  });

  it("verify chỉ trả user (không session) → làm mới session", async () => {
    const gia = taoSupabaseGia({ id: "an-danh-1", is_anonymous: true });
    gia.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: { id: "an-danh-1", is_anonymous: true, email: "" }, session: null as never },
      error: null,
    });
    datSupabaseMock(gia.client);
    expect(await xacNhanMa("khach@gmail.com", "123456", "email_change")).toEqual({ ok: true });
    expect(gia.auth.refreshSession).toHaveBeenCalled();
  });

  it("mã sai → lỗi, không ghi khach", async () => {
    const gia = taoSupabaseGia({ id: "an-danh-1", is_anonymous: true });
    gia.auth.verifyOtp.mockResolvedValueOnce({
      data: { user: null as never, session: null as never },
      error: loiApi("otp_expired", 403, "Token has expired or is invalid"),
    });
    datSupabaseMock(gia.client);
    expect(await xacNhanMa("khach@gmail.com", "000000", "email", 20)).toEqual({ ok: false, loi: LOI.maSai });
    expect(gia.upsert).not.toHaveBeenCalled();
  });

  it("đăng xuất rồi tạo lại khách ẩn danh", async () => {
    const gia = taoSupabaseGia(null);
    datSupabaseMock(gia.client);
    await dangXuat();
    expect(gia.auth.signOut).toHaveBeenCalled();
    expect(gia.auth.signInAnonymously).toHaveBeenCalled();
  });

  it("laDaDangNhap chỉ đúng khi không ẩn danh và có email", () => {
    expect(laDaDangNhap({ is_anonymous: true, email: "" })).toBe(false);
    expect(laDaDangNhap({ is_anonymous: false, email: "a@b.vn" })).toBe(true);
    expect(laDaDangNhap(null)).toBe(false);
  });
});

describe("cờ NEXT_PUBLIC_DANG_NHAP_EMAIL", () => {
  it("chỉ bật khi đúng \"1\"", () => {
    expect(dangNhapEmailBat("1")).toBe(true);
    expect(dangNhapEmailBat(undefined)).toBe(false);
    expect(dangNhapEmailBat("")).toBe(false);
    expect(dangNhapEmailBat("0")).toBe(false);
    expect(dangNhapEmailBat("true")).toBe(false);
  });
});
