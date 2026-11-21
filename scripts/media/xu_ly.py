#!/usr/bin/env python3
"""Tách nền, cắt, chuẩn hóa ra tach-nen.png, the.webp (1000x1000), the-nho.webp (400x400) và kiểm tra tự động."""

from __future__ import annotations

import argparse
import io
import json
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageStat

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

_REMBG_SESSIONS: dict[str, Any] = {}


def lay_rembg_session(model_name: str = "isnet-general-use") -> Any:
    """Tải và cache rembg session theo tên model."""
    if model_name not in _REMBG_SESSIONS:
        from rembg import new_session  # type: ignore

        _REMBG_SESSIONS[model_name] = new_session(model_name)
    return _REMBG_SESSIONS[model_name]


def anh_da_tach_nen_sach(img: Image.Image) -> bool:
    """Kiểm tra ảnh đã có nền trong suốt sạch (>95% viền trong suốt và có vùng trong suốt rõ)."""
    if "A" not in img.getbands():
        return False
    vien = common.tinh_ty_le_trong_suot_vien(img)
    if vien <= 0.95:
        return False
    alpha = img.getchannel("A")
    # Đảm bảo ảnh thực sự có nền trong suốt chứ không phải toàn bộ alpha=255 hoặc rỗng
    extrema = alpha.getextrema()
    if extrema[0] > 10 or extrema[1] < 200:
        return False
    return True


def chon_anh_dep_nhat(ds_anh: list[Path]) -> Path:
    """Chọn ảnh sắc nét và phân giải cao nhất khi cùng 1 mã có nhiều nguồn (docs/06 mục 3)."""
    if len(ds_anh) == 1:
        return ds_anh[0]

    def diem(p: Path) -> tuple[float, float, int]:
        try:
            with Image.open(p) as im:
                w, h = im.size
                co_alpha = 1.0 if anh_da_tach_nen_sach(im) else 0.0
                # Độ tương phản nhẹ để ưu tiên ảnh nét hơn
                gray = im.convert("L").resize((min(w, 256), min(h, 256)))
                std = ImageStat.Stat(gray).stddev[0]
                return (co_alpha, w * h + std * 100.0, p.stat().st_size)
        except Exception:
            return (0.0, 0.0, 0)

    return max(ds_anh, key=diem)


def luu_webp_duoi_gioi_han(
    img: Image.Image,
    dich: Path,
    gioi_han_bytes: int,
    chat_luong_thu: tuple[int, ...] = (86, 84, 82, 78, 72, 65),
) -> tuple[int, int]:
    """Lưu ảnh WebP đảm bảo dung lượng nhỏ hơn gioi_han_bytes. Trả về (bytes, quality)."""
    for q in chat_luong_thu:
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=q, method=6)
        data = buf.getvalue()
        if len(data) < gioi_han_bytes:
            dich.write_bytes(data)
            return len(data), q

    # Nếu vẫn vượt ngưỡng, ghi bản nén tốt nhất (sẽ bị flag cho_duyet nếu vượt quy chuẩn)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=chat_luong_thu[-1], method=6)
    data = buf.getvalue()
    dich.write_bytes(data)
    return len(data), chat_luong_thu[-1]


def tach_nen_anh(
    img: Image.Image,
    model_name: str = "isnet-general-use",
    bo_tach_nen: bool = False,
) -> tuple[Image.Image, bool]:
    """Tách nền nếu ảnh chưa tách sạch. Trả về (ảnh RGBA đã cắt gọn có viền an toàn, đã_tách_bằng_rembg)."""
    rgba = img.convert("RGBA")
    dung_rembg = False
    if not bo_tach_nen and not anh_da_tach_nen_sach(rgba):
        from rembg import remove  # type: ignore

        session = lay_rembg_session(model_name)
        ket_qua = remove(rgba, session=session)
        rgba = common.lam_muot_vien_alpha(ket_qua)
        dung_rembg = True

    bbox = common.tim_khung_bao_alpha(rgba)
    if bbox is None:
        return rgba, dung_rembg

    cat = rgba.crop(bbox)
    cw, ch = cat.size
    le = max(16, round(max(cw, ch) * 0.04))
    khung = Image.new("RGBA", (cw + 2 * le, ch + 2 * le), (0, 0, 0, 0))
    khung.paste(cat, (le, le))
    return khung, dung_rembg


