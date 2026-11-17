"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KhungDienThoai } from "@/components/KhungDienThoai";
import { ThanhTab } from "@/components/ThanhTab";
import { BangChiTiet } from "@/components/deck/BangChiTiet";
import { SAN_PHAM, DEALS, laySanPhamHienThi } from "@/lib/data";
import type { SanPham } from "@/lib/data/types";
import { dinhDangTien, chuanHoaTimKiem } from "@/lib/dinh-dang";
import { layGhiChuDeal } from "@/lib/deals/ghi-chu";
import {
  layDanhSachDaThich,
  themDaThich,
  xoaDaThich,
  layGioHang,
  themVaoGio,
  type ItemGioHang,
} from "@/lib/kho-luu-tru";

const DANH_SACH_LOAI = [
  { id: "sua-rua-mat", label: "Sữa rửa mặt" },
  { id: "nuoc-can-bang", label: "Nước cân bằng" },
  { id: "toner-pad", label: "Toner pad" },
  { id: "tinh-chat", label: "Tinh chất, serum" },
  { id: "kem-duong", label: "Kem dưỡng" },
  { id: "mat-na", label: "Mặt nạ" },
  { id: "chong-nang", label: "Chống nắng" },
  { id: "trang-diem", label: "Trang điểm" },
  { id: "duong-moi", label: "Dưỡng môi" },
  { id: "mieng-dan", label: "Miếng dán mụn" },
  { id: "duong-the", label: "Chăm sóc cơ thể" },
  { id: "thiet-bi", label: "Thiết bị làm đẹp" },
] as const;

const DANH_SACH_VAN_DE = [
  { id: "mun", label: "Mụn" },
  { id: "lo-chan-long", label: "Lỗ chân lông" },
  { id: "sang-da", label: "Thâm, sáng da" },
  { id: "cap-am", label: "Cấp ẩm" },
  { id: "lam-diu", label: "Làm dịu" },
  { id: "chong-lao-hoa", label: "Chống lão hóa" },
] as const;


