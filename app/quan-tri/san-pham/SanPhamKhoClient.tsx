"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import {
  cheDoThu,
  dangNhapNhanVien,
  dangXuatNhanVienLocal,
  layPhienNhanVienLocal,
  layTokenNhanVien,
  type PhienNhanVien,
} from "@/lib/nhan-vien/auth";
import { useDuLieu } from "@/lib/du-lieu-context";
import { duongDanAnh } from "@/lib/anh";
import { dinhDangTien } from "@/lib/dinh-dang";
import {
  DANH_MUC_HOP_LE,
  type DanhMuc,
} from "@/lib/data/types";
import {
  NHAN_DANH_MUC,
  NHAN_LOAI_DA,
  NHAN_VAN_DE,
} from "@/lib/nhan";
import {
  NHAN_TRUONG_SAN_PHAM,
  coTruongAiCanXem,
  laTruongDoAiDien,
  locDanhSachSanPhamKho,
  type LichSuSanPhamItem,
  type SanPhamKho,
  type ThayDoiSanPhamInput,
} from "@/lib/admin/san-pham-kho";
import { Nut, NutLink } from "@/components/ui/Nut";
import { The } from "@/components/ui/The";
import { Nhan, lopChip } from "@/components/ui/Nhan";
import {
  actionDanhDauDaXemAi,
  actionLayLichSuSanPham,
  actionSuaSanPhamKho,
  actionTaiSanPhamKho,
} from "./actions";

const MA_VAN_DE = Object.keys(NHAN_VAN_DE).filter((k) => k !== "co-the");
const MA_LOAI_DA = Object.keys(NHAN_LOAI_DA);

const CAC_TRUONG_NHAN_AI = [
  "ten_hien_thi",
  "ten_en",
  "mo_ta",
  "mo_ta_en",
  "van_de",
  "loai_da",
  "thanh_phan",
] as const;

interface FormSanPhamState {
  id: string;
  barcode: string;
  thuong_hieu: string;
  ten_goc: string;
  ten_hien_thi: string;
  ten_en: string;
  quy_cach: string;
  danh_muc: DanhMuc;
  van_de: string[];
  thanh_phan: string[];
  loai_da: string[];
  mo_ta: string;
  mo_ta_en: string;
  anh: string;
  ghi_chu: string;
  gia_goc: string;
  gia_ban: string;
  hien_thi: boolean;
}

function taoFormTuSanPham(sp?: SanPhamKho | null): FormSanPhamState {
  if (!sp) {
    return {
      id: "",
      barcode: "",
      thuong_hieu: "LOPOE",
      ten_goc: "",
      ten_hien_thi: "",
      ten_en: "",
      quy_cach: "",
      danh_muc: "tinh-chat",
      van_de: [],
      thanh_phan: [],
      loai_da: [],
      mo_ta: "",
      mo_ta_en: "",
      anh: "",
      ghi_chu: "",
      gia_goc: "",
      gia_ban: "100000",
      hien_thi: false,
    };
  }
  return {
    id: sp.id,
    barcode: sp.barcode || "",
    thuong_hieu: sp.thuong_hieu,
    ten_goc: sp.ten_goc,
    ten_hien_thi: sp.ten_hien_thi,
    ten_en: sp.ten_en || "",
    quy_cach: sp.quy_cach || "",
    danh_muc: sp.danh_muc,
    van_de: [...sp.van_de],
    thanh_phan: [...sp.thanh_phan],
    loai_da: [...sp.loai_da],
    mo_ta: sp.mo_ta || "",
    mo_ta_en: sp.mo_ta_en || "",
    anh: sp.anh || "",
    ghi_chu: sp.ghi_chu || "",
    gia_goc: sp.gia_goc !== null ? String(sp.gia_goc) : "",
    gia_ban: String(sp.gia_ban),
    hien_thi: sp.hien_thi,
  };
}

function dinhDangGiaTriLichSu(val: unknown): string {
  if (val === null || val === undefined || val === "") return "(trống)";
  if (Array.isArray(val)) return val.length > 0 ? val.join(", ") : "(trống)";
  if (typeof val === "boolean") return val ? "Đang hiện" : "Đang ẩn";
  return String(val);
}

