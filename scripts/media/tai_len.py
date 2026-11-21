#!/usr/bin/env python3
"""Đẩy ảnh đã xử lý lên bucket `media` của Supabase và ghi/cập nhật bảng `public.media`."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402

MIME_THEO_LOAI = {
    "tach_nen": "image/png",
    "the": "image/webp",
    "the_nho": "image/webp",
    "boi_canh": "image/webp",
    "video_9x16": "video/mp4",
    "video_1x1": "video/mp4",
    "video_4x5": "video/mp4",
}


def tai_len_file_len_bucket(
    sb: Any,
    sb_url: str,
    file_path: Path,
    duong_dan: str,
    content_type: str,
    url_cu: str | None = None,
) -> str:
    """Đẩy 1 file lên bucket `media` (ghi đè nếu đã có) và trả về URL công khai."""
    du_lieu = file_path.read_bytes()
    sb.storage.from_(common.BUCKET_MEDIA).upload(
        duong_dan,
        du_lieu,
        file_options={
            "content-type": content_type,
            "upsert": "true",
            "cache-control": "3600",
        },
    )
    return common.tao_url_cong_khai(sb_url, duong_dan, url_cu=url_cu)


def tim_dong_media_cu(sb: Any, duong_dan: str) -> dict[str, Any] | None:
    """Tìm dòng hiện có trong public.media theo duong_dan."""
    res = (
        sb.table("media")
        .select("id,duong_dan,url,trang_thai")
        .eq("duong_dan", duong_dan)
        .limit(1)
        .execute()
    )
    rows = res.data or []
    return rows[0] if rows else None


def ghi_dong_media(sb: Any, row: dict[str, Any]) -> dict[str, Any]:
    """Chèn hoặc cập nhật dòng trong public.media theo duong_dan (unique)."""
    res = sb.table("media").upsert(row, on_conflict="duong_dan").execute()
    data = res.data or []
    return data[0] if data else row


def tai_len_san_pham(
    pid: str,
    ep_cho_duyet: bool = False,
    ghi_chu_them: str = "",
) -> dict[str, Any]:
    """Đẩy tach_nen, the, the_nho của 1 sản phẩm lên Supabase."""
    thu_muc = common.XU_LY_DIR / pid
    kq_path = thu_muc / "ket-qua.json"
    if not kq_path.exists():
        raise FileNotFoundError(f"Chưa chạy xu_ly.py cho {pid} ({kq_path} không tồn tại)")

    kq = json.loads(kq_path.read_text(encoding="utf-8"))
    sb, sb_url = common.tao_supabase_client()

    nguon = kq.get("nguon") or "drive"
    nguon_chi_tiet = kq.get("nguon_chi_tiet") or ""
    cach_khop = kq.get("cach_khop") or ""

    ket_qua_tai: dict[str, Any] = {}
    for loai in ("tach_nen", "the", "the_nho"):
        info = kq["files"][loai]
        file_path = Path(info["path"])
        if not file_path.exists():
            raise FileNotFoundError(f"Thiếu file đã xử lý: {file_path}")

        duong_dan = common.dat_ten_duong_dan(loai, san_pham_id=pid)
        dong_cu = tim_dong_media_cu(sb, duong_dan)
        url_cu = dong_cu.get("url") if dong_cu else None
        url_moi = tai_len_file_len_bucket(
            sb,
            sb_url,
            file_path,
            duong_dan,
            MIME_THEO_LOAI[loai],
            url_cu=url_cu,
        )

        # Luật duyệt BOD 21/11: Media luôn đẩy trạng thái 'cho_duyet', không bao giờ tự đặt 'duyet'
        # kể cả khi ket-qua.json cũ còn ghi 'duyet'. Tham số ep_cho_duyet giữ lại để tương thích CLI.
        _ = ep_cho_duyet
        trang_thai = "cho_duyet"
        ly_do = list(info.get("ly_do") or [])
        ghi_chu_parts = []
        if cach_khop:
            ghi_chu_parts.append(f"khớp: {cach_khop}")
        if ghi_chu_them:
            ghi_chu_parts.append(ghi_chu_them)
        if ly_do:
            ghi_chu_parts.append("; ".join(ly_do))

        payload = {
            "san_pham_id": pid,
            "loai": loai,
            "duong_dan": duong_dan,
            "url": url_moi,
            "rong": int(info["rong"]),
            "cao": int(info["cao"]),
            "dung_luong": int(info["dung_luong"]),
            "nguon": nguon,
            "nguon_chi_tiet": nguon_chi_tiet,
            "trang_thai": trang_thai,
            "ghi_chu": " | ".join(ghi_chu_parts) or None,
            "tao_boi": "media",
        }
        ghi_dong_media(sb, payload)
        ket_qua_tai[loai] = {"duong_dan": duong_dan, "url": url_moi, "trang_thai": trang_thai}

    sp_res = sb.table("san_pham").select("id,anh").eq("id", pid).limit(1).execute()
    anh_sp = sp_res.data[0]["anh"] if sp_res.data else None
    return {"id": pid, "da_tai": ket_qua_tai, "san_pham_anh": anh_sp}


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Đẩy ảnh đã xử lý lên Supabase bucket `media`.")
    parser.add_argument("ids", nargs="*", help="Danh sách mã sản phẩm cần tải lên")
    parser.add_argument("--all", action="store_true", help="Tải lên mọi mã đã có trong media/tmp/xu-ly/")
    parser.add_argument("--cho-duyet", action="store_true", help="Đặt toàn bộ sang cho_duyet để QA")
    parser.add_argument("--ghi-chu", default="", help="Ghi chú thêm vào cột ghi_chu")
    args = parser.parse_args()

    ids = list(args.ids)
    if args.all and common.XU_LY_DIR.exists():
        for d in sorted(common.XU_LY_DIR.iterdir()):
            if d.is_dir() and (d / "ket-qua.json").exists() and d.name not in ids:
                ids.append(d.name)

    if not ids:
        print("Cần truyền ít nhất 1 mã sản phẩm hoặc --all")
        sys.exit(1)

    for pid in ids:
        try:
            kq = tai_len_san_pham(pid, ep_cho_duyet=args.cho_duyet, ghi_chu_them=args.ghi_chu)
            the = kq["da_tai"]["the"]
            print(
                f"[{pid}] đã tải -> {the['duong_dan']} ({the['trang_thai']}) | san_pham.anh={kq['san_pham_anh']}"
            )
        except Exception as e:
            print(f"[{pid}] LỖI tải lên: {e}")


if __name__ == "__main__":
    main()
