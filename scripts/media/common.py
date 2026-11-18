"""Hàm dùng chung, hằng số thương hiệu, quy tắc đường dẫn và tự duyệt media."""

from __future__ import annotations

import csv
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

import yaml
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
MEDIA_DIR = ROOT / "media"
TMP_DIR = MEDIA_DIR / "tmp"
NGUON_DIR = TMP_DIR / "nguon"
XU_LY_DIR = TMP_DIR / "xu-ly"
VIDEO_DIR = TMP_DIR / "video"
BOI_CANH_DIR = TMP_DIR / "boi-canh"
KIEM_KE_CSV = TMP_DIR / "kiem-ke.csv"
DUYET_HTML = TMP_DIR / "duyet.html"

PRODUCTS_CSV = ROOT / "data" / "products.csv"
DEALS_YAML = ROOT / "data" / "deals.yaml"
NGUON_PHEP_YAML = MEDIA_DIR / "nguon-duoc-phep.yaml"
BRAND_LOGO_BLACK = ROOT / "public" / "brand" / "vive-logo-black.png"
BRAND_LOGO_WHITE = ROOT / "public" / "brand" / "vive-logo-white.png"

BUCKET_MEDIA = "media"

# Thứ tự ưu tiên thương hiệu theo docs/06 mục 1 và W004
THU_TU_UU_TIEN = [
    "LOPOE",
    "Medicube",
    "Celimax",
    "SKINFOOD",
    "Rep!el",
    "Uniura",
    "salTherapy",
    "Tiela",
    "Dermal",
]

# Bảng màu chính thức theo docs/03 mục 1
MAU_THUONG_HIEU = {
    "hong": "#E8D2CC",
    "hong_nhat": "#F7EEEB",
    "bac_ha": "#CFE3D5",
    "bac_ha_nhat": "#EAF3ED",
    "den": "#2B2B2A",
    "xam": "#737373",
    "trang": "#FFFFFF",
}

LOAI_HOP_LE = {
    "goc",
    "tach_nen",
    "the",
    "the_nho",
    "boi_canh",
    "video_9x16",
    "video_1x1",
    "video_4x5",
}

NGUON_HOP_LE = {"drive", "booth", "thuong_hieu", "ai_boi_canh", "tong_hop"}

TRANG_THAI_HOP_LE = {"cho_duyet", "duyet", "loai"}

TU_KHOA_CHU_LA = [
    "shopee",
    "lazada",
    "olive young",
    "oliveyoung",
    "hasaki",
    "watsons",
    "tiki",
    "sendo",
    "tiktok shop",
    "tiktokshop",
    "coupang",
    "gmarket",
    "11st",
    "shein",
    "temu",
    "amazon",
    "watermark",
    "shutterstock",
    "gettyimages",
    "istock",
    "alamy",
    "dreamstime",
]


def dam_bao_thu_muc_tam() -> None:
    """Tạo các thư mục làm việc tạm trong media/tmp/ (đã gitignore)."""
    for d in (TMP_DIR, NGUON_DIR, XU_LY_DIR, VIDEO_DIR, BOI_CANH_DIR):
        d.mkdir(parents=True, exist_ok=True)


def tai_env(env_path: Path | None = None) -> dict[str, str]:
    """Đọc biến môi trường từ .env.local và os.environ mà không in khóa bí mật."""
    path = env_path or (ROOT / ".env.local")
    ket_qua: dict[str, str] = {}
    if path.exists():
        for dong in path.read_text(encoding="utf-8").splitlines():
            s = dong.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            khoa, gia_tri = s.split("=", 1)
            khoa = khoa.strip()
            gia_tri = gia_tri.strip().strip('"').strip("'")
            if khoa:
                ket_qua[khoa] = gia_tri
    for k, v in os.environ.items():
        if k not in ket_qua or not ket_qua[k]:
            ket_qua[k] = v
    return ket_qua