function FormDangNhapKho({
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
        setLoi(res.loi || "Email hoặc mật khẩu không đúng.");
      }
    } catch {
      setLoi("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setDangXuLy(false);
    }
  };

  const xuLyThuNhanh = async (thuEmail: string, thuMatKhau: string) => {
    setLoi(null);
    setDangXuLy(true);
    const res = await dangNhapNhanVien(thuEmail, thuMatKhau);
    if (res.ok && res.phien) {
      onThanhCong(res.phien);
    } else if (res.loi) {
      setLoi(res.loi);
    }
    setDangXuLy(false);
  };

  return (
    <div className="w-full max-w-[460px] mx-auto my-10 px-4">
      <The className="p-6 md:p-8 flex flex-col items-center shadow-sm">
        <Image
          src="/brand/vive-logo-chu.png"
          alt="VIVE"
          width={76}
          height={28}
          className="h-auto mb-4"
        />
        <h1 className="m-0 text-[22px] font-bold text-den text-center">
          Kho sản phẩm song ngữ
        </h1>
        <p className="m-0 text-[14px] text-xam mt-1 mb-6 text-center">
          Đăng nhập bằng tài khoản vai trò <code>kho</code> hoặc{" "}
          <code>quan_tri</code> để sửa thông tin VI | EN và duyệt dữ liệu AI.
        </p>

        {loi && (
          <div
            role="alert"
            className="w-full rounded-[14px] bg-loi-nen border border-loi-vien p-3 text-[14px] text-loi mb-4 text-center"
          >
            {loi}
          </div>
        )}

        <form onSubmit={xuLyGui} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="kho-email"
              className="text-[14px] font-semibold text-den"
            >
              Email kho / quản trị
            </label>
            <input
              id="kho-email"
              type="email"
              required
              autoComplete="username"
              placeholder="kho@vive.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[48px] rounded-[14px] border border-vien px-3.5 text-[15px] text-den bg-trang outline-none focus:border-den transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="kho-password"
              className="text-[14px] font-semibold text-den"
            >
              Mật khẩu
            </label>
            <input
              id="kho-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="h-[48px] rounded-[14px] border border-vien px-3.5 text-[15px] text-den bg-trang outline-none focus:border-den transition-colors"
            />
          </div>

          <Nut
            type="submit"
            bien="dam"
            co="lon"
            rong
            disabled={dangXuLy}
          >
            {dangXuLy ? "Đang xác thực..." : "Đăng nhập kho / quản trị"}
          </Nut>
        </form>

        {cheDoThu() && (
          <div className="w-full mt-4 flex flex-col gap-2">
            <Nut
              bien="phu"
              co="vua"
              rong
              onClick={() => void xuLyThuNhanh("kho@vive.vn", "kho123")}
              disabled={dangXuLy}
            >
              Vào nhanh vai trò Kho (kho@vive.vn)
            </Nut>
            <Nut
              bien="phu"
              co="vua"
              rong
              onClick={() => void xuLyThuNhanh("admin@vive.vn", "admin123")}
              disabled={dangXuLy}
            >
              Vào nhanh vai trò Quản trị (admin@vive.vn)
            </Nut>
          </div>
        )}
      </The>
    </div>
  );
}

function NhanAiVaDaXem({
  sp,
  truong,
  dangXuLy,
  onDaXem,
}: {
  sp: SanPhamKho | null;
  truong: string;
  dangXuLy: boolean;
  onDaXem: (truong: string) => void;
}) {
  if (!sp || !laTruongDoAiDien(sp, truong)) return null;
  const chiTiet = sp.nguon_truong?.[truong];

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        data-testid={`nhan-ai-${truong}`}
        className="inline-flex items-center h-6 px-2 rounded-full bg-vang-nhat text-den text-[11px] font-bold"
      >
        AI
      </span>
      {chiTiet?.url && (
        <a
          href={chiTiet.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-xam-dam underline"
        >
          Nguồn
        </a>
      )}
      <button
        type="button"
        data-testid={`da-xem-${truong}`}
        disabled={dangXuLy}
        onClick={() => onDaXem(truong)}
        className="min-h-[32px] px-2.5 rounded-full bg-kem text-den text-[12px] font-semibold border border-vien hover:bg-oliu-nhat cursor-pointer disabled:opacity-50"
      >
        Đã xem
      </button>
    </span>
  );
}

