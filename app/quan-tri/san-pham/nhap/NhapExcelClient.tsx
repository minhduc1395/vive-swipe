"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  cheDoThu,
  dangNhapNhanVien,
  dangXuatNhanVienLocal,
  layPhienNhanVienLocal,
  layTokenNhanVien,
  type PhienNhanVien,
} from "@/lib/nhan-vien/auth";
import type { LoNhapLieuItem } from "@/lib/admin/kho-quan-tri";
import { Nut, NutLink } from "@/components/ui/Nut";
import { The } from "@/components/ui/The";
import { Nhan } from "@/components/ui/Nhan";
import {
  actionApDungLoExcel,
  actionLayDanhSachLoNhapLieu,
  actionTaiFileExcelMau,
  actionXuatFileExcelHienTai,
} from "./actions";

function taiXuongTuBase64(base64: string, tenFile: string): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tenFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dinhDangTrangThaiLo(tt: LoNhapLieuItem["trang_thai"]): {
  nhan: string;
  nen: string;
} {
  switch (tt) {
    case "da_ap_dung":
      return { nhan: "Đã áp dụng", nen: "bg-be text-den" };
    case "xem_truoc":
      return { nhan: "Đang xem trước", nen: "bg-vang-nhat text-den" };
    case "loi":
      return { nhan: "Có lỗi", nen: "bg-loi-nen text-loi" };
    default:
      return { nhan: "Đã hủy", nen: "bg-nen-phu text-xam-dam" };
  }
}

function FormDangNhapNhapExcel({
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
          Nhập &amp; xuất Excel sản phẩm
        </h1>
        <p className="m-0 text-[14px] text-xam mt-1 mb-6 text-center">
          Đăng nhập bằng tài khoản vai trò <code>kho</code> hoặc{" "}
          <code>quan_tri</code> để tải mẫu, xem trước và áp dụng Excel.
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
              htmlFor="nhap-email"
              className="text-[14px] font-semibold text-den"
            >
              Email kho / quản trị
            </label>
            <input
              id="nhap-email"
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
              htmlFor="nhap-password"
              className="text-[14px] font-semibold text-den"
            >
              Mật khẩu
            </label>
            <input
              id="nhap-password"
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
              Vào nhanh Quản trị (admin@vive.vn)
            </Nut>
          </div>
        )}
      </The>
    </div>
  );
}

