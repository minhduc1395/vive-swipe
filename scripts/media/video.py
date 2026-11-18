#!/usr/bin/env python3
"""Dựng video 9:16 / 1:1 và ảnh bối cảnh 4:5 từ tach-nen.png thật, đẩy lên bucket `media` (cho_duyet)."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402
import tai_len  # noqa: E402
import xu_ly  # noqa: E402

# Vùng an toàn TikTok 9:16 (docs/06 mục 4: y 170–1500, tránh 380px dưới và 140px phải)
VUNG_AN_TOAN_9X16 = (60, 175, 935, 1495)  # x0, y0, x1, y1

NHAN_VAN_DE = {
    "cap-am": "Cấp ẩm",
    "lam-diu": "Làm dịu",
    "sang-da": "Sáng da",
    "chong-lao-hoa": "Chống lão hóa",
    "mun": "Mụn",
    "lo-chan-long": "Lỗ chân lông",
    "chong-nang": "Chống nắng",
    "tay-te-bao-chet": "Tẩy tế bào chết",
    "cham-soc-co-the": "Chăm sóc cơ thể",
    "trang-diem": "Trang điểm",
    "vung-mat": "Vùng mắt",
}


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Chuyển mã màu #RRGGBB sang tuple (r, g, b)."""
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def tim_font(dam: bool = False) -> str | None:
    """Tìm font Unicode hỗ trợ tiếng Việt có sẵn trên máy."""
    ung_vien = (
        [
            r"C:\Windows\Fonts\segoeuib.ttf",
            r"C:\Windows\Fonts\seguisb.ttf",
            r"C:\Windows\Fonts\arialbd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
        if dam
        else [
            r"C:\Windows\Fonts\segoeui.ttf",
            r"C:\Windows\Fonts\arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    )
    for p in ung_vien:
        if Path(p).exists():
            return p
    return None


def tai_font(co: int, dam: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Tải font TrueType với cỡ chữ mong muốn."""
    duong_dan = tim_font(dam=dam)
    if duong_dan:
        return ImageFont.truetype(duong_dan, co)
    return ImageFont.load_default()


def ngat_dong(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_w: int) -> list[str]:
    """Ngắt dòng văn bản sao cho chiều rộng mỗi dòng <= max_w."""
    tu_ds = text.split()
    dong_ds: list[str] = []
    hien_tai = ""
    for tu in tu_ds:
        thu = f"{hien_tai} {tu}".strip()
        box = draw.textbbox((0, 0), thu, font=font)
        if box[2] - box[0] <= max_w or not hien_tai:
            hien_tai = thu
        else:
            dong_ds.append(hien_tai)
            hien_tai = tu
    if hien_tai:
        dong_ds.append(hien_tai)
    return dong_ds


def lay_thong_tin_san_pham(pid: str) -> dict[str, str]:
    """Lấy thông tin chuẩn từ data/products.csv cho sản phẩm."""
    for row in common.doc_products_csv():
        if row.get("id") == pid:
            return row
    raise ValueError(f"Không tìm thấy sản phẩm {pid} trong data/products.csv")


def lay_tu_khoa_san_pham(sp: dict[str, str], chien_dich: str | None = None) -> dict[str, Any]:
    """Trích xuất từ khóa hợp lệ từ data/products.csv và data/deals.yaml (không tự bịa)."""
    brand = sp.get("thuong_hieu", "").strip()
    ten = sp.get("ten_goc", "").strip() or sp.get("ten_hien_thi", "").strip()
    quy_cach = sp.get("quy_cach", "").strip()
    van_de_raw = [v.strip() for v in (sp.get("van_de") or "").split(";") if v.strip()]
    tu_khoa = [NHAN_VAN_DE[v] for v in van_de_raw if v in NHAN_VAN_DE][:2]

    deal_hook = ""
    for d in common.doc_deals_yaml():
        if not d.get("hien_thi"):
            continue
        if d.get("may_rui") and not d.get("da_dang_ky"):
            continue
        ap_dung = d.get("ap_dung_cho") or []
        thanh_phan = [tp.get("id") for tp in (d.get("thanh_phan") or []) if isinstance(tp, dict)]
        if sp.get("id") in ap_dung or sp.get("id") in thanh_phan:
            deal_hook = str(d.get("hook") or d.get("ten") or "").strip()
            break

    return {
        "nhan_tren": "NỘI ĐỊA HÀN · TẠI VIVE",
        "thuong_hieu": brand,
        "ten": ten,
        "quy_cach": quy_cach,
        "tu_khoa": tu_khoa,
        "deal_hook": deal_hook,
        "dia_chi": "LL2 UNION SQUARE",
    }


def tai_hoac_lay_tach_nen(pid: str) -> Image.Image:
    """Đọc tach-nen.png ở media/tmp/xu-ly/<id>/ hoặc tải từ Supabase bucket."""
    local_path = common.XU_LY_DIR / pid / "tach-nen.png"
    if local_path.exists():
        return Image.open(local_path).convert("RGBA")

    sb, _ = common.tao_supabase_client()
    duong_dan = common.dat_ten_duong_dan("tach_nen", san_pham_id=pid)
    data = sb.storage.from_(common.BUCKET_MEDIA).download(duong_dan)
    local_path.parent.mkdir(parents=True, exist_ok=True)
    local_path.write_bytes(data)
    return Image.open(local_path).convert("RGBA")


def tao_nen_thuong_hieu(
    rong: int,
    cao: int,
    mau_chinh: str = "#F7EEEB",
    mau_phu: str = "#E8D2CC",
    mau_nhan: str = "#CFE3D5",
) -> Image.Image:
    """Tạo nền bối cảnh gradient/hình học dịu mắt theo bảng màu docs/03."""
    c1 = hex_to_rgb(mau_chinh)
    c2 = hex_to_rgb(mau_phu)
    c3 = hex_to_rgb(mau_nhan)

    nen = Image.new("RGBA", (rong, cao), (*c1, 255))
    draw = ImageDraw.Draw(nen)
    # Gradient dọc nhẹ từ mau_chinh sang mau_phu nhạt
    for y in range(cao):
        t = (y / max(1, cao - 1)) * 0.35
        r = round(c1[0] * (1 - t) + c2[0] * t)
        g = round(c1[1] * (1 - t) + c2[1] * t)
        b = round(c1[2] * (1 - t) + c2[2] * t)
        draw.line([(0, y), (rong, y)], fill=(r, g, b, 255))

    # Vệt tròn ánh sáng mềm phía sau sản phẩm (trắng ấm & bạc hà)
    halo = Image.new("RGBA", (rong, cao), (0, 0, 0, 0))
    hd = ImageDraw.Draw(halo)
    hd.ellipse(
        (int(rong * 0.10), int(cao * 0.22), int(rong * 0.90), int(cao * 0.72)),
        fill=(255, 255, 255, 130),
    )
    hd.ellipse(
        (int(rong * -0.15), int(cao * 0.56), int(rong * 0.65), int(cao * 0.98)),
        fill=(*c3, 105),
    )
    halo = halo.filter(ImageFilter.GaussianBlur(radius=max(24, rong // 12)))
    nen = Image.alpha_composite(nen, halo)

    # Bệ đặt sản phẩm tối giản màu sáng để giữ cảm giác trưng bày tại booth
    be = Image.new("RGBA", (rong, cao), (0, 0, 0, 0))
    bd = ImageDraw.Draw(be)
    y_be = int(cao * 0.68)
    bd.rectangle((0, y_be, rong, cao), fill=(255, 255, 255, 75))
    bd.line([(0, y_be), (rong, y_be)], fill=(*c2, 160), width=2)
    nen = Image.alpha_composite(nen, be)
    return nen


def dat_san_pham_co_bong(
    nen: Image.Image,
    tach_nen: Image.Image,
    vung: tuple[int, int, int, int],
) -> Image.Image:
    """Đặt ảnh tách nền thật vào vùng chỉ định kèm bóng mềm, không sửa điểm ảnh sản phẩm."""
    x0, y0, x1, y1 = vung
    vw, vh = x1 - x0, y1 - y0
    bbox = common.tim_khung_bao_alpha(tach_nen)
    sp = tach_nen.crop(bbox) if bbox else tach_nen.convert("RGBA")

    ti_le = min(vw / sp.width, vh / sp.height)
    nw = max(1, round(sp.width * ti_le))
    nh = max(1, round(sp.height * ti_le))
    sp_resize = sp.resize((nw, nh), Image.Resampling.LANCZOS)

    px = x0 + (vw - nw) // 2
    py = y0 + (vh - nh) // 2

    # Bóng đổ tiếp đất dưới đáy sản phẩm
    bong = Image.new("RGBA", nen.size, (0, 0, 0, 0))
    bd = ImageDraw.Draw(bong)
    bw = int(nw * 0.72)
    bh = max(14, int(nh * 0.055))
    bx0 = px + (nw - bw) // 2
    by0 = py + nh - bh // 2
    bd.ellipse((bx0, by0, bx0 + bw, by0 + bh), fill=(43, 43, 42, 65))
    bong = bong.filter(ImageFilter.GaussianBlur(radius=max(8, nw // 22)))

    ket_qua = Image.alpha_composite(nen.convert("RGBA"), bong)
    lop_sp = Image.new("RGBA", nen.size, (0, 0, 0, 0))
    lop_sp.paste(sp_resize, (px, py))
    return Image.alpha_composite(ket_qua, lop_sp)


def ve_logo_vive(overlay: Image.Image, x: int, y: int, rong_muc_tieu: int = 120) -> tuple[int, int, int, int]:
    """Dán file logo gốc vive-logo-black.png (docs/03 mục 3, không gõ lại bằng font)."""
    if not common.BRAND_LOGO_BLACK.exists():
        return (x, y, x, y)
    logo = Image.open(common.BRAND_LOGO_BLACK).convert("RGBA")
    bbox = common.tim_khung_bao_alpha(logo)
    if bbox:
        logo = logo.crop(bbox)
    nh = max(1, round(logo.height * (rong_muc_tieu / logo.width)))
    logo_r = logo.resize((rong_muc_tieu, nh), Image.Resampling.LANCZOS)
    overlay.alpha_composite(logo_r, (x, y))
    return (x, y, x + rong_muc_tieu, y + nh)


def ve_chip_nhan(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    chu: str,
    font: ImageFont.ImageFont,
    mau_nen: str,
    mau_chu: str = "#2B2B2A",
    pad_x: int = 20,
    pad_y: int = 10,
) -> tuple[int, int, int, int]:
    """Vẽ nhãn bo góc màu thương hiệu, trả về hộp bao."""
    tb = draw.textbbox((0, 0), chu, font=font)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    box = (x, y, x + tw + 2 * pad_x, y + th + 2 * pad_y)
    draw.rounded_rectangle(box, radius=(box[3] - box[1]) // 2, fill=hex_to_rgb(mau_nen) + (255,))
    draw.text((x + pad_x - tb[0], y + pad_y - tb[1]), chu, font=font, fill=hex_to_rgb(mau_chu) + (255,))
    return box


def tao_anh_boi_canh_4x5(
    pid: str,
    so_thu_tu: int = 1,
    chien_dich: str | None = None,
    tai_len_ngay: bool = True,
) -> dict[str, Any]:
    """Tạo ảnh bối cảnh 1080x1350 (<300KB) đặt sản phẩm thật lên nền thương hiệu."""
    common.dam_bao_thu_muc_tam()
    sp = lay_thong_tin_san_pham(pid)
    info = lay_tu_khoa_san_pham(sp, chien_dich=chien_dich)
    tach_nen = tai_hoac_lay_tach_nen(pid)

    rong, cao = 1080, 1350
    bang_mau = [
        ("#F7EEEB", "#E8D2CC", "#CFE3D5"),
        ("#EAF3ED", "#CFE3D5", "#E8D2CC"),
        ("#F7EEEB", "#CFE3D5", "#E8D2CC"),
    ]
    c1, c2, c3 = bang_mau[(so_thu_tu - 1) % len(bang_mau)]
    khung = tao_nen_thuong_hieu(rong, cao, mau_chinh=c1, mau_phu=c2, mau_nhan=c3)
    khung = dat_san_pham_co_bong(khung, tach_nen, (160, 290, 920, 1020))

    draw = ImageDraw.Draw(khung)
    f_nhan = tai_font(22, dam=True)
    f_brand = tai_font(28, dam=True)
    f_ten = tai_font(40, dam=True)
    f_phu = tai_font(24, dam=False)

    ve_logo_vive(khung, 72, 68, rong_muc_tieu=125)
    ve_chip_nhan(draw, 630, 68, info["nhan_tren"], f_nhan, "#E8D2CC")

    den = hex_to_rgb("#2B2B2A") + (255,)
    xam = hex_to_rgb("#737373") + (255,)
    y_text = 1065
    draw.text((72, y_text), info["thuong_hieu"].upper(), font=f_brand, fill=xam)
    y_text += 38

    ten_dong = ngat_dong(draw, info["ten"], f_ten, rong - 144)[:2]
    for dong in ten_dong:
        draw.text((72, y_text), dong, font=f_ten, fill=den)
        y_text += 48

    phu_parts = [p for p in [info["quy_cach"], *info["tu_khoa"]] if p]
    if phu_parts:
        draw.text((72, y_text + 8), " · ".join(phu_parts), font=f_phu, fill=xam)

    out_dir = common.BOI_CANH_DIR / pid
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"boi-canh-{so_thu_tu}.webp"
    rgb = khung.convert("RGB")
    dung_luong, _ = xu_ly.luu_webp_duoi_gioi_han(rgb, out_path, 300 * 1024, (86, 84, 80, 74, 68))

    ket_qua: dict[str, Any] = {
        "san_pham_id": pid,
        "chien_dich": chien_dich,
        "loai": "boi_canh",
        "path": str(out_path),
        "rong": rong,
        "cao": cao,
        "dung_luong": dung_luong,
        "trang_thai": "cho_duyet",
    }
    if tai_len_ngay:
        sb, sb_url = common.tao_supabase_client()
        duong_dan = common.dat_ten_duong_dan("boi_canh", san_pham_id=pid, so_thu_tu=so_thu_tu)
        dong_cu = tai_len.tim_dong_media_cu(sb, duong_dan)
        url_moi = tai_len.tai_len_file_len_bucket(
            sb, sb_url, out_path, duong_dan, "image/webp",
            url_cu=dong_cu["url"] if dong_cu else None,
        )
        tai_len.ghi_dong_media(
            sb,
            {
                "san_pham_id": pid,
                "chien_dich": chien_dich,
                "loai": "boi_canh",
                "duong_dan": duong_dan,
                "url": url_moi,
                "rong": rong,
                "cao": cao,
                "dung_luong": dung_luong,
                "nguon": "ai_boi_canh",
                "nguon_chi_tiet": f"tach-nen thật {pid} + nền màu thương hiệu",
                "trang_thai": "cho_duyet",
                "ghi_chu": "Bối cảnh 4:5 (1080x1350), sản phẩm thật giữ nguyên điểm ảnh",
                "tao_boi": "media",
            },
        )
        ket_qua["duong_dan"] = duong_dan
        ket_qua["url"] = url_moi
    return ket_qua


def ve_khung_overlay_video(
    rong: int,
    cao: int,
    brand: str,
    tieu_de: str,
    phu_de: str,
    deal_text: str = "",
) -> tuple[Image.Image, list[tuple[int, int, int, int]]]:
    """Tạo lớp chữ và logo trong suốt cho video, tuân thủ vùng an toàn TikTok."""
    overlay = Image.new("RGBA", (rong, cao), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    hop_ds: list[tuple[int, int, int, int]] = []

    if rong == 1080 and cao == 1920:
        x0, y0, x1, y1 = VUNG_AN_TOAN_9X16
    else:
        x0, y0, x1, y1 = (60, 60, rong - 60, cao - 60)

    max_w = x1 - x0
    hop_logo = ve_logo_vive(overlay, x0, y0 + 10, rong_muc_tieu=128)
    hop_ds.append(hop_logo)

    f_chip = tai_font(22, dam=True)
    hop_chip = ve_chip_nhan(draw, x0, hop_logo[3] + 24, "NỘI ĐỊA HÀN · TẠI VIVE", f_chip, "#E8D2CC")
    hop_ds.append(hop_chip)

    # Khối chữ dưới đặt nằm gọn phía trên giới hạn dưới của vùng an toàn (y1)
    f_brand = tai_font(28, dam=True)
    f_title = tai_font(44, dam=True)
    f_sub = tai_font(26, dam=False)
    f_deal = tai_font(24, dam=True)

    den = hex_to_rgb("#2B2B2A") + (255,)
    xam = hex_to_rgb("#737373") + (255,)

    dong_tieu_de = ngat_dong(draw, tieu_de, f_title, max_w)[:2]
    y_duoi = y1 - 24
    if deal_text:
        chip_w_box = ve_chip_nhan(draw, x0, y_duoi - 52, deal_text, f_deal, "#CFE3D5")
        hop_ds.append(chip_w_box)
        y_duoi = chip_w_box[1] - 18

    if phu_de:
        sb_box = draw.textbbox((0, 0), phu_de, font=f_sub)
        sh = sb_box[3] - sb_box[1]
        draw.text((x0, y_duoi - sh), phu_de, font=f_sub, fill=xam)
        hop_ds.append((x0, y_duoi - sh, x0 + (sb_box[2] - sb_box[0]), y_duoi))
        y_duoi = y_duoi - sh - 14

    for dong in reversed(dong_tieu_de):
        tb = draw.textbbox((0, 0), dong, font=f_title)
        th = tb[3] - tb[1]
        draw.text((x0, y_duoi - th), dong, font=f_title, fill=den)
        hop_ds.append((x0, y_duoi - th, x0 + (tb[2] - tb[0]), y_duoi))
        y_duoi = y_duoi - th - 10

    if brand:
        bb = draw.textbbox((0, 0), brand.upper(), font=f_brand)
        bh = bb[3] - bb[1]
        draw.text((x0, y_duoi - bh), brand.upper(), font=f_brand, fill=xam)
        hop_ds.append((x0, y_duoi - bh, x0 + (bb[2] - bb[0]), y_duoi))

    return overlay, hop_ds


def chuan_bi_lop_san_pham_video(
    tach_nen: Image.Image,
    khung_rong: int,
    khung_cao: int,
    vung_sp: tuple[int, int, int, int],
) -> tuple[Image.Image, int, int]:
    """Tạo ảnh PNG trong suốt sản phẩm kèm bóng đổ vừa vặn vùng giữa video."""
    x0, y0, x1, y1 = vung_sp
    vw, vh = x1 - x0, y1 - y0
    bbox = common.tim_khung_bao_alpha(tach_nen)
    sp = tach_nen.crop(bbox) if bbox else tach_nen.convert("RGBA")
    ti_le = min(vw / sp.width, vh / sp.height)
    nw = max(1, round(sp.width * ti_le))
    nh = max(1, round(sp.height * ti_le))
    sp_r = sp.resize((nw, nh), Image.Resampling.LANCZOS)

    pad = 40
    lop = Image.new("RGBA", (nw + 2 * pad, nh + 2 * pad), (0, 0, 0, 0))
    # Bóng mềm dưới chân sản phẩm
    bd = ImageDraw.Draw(lop)
    bw = int(nw * 0.72)
    bh = max(14, int(nh * 0.05))
    bx0 = pad + (nw - bw) // 2
    by0 = pad + nh - bh // 2
    bd.ellipse((bx0, by0, bx0 + bw, by0 + bh), fill=(43, 43, 42, 60))
    lop = lop.filter(ImageFilter.GaussianBlur(radius=10))
    lop_sp = Image.new("RGBA", lop.size, (0, 0, 0, 0))
    lop_sp.paste(sp_r, (pad, pad))
    lop = Image.alpha_composite(lop, lop_sp)

    cx = x0 + vw // 2
    cy = y0 + vh // 2
    return lop, cx, cy


def chay_ffmpeg_dung_video(
    nen_path: Path,
    sp_path: Path,
    overlay_path: Path,
    out_path: Path,
    rong: int,
    cao: int,
    cx: int,
    cy: int,
    thoi_luong: float = 7.0,
) -> None:
    """Chạy ffmpeg dựng video H.264 30fps, zoom nhẹ sản phẩm thật + chữ thương hiệu."""
    ffmpeg = common.tim_ffmpeg()
    frames = int(round(thoi_luong * 30))
    # Zoom nền 1.0 -> 1.08; sản phẩm nổi rõ hơn (+/-22px) và phóng 0.92 -> 1.06 theo góp ý QA
    filter_complex = (
        f"[0:v]zoompan=z='min(1.0+0.08*(on/{frames}),1.08)':d={frames}:fps=30:"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={rong}x{cao},format=rgba[bg];"
        f"[1:v]format=rgba,scale=w='trunc(iw*(0.92+0.14*(t/{thoi_luong}))/2)*2':h=-2:eval=frame[sp];"
        f"[bg][sp]overlay=x='{cx}-w/2':y='{cy}-h/2+22*sin(2*PI*t/3.5)':shortest=1[mid];"
        f"[2:v]format=rgba,fade=t=in:st=0.15:d=0.45:alpha=1[ov];"
        f"[mid][ov]overlay=0:0:shortest=1,format=yuv420p[out]"
    )
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(nen_path),
        "-loop",
        "1",
        "-t",
        str(thoi_luong),
        "-i",
        str(sp_path),
        "-loop",
        "1",
        "-t",
        str(thoi_luong),
        "-i",
        str(overlay_path),
        "-filter_complex",
        filter_complex,
        "-map",
        "[out]",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-r",
        "30",
        "-an",
        "-movflags",
        "+faststart",
        str(out_path),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"ffmpeg lỗi (code {res.returncode}): {res.stderr[-600:]}")


def tao_video_san_pham(
    pid: str,
    kieu: str = "9x16",
    chien_dich: str | None = None,
    thoi_luong: float = 7.0,
    tai_len_ngay: bool = True,
) -> dict[str, Any]:
    """Dựng video 9:16 hoặc 1:1 cho 1 sản phẩm từ tach-nen.png thật."""
    common.dam_bao_thu_muc_tam()
    if kieu not in ("9x16", "1x1"):
        raise ValueError("kieu phải là 9x16 hoặc 1x1")
    if not (6.0 <= thoi_luong <= 10.0):
        raise ValueError("thoi_luong phải từ 6 đến 10 giây (docs/06 mục 4)")

    sp = lay_thong_tin_san_pham(pid)
    info = lay_tu_khoa_san_pham(sp, chien_dich=chien_dich)
    tach_nen = tai_hoac_lay_tach_nen(pid)

    rong, cao = (1080, 1920) if kieu == "9x16" else (1080, 1080)
    work = common.VIDEO_DIR / pid
    work.mkdir(parents=True, exist_ok=True)

    nen = tao_nen_thuong_hieu(rong, cao, "#F7EEEB", "#E8D2CC", "#CFE3D5")
    nen_path = work / f"nen-{kieu}.png"
    nen.convert("RGB").save(nen_path)

    vung_sp = (140, 390, 860, 1140) if kieu == "9x16" else (240, 210, 840, 770)
    lop_sp, cx, cy = chuan_bi_lop_san_pham_video(tach_nen, rong, cao, vung_sp)
    sp_path = work / f"sp-{kieu}.png"
    lop_sp.save(sp_path)

    phu_parts = [p for p in [info["quy_cach"], *info["tu_khoa"]] if p]
    overlay, hop_ds = ve_khung_overlay_video(
        rong,
        cao,
        brand=info["thuong_hieu"],
        tieu_de=info["ten"],
        phu_de=" · ".join(phu_parts),
        deal_text=info["deal_hook"],
    )
    overlay_path = work / f"overlay-{kieu}.png"
    overlay.save(overlay_path)

    out_path = work / f"{kieu}.mp4"
    chay_ffmpeg_dung_video(nen_path, sp_path, overlay_path, out_path, rong, cao, cx, cy, thoi_luong)

    dung_luong = out_path.stat().st_size
    if dung_luong >= 4 * 1024 * 1024:
        raise RuntimeError(f"Video {out_path} vượt 4MB ({dung_luong} bytes)")

    loai = "video_9x16" if kieu == "9x16" else "video_1x1"
    ket_qua: dict[str, Any] = {
        "san_pham_id": pid,
        "chien_dich": chien_dich,
        "loai": loai,
        "path": str(out_path),
        "rong": rong,
        "cao": cao,
        "thoi_luong": thoi_luong,
        "dung_luong": dung_luong,
        "trang_thai": "cho_duyet",
        "safe_zone_boxes": len(hop_ds),
    }

    if tai_len_ngay:
        sb, sb_url = common.tao_supabase_client()
        duong_dan = common.dat_ten_duong_dan(loai, san_pham_id=pid)
        dong_cu = tai_len.tim_dong_media_cu(sb, duong_dan)
        url_moi = tai_len.tai_len_file_len_bucket(
            sb, sb_url, out_path, duong_dan, "video/mp4",
            url_cu=dong_cu["url"] if dong_cu else None,
        )
        tai_len.ghi_dong_media(
            sb,
            {
                "san_pham_id": pid,
                "chien_dich": chien_dich,
                "loai": loai,
                "duong_dan": duong_dan,
                "url": url_moi,
                "rong": rong,
                "cao": cao,
                "dung_luong": dung_luong,
                "thoi_luong": thoi_luong,
                "nguon": "tong_hop",
                "nguon_chi_tiet": f"Dựng ffmpeg từ tach-nen thật {pid}",
                "trang_thai": "cho_duyet",
                "ghi_chu": f"Video {kieu} ({thoi_luong}s, vùng an toàn TikTok)",
                "tao_boi": "media",
            },
        )
        ket_qua["duong_dan"] = duong_dan
        ket_qua["url"] = url_moi
    return ket_qua


def tao_video_bo_ba_lopoe(
    chien_dich: str = "lopoe-better-balance",
    kieu: str = "9x16",
    thoi_luong: float = 8.0,
    tai_len_ngay: bool = True,
) -> dict[str, Any]:
    """Dựng video bộ ba LOPOE Better Balance từ 3 ảnh tách nền thật."""
    common.dam_bao_thu_muc_tam()
    rong, cao = (1080, 1920) if kieu == "9x16" else (1080, 1080)
    work = common.VIDEO_DIR / chien_dich
    work.mkdir(parents=True, exist_ok=True)

    nen = tao_nen_thuong_hieu(rong, cao, "#EAF3ED", "#CFE3D5", "#E8D2CC")
    nen_path = work / f"nen-bo-ba-{kieu}.png"
    nen.convert("RGB").save(nen_path)

    # Ghép bố cục 3 chai thật trên 1 lớp trong suốt (giữa ampoule, trái srm, phải kem)
    srm = tai_hoac_lay_tach_nen("LOPOE-CF")
    amp = tai_hoac_lay_tach_nen("LOPOE-AMP")
    kem = tai_hoac_lay_tach_nen("LOPOE-CR")

    nhom = Image.new("RGBA", (820, 740), (0, 0, 0, 0))
    for img_sp, box in (
        (srm, (0, 110, 290, 690)),
        (kem, (530, 120, 820, 690)),
        (amp, (240, 10, 580, 720)),
    ):
        bbox = common.tim_khung_bao_alpha(img_sp)
        cat = img_sp.crop(bbox) if bbox else img_sp
        bw, bh = box[2] - box[0], box[3] - box[1]
        tl = min(bw / cat.width, bh / cat.height)
        nw, nh = max(1, round(cat.width * tl)), max(1, round(cat.height * tl))
        r_img = cat.resize((nw, nh), Image.Resampling.LANCZOS)
        nhom.alpha_composite(r_img, (box[0] + (bw - nw) // 2, box[1] + (bh - nh) // 2))

    vung_sp = (90, 410, 910, 1150) if kieu == "9x16" else (140, 220, 940, 780)
    lop_sp, cx, cy = chuan_bi_lop_san_pham_video(nhom, rong, cao, vung_sp)
    sp_path = work / f"bo-ba-{kieu}.png"
    lop_sp.save(sp_path)

    overlay, _ = ve_khung_overlay_video(
        rong,
        cao,
        brand="LOPOE",
        tieu_de="Better Balance · Bộ ba cấp ẩm",
        phu_de="Sữa rửa mặt 160ml · Ampoule 50ml · Kem dưỡng 80ml",
        deal_text="Mua kèm sản phẩm bất kỳ, LOPOE giảm 25%",
    )
    overlay_path = work / f"overlay-bo-ba-{kieu}.png"
    overlay.save(overlay_path)

    out_path = work / f"bo-ba-{kieu}.mp4"
    chay_ffmpeg_dung_video(nen_path, sp_path, overlay_path, out_path, rong, cao, cx, cy, thoi_luong)

    dung_luong = out_path.stat().st_size
    if dung_luong >= 4 * 1024 * 1024:
        raise RuntimeError(f"Video bộ ba vượt 4MB ({dung_luong} bytes)")

    loai = "video_9x16" if kieu == "9x16" else "video_1x1"
    ket_qua: dict[str, Any] = {
        "san_pham_id": None,
        "chien_dich": chien_dich,
        "loai": loai,
        "path": str(out_path),
        "rong": rong,
        "cao": cao,
        "thoi_luong": thoi_luong,
        "dung_luong": dung_luong,
        "trang_thai": "cho_duyet",
    }
    if tai_len_ngay:
        sb, sb_url = common.tao_supabase_client()
        ten_file = f"bo-ba-{kieu}.mp4"
        duong_dan = common.dat_ten_duong_dan(loai, chien_dich=chien_dich, ten_file=ten_file)
        dong_cu = tai_len.tim_dong_media_cu(sb, duong_dan)
        url_moi = tai_len.tai_len_file_len_bucket(
            sb, sb_url, out_path, duong_dan, "video/mp4",
            url_cu=dong_cu["url"] if dong_cu else None,
        )
        tai_len.ghi_dong_media(
            sb,
            {
                "san_pham_id": None,
                "chien_dich": chien_dich,
                "loai": loai,
                "duong_dan": duong_dan,
                "url": url_moi,
                "rong": rong,
                "cao": cao,
                "dung_luong": dung_luong,
                "thoi_luong": thoi_luong,
                "nguon": "tong_hop",
                "nguon_chi_tiet": "Dựng ffmpeg từ 3 ảnh tach-nen thật LOPOE",
                "trang_thai": "cho_duyet",
                "ghi_chu": f"Video bộ ba {chien_dich} {kieu} ({thoi_luong}s)",
                "tao_boi": "media",
            },
        )
        ket_qua["duong_dan"] = duong_dan
        ket_qua["url"] = url_moi
    return ket_qua


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Dựng video hoặc ảnh bối cảnh từ ảnh tách nền thật.")
    parser.add_argument("id", nargs="?", help="Mã sản phẩm (bỏ trống nếu dùng --bo-ba)")
    parser.add_argument("--kieu", default="9x16", choices=["9x16", "1x1"], help="Tỷ lệ video")
    parser.add_argument("--thoi-luong", type=float, default=7.0, help="Độ dài video (6-10s)")
    parser.add_argument("--boi-canh", action="store_true", help="Tạo ảnh bối cảnh 4:5 (1080x1350)")
    parser.add_argument("--so-thu-tu", type=int, default=1, help="Số thứ tự ảnh bối cảnh")
    parser.add_argument("--chien-dich", default=None, help="Mã chiến dịch (vd: lopoe-better-balance)")
    parser.add_argument("--bo-ba", action="store_true", help="Dựng video bộ ba chiến dịch LOPOE")
    parser.add_argument("--khong-tai-len", action="store_true", help="Chỉ xuất file tạm, không đẩy lên Supabase")
    args = parser.parse_args()

    tai_len_ngay = not args.khong_tai_len
    if args.bo_ba:
        cd = args.chien_dich or "lopoe-better-balance"
        kq = tao_video_bo_ba_lopoe(
            chien_dich=cd, kieu=args.kieu, thoi_luong=max(6.0, args.thoi_luong), tai_len_ngay=tai_len_ngay
        )
    elif args.boi_canh:
        if not args.id:
            print("Cần truyền <id> khi dùng --boi-canh")
            sys.exit(1)
        kq = tao_anh_boi_canh_4x5(
            args.id, so_thu_tu=args.so_thu_tu, chien_dich=args.chien_dich, tai_len_ngay=tai_len_ngay
        )
    else:
        if not args.id:
            print("Cần truyền <id> hoặc --bo-ba")
            sys.exit(1)
        kq = tao_video_san_pham(
            args.id,
            kieu=args.kieu,
            chien_dich=args.chien_dich,
            thoi_luong=args.thoi_luong,
            tai_len_ngay=tai_len_ngay,
        )

    print(
        f"Xong [{kq['loai']}] {kq.get('duong_dan') or kq['path']} | "
        f"{kq['rong']}x{kq['cao']} | {kq['dung_luong']//1024}KB | {kq['trang_thai']}"
    )


if __name__ == "__main__":
    main()