function DanhMucNoiDung() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc bộ lọc từ URL
  const loaiUrl = searchParams.get("loai") || "";
  const vanDeUrl = searchParams.get("van-de") || "";
  const thuongHieuUrl = searchParams.get("thuong-hieu") || "";
  const timUrl = searchParams.get("tim") || "";
  const xepUrl = searchParams.get("xep") || "goi-y";

  const [timKiemInput, setTimKiemInput] = useState<string>(timUrl);
  const [gioiHanHienThi, setGioiHanHienThi] = useState<number>(6);
  const [daThich, setDaThich] = useState<string[]>([]);
  const [soLuongGio, setSoLuongGio] = useState<number>(0);
  const [sanPhamChiTiet, setSanPhamChiTiet] = useState<SanPham | null>(null);

  // Sync state từ storage
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setDaThich(layDanhSachDaThich());
    const gh = layGioHang();
    setSoLuongGio(gh.reduce((t: number, m: ItemGioHang) => t + m.soLuong, 0));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Sync ô tìm kiếm khi URL thay đổi
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setTimKiemInput(timUrl);
    setGioiHanHienThi(6);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [timUrl, loaiUrl, vanDeUrl, thuongHieuUrl, xepUrl]);

  // Tất cả sản phẩm hiển thị hợp lệ
  const tatCaSanPhamHienThi = useMemo(() => laySanPhamHienThi(SAN_PHAM), []);

  // Đếm số món trên từng loại sản phẩm
  const soLuongTheoLoai = useMemo(() => {
    const dem: Record<string, number> = {};
    for (const sp of tatCaSanPhamHienThi) {
      dem[sp.danh_muc] = (dem[sp.danh_muc] || 0) + 1;
    }
    return dem;
  }, [tatCaSanPhamHienThi]);

  // Đếm số món theo thương hiệu
  const danhSachThuongHieu = useMemo(() => {
    const dem: Record<string, number> = {};
    for (const sp of tatCaSanPhamHienThi) {
      dem[sp.thuong_hieu] = (dem[sp.thuong_hieu] || 0) + 1;
    }
    return Object.entries(dem)
      .sort((a, b) => b[1] - a[1])
      .map(([ten, count]) => ({ ten, count }));
  }, [tatCaSanPhamHienThi]);

  // Cập nhật URL bộ lọc
  const capNhatBoLoc = (
    params: {
      loai?: string;
      vanDe?: string;
      thuongHieu?: string;
      tim?: string;
      xep?: string;
    },
    options?: { replace?: boolean }
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (params.loai !== undefined) {
      if (params.loai) nextParams.set("loai", params.loai);
      else nextParams.delete("loai");
    }
    if (params.vanDe !== undefined) {
      if (params.vanDe) nextParams.set("van-de", params.vanDe);
      else nextParams.delete("van-de");
    }
    if (params.thuongHieu !== undefined) {
      if (params.thuongHieu) nextParams.set("thuong-hieu", params.thuongHieu);
      else nextParams.delete("thuong-hieu");
    }
    if (params.tim !== undefined) {
      if (params.tim) nextParams.set("tim", params.tim);
      else nextParams.delete("tim");
    }
    if (params.xep !== undefined) {
      if (params.xep && params.xep !== "goi-y") nextParams.set("xep", params.xep);
      else nextParams.delete("xep");
    }

    const queryStr = nextParams.toString();
    const target = `/danh-muc${queryStr ? `?${queryStr}` : ""}`;
    if (options?.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  };

  const xuLyVeTrangDau = () => {
    if (typeof window !== "undefined" && window.history.state?.idx > 0) {
      router.back();
    } else {
      router.push("/danh-muc");
    }
    setTimKiemInput("");
  };

  // Xác định có đang ở chế độ xem kết quả hay không
  const dangXemDanhSach = Boolean(
    loaiUrl || vanDeUrl || thuongHieuUrl || timUrl.trim()
  );

  // Lọc sản phẩm
  const ketQuaLoc = useMemo(() => {
    const qChuan = chuanHoaTimKiem(timUrl.trim());

    const ds = tatCaSanPhamHienThi.filter((sp) => {
      // Lọc theo loại
      if (loaiUrl && sp.danh_muc !== loaiUrl) return false;

      // Lọc theo vấn đề da
      if (vanDeUrl && !sp.van_de?.includes(vanDeUrl)) return false;

      // Lọc theo thương hiệu
      if (thuongHieuUrl && sp.thuong_hieu.toLowerCase() !== thuongHieuUrl.toLowerCase())
        return false;

      // Lọc theo từ khóa tìm kiếm không dấu
      if (qChuan) {
        const tenChuan = chuanHoaTimKiem(sp.ten_hien_thi);
        const gocChuan = chuanHoaTimKiem(sp.ten_goc);
        const thChuan = chuanHoaTimKiem(sp.thuong_hieu);
        const tpChuan = sp.thanh_phan?.some((tp) =>
          chuanHoaTimKiem(tp).includes(qChuan)
        );
        const vdChuan = sp.van_de?.some((vd) =>
          chuanHoaTimKiem(vd).includes(qChuan)
        );

        const khop =
          tenChuan.includes(qChuan) ||
          gocChuan.includes(qChuan) ||
          thChuan.includes(qChuan) ||
          tpChuan ||
          vdChuan;

        if (!khop) return false;
      }

      return true;
    });

    // Sắp xếp
    if (xepUrl === "giam") {
      // Đang giảm giá: sắp xếp theo % giảm giá giảm dần
      return ds.slice().sort((a, b) => {
        const phanTramA =
          a.gia_goc && a.gia_goc > a.gia_ban
            ? (a.gia_goc - a.gia_ban) / a.gia_goc
            : 0;
        const phanTramB =
          b.gia_goc && b.gia_goc > b.gia_ban
            ? (b.gia_goc - b.gia_ban) / b.gia_goc
            : 0;
        if (phanTramB !== phanTramA) return phanTramB - phanTramA;
        return (b.pho_bien ?? 0.5) - (a.pho_bien ?? 0.5);
      });
    }

    if (xepUrl === "gia-tang") {
      return ds.slice().sort((a, b) => a.gia_ban - b.gia_ban);
    }

    if (xepUrl === "gia-giam") {
      return ds.slice().sort((a, b) => b.gia_ban - a.gia_ban);
    }

    // Mặc định: Gợi ý (sản phẩm có ảnh trước, độ phổ biến cao trước)
    return ds.slice().sort((a, b) => {
      const coAnhA = a.anh ? 1 : 0;
      const coAnhB = b.anh ? 1 : 0;
      if (coAnhB !== coAnhA) return coAnhB - coAnhA;
      return (b.pho_bien ?? 0.5) - (a.pho_bien ?? 0.5);
    });
  }, [tatCaSanPhamHienThi, loaiUrl, vanDeUrl, thuongHieuUrl, timUrl, xepUrl]);

  // Tiêu đề trang
  const tieuDeTrang = useMemo(() => {
    if (loaiUrl) {
      const timLoai = DANH_SACH_LOAI.find((l) => l.id === loaiUrl);
      return timLoai ? timLoai.label : "Danh mục";
    }
    if (vanDeUrl) {
      const timVd = DANH_SACH_VAN_DE.find((v) => v.id === vanDeUrl);
      return timVd ? `Da: ${timVd.label}` : "Danh mục";
    }
    if (thuongHieuUrl) {
      return thuongHieuUrl;
    }
    if (timUrl) {
      return `Tìm "${timUrl}"`;
    }
    return "Danh mục";
  }, [loaiUrl, vanDeUrl, thuongHieuUrl, timUrl]);

  // Xử lý toggle thích
  const toggleThich = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (daThich.includes(id)) {
      xoaDaThich(id);
      setDaThich((prev) => prev.filter((item) => item !== id));
    } else {
      themDaThich(id);
      setDaThich((prev) => [id, ...prev]);
    }
  };

  // Xử lý thêm vào giỏ
  const xuLyThemVaoGio = (sp: SanPham, e?: React.MouseEvent) => {
    e?.stopPropagation();
    themVaoGio(sp.id, 1);
    setSoLuongGio((prev) => prev + 1);
  };

  const sanPhamHienThiList = ketQuaLoc.slice(0, gioiHanHienThi);
  const conThem = ketQuaLoc.length - gioiHanHienThi;

  return (
    <KhungDienThoai className="h-dvh">
      <div className="w-full h-full flex flex-col bg-trang font-sans text-den overflow-hidden relative">
        {/* Vùng cuộn nội dung */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Header */}
          <header className="px-5 pt-6 pb-2 flex items-center gap-1">
            {dangXemDanhSach && (
              <button
                type="button"
                onClick={xuLyVeTrangDau}
                aria-label="Về tất cả danh mục"
                className="w-11 h-11 -ml-3 flex items-center justify-center rounded-full text-den hover:bg-hong-nhat transition-colors cursor-pointer"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <h1 className="m-0 text-[26px] font-bold tracking-[-0.4px] text-den">
              {tieuDeTrang}
            </h1>
            {dangXemDanhSach && (
              <span className="ml-1.5 text-[14px] text-xam">
                {ketQuaLoc.length} món
              </span>
            )}
          </header>

          {/* Ô tìm kiếm */}
          <div className="px-5 pt-1 pb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const query = (fd.get("tim") as string) ?? timKiemInput;
                capNhatBoLoc({ tim: query.trim() });
              }}
              className="h-12 rounded-[14px] bg-hong-nhat flex items-center gap-2.5 px-3.5 focus-within:ring-2 focus-within:ring-den"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5C5C5B"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <label htmlFor="tim-sp" className="sr-only">
                Tìm sản phẩm
              </label>
              <input
                id="tim-sp"
                name="tim"
                type="search"
                value={timKiemInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    capNhatBoLoc({ tim: e.currentTarget.value.trim() });
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimKiemInput(val);
                  if (val === "") {
                    capNhatBoLoc({ tim: "" });
                  }
                }}
                placeholder="Tìm tên, thương hiệu, thành phần"
                className="flex-1 min-w-0 border-none outline-none bg-transparent font-sans text-[15px] text-den placeholder:text-xam"
              />
              <button type="submit" className="hidden" aria-hidden="true">
                Tìm
              </button>
              {timKiemInput && (
                <button
                  type="button"
                  onClick={() => {
                    setTimKiemInput("");
                    capNhatBoLoc({ tim: "" });
                  }}
                  aria-label="Xóa tìm kiếm"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xam hover:text-den cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* MÀN HÌNH CHÍNH (LANDING) */}
          {!dangXemDanhSach && (
            <>
              {/* Lưới 12 loại sản phẩm */}
              <section className="px-5 pt-3 pb-2 flex flex-col gap-2.5">
                <h2 className="m-0 text-[15px] font-semibold text-den">
                  Loại sản phẩm
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {DANH_SACH_LOAI.map((c, i) => {
                    const count = soLuongTheoLoai[c.id] || 0;
                    const bgClass =
                      i % 2 === 0 ? "bg-[#F7EEEB]" : "bg-[#EAF3ED]";
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          capNhatBoLoc({
                            loai: c.id,
                            vanDe: "",
                            thuongHieu: "",
                          })
                        }
                        className={`h-[76px] rounded-[18px] p-3 flex flex-col justify-between items-start text-left cursor-pointer border-none ${bgClass} hover:opacity-90 transition-opacity`}
                      >
                        <span className="text-[14px] font-semibold leading-[1.25] text-den">
                          {c.label}
                        </span>
                        <span className="text-[12px] text-[#5C5C5B]">
                          {count} món
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Hàng chip theo vấn đề da */}
              <section className="px-5 pt-4 pb-2 flex flex-col gap-2.5">
                <h2 className="m-0 text-[15px] font-semibold text-den">
                  Theo vấn đề da
                </h2>
                <div className="flex flex-wrap gap-2">
                  {DANH_SACH_VAN_DE.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        capNhatBoLoc({
                          vanDe: v.id,
                          loai: "",
                          thuongHieu: "",
                        })
                      }
                      className="h-[38px] px-3.5 rounded-full border border-[#E8D2CC] bg-trang font-sans text-[14px] text-den hover:border-den cursor-pointer transition-colors"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Thương hiệu cuộn ngang */}
              <section className="pl-5 pt-4 pb-6 flex flex-col gap-2.5">
                <h2 className="m-0 text-[15px] font-semibold text-den">
                  Thương hiệu
                </h2>
                <div className="flex gap-2 overflow-x-auto pr-5 pb-1">
                  {danhSachThuongHieu.map((b) => (
                    <button
                      key={b.ten}
                      type="button"
                      onClick={() =>
                        capNhatBoLoc({
                          thuongHieu: b.ten,
                          loai: "",
                          vanDe: "",
                        })
                      }
                      className="h-[38px] px-3.5 rounded-full border border-[#E8D2CC] bg-trang font-sans text-[14px] font-medium whitespace-nowrap text-den hover:border-den cursor-pointer shrink-0 transition-colors"
                    >
                      {b.ten} · {b.count}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* MÀN HÌNH DANH SÁCH KẾT QUẢ */}
          {dangXemDanhSach && (
            <>
              {/* Chip cuộn ngang loại sản phẩm */}
              <div
                className="pl-5 pt-2 flex gap-2 overflow-x-auto pr-5"
                role="group"
                aria-label="Chọn loại sản phẩm"
              >
                <button
                  type="button"
                  onClick={() => capNhatBoLoc({ loai: "" })}
                  aria-pressed={!loaiUrl}
                  className={`h-[34px] px-3 rounded-full font-sans text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    !loaiUrl
                      ? "bg-den text-trang border border-den"
                      : "bg-trang text-den border border-[#E8D2CC]"
                  }`}
                >
                  Tất cả
                </button>
                {DANH_SACH_LOAI.map((c) => {
                  const on = loaiUrl === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => capNhatBoLoc({ loai: c.id })}
                      aria-pressed={on}
                      className={`h-[34px] px-3 rounded-full font-sans text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        on
                          ? "bg-den text-trang border border-den"
                          : "bg-trang text-den border border-[#E8D2CC]"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Hàng chip vấn đề da + dropdown Xếp */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between gap-2.5">
                <div
                  className="flex gap-1.5 overflow-x-auto min-w-0"
                  role="group"
                  aria-label="Lọc theo vấn đề da"
                >
                  {DANH_SACH_VAN_DE.map((v) => {
                    const on = vanDeUrl === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          capNhatBoLoc({ vanDe: on ? "" : v.id })
                        }
                        aria-pressed={on}
                        className={`h-[32px] px-3 rounded-full font-sans text-[12px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          on
                            ? "bg-den text-trang border border-den"
                            : "bg-trang text-den border border-[#E8D2CC]"
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>

                <label className="shrink-0 flex items-center gap-1 text-[13px] text-xam">
                  <span>Xếp</span>
                  <select
                    value={xepUrl}
                    onChange={(e) =>
                      capNhatBoLoc({ xep: e.target.value }, { replace: true })
                    }
                    className="h-[34px] rounded-[10px] border border-[#E8D2CC] bg-trang font-sans text-[13px] text-den px-1.5 outline-none cursor-pointer"
                  >
                    <option value="goi-y">Gợi ý</option>
                    <option value="giam">Đang giảm giá</option>
                    <option value="gia-tang">Giá thấp trước</option>
                    <option value="gia-giam">Giá cao trước</option>
                  </select>
                </label>
              </div>

              {/* Lưới sản phẩm 2 cột */}
              {ketQuaLoc.length > 0 ? (
                <div className="px-4 pt-2 grid grid-cols-2 gap-3">
                  {sanPhamHienThiList.map((sp, i) => {
                    const liked = daThich.includes(sp.id);
                    const bgClass =
                      i % 4 === 0 || i % 4 === 3
                        ? "bg-[#F7EEEB]"
                        : "bg-[#EAF3ED]";
                    const ghiChuDeal = layGhiChuDeal(sp, DEALS);

                    return (
                      <article
                        key={sp.id}
                        onClick={() => setSanPhamChiTiet(sp)}
                        className="flex flex-col gap-1 cursor-pointer group"
                      >
                        {/* Hộp ảnh */}
                        <div
                          className={`relative h-[150px] rounded-[18px] ${bgClass} flex items-center justify-center overflow-hidden`}
                        >
                          {sp.anh ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={sp.anh}
                              alt={sp.ten_hien_thi}
                              className="w-[126px] h-[126px] object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <span className="text-[11px] font-semibold tracking-[1.4px] text-xam uppercase">
                              {sp.thuong_hieu}
                            </span>
                          )}

                          {/* Tag giảm giá */}
                          {sp.giam_tren_tag && (
                            <span className="absolute left-2 top-2 h-6 px-2 rounded-lg bg-den text-trang text-[11px] font-semibold flex items-center">
                              {sp.giam_tren_tag}
                            </span>
                          )}

                          {/* Nút tim */}
                          <button
                            type="button"
                            onClick={(e) => toggleThich(sp.id, e)}
                            aria-label={liked ? "Bỏ thích" : "Thích"}
                            aria-pressed={liked}
                            className="absolute top-1.5 right-1.5 w-[38px] h-[38px] rounded-full border-none bg-trang flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 transition-transform"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill={liked ? "#2B2B2A" : "none"}
                              stroke="#2B2B2A"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>

                        {/* Thương hiệu */}
                        <span className="text-[11px] font-semibold tracking-[1.2px] text-xam uppercase">
                          {sp.thuong_hieu}
                        </span>

                        {/* Tên */}
                        <span className="text-[14px] leading-[1.35] font-medium text-den h-[38px] overflow-hidden line-clamp-2">
                          {sp.ten_hien_thi}
                        </span>

                        {/* Giá + Nút thêm giỏ */}
                        <div className="flex items-end justify-between gap-1.5 mt-auto">
                          <div className="flex flex-col min-w-0">
                            <span className="flex items-baseline gap-1.5">
                              <strong className="text-[16px] font-bold text-den">
                                {dinhDangTien(sp.gia_ban)}
                              </strong>
                              {sp.gia_goc && sp.gia_goc > sp.gia_ban && (
                                <s className="text-[12px] text-xam">
                                  {dinhDangTien(sp.gia_goc)}
                                </s>
                              )}
                            </span>
                            {ghiChuDeal && (
                              <span className="text-[11px] text-xam h-[15px] truncate">
                                {ghiChuDeal}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => xuLyThemVaoGio(sp, e)}
                            aria-label={`Thêm ${sp.ten_hien_thi} vào giỏ`}
                            className="w-[38px] h-[38px] shrink-0 rounded-full bg-[#CFE3D5] flex items-center justify-center text-den hover:opacity-90 cursor-pointer transition-opacity"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#2B2B2A"
                              strokeWidth="2"
                              strokeLinecap="round"
                              aria-hidden="true"
                            >
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                /* Không có kết quả */
                <p className="my-8 mx-5 text-center text-[14px] leading-relaxed text-xam">
                  Chưa có sản phẩm hợp bộ lọc này. Thử bỏ bớt bộ lọc hoặc tìm từ
                  khác.
                </p>
              )}

              {/* Nút Xem thêm */}
              {conThem > 0 && (
                <div className="px-5 pt-4 pb-2">
                  <button
                    type="button"
                    onClick={() => setGioiHanHienThi((prev) => prev + 6)}
                    className="w-full h-12 rounded-full border-[1.5px] border-den bg-trang font-sans text-[15px] font-semibold text-den cursor-pointer hover:bg-hong-nhat transition-colors"
                  >
                    Xem thêm {Math.min(6, conThem)} sản phẩm
                  </button>
                </div>
              )}

              <div className="h-6" />
            </>
          )}
        </div>

        {/* Thanh Tab 5 mục ở đáy */}
        <ThanhTab soLuongThich={daThich.length} soLuongGio={soLuongGio} />

        {/* Modal chi tiết sản phẩm */}
        <BangChiTiet
          sanPham={sanPhamChiTiet}
          dangMo={sanPhamChiTiet !== null}
          onDong={() => setSanPhamChiTiet(null)}
          onThich={() => {
            if (sanPhamChiTiet) {
              if (daThich.includes(sanPhamChiTiet.id)) {
                xoaDaThich(sanPhamChiTiet.id);
                setDaThich((prev) => prev.filter((id) => id !== sanPhamChiTiet.id));
              } else {
                themDaThich(sanPhamChiTiet.id);
                setDaThich((prev) => [sanPhamChiTiet.id, ...prev]);
              }
            }
          }}
          onThemGio={() => {
            if (sanPhamChiTiet) {
              xuLyThemVaoGio(sanPhamChiTiet);
            }
          }}
          daThich={
            sanPhamChiTiet !== null && daThich.includes(sanPhamChiTiet.id)
          }
        />
      </div>
    </KhungDienThoai>
  );
}

export default function TrangDanhMuc() {
  return (
    <Suspense fallback={null}>
      <DanhMucNoiDung />
    </Suspense>
  );
}