def xu_ly_mot_san_pham(
    pid: str,
    model_name: str = "isnet-general-use",
    ep_nen_trang: bool = False,
    bo_tach_nen: bool = False,
) -> dict[str, Any]:
    """Xử lý trọn bộ tach-nen.png, the.webp, the-nho.webp cho 1 mã sản phẩm."""
    common.dam_bao_thu_muc_tam()
    thu_muc_nguon = common.NGUON_DIR / pid
    if not thu_muc_nguon.exists():
        raise FileNotFoundError(f"Chưa nhập ảnh nguồn cho mã {pid} trong {thu_muc_nguon}")

    meta_path = thu_muc_nguon / "meta.json"
    meta: dict[str, Any] = {}
    if meta_path.exists():
        meta = json.loads(meta_path.read_text(encoding="utf-8"))

    ds_anh = sorted(
        p
        for p in thu_muc_nguon.iterdir()
        if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    if not ds_anh:
        raise FileNotFoundError(f"Không tìm thấy file ảnh nào trong {thu_muc_nguon}")

    anh_chon = chon_anh_dep_nhat(ds_anh)
    thu_muc_xuat = common.XU_LY_DIR / pid
    thu_muc_xuat.mkdir(parents=True, exist_ok=True)

    with Image.open(anh_chon) as goc:
        tach_nen, dung_rembg = tach_nen_anh(
            goc, model_name=model_name, bo_tach_nen=bo_tach_nen
        )

    tach_nen_path = thu_muc_xuat / "tach-nen.png"
    tach_nen.save(tach_nen_path, format="PNG", optimize=True)

    ty_le_vien_goc = common.tinh_ty_le_trong_suot_vien(tach_nen)
    dung_nen_trang = ep_nen_trang or (ty_le_vien_goc <= 0.95)

    img_the = common.chuan_hoa_kich_thuoc(
        tach_nen, kich_thuoc=1000, ty_le_san_pham=0.80, nen_trang=dung_nen_trang, bong_mem=True
    )
    the_path = thu_muc_xuat / "the.webp"
    the_bytes, the_q = luu_webp_duoi_gioi_han(img_the, the_path, 150 * 1024)

    img_the_nho = common.chuan_hoa_kich_thuoc(
        tach_nen, kich_thuoc=400, ty_le_san_pham=0.80, nen_trang=dung_nen_trang, bong_mem=True
    )
    the_nho_path = thu_muc_xuat / "the-nho.webp"
    the_nho_bytes, the_nho_q = luu_webp_duoi_gioi_han(img_the_nho, the_nho_path, 40 * 1024)

    nguon = meta.get("nguon") or "drive"
    khop_ma = bool(meta.get("khop_ma", True))
    khop_ma_chac_chan = bool(meta.get("khop_ma_chac_chan", nguon in ("drive", "booth")))
    chu_la = list(meta.get("chu_la_ten_file") or []) + common.phat_hien_chu_la(
        meta.get("nguon_chi_tiet")
    )
    chu_la = sorted(set(chu_la))

    ty_le_vien_the = (
        0.0 if dung_nen_trang else common.tinh_ty_le_trong_suot_vien(img_the)
    )
    ty_le_vien_nho = (
        0.0 if dung_nen_trang else common.tinh_ty_le_trong_suot_vien(img_the_nho)
    )

    tt_tach, ld_tach = common.quyet_dinh_trang_thai(
        loai="tach_nen",
        nguon=nguon,
        kich_thuoc=tach_nen.size,
        dung_luong=tach_nen_path.stat().st_size,
        khop_ma=khop_ma,
        ty_le_vien_trong_suot=ty_le_vien_goc,
        chu_la=chu_la,
        khop_ma_chac_chan=khop_ma_chac_chan,
    )
    tt_the, ld_the = common.quyet_dinh_trang_thai(
        loai="the",
        nguon=nguon,
        kich_thuoc=img_the.size,
        dung_luong=the_bytes,
        khop_ma=khop_ma,
        ty_le_vien_trong_suot=ty_le_vien_the,
        chu_la=chu_la,
        khop_ma_chac_chan=khop_ma_chac_chan,
    )
    tt_nho, ld_nho = common.quyet_dinh_trang_thai(
        loai="the_nho",
        nguon=nguon,
        kich_thuoc=img_the_nho.size,
        dung_luong=the_nho_bytes,
        khop_ma=khop_ma,
        ty_le_vien_trong_suot=ty_le_vien_nho,
        chu_la=chu_la,
        khop_ma_chac_chan=khop_ma_chac_chan,
    )

    ket_qua = {
        "id": pid,
        "anh_goc_chon": str(anh_chon),
        "nguon": nguon,
        "nguon_chi_tiet": meta.get("nguon_chi_tiet") or str(anh_chon),
        "cach_khop": meta.get("cach_khop") or "",
        "khop_ma": khop_ma,
        "khop_ma_chac_chan": khop_ma_chac_chan,
        "dung_rembg": dung_rembg,
        "nen_trang": dung_nen_trang,
        "chu_la": chu_la,
        "files": {
            "tach_nen": {
                "path": str(tach_nen_path),
                "rong": tach_nen.width,
                "cao": tach_nen.height,
                "dung_luong": tach_nen_path.stat().st_size,
                "ty_le_vien": round(ty_le_vien_goc, 4),
                "trang_thai": tt_tach,
                "ly_do": ld_tach,
            },
            "the": {
                "path": str(the_path),
                "rong": img_the.width,
                "cao": img_the.height,
                "dung_luong": the_bytes,
                "chat_luong": the_q,
                "ty_le_vien": round(ty_le_vien_the, 4),
                "trang_thai": tt_the,
                "ly_do": ld_the,
            },
            "the_nho": {
                "path": str(the_nho_path),
                "rong": img_the_nho.width,
                "cao": img_the_nho.height,
                "dung_luong": the_nho_bytes,
                "chat_luong": the_nho_q,
                "ty_le_vien": round(ty_le_vien_nho, 4),
                "trang_thai": tt_nho,
                "ly_do": ld_nho,
            },
        },
    }
    (thu_muc_xuat / "ket-qua.json").write_text(
        json.dumps(ket_qua, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return ket_qua


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Tách nền và chuẩn hóa ảnh thẻ 1000x1000 / 400x400.")
    parser.add_argument("ids", nargs="*", help="Danh sách mã sản phẩm cần xử lý")
    parser.add_argument("--all", action="store_true", help="Xử lý mọi mã đã nhập trong media/tmp/nguon/")
    parser.add_argument(
        "--model",
        default="isnet-general-use",
        choices=["isnet-general-use", "birefnet-general"],
        help="Model rembg khi cần tách nền",
    )
    parser.add_argument("--nen-trang", action="store_true", help="Ép dùng nền trắng #FFFFFF")
    parser.add_argument("--bo-tach-nen", action="store_true", help="Không chạy rembg")
    args = parser.parse_args()

    ids = list(args.ids)
    if args.all and common.NGUON_DIR.exists():
        for d in sorted(common.NGUON_DIR.iterdir()):
            if d.is_dir() and not d.name.startswith("_"):
                if d.name not in ids:
                    ids.append(d.name)

    if not ids:
        print("Cần truyền ít nhất 1 mã sản phẩm hoặc --all")
        sys.exit(1)

    for pid in ids:
        try:
            kq = xu_ly_mot_san_pham(
                pid,
                model_name=args.model,
                ep_nen_trang=args.nen_trang,
                bo_tach_nen=args.bo_tach_nen,
            )
            f_the = kq["files"]["the"]
            f_nho = kq["files"]["the_nho"]
            ly_do = "; ".join(f_the["ly_do"]) if f_the["ly_do"] else "đạt kiểm tra tự động (chờ QA kỹ thuật)"
            print(
                f"[{pid}] {f_the['trang_thai']} | the={f_the['rong']}x{f_the['cao']} "
                f"{f_the['dung_luong']//1024}KB (q={f_the['chat_luong']}) | "
                f"the-nho={f_nho['dung_luong']//1024}KB | viền={f_the['ty_le_vien']:.1%} | {ly_do}"
            )
        except Exception as e:
            print(f"[{pid}] LỖI: {e}")


if __name__ == "__main__":
    main()
