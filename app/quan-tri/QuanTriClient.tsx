"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  cheDoThu,
  dangNhapNhanVien,
  dangXuatNhanVienLocal,
  layPhienNhanVienLocal,
  layTokenNhanVien,
  type PhienNhanVien,
} from "@/lib/nhan-vien/auth";
import { useDuLieu } from "@/lib/du-lieu-context";
import { dinhDangTien, chuanHoaTimKiem } from "@/lib/dinh-dang";
import type { Deal, SanPham, TrangThaiDeal } from "@/lib/data/types";
import type { DuLieuQuanTri } from "@/lib/admin/kho-quan-tri";
import type { KiotVietImportResult } from "@/lib/admin/kiotviet";
import { kiemTraBatDeal } from "@/lib/admin/deal-rules";
import {
  actionCapNhatDeal,
  actionCapNhatSanPham,
  actionGuiEmailThuQuanTri,
  actionTaiDuLieuQuanTri,
  actionXacNhanNhapTonKiotViet,
  actionXemTruocCsvKiotViet,
} from "./actions";

type TabQuanTri = "deal" | "san-pham" | "kiotviet" | "so-lieu" | "email";

function FormDangNhapQuanTri({
  onThanhCong,
}: {
  onThanhCong: (phien: PhienNhanVien) => void;
}) {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loi, setLoi] = useState<string | null>(null);
  const [dangXuLy, setDangXuLy] = useState(false);

  const xuLyGui = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangXuLy(true);
    try {
      const res = await dangNhapNhanVien(email, matKhau);
      if (res.ok && res.phien) {
        onThanhCong(res.phien);
      } else {
        setLoi(res.loi || "Email hoặc mật khẩu quản trị không đúng.");
      }
    } catch {
      setLoi("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setDangXuLy(false);
    }
  };

  const xuLyThuQuanTri = async () => {
    setLoi(null);
    setDangXuLy(true);
    const res = await dangNhapNhanVien("admin@vive.vn", "admin123");
    if (res.ok && res.phien) {
      onThanhCong(res.phien);
    }
    setDangXuLy(false);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto my-10 px-4">
      <div className="bg-trang rounded-[24px] p-6 md:p-8 border border-[#E8D2CC] shadow-sm flex flex-col items-center">
        <Image
          src="/brand/vive-logo-chu.png"
          alt="VIVE"
          width={76}
          height={28}
          className="h-auto mb-4"
        />
        <h1 className="text-[22px] font-bold text-den m-0 text-center">
          Quản trị VIVE Quẹt
        </h1>
        <p className="text-[14px] text-xam mt-1 mb-6 text-center">
          Đăng nhập bằng tài khoản quản trị (vai trò <code>quan_tri</code>) để
          quản lý sản phẩm, deal và tồn kho.
        </p>

        {loi && (
          <div
            role="alert"
            className="w-full rounded-[14px] bg-[#FDE8E8] border border-[#F8B4B4] p-3 text-[14px] text-[#9B1C1C] mb-4 text-center"
          >
            {loi}
          </div>
        )}

        <form onSubmit={xuLyGui} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-email"
              className="text-[14px] font-semibold text-den"
            >
              Email quản trị
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              placeholder="quanly@vive.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[48px] rounded-[14px] border-[1.5px] border-[#E8D2CC] px-3.5 text-[15px] text-den outline-none focus:border-den transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-password"
              className="text-[14px] font-semibold text-den"
            >
              Mật khẩu
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="h-[48px] rounded-[14px] border-[1.5px] border-[#E8D2CC] px-3.5 text-[15px] text-den outline-none focus:border-den transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={dangXuLy}
            className="min-h-[48px] rounded-full bg-den text-trang font-semibold text-[15px] cursor-pointer hover:bg-black transition-colors disabled:opacity-50"
          >
            {dangXuLy ? "Đang xác thực..." : "Đăng nhập quản trị"}
          </button>
        </form>

        {cheDoThu() && (
          <button
            type="button"
            onClick={xuLyThuQuanTri}
            disabled={dangXuLy}
            className="mt-4 w-full min-h-[44px] rounded-full bg-[#F7EEEB] text-den font-medium text-[13px] cursor-pointer hover:bg-[#E8D2CC]/60 transition-colors px-4"
          >
            Vào nhanh chế độ thử quản trị (admin@vive.vn)
          </button>
        )}
      </div>
    </div>
  );
}