export function SanPhamKhoClient() {
  const { taiLaiDuLieu } = useDuLieu();
  const [phien, setPhien] = useState<PhienNhanVien | null>(null);
  const [daKiemTraPhien, setDaKiemTraPhien] = useState(false);

  const [sanPham, setSanPham] = useState<SanPhamKho[]>([]);
  const [lichSuTatCa, setLichSuTatCa] = useState<LichSuSanPhamItem[]>([]);
  const [lichSuMonDangSua, setLichSuMonDangSua] = useState<
    LichSuSanPhamItem[]
  >([]);
  const [cheDoDb, setCheDoDb] = useState<"supabase" | "dev_memory">(
    "dev_memory",
  );
  const [dangTai, setDangTai] = useState(false);
  const [thongBao, setThongBao] = useState<{
    loai: "ok" | "loi";
    noiDung: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Tìm kiếm & bộ lọc (docs/07 §4.1)
  const [tuKhoa, setTuKhoa] = useState("");
  const [thuongHieuLoc, setThuongHieuLoc] = useState("tat_ca");
  const [locThieuEn, setLocThieuEn] = useState(false);
  const [locAiCanXem, setLocAiCanXem] = useState(false);
  const [locThieuAnh, setLocThieuAnh] = useState(false);
  const [ngonNguXem, setNgonNguXem] = useState<"vi" | "en">("vi");

  // Trình sửa 1 sản phẩm
  const [dangMoTrinhSua, setDangMoTrinhSua] = useState(false);
  const [dangTaoMoi, setDangTaoMoi] = useState(false);
  const [spDangSuaId, setSpDangSuaId] = useState<string | null>(null);
  const [tabSua, setTabSua] = useState<"thong-tin" | "lich-su">("thong-tin");
  const [form, setForm] = useState<FormSanPhamState>(() => taoFormTuSanPham());
  const [thanhPhanMoi, setThanhPhanMoi] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setPhien(layPhienNhanVienLocal());
    setDaKiemTraPhien(true);
    const cookieLang = document.cookie
      .split("; ")
      .find((c) => c.startsWith("vive_lang="))
      ?.split("=")[1];
    if (cookieLang === "en") setNgonNguXem("en");
    /* eslint-enable react-hooks/set-state-in-effect */

    const onAuth = () => setPhien(layPhienNhanVienLocal());
    window.addEventListener("vive_staff_auth_changed", onAuth);
    return () => window.removeEventListener("vive_staff_auth_changed", onAuth);
  }, []);

  const doiNgonNguXem = (ngonNgu: "vi" | "en") => {
    setNgonNguXem(ngonNgu);
    document.cookie = `vive_lang=${ngonNgu}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const coQuyenKho = phien?.vaiTro === "kho" || phien?.vaiTro === "quan_tri";

  const napDuLieu = useCallback(async () => {
    setDangTai(true);
    try {
      const token = await layTokenNhanVien();
      const kq = await actionTaiSanPhamKho(token);
      setSanPham(kq.sanPham);
      setLichSuTatCa(kq.lichSu);
      setCheDoDb(kq.cheDoDatabase);
    } catch (err) {
      setThongBao({
        loai: "loi",
        noiDung:
          err instanceof Error
            ? err.message
            : "Không tải được danh sách sản phẩm kho.",
      });
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    if (!coQuyenKho) return;
    let cancelled = false;
    layTokenNhanVien()
      .then((token) => actionTaiSanPhamKho(token))
      .then((kq) => {
        if (cancelled) return;
        setSanPham(kq.sanPham);
        setLichSuTatCa(kq.lichSu);
        setCheDoDb(kq.cheDoDatabase);
      })
      .catch((err) => {
        if (cancelled) return;
        setThongBao({
          loai: "loi",
          noiDung:
            err instanceof Error
              ? err.message
              : "Không tải được danh sách sản phẩm kho.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [coQuyenKho]);

  const danhSachThuongHieu = useMemo(() => {
    return Array.from(new Set(sanPham.map((sp) => sp.thuong_hieu))).sort();
  }, [sanPham]);

  const danhSachHienThi = useMemo(() => {
    return locDanhSachSanPhamKho(sanPham, {
      tuKhoa,
      thuongHieu: thuongHieuLoc,
      thieuEn: locThieuEn,
      aiCanXem: locAiCanXem,
      thieuAnh: locThieuAnh,
    });
  }, [
    sanPham,
    tuKhoa,
    thuongHieuLoc,
    locThieuEn,
    locAiCanXem,
    locThieuAnh,
  ]);

  const spDangSua = useMemo(() => {
    if (dangTaoMoi || !spDangSuaId) return null;
    return sanPham.find((sp) => sp.id === spDangSuaId) ?? null;
  }, [dangTaoMoi, spDangSuaId, sanPham]);

  const moSuaSanPham = (sp: SanPhamKho) => {
    setDangTaoMoi(false);
    setSpDangSuaId(sp.id);
    setForm(taoFormTuSanPham(sp));
    setThanhPhanMoi("");
    setTabSua("thong-tin");
    setLichSuMonDangSua(
      lichSuTatCa.filter((ls) => ls.san_pham_id === sp.id),
    );
    setDangMoTrinhSua(true);

    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const lsMoi = await actionLayLichSuSanPham(token, sp.id);
        setLichSuMonDangSua(lsMoi);
      } catch {
        // giữ danh sách lịch sử hiện có
      }
    });
  };

  const moTaoSanPhamMoi = () => {
    setDangTaoMoi(true);
    setSpDangSuaId(null);
    setForm(taoFormTuSanPham(null));
    setThanhPhanMoi("");
    setTabSua("thong-tin");
    setLichSuMonDangSua([]);
    setDangMoTrinhSua(true);
  };

  const dongTrinhSua = () => {
    setDangMoTrinhSua(false);
    setDangTaoMoi(false);
    setSpDangSuaId(null);
  };

  const toggleTrongMang = (khoa: "van_de" | "loai_da", giaTri: string) => {
    setForm((prev) => {
      const daCo = prev[khoa].includes(giaTri);
      return {
        ...prev,
        [khoa]: daCo
          ? prev[khoa].filter((x) => x !== giaTri)
          : [...prev[khoa], giaTri],
      };
    });
  };

  const themThanhPhan = () => {
    const sach = thanhPhanMoi.trim();
    if (!sach) return;
    setForm((prev) => ({
      ...prev,
      thanh_phan: prev.thanh_phan.includes(sach)
        ? prev.thanh_phan
        : [...prev.thanh_phan, sach],
    }));
    setThanhPhanMoi("");
  };

  const xuLyLuuSanPham = (e: React.FormEvent) => {
    e.preventDefault();
    const id = form.id.trim();
    if (!id) {
      setThongBao({ loai: "loi", noiDung: "Vui lòng nhập mã sản phẩm." });
      return;
    }

    const laQuanTri = phien?.vaiTro === "quan_tri";
    const thayDoi: ThayDoiSanPhamInput = {
      barcode: form.barcode.trim() || null,
      thuong_hieu: form.thuong_hieu.trim() || "LOPOE",
      ten_goc: form.ten_goc.trim() || form.ten_hien_thi.trim() || id,
      ten_hien_thi: form.ten_hien_thi.trim() || form.ten_goc.trim() || id,
      ten_en: form.ten_en.trim() || null,
      quy_cach: form.quy_cach.trim() || null,
      danh_muc: form.danh_muc,
      van_de: form.van_de,
      thanh_phan: form.thanh_phan,
      loai_da: form.loai_da,
      mo_ta: form.mo_ta.trim() || null,
      mo_ta_en: form.mo_ta_en.trim() || null,
      anh: form.anh.trim() || null,
      ghi_chu: form.ghi_chu.trim() || null,
    };

    if (laQuanTri) {
      const giaBanNum = parseInt(form.gia_ban, 10);
      if (Number.isInteger(giaBanNum) && giaBanNum > 0) {
        thayDoi.gia_ban = giaBanNum;
      }
      if (form.gia_goc.trim()) {
        const giaGocNum = parseInt(form.gia_goc, 10);
        if (Number.isInteger(giaGocNum) && giaGocNum > 0) {
          thayDoi.gia_goc = giaGocNum;
        }
      } else {
        thayDoi.gia_goc = null;
      }
      thayDoi.hien_thi = form.hien_thi;
    }

    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const kq = await actionSuaSanPhamKho(token, { id, thayDoi });
        setSanPham((prev) => {
          const tonTai = prev.some((x) => x.id === kq.sanPham.id);
          if (!tonTai) return [kq.sanPham, ...prev];
          return prev.map((x) => (x.id === kq.sanPham.id ? kq.sanPham : x));
        });
        setLichSuMonDangSua(kq.lichSu);
        setDangTaoMoi(false);
        setSpDangSuaId(kq.sanPham.id);
        setForm(taoFormTuSanPham(kq.sanPham));
        await napDuLieu();
        await taiLaiDuLieu();
        window.dispatchEvent(new Event("vive_du_lieu_updated"));
        setThongBao({
          loai: "ok",
          noiDung: `Đã lưu thông tin ${kq.sanPham.ten_hien_thi}.`,
        });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung:
            err instanceof Error ? err.message : "Không lưu được sản phẩm.",
        });
      }
    });
  };

  const xuLyDaXemAi = (cacTruong: string[]) => {
    if (!spDangSua || cacTruong.length === 0) return;
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const kq = await actionDanhDauDaXemAi(token, {
          id: spDangSua.id,
          cacTruong,
        });
        setSanPham((prev) =>
          prev.map((x) => (x.id === kq.sanPham.id ? kq.sanPham : x)),
        );
        setThongBao({
          loai: "ok",
          noiDung: `Đã xác nhận trường AI cho mã ${kq.sanPham.id}.`,
        });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung:
            err instanceof Error
              ? err.message
              : "Không cập nhật được trạng thái Đã xem.",
        });
      }
    });
  };

  if (!daKiemTraPhien) {
    return (
      <div className="w-full min-h-[360px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-den" />
      </div>
    );
  }

  if (!phien) {
    return (
      <FormDangNhapKho
        onThanhCong={(phienMoi) => {
          setThongBao(null);
          setPhien(phienMoi);
        }}
      />
    );
  }

  if (!coQuyenKho) {
    return (
      <div className="w-full max-w-[480px] mx-auto my-12 px-4">
        <div
          role="alert"
          className="rounded-[24px] bg-loi-nen border border-loi-vien p-6 text-center flex flex-col items-center gap-4"
        >
          <h1 className="m-0 text-[20px] font-bold text-loi">
            Không có quyền truy cập trang kho
          </h1>
          <p className="m-0 text-[14px] text-loi leading-relaxed">
            Tài khoản <strong>{phien.email}</strong> đang có vai trò{" "}
            <code>{phien.vaiTro}</code>. Chỉ tài khoản <code>kho</code> hoặc{" "}
            <code>quan_tri</code> mới được sửa thông tin sản phẩm song ngữ.
          </p>
          <Nut bien="dam" onClick={() => dangXuatNhanVienLocal()}>
            Đăng xuất để đổi tài khoản
          </Nut>
        </div>
      </div>
    );
  }

  const cacTruongAiCuaMonDangSua = spDangSua
    ? CAC_TRUONG_NHAN_AI.filter((t) => laTruongDoAiDien(spDangSua, t))
    : [];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-5 md:py-8 flex flex-col gap-5">
      {/* Đầu trang kho */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-vien">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/brand/vive-logo-chu.png"
            alt="VIVE"
            width={68}
            height={26}
            className="h-auto shrink-0"
          />
          <div className="min-w-0">
            <h1 className="m-0 text-[20px] md:text-[24px] font-bold text-den">
              Kho sản phẩm song ngữ
            </h1>
            <p className="m-0 text-[13px] text-xam-dam truncate">
              {phien.ten} ({phien.email}) · vai trò:{" "}
              <code>{phien.vaiTro}</code> ·{" "}
              {cheDoDb === "supabase" ? "Supabase" : "Kho thử dev"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Chế độ xem ngôn ngữ trên web"
            data-testid="che-do-ngon-ngu-xem"
            className="inline-flex items-center rounded-full bg-nen-phu p-1 gap-1"
          >
            <button
              type="button"
              onClick={() => doiNgonNguXem("vi")}
              aria-pressed={ngonNguXem === "vi"}
              className={`min-h-[36px] px-3 rounded-full text-[13px] font-semibold border-0 cursor-pointer transition-colors ${
                ngonNguXem === "vi" ? "bg-hong text-den" : "bg-transparent text-xam-dam"
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => doiNgonNguXem("en")}
              aria-pressed={ngonNguXem === "en"}
              className={`min-h-[36px] px-3 rounded-full text-[13px] font-semibold border-0 cursor-pointer transition-colors ${
                ngonNguXem === "en" ? "bg-hong text-den" : "bg-transparent text-xam-dam"
              }`}
            >
              EN
            </button>
          </div>

          <Nut bien="chinh" onClick={moTaoSanPhamMoi}>
            + Thêm mã mới
          </Nut>
          {phien.vaiTro === "quan_tri" && (
            <NutLink href="/quan-tri" bien="phu">
              Bảng quản trị
            </NutLink>
          )}
          <Nut
            bien="phu"
            onClick={() => void napDuLieu()}
            disabled={dangTai || isPending}
          >
            {dangTai ? "Đang tải..." : "Làm mới"}
          </Nut>
          <Nut bien="phu" onClick={() => dangXuatNhanVienLocal()}>
            Đăng xuất
          </Nut>
        </div>
      </header>

      {thongBao && (
        <div
          role={thongBao.loai === "loi" ? "alert" : "status"}
          className={`rounded-[16px] px-4 py-3 text-[14px] flex items-center justify-between gap-3 ${
            thongBao.loai === "loi"
              ? "bg-loi-nen border border-loi-vien text-loi"
              : "bg-be text-den"
          }`}
        >
          <span>{thongBao.noiDung}</span>
          <button
            type="button"
            onClick={() => setThongBao(null)}
            aria-label="Đóng thông báo"
            className="min-w-[36px] min-h-[36px] font-bold cursor-pointer bg-transparent border-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thanh tìm kiếm & bộ lọc */}
      <The nen="hong" className="p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="search"
            aria-label="Tìm tên hoặc mã vạch"
            placeholder="Tìm tên sản phẩm hoặc mã vạch..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            className="flex-1 min-w-0 h-[44px] rounded-full border border-vien bg-trang px-4 text-[14px] text-den outline-none focus:border-den"
          />

          <select
            aria-label="Lọc theo thương hiệu"
            value={thuongHieuLoc}
            onChange={(e) => setThuongHieuLoc(e.target.value)}
            className="h-[44px] rounded-full border border-vien bg-trang px-4 text-[14px] text-den outline-none cursor-pointer"
          >
            <option value="tat_ca">Tất cả thương hiệu</option>
            {danhSachThuongHieu.map((th) => (
              <option key={th} value={th}>
                {th}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="loc-thieu-en"
            aria-pressed={locThieuEn}
            onClick={() => setLocThieuEn((v) => !v)}
            className={lopChip(locThieuEn)}
          >
            Thiếu tiếng Anh
          </button>
          <button
            type="button"
            data-testid="loc-ai-can-xem"
            aria-pressed={locAiCanXem}
            onClick={() => setLocAiCanXem((v) => !v)}
            className={lopChip(locAiCanXem)}
          >
            AI – cần xem
          </button>
          <button
            type="button"
            data-testid="loc-thieu-anh"
            aria-pressed={locThieuAnh}
            onClick={() => setLocThieuAnh((v) => !v)}
            className={lopChip(locThieuAnh)}
          >
            Thiếu ảnh
          </button>

          <span className="ml-auto text-[13px] text-xam-dam">
            Hiển thị <strong>{danhSachHienThi.length}</strong> /{" "}
            {sanPham.length} mã
          </span>
        </div>
      </The>

      {/* Danh sách sản phẩm */}
      <div className="flex flex-col gap-3">
        {danhSachHienThi.map((sp) => {
          const urlAnh = duongDanAnh(sp.anh, "nho");
          const coAi = coTruongAiCanXem(sp);
          const tenTheoNgonNgu =
            ngonNguXem === "en" ? sp.ten_en || sp.ten_hien_thi : sp.ten_hien_thi;

          return (
            <The
              key={sp.id}
              className="p-3.5 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="w-14 h-14 rounded-[14px] bg-kem border border-vien shrink-0 flex items-center justify-center overflow-hidden">
                  {urlAnh ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlAnh}
                      alt={sp.ten_hien_thi}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-xam-dam text-center px-1">
                      Thiếu ảnh
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.6px] text-xam-dam">
                      {sp.thuong_hieu} · {sp.id}
                    </span>
                    {sp.barcode && (
                      <span className="text-[11px] text-xam">
                        ({sp.barcode})
                      </span>
                    )}
                    {coAi && (
                      <span className="inline-flex items-center h-5 px-2 rounded-full bg-vang-nhat text-den text-[11px] font-bold">
                        AI
                      </span>
                    )}
                    {(!sp.ten_en || !sp.mo_ta_en) && (
                      <Nhan mau="phu">Thiếu EN</Nhan>
                    )}
                    {!sp.hien_thi && <Nhan mau="phu">Đang ẩn</Nhan>}
                  </div>

                  <h2
                    data-testid={`ten-sp-${sp.id}`}
                    className="m-0 text-[15px] font-semibold text-den break-words"
                  >
                    {tenTheoNgonNgu}
                  </h2>

                  <p className="m-0 text-[13px] text-xam-dam break-words mt-0.5">
                    {ngonNguXem === "en"
                      ? sp.mo_ta_en || sp.mo_ta || sp.ten_hien_thi
                      : sp.ten_en
                        ? `EN: ${sp.ten_en}`
                        : "EN: (chưa có tên tiếng Anh)"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-[14px] font-bold text-den whitespace-nowrap">
                  {dinhDangTien(sp.gia_ban)}
                </span>
                <Nut
                  bien="chinh"
                  co="vua"
                  aria-label={`Sửa ${sp.id}`}
                  onClick={() => moSuaSanPham(sp)}
                >
                  Sửa
                </Nut>
              </div>
            </The>
          );
        })}

        {danhSachHienThi.length === 0 && (
          <The className="p-8 text-center text-[14px] text-xam-dam">
            Không có sản phẩm nào khớp bộ lọc.
          </The>
        )}
      </div>

      {/* Khung sửa 1 sản phẩm (VI | EN + tab Lịch sử) */}
      {dangMoTrinhSua && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            dangTaoMoi
              ? "Thêm mã sản phẩm mới"
              : `Sửa thông tin sản phẩm ${form.id}`
          }
          className="fixed inset-0 z-50 bg-den/40 flex items-center justify-center p-2 sm:p-4"
          onClick={dongTrinhSua}
        >
          <div
            className="w-full max-w-[920px] max-h-[92dvh] bg-trang rounded-[24px] shadow-2xl border border-vien flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Đầu hộp thoại */}
            <div className="px-4 sm:px-6 py-4 border-b border-vien flex flex-wrap items-center justify-between gap-2 bg-kem shrink-0">
              <div className="min-w-0">
                <h2 className="m-0 text-[18px] font-bold text-den">
                  {dangTaoMoi
                    ? "Thêm mã sản phẩm mới"
                    : `${form.ten_hien_thi} (${form.id})`}
                </h2>
                <p className="m-0 text-[12px] text-xam-dam">
                  {phien.vaiTro === "kho"
                    ? "Vai trò kho: sửa thông tin song ngữ (không sửa giá/hiển thị; mã mới mặc định ẩn)"
                    : "Vai trò quản trị: sửa toàn bộ thông tin"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {cacTruongAiCuaMonDangSua.length > 0 && (
                  <Nut
                    bien="phu"
                    co="nho"
                    disabled={isPending}
                    onClick={() => xuLyDaXemAi([...cacTruongAiCuaMonDangSua])}
                  >
                    Đã xem tất cả AI ({cacTruongAiCuaMonDangSua.length})
                  </Nut>
                )}
                <Nut bien="phu" co="nho" onClick={dongTrinhSua}>
                  Đóng
                </Nut>
              </div>
            </div>

            {/* Tab: Sửa thông tin | Lịch sử */}
            <div
              role="tablist"
              aria-label="Mục chỉnh sửa sản phẩm"
              className="px-4 sm:px-6 pt-3 flex gap-2 border-b border-vien bg-trang shrink-0"
            >
              <button
                type="button"
                role="tab"
                data-testid="tab-sua-thong-tin"
                aria-selected={tabSua === "thong-tin"}
                onClick={() => setTabSua("thong-tin")}
                className={`min-h-[44px] px-4 text-[14px] font-semibold border-0 border-b-2 bg-transparent cursor-pointer ${
                  tabSua === "thong-tin"
                    ? "border-den text-den"
                    : "border-transparent text-xam"
                }`}
              >
                Sửa thông tin
              </button>
              <button
                type="button"
                role="tab"
                data-testid="tab-lich-su"
                aria-selected={tabSua === "lich-su"}
                onClick={() => setTabSua("lich-su")}
                className={`min-h-[44px] px-4 text-[14px] font-semibold border-0 border-b-2 bg-transparent cursor-pointer ${
                  tabSua === "lich-su"
                    ? "border-den text-den"
                    : "border-transparent text-xam"
                }`}
              >
                Lịch sử ({lichSuMonDangSua.length})
              </button>
            </div>

            {/* Nội dung hộp thoại */}
            <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
              {tabSua === "thong-tin" ? (
                <form
                  onSubmit={xuLyLuuSanPham}
                  className="flex flex-col gap-5"
                >
                  {/* Mã, mã vạch, thương hiệu, quy cách */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-den">
                      <span>Mã sản phẩm (ID)</span>
                      <input
                        type="text"
                        required
                        disabled={!dangTaoMoi}
                        value={form.id}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, id: e.target.value }))
                        }
                        placeholder="VD: LOPOE-NEW-01"
                        className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang disabled:bg-nen-phu"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-den">
                      <span>Mã vạch</span>
                      <input
                        type="text"
                        value={form.barcode}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, barcode: e.target.value }))
                        }
                        className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-den">
                      <span>Thương hiệu</span>
                      <input
                        type="text"
                        required
                        value={form.thuong_hieu}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            thuong_hieu: e.target.value,
                          }))
                        }
                        className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-den">
                      <span>Quy cách</span>
                      <input
                        type="text"
                        value={form.quy_cach}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, quy_cach: e.target.value }))
                        }
                        placeholder="50ml, 10 miếng..."
                        className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                      />
                    </label>
                  </div>

                  {/* 2 cột song ngữ VI | EN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cột VI */}
                    <div className="rounded-[16px] bg-kem p-4 flex flex-col gap-3 border border-vien">
                      <h3 className="m-0 text-[14px] font-bold text-den uppercase tracking-[0.6px]">
                        Tiếng Việt (VI)
                      </h3>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="sua-ten-vi"
                            className="text-[13px] font-semibold text-den"
                          >
                            Tên hiển thị (VI)
                          </label>
                          <NhanAiVaDaXem
                            sp={spDangSua}
                            truong="ten_hien_thi"
                            dangXuLy={isPending}
                            onDaXem={(tr) => xuLyDaXemAi([tr])}
                          />
                        </div>
                        <input
                          id="sua-ten-vi"
                          type="text"
                          required
                          value={form.ten_hien_thi}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              ten_hien_thi: e.target.value,
                            }))
                          }
                          className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="sua-mo-ta-vi"
                            className="text-[13px] font-semibold text-den"
                          >
                            Mô tả (VI)
                          </label>
                          <NhanAiVaDaXem
                            sp={spDangSua}
                            truong="mo_ta"
                            dangXuLy={isPending}
                            onDaXem={(tr) => xuLyDaXemAi([tr])}
                          />
                        </div>
                        <textarea
                          id="sua-mo-ta-vi"
                          rows={4}
                          value={form.mo_ta}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, mo_ta: e.target.value }))
                          }
                          className="rounded-[12px] border border-vien p-3 text-[14px] bg-trang resize-y"
                        />
                      </div>
                    </div>

                    {/* Cột EN */}
                    <div className="rounded-[16px] bg-oliu-nhat p-4 flex flex-col gap-3 border border-vien">
                      <h3 className="m-0 text-[14px] font-bold text-den uppercase tracking-[0.6px]">
                        Tiếng Anh (EN)
                      </h3>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="sua-ten-en"
                            className="text-[13px] font-semibold text-den"
                          >
                            Tên tiếng Anh (EN)
                          </label>
                          <NhanAiVaDaXem
                            sp={spDangSua}
                            truong="ten_en"
                            dangXuLy={isPending}
                            onDaXem={(tr) => xuLyDaXemAi([tr])}
                          />
                        </div>
                        <input
                          id="sua-ten-en"
                          type="text"
                          value={form.ten_en}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, ten_en: e.target.value }))
                          }
                          placeholder="English product display name"
                          className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <label
                            htmlFor="sua-mo-ta-en"
                            className="text-[13px] font-semibold text-den"
                          >
                            Mô tả tiếng Anh (EN)
                          </label>
                          <NhanAiVaDaXem
                            sp={spDangSua}
                            truong="mo_ta_en"
                            dangXuLy={isPending}
                            onDaXem={(tr) => xuLyDaXemAi([tr])}
                          />
                        </div>
                        <textarea
                          id="sua-mo-ta-en"
                          rows={4}
                          value={form.mo_ta_en}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              mo_ta_en: e.target.value,
                            }))
                          }
                          placeholder="Short English description"
                          className="rounded-[12px] border border-vien p-3 text-[14px] bg-trang resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phân loại & tên gốc */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-den">
                      <span>Phân loại</span>
                      <select
                        aria-label="Phân loại"
                        value={form.danh_muc}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            danh_muc: e.target.value as DanhMuc,
                          }))
                        }
                        className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                      >
                        {DANH_MUC_HOP_LE.map((dm) => (
                          <option key={dm} value={dm}>
                            {NHAN_DANH_MUC[dm] || dm} ({dm})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-[13px] font-semibold text-den">
                      <span>Tên gốc sản phẩm (INCI/nhãn, không dịch)</span>
                      <input
                        type="text"
                        value={form.ten_goc}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, ten_goc: e.target.value }))
                        }
                        className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                      />
                    </label>
                  </div>

                  {/* Vấn đề da */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-den">
                        Vấn đề da
                      </span>
                      <NhanAiVaDaXem
                        sp={spDangSua}
                        truong="van_de"
                        dangXuLy={isPending}
                        onDaXem={(tr) => xuLyDaXemAi([tr])}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MA_VAN_DE.map((vd) => {
                        const dangChon = form.van_de.includes(vd);
                        return (
                          <button
                            key={vd}
                            type="button"
                            aria-pressed={dangChon}
                            onClick={() => toggleTrongMang("van_de", vd)}
                            className={lopChip(dangChon)}
                          >
                            {NHAN_VAN_DE[vd] || vd}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Loại da */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-den">
                        Loại da
                      </span>
                      <NhanAiVaDaXem
                        sp={spDangSua}
                        truong="loai_da"
                        dangXuLy={isPending}
                        onDaXem={(tr) => xuLyDaXemAi([tr])}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MA_LOAI_DA.map((ld) => {
                        const dangChon = form.loai_da.includes(ld);
                        return (
                          <button
                            key={ld}
                            type="button"
                            aria-pressed={dangChon}
                            onClick={() => toggleTrongMang("loai_da", ld)}
                            className={lopChip(dangChon)}
                          >
                            {NHAN_LOAI_DA[ld] || ld}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thành phần dạng thẻ */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-den">
                        Thành phần (INCI)
                      </span>
                      <NhanAiVaDaXem
                        sp={spDangSua}
                        truong="thanh_phan"
                        dangXuLy={isPending}
                        onDaXem={(tr) => xuLyDaXemAi([tr])}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.thanh_phan.map((tp) => (
                        <button
                          key={tp}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              thanh_phan: p.thanh_phan.filter((x) => x !== tp),
                            }))
                          }
                          aria-label={`Xóa thành phần ${tp}`}
                          className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-full bg-nen-phu text-den text-[13px] border-0 cursor-pointer hover:bg-hong"
                        >
                          <span>{tp}</span>
                          <span aria-hidden="true">×</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập thành phần (VD: Panthenol)"
                        aria-label="Thêm thành phần mới"
                        value={thanhPhanMoi}
                        onChange={(e) => setThanhPhanMoi(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            themThanhPhan();
                          }
                        }}
                        className="flex-1 min-w-0 h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang"
                      />
                      <Nut bien="phu" onClick={themThanhPhan}>
                        Thêm thẻ
                      </Nut>
                    </div>
                  </div>

                  {/* Giá & hiển thị: khóa cho vai trò kho */}
                  <div className="rounded-[16px] bg-nen-phu p-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-den">
                        Giá và trạng thái hiển thị
                      </span>
                      {phien.vaiTro === "kho" && (
                        <span className="text-[12px] text-xam-dam">
                          Vai trò kho không sửa được giá và hiển thị (mã mới mặc định ẩn)
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <label className="flex flex-col gap-1 text-[13px] text-xam-dam">
                        <span>Giá gốc</span>
                        <input
                          type="number"
                          aria-label="Giá gốc"
                          disabled={phien.vaiTro === "kho"}
                          value={form.gia_goc}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, gia_goc: e.target.value }))
                          }
                          className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang disabled:opacity-60"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[13px] text-xam-dam">
                        <span>Giá bán</span>
                        <input
                          type="number"
                          aria-label="Giá bán"
                          disabled={phien.vaiTro === "kho"}
                          value={form.gia_ban}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, gia_ban: e.target.value }))
                          }
                          className="h-[44px] rounded-[12px] border border-vien px-3 text-[14px] bg-trang disabled:opacity-60"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-[14px] font-medium text-den pt-4">
                        <input
                          type="checkbox"
                          disabled={phien.vaiTro === "kho"}
                          checked={form.hien_thi}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              hien_thi: e.target.checked,
                            }))
                          }
                        />
                        <span>Hiển thị trên web</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <Nut bien="phu" onClick={dongTrinhSua}>
                      Hủy
                    </Nut>
                    <Nut
                      type="submit"
                      bien="chinh"
                      co="lon"
                      data-testid="luu-san-pham-kho"
                      disabled={isPending}
                    >
                      {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </Nut>
                  </div>
                </form>
              ) : (
                /* Tab Lịch sử */
                <div
                  data-testid="danh-sach-lich-su"
                  className="flex flex-col gap-2.5"
                >
                  {lichSuMonDangSua.map((ls) => (
                    <The
                      key={ls.id}
                      nen="phu"
                      className="p-3.5 flex flex-col gap-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-[14px] text-den">
                          {NHAN_TRUONG_SAN_PHAM[ls.truong] || ls.truong}
                        </strong>
                        <span className="text-[12px] text-xam-dam">
                          nguồn: <code>{ls.nguon}</code> ·{" "}
                          {ls.boi || "Không rõ"} ·{" "}
                          {new Date(ls.luc).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <p className="m-0 text-[13px] text-xam-dam break-words">
                        <span className="line-through mr-2">
                          {dinhDangGiaTriLichSu(ls.gia_tri_cu)}
                        </span>
                        <span aria-hidden="true">→ </span>
                        <strong className="text-den">
                          {dinhDangGiaTriLichSu(ls.gia_tri_moi)}
                        </strong>
                      </p>
                    </The>
                  ))}

                  {lichSuMonDangSua.length === 0 && (
                    <p className="m-0 py-8 text-center text-[14px] text-xam-dam">
                      Chưa có lịch sử sửa cho sản phẩm này.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