def tao_supabase_client(env: dict[str, str] | None = None) -> tuple[Any, str]:
    """Khởi tạo Supabase client với service role, tránh đụng thư mục supabase/ trong repo."""
    bien = env or tai_env()
    url = (bien.get("NEXT_PUBLIC_SUPABASE_URL") or "").strip().rstrip("/")
    key = (bien.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not url or not key:
        raise RuntimeError(
            "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local"
        )

    # Thư mục gốc repo có thư mục supabase/ (migrations) dễ che mất thư viện supabase PyPI
    root_resolved = ROOT.resolve()
    sys_path_cu = list(sys.path)
    try:
        sys.path = [
            p
            for p in sys.path
            if Path(p or ".").resolve() != root_resolved
        ]
        mod_cu = sys.modules.get("supabase")
        if mod_cu is not None and getattr(mod_cu, "__file__", None) is None:
            del sys.modules["supabase"]
        from supabase import create_client  # type: ignore
    finally:
        sys.path = sys_path_cu

    client = create_client(url, key)
    return client, url


def tim_ffmpeg() -> str:
    """Tìm đường dẫn thực thi ffmpeg trên Windows/Linux/macOS."""
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg  # type: ignore

        bundled = imageio_ffmpeg.get_ffmpeg_exe()
        if bundled and Path(bundled).exists():
            return bundled
    except Exception:
        pass
    raise FileNotFoundError(
        "Không tìm thấy ffmpeg. Cài ffmpeg vào PATH hoặc pip install imageio-ffmpeg."
    )


def doc_products_csv(path: Path | None = None) -> list[dict[str, str]]:
    """Đọc data/products.csv trả về danh sách dict từng sản phẩm."""
    p = path or PRODUCTS_CSV
    with open(p, "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def doc_deals_yaml(path: Path | None = None) -> list[dict[str, Any]]:
    """Đọc data/deals.yaml trả về danh sách deal."""
    p = path or DEALS_YAML
    data = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
    return list(data.get("deals") or [])


def doc_nguon_duoc_phep(path: Path | None = None) -> dict[str, Any]:
    """Đọc media/nguon-duoc-phep.yaml."""
    p = path or NGUON_PHEP_YAML
    if not p.exists():
        return {"tat_ca_thuong_hieu": False, "duoc_phep": []}
    return yaml.safe_load(p.read_text(encoding="utf-8")) or {}


def thuong_hieu_duoc_phep(thuong_hieu: str, cau_hinh: dict[str, Any] | None = None) -> bool:
    """Kiểm tra thương hiệu có được phép dùng ảnh website chính hãng không."""
    cfg = cau_hinh if cau_hinh is not None else doc_nguon_duoc_phep()
    if cfg.get("tat_ca_thuong_hieu") is True:
        return True
    ds = cfg.get("duoc_phep") or []
    muc_tieu = thuong_hieu.strip().lower()
    for item in ds:
        if isinstance(item, dict):
            ten = str(item.get("thuong_hieu", "")).strip().lower()
        else:
            ten = str(item).strip().lower()
        if ten == muc_tieu:
            return True
    return False


def thu_tu_thuong_hieu(thuong_hieu: str) -> tuple[int, str]:
    """Khóa sắp xếp theo thứ tự ưu tiên docs/06 mục 1."""
    try:
        idx = THU_TU_UU_TIEN.index(thuong_hieu)
    except ValueError:
        idx = len(THU_TU_UU_TIEN)
    return (idx, thuong_hieu.lower())


def dat_ten_duong_dan(
    loai: str,
    san_pham_id: str | None = None,
    chien_dich: str | None = None,
    so_thu_tu: int = 1,
    ten_file: str | None = None,
) -> str:
    """Tạo đường dẫn chuẩn trong bucket `media` theo docs/06 mục 2."""
    if loai not in LOAI_HOP_LE:
        raise ValueError(f"Loại media không hợp lệ: {loai}")
    sp = (san_pham_id or "").strip()
    cd = (chien_dich or "").strip()
    if not sp and not cd:
        raise ValueError("Phải có ít nhất san_pham_id hoặc chien_dich")

    if loai == "the":
        if not sp:
            raise ValueError("Loại 'the' bắt buộc có san_pham_id")
        return f"san-pham/{sp}/the.webp"
    if loai == "the_nho":
        if not sp:
            raise ValueError("Loại 'the_nho' bắt buộc có san_pham_id")
        return f"san-pham/{sp}/the-nho.webp"
    if loai == "tach_nen":
        if not sp:
            raise ValueError("Loại 'tach_nen' bắt buộc có san_pham_id")
        return f"san-pham/{sp}/tach-nen.png"
    if loai == "goc":
        if not sp:
            raise ValueError("Loại 'goc' bắt buộc có san_pham_id")
        fname = (ten_file or "goc.png").lstrip("/")
        return f"san-pham/{sp}/{fname}"
    if loai == "boi_canh":
        if sp:
            return f"san-pham/{sp}/boi-canh-{int(so_thu_tu)}.webp"
        fname = (ten_file or f"boi-canh-{int(so_thu_tu)}.webp").lstrip("/")
        return f"chien-dich/{cd}/{fname}"

    duoi_video = {
        "video_9x16": "9x16.mp4",
        "video_1x1": "1x1.mp4",
        "video_4x5": "4x5.mp4",
    }[loai]
    if sp:
        return f"video/{sp}/{duoi_video}"
    fname = (ten_file or duoi_video).lstrip("/")
    return f"chien-dich/{cd}/{fname}"


def tao_url_cong_khai(
    supabase_url: str,
    duong_dan: str,
    url_cu: str | None = None,
) -> str:
    """Sinh URL đọc công khai của bucket media; tự tăng ?v=<số> nếu ghi đè."""
    goc = (
        f"{supabase_url.rstrip('/')}/storage/v1/object/public/"
        f"{BUCKET_MEDIA}/{duong_dan.lstrip('/')}"
    )
    if not url_cu:
        return goc
    parsed = urlparse(url_cu)
    qs = parse_qs(parsed.query)
    v_cu = 1
    if "v" in qs and qs["v"]:
        try:
            v_cu = int(qs["v"][0])
        except ValueError:
            v_cu = 1
    return f"{goc}?v={v_cu + 1}"


def tim_khung_bao_alpha(img_rgba: Image.Image, nguong_alpha: int = 10) -> tuple[int, int, int, int] | None:
    """Tìm hộp bao kín nhất của phần sản phẩm có alpha > ngưỡng."""
    rgba = img_rgba.convert("RGBA")
    alpha = rgba.getchannel("A")
    mat_na = alpha.point(lambda a: 255 if a > nguong_alpha else 0)
    return mat_na.getbbox()


def chuan_hoa_kich_thuoc(
    img_rgba: Image.Image,
    kich_thuoc: int = 1000,
    ty_le_san_pham: float = 0.80,
    nen_trang: bool = False,
    bong_mem: bool = True,
) -> Image.Image:
    """Chuẩn hóa ảnh tách nền vào khung vuông, giữ nguyên điểm ảnh sản phẩm thật."""
    if kich_thuoc <= 0:
        raise ValueError("kich_thuoc phải > 0")
    if not (0 < ty_le_san_pham <= 1.0):
        raise ValueError("ty_le_san_pham phải nằm trong (0, 1]")

    rgba = img_rgba.convert("RGBA")
    bbox = tim_khung_bao_alpha(rgba)
    if bbox is None:
        if nen_trang:
            return Image.new("RGB", (kich_thuoc, kich_thuoc), (255, 255, 255))
        return Image.new("RGBA", (kich_thuoc, kich_thuoc), (0, 0, 0, 0))

    sp_cat = rgba.crop(bbox)
    cw, ch = sp_cat.size
    canh_muc_tieu = max(1, round(kich_thuoc * ty_le_san_pham))
    ti_le = canh_muc_tieu / max(cw, ch)
    nw = max(1, round(cw * ti_le))
    nh = max(1, round(ch * ti_le))
    sp_resize = sp_cat.resize((nw, nh), Image.Resampling.LANCZOS)

    x0 = (kich_thuoc - nw) // 2
    y0 = (kich_thuoc - nh) // 2

    khung = Image.new("RGBA", (kich_thuoc, kich_thuoc), (0, 0, 0, 0))
    if bong_mem:
        # Đặt bóng mềm phía dưới lớp sản phẩm, không chạm điểm ảnh của sản phẩm
        lop_alpha = Image.new("L", (kich_thuoc, kich_thuoc), 0)
        dy = max(2, round(kich_thuoc * 0.016))
        lop_alpha.paste(sp_resize.getchannel("A"), (x0, min(kich_thuoc - nh, y0 + dy)))
        ban_kinh = max(2, round(kich_thuoc * 0.014))
        bong_alpha = lop_alpha.filter(ImageFilter.GaussianBlur(radius=ban_kinh))
        bong_alpha = bong_alpha.point(lambda a: int(a * 0.14))
        lop_bong = Image.new("RGBA", (kich_thuoc, kich_thuoc), (43, 43, 42, 0))
        lop_bong.putalpha(bong_alpha)
        khung = Image.alpha_composite(khung, lop_bong)

    lop_sp = Image.new("RGBA", (kich_thuoc, kich_thuoc), (0, 0, 0, 0))
    lop_sp.paste(sp_resize, (x0, y0))
    khung = Image.alpha_composite(khung, lop_sp)

    if nen_trang:
        nen = Image.new("RGBA", (kich_thuoc, kich_thuoc), (255, 255, 255, 255))
        return Image.alpha_composite(nen, khung).convert("RGB")
    return khung


def tinh_ty_le_trong_suot_vien(
    img_rgba: Image.Image,
    do_day_vien: int = 2,
    nguong_alpha: int = 10,
) -> float:
    """Tính tỉ lệ điểm ảnh trong suốt ở viền ngoài của ảnh (0.0 đến 1.0)."""
    if "A" not in img_rgba.getbands():
        return 0.0
    alpha = img_rgba.getchannel("A")
    w, h = alpha.size
    if w == 0 or h == 0:
        return 0.0
    d = max(1, min(do_day_vien, w // 2 or 1, h // 2 or 1))
    tong = 0
    trong_suot = 0
    px = alpha.load()
    for y in range(h):
        if y < d or y >= h - d:
            for x in range(w):
                tong += 1
                if px[x, y] <= nguong_alpha:
                    trong_suot += 1
        else:
            for x in list(range(0, d)) + list(range(w - d, w)):
                tong += 1
                if px[x, y] <= nguong_alpha:
                    trong_suot += 1
    return trong_suot / tong if tong else 0.0


def phat_hien_chu_la(van_ban: str | None) -> list[str]:
    """Phát hiện tên sàn bán lẻ hoặc watermark bị cấm trong văn bản/metadata/OCR."""
    if not van_ban:
        return []
    thap = re.sub(r"\s+", " ", van_ban.lower())
    ket_qua: list[str] = []
    for tu in TU_KHOA_CHU_LA:
        if tu in thap:
            ket_qua.append(tu)
    return ket_qua


def quyet_dinh_trang_thai(
    loai: str,
    nguon: str,
    kich_thuoc: tuple[int, int],
    dung_luong: int,
    khop_ma: bool,
    ty_le_vien_trong_suot: float,
    chu_la: list[str] | None = None,
    khop_ma_chac_chan: bool = False,
) -> tuple[str, list[str]]:
    """Quyết định tự duyệt ('duyet') hay chờ duyệt ('cho_duyet') theo docs/06 mục 5."""
    ly_do: list[str] = []

    if loai not in ("the", "the_nho", "tach_nen"):
        ly_do.append(f"Loại '{loai}' cần duyệt thủ công")

    if nguon in ("drive", "booth"):
        if not khop_ma:
            ly_do.append("Chưa xác định khớp mã sản phẩm")
    elif nguon == "thuong_hieu":
        if not khop_ma or not khop_ma_chac_chan:
            ly_do.append("Ảnh chính hãng chưa khớp mã chắc chắn (tên/quy cách/biến thể)")
    else:
        ly_do.append(f"Nguồn '{nguon}' bắt buộc chờ duyệt")

    rong, cao = kich_thuoc
    if loai == "the":
        if (rong, cao) != (1000, 1000):
            ly_do.append(f"Kích thước thẻ {rong}x{cao} khác 1000x1000")
        if dung_luong <= 0 or dung_luong >= 150 * 1024:
            ly_do.append(f"Dung lượng thẻ {dung_luong}B phải < 150KB")
    elif loai == "the_nho":
        if (rong, cao) != (400, 400):
            ly_do.append(f"Kích thước thẻ nhỏ {rong}x{cao} khác 400x400")
        if dung_luong <= 0 or dung_luong >= 40 * 1024:
            ly_do.append(f"Dung lượng thẻ nhỏ {dung_luong}B phải < 40KB")
    elif loai == "tach_nen":
        if rong <= 0 or cao <= 0 or dung_luong <= 0:
            ly_do.append("Ảnh tách nền không hợp lệ")

    if loai in ("the", "the_nho", "tach_nen") and ty_le_vien_trong_suot <= 0.95:
        ly_do.append(
            f"Tỉ lệ trong suốt ở viền {ty_le_vien_trong_suot:.1%} <= 95%"
        )

    if chu_la:
        ly_do.append(f"Phát hiện chữ lạ/watermark: {', '.join(chu_la)}")

    if not ly_do:
        return "duyet", []
    return "cho_duyet", ly_do


def lam_muot_vien_alpha(img_rgba: Image.Image) -> Image.Image:
    """Làm mượt nhẹ mép alpha để giảm răng cưa sau khi tách nền, giữ nguyên phần lõi."""
    rgba = img_rgba.convert("RGBA")
    r, g, b, a = rgba.split()
    a_mem = a.filter(ImageFilter.GaussianBlur(radius=0.6))
    # Chỉ làm mềm vùng rìa bán trong suốt, giữ nguyên alpha đặc (255) và vùng nền (0)
    a_cuoi = ImageChops.lighter(a.point(lambda v: 255 if v >= 245 else 0), a_mem)
    a_cuoi = a_cuoi.point(lambda v: 0 if v < 12 else v)
    return Image.merge("RGBA", (r, g, b, a_cuoi))