function SanPhamRow({
  sp,
  dangXuLy,
  onLuu,
}: {
  sp: SanPham;
  dangXuLy: boolean;
  onLuu: (id: string, giaBan: number, ton: number, hienThi: boolean) => void;
}) {
  const [giaBan, setGiaBan] = useState(String(sp.gia_ban));
  const [ton, setTon] = useState(String(sp.ton ?? 0));
  const [hienThi, setHienThi] = useState(sp.hien_thi);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setGiaBan(String(sp.gia_ban));
    setTon(String(sp.ton ?? 0));
    setHienThi(sp.hien_thi);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [sp.gia_ban, sp.ton, sp.hien_thi]);

  const daThayDoi =
    Number(giaBan) !== sp.gia_ban ||
    Number(ton) !== (sp.ton ?? 0) ||
    hienThi !== sp.hien_thi;

  return (
    <article className="rounded-[18px] bg-trang border border-vien p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-xam">
            {sp.thuong_hieu} · {sp.id}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              sp.con_hang === "false"
                ? "bg-[#FDE8E8] text-[#9B1C1C]"
                : "bg-bac-ha text-den"
            }`}
          >
            {sp.con_hang === "false" ? "Hết hàng" : "Còn hàng"}
          </span>
          {!sp.hien_thi && (
            <span className="px-2 py-0.5 rounded-full bg-hong-nhat text-[11px] font-semibold text-xam-dam">
              Đang ẩn
            </span>
          )}
        </div>
        <h3 className="m-0 text-[15px] font-semibold text-den break-words">
          {sp.ten_hien_thi}
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-1.5 text-[13px] text-xam-dam">
          <span>Giá</span>
          <input
            type="number"
            min={1000}
            step={1000}
            aria-label={`Giá bán ${sp.ten_hien_thi}`}
            value={giaBan}
            onChange={(e) => setGiaBan(e.target.value)}
            className="w-[104px] h-[44px] rounded-[12px] border border-[#E8D2CC] px-2.5 text-[14px] text-den bg-trang"
          />
        </label>

        <label className="flex items-center gap-1.5 text-[13px] text-xam-dam">
          <span>Tồn</span>
          <input
            type="number"
            min={0}
            step={1}
            aria-label={`Tồn kho ${sp.ten_hien_thi}`}
            value={ton}
            onChange={(e) => setTon(e.target.value)}
            className="w-[78px] h-[44px] rounded-[12px] border border-[#E8D2CC] px-2.5 text-[14px] text-den bg-trang"
          />
        </label>

        <button
          type="button"
          onClick={() => setHienThi((v) => !v)}
          className={`min-h-[44px] px-3.5 rounded-full text-[13px] font-semibold cursor-pointer border transition-colors ${
            hienThi
              ? "bg-bac-ha border-bac-ha text-den"
              : "bg-hong-nhat border-[#E8D2CC] text-xam-dam"
          }`}
        >
          {hienThi ? "Đang hiện" : "Đang ẩn"}
        </button>

        <button
          type="button"
          disabled={!daThayDoi || dangXuLy}
          onClick={() =>
            onLuu(
              sp.id,
              Math.max(1000, parseInt(giaBan, 10) || sp.gia_ban),
              Math.max(0, parseInt(ton, 10) || 0),
              hienThi,
            )
          }
          className="min-h-[44px] px-4 rounded-full bg-den text-trang text-[13px] font-semibold cursor-pointer hover:bg-black disabled:opacity-40 transition-colors"
        >
          Lưu
        </button>
      </div>
    </article>
  );
}

export function QuanTriClient() {
  const { taiLaiDuLieu } = useDuLieu();
  const [phien, setPhien] = useState<PhienNhanVien | null>(null);
  const [daKiemTraPhien, setDaKiemTraPhien] = useState(false);

  const [duLieu, setDuLieu] = useState<DuLieuQuanTri | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [thongBao, setThongBao] = useState<{ loai: "ok" | "loi"; noiDung: string } | null>(
    null,
  );
  const [tab, setTab] = useState<TabQuanTri>("deal");
  const [isPending, startTransition] = useTransition();

  // Tìm kiếm & lọc sản phẩm
  const [tuKhoaSp, setTuKhoaSp] = useState("");
  const [locConHang, setLocConHang] = useState<"tat_ca" | "con" | "het">("tat_ca");

  // Nhập CSV KiotViet
  const [csvText, setCsvText] = useState("");
  const [xemTruocCsv, setXemTruocCsv] = useState<KiotVietImportResult | null>(null);

  // Email
  const [tieuDeEmail, setTieuDeEmail] = useState("Ưu đãi K-Beauty cuối tuần tại VIVE Booth");
  const [emailNhanThu, setEmailNhanThu] = useState("admin@vive.vn");
  const [noiDungEmail, setNoiDungEmail] = useState(
    "Chào bạn, booth VIVE tại LL2 Union Square đang có ưu đãi LOPOE giảm 25% khi mua kèm và quà tặng theo hóa đơn.",
  );

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setPhien(layPhienNhanVienLocal());
    setDaKiemTraPhien(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const onAuth = () => {
      setPhien(layPhienNhanVienLocal());
    };
    window.addEventListener("vive_staff_auth_changed", onAuth);
    return () => window.removeEventListener("vive_staff_auth_changed", onAuth);
  }, []);

  const napDuLieuQuanTri = useCallback(async () => {
    setDangTai(true);
    try {
      const token = await layTokenNhanVien();
      const kq = await actionTaiDuLieuQuanTri(token);
      setDuLieu(kq);
    } catch (err) {
      setThongBao({
        loai: "loi",
        noiDung:
          err instanceof Error
            ? err.message
            : "Không tải được dữ liệu quản trị.",
      });
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    if (phien?.vaiTro !== "quan_tri") return;
    let cancelled = false;
    layTokenNhanVien()
      .then((token) => actionTaiDuLieuQuanTri(token))
      .then((kq) => {
        if (!cancelled) setDuLieu(kq);
      })
      .catch((err) => {
        if (!cancelled) {
          setThongBao({
            loai: "loi",
            noiDung:
              err instanceof Error
                ? err.message
                : "Không tải được dữ liệu quản trị.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [phien]);

  const dongBoWebKhach = useCallback(async () => {
    await taiLaiDuLieu();
    window.dispatchEvent(new Event("vive_du_lieu_updated"));
  }, [taiLaiDuLieu]);

  const xuLyCapNhatDeal = (
    deal: Deal,
    thayDoi: { hienThi?: boolean; hetQua?: boolean; trangThai?: TrangThaiDeal },
  ) => {
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const moi = await actionCapNhatDeal(token, {
          id: deal.id,
          ...thayDoi,
        });
        setDuLieu((prev) =>
          prev
            ? {
                ...prev,
                deals: prev.deals.map((d) => (d.id === moi.id ? moi : d)),
              }
            : prev,
        );
        await napDuLieuQuanTri();
        await dongBoWebKhach();
        setThongBao({ loai: "ok", noiDung: `Đã cập nhật deal ${moi.ten}.` });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung: err instanceof Error ? err.message : "Lỗi cập nhật deal.",
        });
      }
    });
  };

  const xuLyLuuSanPham = (
    id: string,
    giaBan: number,
    ton: number,
    hienThi: boolean,
  ) => {
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const spMoi = await actionCapNhatSanPham(token, {
          id,
          giaBan,
          ton,
          hienThi,
        });
        setDuLieu((prev) =>
          prev
            ? {
                ...prev,
                sanPham: prev.sanPham.map((s) => (s.id === spMoi.id ? spMoi : s)),
              }
            : prev,
        );
        await napDuLieuQuanTri();
        await dongBoWebKhach();
        setThongBao({
          loai: "ok",
          noiDung: `Đã lưu ${spMoi.ten_hien_thi} (${dinhDangTien(spMoi.gia_ban)}, tồn ${spMoi.ton ?? 0}).`,
        });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung: err instanceof Error ? err.message : "Lỗi cập nhật sản phẩm.",
        });
      }
    });
  };

  const xuLyXemTruocCsv = (noiDung: string) => {
    setCsvText(noiDung);
    if (!noiDung.trim()) {
      setXemTruocCsv(null);
      return;
    }
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const kq = await actionXemTruocCsvKiotViet(token, noiDung);
        setXemTruocCsv(kq);
        if (!kq.thanhCong && kq.loi) {
          setThongBao({ loai: "loi", noiDung: kq.loi });
        }
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung: err instanceof Error ? err.message : "Không đọc được file CSV.",
        });
      }
    });
  };

  const xuLyXacNhanNhapTon = () => {
    if (!csvText.trim()) return;
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const { ketQua, sanPham } = await actionXacNhanNhapTonKiotViet(
          token,
          csvText,
        );
        setDuLieu((prev) => (prev ? { ...prev, sanPham } : prev));
        setXemTruocCsv(null);
        setCsvText("");
        await napDuLieuQuanTri();
        await dongBoWebKhach();
        setThongBao({
          loai: "ok",
          noiDung: `Đã cập nhật tồn cho ${ketQua.soLuongKhop} sản phẩm (${ketQua.soLuongVeKhong} mã hết hàng).`,
        });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung: err instanceof Error ? err.message : "Lỗi nhập tồn KiotViet.",
        });
      }
    });
  };

  const xuLyGuiEmail = (guiThat: boolean) => {
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const res = await actionGuiEmailThuQuanTri(token, {
          tieuDe: tieuDeEmail,
          noiDung: noiDungEmail,
          emailNhan: emailNhanThu,
          guiThat,
        });
        await napDuLieuQuanTri();
        setThongBao({ loai: "ok", noiDung: res.thongBao });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung: err instanceof Error ? err.message : "Lỗi gửi email.",
        });
      }
    });
  };

  const sanPhamLoc = useMemo(() => {
    if (!duLieu) return [];
    const q = chuanHoaTimKiem(tuKhoaSp.trim());
    return duLieu.sanPham.filter((sp) => {
      if (locConHang === "con" && sp.con_hang === "false") return false;
      if (locConHang === "het" && sp.con_hang !== "false") return false;
      if (!q) return true;
      return (
        chuanHoaTimKiem(sp.ten_hien_thi).includes(q) ||
        chuanHoaTimKiem(sp.thuong_hieu).includes(q) ||
        chuanHoaTimKiem(sp.id).includes(q)
      );
    });
  }, [duLieu, tuKhoaSp, locConHang]);

  if (!daKiemTraPhien) {
    return (
      <div className="w-full min-h-[360px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-den" />
      </div>
    );
  }

  if (!phien) {
    return (
      <FormDangNhapQuanTri
        onThanhCong={(phienMoi) => {
          setThongBao(null);
          setPhien(phienMoi);
        }}
      />
    );
  }

  if (phien.vaiTro !== "quan_tri") {
    return (
      <div className="w-full max-w-[480px] mx-auto my-12 px-4">
        <div
          role="alert"
          className="rounded-[24px] bg-[#FDE8E8] border border-[#F8B4B4] p-6 text-center flex flex-col items-center gap-4"
        >
          <h1 className="m-0 text-[20px] font-bold text-[#9B1C1C]">
            Không có quyền quản trị
          </h1>
          <p className="m-0 text-[14px] text-[#9B1C1C] leading-relaxed">
            Tài khoản <strong>{phien.email}</strong> đang có vai trò{" "}
            <code>{phien.vaiTro}</code>. Chỉ tài khoản <code>quan_tri</code> mới
            được truy cập bảng điều khiển này.
          </p>
          <button
            type="button"
            onClick={() => dangXuatNhanVienLocal()}
            className="min-h-[44px] px-6 rounded-full bg-den text-trang text-[14px] font-semibold cursor-pointer"
          >
            Đăng xuất để đổi tài khoản
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-5 md:py-8 flex flex-col gap-5">
      {/* Đầu trang quản trị (tách biệt menu khách) */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-vien">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/vive-logo-chu.png"
            alt="VIVE"
            width={68}
            height={26}
            className="h-auto"
          />
          <div>
            <h1 className="m-0 text-[20px] md:text-[24px] font-bold text-den">
              Quản trị VIVE Quẹt
            </h1>
            <p className="m-0 text-[13px] text-xam">
              {phien.ten} ({phien.email}) ·{" "}
              {duLieu?.cheDoDatabase === "supabase"
                ? "Kết nối Supabase"
                : "Kho server thử nghiệm"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/quan-tri/san-pham"
            className="min-h-[44px] px-4 rounded-full bg-hong text-den text-[13px] font-semibold inline-flex items-center no-underline hover:brightness-95 transition-all"
          >
            Kho sản phẩm song ngữ
          </Link>
          <button
            type="button"
            onClick={() => void napDuLieuQuanTri()}
            disabled={dangTai || isPending}
            className="min-h-[44px] px-4 rounded-full bg-hong-nhat text-den text-[13px] font-semibold cursor-pointer hover:bg-[#E8D2CC]/70 transition-colors"
          >
            {dangTai ? "Đang tải..." : "Làm mới"}
          </button>
          <button
            type="button"
            onClick={() => dangXuatNhanVienLocal()}
            className="min-h-[44px] px-4 rounded-full border border-den text-den text-[13px] font-semibold cursor-pointer hover:bg-hong-nhat transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {thongBao && (
        <div
          role={thongBao.loai === "loi" ? "alert" : "status"}
          className={`rounded-[16px] px-4 py-3 text-[14px] flex items-center justify-between gap-3 ${
            thongBao.loai === "loi"
              ? "bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C]"
              : "bg-bac-ha text-den"
          }`}
        >
          <span>{thongBao.noiDung}</span>
          <button
            type="button"
            onClick={() => setThongBao(null)}
            aria-label="Đóng thông báo"
            className="min-w-[36px] min-h-[36px] font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thanh chọn mục quản trị */}
      <nav
        aria-label="Mục quản trị"
        className="flex flex-wrap gap-2"
      >
        {(
          [
            { key: "deal", label: `Deal (${duLieu?.deals.length ?? 0})` },
            {
              key: "san-pham",
              label: `Sản phẩm (${duLieu?.sanPham.length ?? 0})`,
            },
            { key: "kiotviet", label: "Nhập tồn KiotViet" },
            { key: "so-lieu", label: "Số liệu & Lịch sử" },
            {
              key: "email",
              label: `Email (${duLieu?.danhSachEmail.length ?? 0})`,
            },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={tab === m.key}
            onClick={() => setTab(m.key)}
            className={`min-h-[44px] px-4 rounded-full text-[14px] font-semibold cursor-pointer transition-colors ${
              tab === m.key
                ? "bg-den text-trang"
                : "bg-hong-nhat text-den hover:bg-[#E8D2CC]/60"
            }`}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {!duLieu ? (
        <div className="p-8 text-center text-xam">Đang tải dữ liệu quản trị...</div>
      ) : (
        <main className="flex flex-col gap-5">
          {/* TAB 1: DEAL */}
          {tab === "deal" && (
            <section aria-label="Quản lý deal" className="flex flex-col gap-3">
              {duLieu.deals.map((d) => {
                const ktBat = kiemTraBatDeal(d, true);
                const biKhoaMayRui = !d.hien_thi && !ktBat.hopLe;

                return (
                  <article
                    key={d.id}
                    className="rounded-[20px] bg-trang border border-vien p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-xam">
                          {d.id} · {d.loai}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-hong-nhat text-[11px] font-semibold text-den">
                          {d.trang_thai}
                        </span>
                        {d.may_rui && !d.da_dang_ky && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold">
                            May rủi · Chưa đăng ký Sở CT
                          </span>
                        )}
                      </div>
                      <h2 className="m-0 text-[16px] font-bold text-den">
                        {d.ten}
                      </h2>
                      {d.dieu_kien && (
                        <p className="m-0 mt-1 text-[13px] text-xam">
                          {d.dieu_kien}
                        </p>
                      )}
                      {d.khi_het_qua?.uu_dai && (
                        <p className="m-0 mt-1 text-[12px] text-xam-dam">
                          Khi hết quà: {d.khi_het_qua.uu_dai}
                        </p>
                      )}
                      {!ktBat.hopLe && (
                        <p className="m-0 mt-1 text-[12px] text-[#9B1C1C]">
                          {ktBat.loi}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={biKhoaMayRui || isPending}
                        aria-label={`Hiển thị deal ${d.id}`}
                        aria-pressed={d.hien_thi}
                        onClick={() =>
                          xuLyCapNhatDeal(d, { hienThi: !d.hien_thi })
                        }
                        className={`min-h-[44px] px-4 rounded-full text-[13px] font-semibold border transition-colors ${
                          biKhoaMayRui
                            ? "bg-xam-nhat text-xam border-vien cursor-not-allowed opacity-60"
                            : d.hien_thi
                              ? "bg-bac-ha text-den border-bac-ha cursor-pointer"
                              : "bg-trang text-xam-dam border-[#E8D2CC] cursor-pointer"
                        }`}
                      >
                        {biKhoaMayRui
                          ? "Bị khóa (chưa đăng ký)"
                          : d.hien_thi
                            ? "Đang bật"
                            : "Đang tắt"}
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        aria-label={`Hết quà deal ${d.id}`}
                        aria-pressed={d.het_qua}
                        onClick={() =>
                          xuLyCapNhatDeal(d, { hetQua: !d.het_qua })
                        }
                        className={`min-h-[44px] px-4 rounded-full text-[13px] font-semibold cursor-pointer border transition-colors ${
                          d.het_qua
                            ? "bg-[#FDE8E8] border-[#F8B4B4] text-[#9B1C1C]"
                            : "bg-trang border-[#E8D2CC] text-den hover:bg-hong-nhat"
                        }`}
                      >
                        {d.het_qua ? "Đã hết quà" : "Còn quà"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* TAB 2: SẢN PHẨM */}
          {tab === "san-pham" && (
            <section
              aria-label="Quản lý sản phẩm"
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="search"
                  placeholder="Tìm sản phẩm, thương hiệu, mã..."
                  value={tuKhoaSp}
                  onChange={(e) => setTuKhoaSp(e.target.value)}
                  className="flex-1 min-h-[44px] rounded-[14px] bg-hong-nhat px-4 text-[14px] text-den outline-none focus:ring-2 focus:ring-den/20"
                />
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "tat_ca", label: "Tất cả" },
                      { id: "con", label: "Còn hàng" },
                      { id: "het", label: "Hết hàng" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setLocConHang(f.id)}
                      className={`min-h-[44px] px-4 rounded-full text-[13px] font-semibold cursor-pointer ${
                        locConHang === f.id
                          ? "bg-den text-trang"
                          : "bg-hong-nhat text-den"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {sanPhamLoc.slice(0, 40).map((sp) => (
                  <SanPhamRow
                    key={sp.id}
                    sp={sp}
                    dangXuLy={isPending}
                    onLuu={xuLyLuuSanPham}
                  />
                ))}
                {sanPhamLoc.length > 40 && (
                  <p className="text-[13px] text-xam text-center">
                    Đang hiển thị 40 / {sanPhamLoc.length} sản phẩm khớp. Gõ thêm
                    từ khóa để thu hẹp.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* TAB 3: NHẬP TỒN KIOTVIET */}
          {tab === "kiotviet" && (
            <section
              aria-label="Nhập tồn KiotViet"
              className="rounded-[22px] bg-hong-nhat/60 border border-vien p-5 flex flex-col gap-4"
            >
              <div>
                <h2 className="m-0 text-[18px] font-bold text-den">
                  Nhập CSV tồn kho từ KiotViet
                </h2>
                <p className="m-0 mt-1 text-[14px] text-xam-dam">
                  Tải file CSV có cột Mã hàng / Mã vạch và Tồn kho để xem trước
                  thay đổi trước khi ghi vào database.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="min-h-[44px] px-5 rounded-full bg-den text-trang text-[14px] font-semibold inline-flex items-center cursor-pointer hover:bg-black transition-colors">
                  <span>Chọn file CSV KiotViet</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      file.text().then((text) => xuLyXemTruocCsv(text));
                    }}
                  />
                </label>
              </div>

              <textarea
                aria-label="Nội dung CSV KiotViet"
                rows={5}
                placeholder="Hoặc dán trực tiếp nội dung CSV tại đây..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full rounded-[14px] bg-trang border border-[#E8D2CC] p-3 text-[13px] font-mono text-den outline-none focus:border-den"
              />

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={!csvText.trim() || isPending}
                  onClick={() => xuLyXemTruocCsv(csvText)}
                  className="min-h-[44px] px-5 rounded-full bg-trang border border-den text-den text-[14px] font-semibold cursor-pointer disabled:opacity-40"
                >
                  Xem trước thay đổi
                </button>
                {xemTruocCsv?.thanhCong && xemTruocCsv.thayDoi.length > 0 && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={xuLyXacNhanNhapTon}
                    className="min-h-[44px] px-5 rounded-full bg-den text-trang text-[14px] font-semibold cursor-pointer hover:bg-black"
                  >
                    Xác nhận cập nhật ({xemTruocCsv.soLuongKhop} món)
                  </button>
                )}
              </div>

              {xemTruocCsv && (
                <div className="rounded-[18px] bg-trang border border-vien p-4 flex flex-col gap-3">
                  <div className="flex flex-wrap gap-3 text-[13px] font-semibold text-den">
                    <span>Khớp: {xemTruocCsv.soLuongKhop} món</span>
                    <span>Về 0 (hết hàng): {xemTruocCsv.soLuongVeKhong}</span>
                    <span>Không khớp: {xemTruocCsv.khongKhop.length}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] border-collapse">
                      <thead>
                        <tr className="border-b border-vien text-xam">
                          <th className="py-2 pr-3">Mã hàng</th>
                          <th className="py-2 pr-3">Sản phẩm</th>
                          <th className="py-2 pr-3">Tồn cũ</th>
                          <th className="py-2 pr-3">Tồn mới</th>
                        </tr>
                      </thead>
                      <tbody>
                        {xemTruocCsv.thayDoi.map((td) => (
                          <tr key={td.sanPhamId} className="border-b border-vien/60">
                            <td className="py-2 pr-3 font-mono">{td.maHang}</td>
                            <td className="py-2 pr-3">{td.tenHang}</td>
                            <td className="py-2 pr-3">{td.tonCu}</td>
                            <td className="py-2 pr-3 font-bold">
                              {td.tonMoi}{" "}
                              {td.tonMoi === 0 && (
                                <span className="text-[#9B1C1C] font-normal">
                                  (Hết hàng)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 4: SỐ LIỆU & LỊCH SỬ */}
          {tab === "so-lieu" && (
            <section
              aria-label="Số liệu và lịch sử quản trị"
              className="flex flex-col gap-5"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Khách", val: duLieu.thongKe.tongKhach },
                  { label: "Lượt quẹt", val: duLieu.thongKe.tongLuotQuet },
                  { label: "Lượt thích", val: duLieu.thongKe.tongThich },
                  { label: "Đơn giữ hàng", val: duLieu.thongKe.donGiuHang },
                  {
                    label: "Tỷ lệ lấy",
                    val: `${duLieu.thongKe.tyLeLayPhanTram}%`,
                  },
                  {
                    label: "Đồng ý email",
                    val: duLieu.thongKe.khachDongYEmail,
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[18px] bg-hong-nhat p-4 flex flex-col gap-1"
                  >
                    <span className="text-[12px] text-xam font-medium">
                      {card.label}
                    </span>
                    <strong className="text-[22px] font-bold text-den">
                      {card.val}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="rounded-[20px] bg-trang border border-vien p-5 flex flex-col gap-3">
                <h2 className="m-0 text-[16px] font-bold text-den">
                  Lịch sử thao tác quản trị (bảng su_kien)
                </h2>
                {duLieu.lichSu.length === 0 ? (
                  <p className="m-0 text-[14px] text-xam">
                    Chưa có thay đổi nào được ghi trong phiên này.
                  </p>
                ) : (
                  <ul className="m-0 p-0 list-none flex flex-col gap-2">
                    {duLieu.lichSu.map((ls) => (
                      <li
                        key={ls.id}
                        className="rounded-[12px] bg-hong-nhat/50 px-3.5 py-2.5 text-[13px] text-den flex flex-col sm:flex-row sm:justify-between gap-1"
                      >
                        <span>{ls.moTa}</span>
                        <span className="text-[12px] text-xam shrink-0">
                          {new Date(ls.taoLuc).toLocaleString("vi-VN")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {/* TAB 5: EMAIL DEAL */}
          {tab === "email" && (
            <section
              aria-label="Gửi email deal"
              className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            >
              <div className="rounded-[20px] bg-trang border border-vien p-5 flex flex-col gap-3.5">
                <h2 className="m-0 text-[17px] font-bold text-den">
                  Soạn email thông báo deal
                </h2>
                <label className="flex flex-col gap-1 text-[13px] font-semibold">
                  <span>Tiêu đề</span>
                  <input
                    type="text"
                    value={tieuDeEmail}
                    onChange={(e) => setTieuDeEmail(e.target.value)}
                    className="h-[44px] rounded-[12px] border border-[#E8D2CC] px-3 text-[14px] font-normal"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold">
                  <span>Email nhận bản thử</span>
                  <input
                    type="email"
                    value={emailNhanThu}
                    onChange={(e) => setEmailNhanThu(e.target.value)}
                    className="h-[44px] rounded-[12px] border border-[#E8D2CC] px-3 text-[14px] font-normal"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] font-semibold">
                  <span>Nội dung</span>
                  <textarea
                    rows={4}
                    value={noiDungEmail}
                    onChange={(e) => setNoiDungEmail(e.target.value)}
                    className="rounded-[12px] border border-[#E8D2CC] p-3 text-[14px] font-normal"
                  />
                </label>
                <p className="m-0 text-[13px] text-xam italic">
                  Chưa gửi được email: cần tên miền và task W018.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={true}
                    onClick={() => xuLyGuiEmail(false)}
                    className="min-h-[44px] px-5 rounded-full bg-hong-nhat text-den text-[14px] font-semibold opacity-50 cursor-not-allowed"
                  >
                    Gửi thử cho mình
                  </button>
                  <button
                    type="button"
                    disabled={true}
                    onClick={() => xuLyGuiEmail(true)}
                    className="min-h-[44px] px-5 rounded-full bg-den text-trang text-[14px] font-semibold opacity-50 cursor-not-allowed"
                  >
                    Gửi email thật ({duLieu.danhSachEmail.length} khách)
                  </button>
                </div>
              </div>

              <div className="rounded-[20px] bg-hong-nhat/60 border border-vien p-5 flex flex-col gap-3">
                <h2 className="m-0 text-[17px] font-bold text-den">
                  Khách đã đồng ý nhận deal ({duLieu.danhSachEmail.length})
                </h2>
                {duLieu.danhSachEmail.length === 0 ? (
                  <p className="m-0 text-[14px] text-xam">
                    Chưa có khách nào đăng ký nhận email.
                  </p>
                ) : (
                  <ul className="m-0 p-0 list-none flex flex-col gap-2">
                    {duLieu.danhSachEmail.map((k, i) => (
                      <li
                        key={`${k.email}-${i}`}
                        className="rounded-[12px] bg-trang px-3.5 py-2.5 text-[13px] flex justify-between gap-2"
                      >
                        <span className="font-semibold text-den">
                          {k.ten || "Khách VIVE"}
                        </span>
                        <span className="text-xam break-all">{k.email}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}