export function NhapExcelClient() {
  const [phien, setPhien] = useState<PhienNhanVien | null>(null);
  const [daKiemTraPhien, setDaKiemTraPhien] = useState(false);

  const [loHienTai, setLoHienTai] = useState<LoNhapLieuItem | null>(null);
  const [lichSuLo, setLichSuLo] = useState<LoNhapLieuItem[]>([]);
  const [dangTaiFile, setDangTaiFile] = useState(false);
  const [dangXuatFile, setDangXuatFile] = useState(false);
  const [thongBao, setThongBao] = useState<{
    loai: "thanh-cong" | "loi";
    noiDung: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhien(layPhienNhanVienLocal());
    setDaKiemTraPhien(true);

    const onAuthChange = () => {
      if (active) setPhien(layPhienNhanVienLocal());
    };
    window.addEventListener("vive_nv_auth_change", onAuthChange);
    return () => {
      active = false;
      window.removeEventListener("vive_nv_auth_change", onAuthChange);
    };
  }, []);

  const coQuyenKho =
    phien?.vaiTro === "kho" || phien?.vaiTro === "quan_tri";

  useEffect(() => {
    if (!phien || !coQuyenKho) return;
    let cancelled = false;
    layTokenNhanVien()
      .then((token) => actionLayDanhSachLoNhapLieu(token))
      .then((ds) => {
        if (!cancelled) setLichSuLo(ds);
      })
      .catch(() => {
        // Bỏ qua lỗi tải lịch sử ban đầu nếu token đang làm mới
      });
    return () => {
      cancelled = true;
    };
  }, [phien, coQuyenKho]);

  const lamMoiLichSuLo = async () => {
    try {
      const token = await layTokenNhanVien();
      const ds = await actionLayDanhSachLoNhapLieu(token);
      setLichSuLo(ds);
    } catch {
      // ignore
    }
  };

  const xuLyTaiFileMau = () => {
    setThongBao(null);
    setDangXuatFile(true);
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const res = await actionTaiFileExcelMau(token);
        taiXuongTuBase64(res.base64, res.tenFile);
        setThongBao({
          loai: "thanh-cong",
          noiDung: `Đã tải file mẫu ${res.tenFile}.`,
        });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung:
            err instanceof Error ? err.message : "Không tải được file mẫu.",
        });
      } finally {
        setDangXuatFile(false);
      }
    });
  };

  const xuLyXuatDuLieuHienTai = () => {
    setThongBao(null);
    setDangXuatFile(true);
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const res = await actionXuatFileExcelHienTai(token);
        taiXuongTuBase64(res.base64, res.tenFile);
        setThongBao({
          loai: "thanh-cong",
          noiDung: `Đã xuất ${res.soSanPham} sản phẩm ra ${res.tenFile}.`,
        });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung:
            err instanceof Error
              ? err.message
              : "Không xuất được danh sách sản phẩm.",
        });
      } finally {
        setDangXuatFile(false);
      }
    });
  };

  const xuLyChonFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setThongBao(null);
    setDangTaiFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = await layTokenNhanVien();
      const res = await fetch("/quan-tri/san-pham/nhap/tai-len", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const json = (await res.json()) as { lo?: LoNhapLieuItem; error?: string };
      if (!res.ok || !json.lo) {
        throw new Error(json.error || "Không phân tích được file Excel.");
      }
      setLoHienTai(json.lo);
      await lamMoiLichSuLo();
      if (json.lo.ket_qua.loiChung) {
        setThongBao({
          loai: "loi",
          noiDung: json.lo.ket_qua.loiChung,
        });
      } else {
        setThongBao({
          loai: "thanh-cong",
          noiDung: `Đã đọc ${json.lo.ten_file}: ${json.lo.so_moi} mã mới, ${json.lo.so_sua} mã cập nhật, ${json.lo.so_loi} dòng lỗi.`,
        });
      }
    } catch (err) {
      setThongBao({
        loai: "loi",
        noiDung:
          err instanceof Error ? err.message : "Lỗi tải file lên server.",
      });
    } finally {
      setDangTaiFile(false);
    }
  };

  const xuLyApDungLo = () => {
    if (!loHienTai) return;
    setThongBao(null);
    startTransition(async () => {
      try {
        const token = await layTokenNhanVien();
        const res = await actionApDungLoExcel(token, loHienTai.id);
        setLoHienTai(res.lo);
        await lamMoiLichSuLo();
        setThongBao({
          loai: "thanh-cong",
          noiDung: `Đã áp dụng xong ${res.soMaDaGhi} mã sản phẩm (nguồn: excel) và lưu lịch sử.`,
        });
      } catch (err) {
        setThongBao({
          loai: "loi",
          noiDung:
            err instanceof Error ? err.message : "Không thể áp dụng lô Excel.",
        });
      }
    });
  };

  if (!daKiemTraPhien) {
    return (
      <div className="w-full max-w-[1160px] mx-auto px-4 py-12 text-center text-[15px] text-xam">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!phien) {
    return <FormDangNhapNhapExcel onThanhCong={setPhien} />;
  }

  if (!coQuyenKho) {
    return (
      <div className="w-full max-w-[480px] mx-auto my-12 px-4">
        <div
          role="alert"
          className="rounded-[24px] bg-loi-nen border border-loi-vien p-6 text-center flex flex-col items-center gap-4"
        >
          <h1 className="m-0 text-[20px] font-bold text-loi">
            Không có quyền nhập Excel sản phẩm
          </h1>
          <p className="m-0 text-[14px] text-loi leading-relaxed">
            Tài khoản <strong>{phien.email}</strong> đang có vai trò{" "}
            <code>{phien.vaiTro}</code>. Chỉ tài khoản <code>kho</code> hoặc{" "}
            <code>quan_tri</code> mới được nhập/xuất Excel sản phẩm.
          </p>
          <Nut bien="dam" onClick={() => dangXuatNhanVienLocal()}>
            Đăng xuất để đổi tài khoản
          </Nut>
        </div>
      </div>
    );
  }

  const ketQua = loHienTai?.ket_qua ?? null;
  const coTheApDung =
    Boolean(loHienTai) &&
    loHienTai?.trang_thai !== "da_ap_dung" &&
    !ketQua?.loiChung &&
    (ketQua?.dongHopLe.length ?? 0) > 0;

  return (
    <div className="w-full max-w-[1180px] mx-auto px-4 md:px-6 py-5 md:py-8 flex flex-col gap-5">
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
              Nhập &amp; xuất Excel sản phẩm
            </h1>
            <p className="m-0 text-[13px] text-xam-dam truncate">
              {phien.ten} ({phien.email}) · vai trò:{" "}
              <code>{phien.vaiTro}</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <NutLink href="/quan-tri/san-pham" bien="phu">
            ← Về kho sản phẩm
          </NutLink>
          {phien.vaiTro === "quan_tri" && (
            <NutLink href="/quan-tri" bien="phu">
              Bảng quản trị
            </NutLink>
          )}
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

      {/* Bước 1 & 2: Tải mẫu / Xuất hiện tại / Tải file lên */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <The nen="hong" className="p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 text-[17px] font-bold text-den">
              1. Tải file Excel mẫu hoặc dữ liệu hiện tại
            </h2>
            <p className="m-0 text-[14px] text-xam-dam leading-relaxed">
              File <code>.xlsx</code> gồm sheet <strong>Sản phẩm</strong> và
              sheet <strong>Hướng dẫn</strong> (danh sách mã phân loại chuẩn). Ô
              để trống <strong>không xóa</strong> dữ liệu cũ; muốn xóa một ô tùy
              chọn hãy gõ <code>[xoa]</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Nut
              bien="chinh"
              onClick={xuLyTaiFileMau}
              disabled={dangXuatFile || isPending}
              data-testid="nut-tai-file-mau"
            >
              Tải file mẫu (.xlsx)
            </Nut>
            <Nut
              bien="phu"
              onClick={xuLyXuatDuLieuHienTai}
              disabled={dangXuatFile || isPending}
              data-testid="nut-xuat-excel"
            >
              Tải xuống dữ liệu hiện tại (.xlsx)
            </Nut>
          </div>
        </The>

        <The className="p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 text-[17px] font-bold text-den">
              2. Tải file lên để xem trước từng ô
            </h2>
            <p className="m-0 text-[14px] text-xam-dam leading-relaxed">
              Nhận <code>.xlsx</code> hoặc <code>.csv</code> tối đa{" "}
              <strong>2.000 dòng</strong>, dung lượng dưới <strong>5 MB</strong>
              . Hệ thống lưu bản gốc vào kho <code>nhap-lieu</code> và kiểm tra
              mã vạch, phân loại trước khi ghi.
            </p>
          </div>

          <label
            htmlFor="input-file-excel"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-[16px] border border-dashed border-vien bg-kem px-4 py-3.5 cursor-pointer hover:border-den transition-colors"
          >
            <span className="text-[14px] font-semibold text-den">
              {dangTaiFile
                ? "Đang đọc và kiểm tra file..."
                : "Chọn file .xlsx hoặc .csv để xem trước"}
            </span>
            <input
              id="input-file-excel"
              data-testid="input-file-excel"
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => void xuLyChonFileUpload(e)}
              disabled={dangTaiFile || isPending}
              className="text-[13px] text-xam-dam max-w-full"
            />
          </label>
        </The>
      </div>

      {/* Màn xem trước lô vừa tải */}
      {loHienTai && ketQua && (
        <The className="p-5 flex flex-col gap-4" data-testid="khung-xem-truoc-excel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-[18px] font-bold text-den">
                Xem trước lô: {loHienTai.ten_file}
              </h2>
              <p className="m-0 text-[13px] text-xam mt-0.5">
                Mã lô: <code>{loHienTai.id}</code>
                {loHienTai.duong_dan_bucket && (
                  <> · Bucket: <code>{loHienTai.duong_dan_bucket}</code></>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Nhan className={dinhDangTrangThaiLo(loHienTai.trang_thai).nen}>
                {dinhDangTrangThaiLo(loHienTai.trang_thai).nhan}
              </Nhan>
              <Nut
                bien="phu"
                onClick={() => setLoHienTai(null)}
                disabled={isPending}
              >
                Đóng xem trước
              </Nut>
              <Nut
                bien="dam"
                onClick={xuLyApDungLo}
                disabled={!coTheApDung || isPending}
                data-testid="nut-ap-dung-excel"
              >
                {loHienTai.trang_thai === "da_ap_dung"
                  ? "Đã áp dụng"
                  : isPending
                    ? "Đang áp dụng..."
                    : `Áp dụng thay đổi (${ketQua.dongHopLe.length} mã)`}
              </Nut>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-[14px] bg-nen-phu p-3">
              <p className="m-0 text-[12px] text-xam">Tổng dòng</p>
              <p className="m-0 text-[20px] font-bold text-den">
                {ketQua.tongSoDong}
              </p>
            </div>
            <div className="rounded-[14px] bg-be p-3">
              <p className="m-0 text-[12px] text-xam-dam">Mã mới</p>
              <p
                className="m-0 text-[20px] font-bold text-den"
                data-testid="so-ma-moi"
              >
                {ketQua.soMaMoi}
              </p>
            </div>
            <div className="rounded-[14px] bg-hong p-3">
              <p className="m-0 text-[12px] text-xam-dam">Mã cập nhật</p>
              <p
                className="m-0 text-[20px] font-bold text-den"
                data-testid="so-ma-sua"
              >
                {ketQua.soMaSua}
              </p>
            </div>
            <div className="rounded-[14px] bg-nen-phu p-3">
              <p className="m-0 text-[12px] text-xam">Không đổi</p>
              <p className="m-0 text-[20px] font-bold text-den">
                {ketQua.soDongKhongDoi}
              </p>
            </div>
            <div className="rounded-[14px] bg-loi-nen border border-loi-vien p-3">
              <p className="m-0 text-[12px] text-loi">Dòng lỗi</p>
              <p
                className="m-0 text-[20px] font-bold text-loi"
                data-testid="so-dong-loi"
              >
                {ketQua.soDongLoi}
              </p>
            </div>
          </div>

          {ketQua.loiChung && (
            <div
              role="alert"
              className="rounded-[14px] bg-loi-nen border border-loi-vien p-3.5 text-[14px] text-loi"
            >
              {ketQua.loiChung}
            </div>
          )}

          {ketQua.dongLoi.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="m-0 text-[15px] font-bold text-loi">
                Dòng lỗi cần sửa trong file ({ketQua.dongLoi.length})
              </h3>
              <div className="overflow-x-auto rounded-[14px] border border-loi-vien">
                <table
                  className="w-full text-left border-collapse text-[13px]"
                  data-testid="bang-dong-loi-excel"
                >
                  <thead className="bg-loi-nen text-loi">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Dòng</th>
                      <th className="py-2.5 px-3 font-semibold">Mã SP</th>
                      <th className="py-2.5 px-3 font-semibold">Lý do lỗi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ketQua.dongLoi.map((err, idx) => (
                      <tr
                        key={`${err.soDong}-${idx}`}
                        className="border-t border-loi-vien bg-trang"
                      >
                        <td className="py-2 px-3 font-semibold text-loi">
                          {err.soDong}
                        </td>
                        <td className="py-2 px-3 text-den">
                          {err.id || "(trống)"}
                        </td>
                        <td className="py-2 px-3 text-loi">{err.lyDo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {ketQua.dongHopLe.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="m-0 text-[15px] font-bold text-den">
                Đối chiếu từng ô thay đổi ({ketQua.dongHopLe.length} sản phẩm)
              </h3>
              <div className="overflow-x-auto rounded-[14px] border border-vien">
                <table
                  className="w-full text-left border-collapse text-[13px]"
                  data-testid="bang-so-sanh-excel"
                >
                  <thead className="bg-nen-phu text-den">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Dòng</th>
                      <th className="py-2.5 px-3 font-semibold">Sản phẩm</th>
                      <th className="py-2.5 px-3 font-semibold">Trường</th>
                      <th className="py-2.5 px-3 font-semibold">Giá trị cũ</th>
                      <th className="py-2.5 px-3 font-semibold">Giá trị mới</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ketQua.dongHopLe.flatMap((dong) =>
                      dong.soSanh.map((o, idx) => (
                        <tr
                          key={`${dong.soDong}-${dong.id}-${o.truong}-${idx}`}
                          className="border-t border-vien bg-trang align-top"
                        >
                          <td className="py-2 px-3 text-xam">{dong.soDong}</td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <strong className="text-den">{dong.id}</strong>
                              <Nhan
                                className={
                                  dong.laMaMoi
                                    ? "bg-vang-nhat text-den"
                                    : "bg-nen-phu text-xam-dam"
                                }
                              >
                                {dong.laMaMoi ? "Mã mới" : "Cập nhật"}
                              </Nhan>
                            </div>
                            {dong.canhBao && dong.canhBao.length > 0 && (
                              <p className="m-0 mt-1 text-[11px] text-xam-dam bg-vang-nhat rounded px-1.5 py-0.5 inline-block">
                                {dong.canhBao.join(" ")}
                              </p>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-den">
                            {o.nhanTruong}
                          </td>
                          <td className="py-2 px-3 text-xam break-words max-w-[260px]">
                            {o.giaTriCu}
                          </td>
                          <td className="py-2 px-3 font-medium text-den break-words max-w-[260px]">
                            {o.giaTriMoi}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </The>
      )}

      {/* Lịch sử các lô nhập liệu */}
      <The className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 text-[16px] font-bold text-den">
            Lịch sử lô nhập liệu ({lichSuLo.length})
          </h2>
        </div>
        {lichSuLo.length === 0 ? (
          <p className="m-0 text-[14px] text-xam">
            Chưa có lô nhập Excel nào trong phiên làm việc này.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-[14px] border border-vien">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead className="bg-nen-phu text-den">
                <tr>
                  <th className="py-2 px-3 font-semibold">File</th>
                  <th className="py-2 px-3 font-semibold">Trạng thái</th>
                  <th className="py-2 px-3 font-semibold">Mới / Sửa / Lỗi</th>
                  <th className="py-2 px-3 font-semibold">Người thực hiện</th>
                  <th className="py-2 px-3 font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {lichSuLo.map((item) => {
                  const st = dinhDangTrangThaiLo(item.trang_thai);
                  return (
                    <tr key={item.id} className="border-t border-vien bg-trang">
                      <td className="py-2 px-3 font-medium text-den">
                        {item.ten_file}
                      </td>
                      <td className="py-2 px-3">
                        <Nhan className={st.nen}>{st.nhan}</Nhan>
                      </td>
                      <td className="py-2 px-3 text-xam-dam">
                        {item.so_moi} mới · {item.so_sua} sửa · {item.so_loi} lỗi
                      </td>
                      <td className="py-2 px-3 text-xam-dam">
                        {item.boi || "-"}
                      </td>
                      <td className="py-2 px-3 text-xam">
                        {new Date(item.ap_dung_luc || item.tao_luc).toLocaleString(
                          "vi-VN",
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </The>
    </div>
  );
}
