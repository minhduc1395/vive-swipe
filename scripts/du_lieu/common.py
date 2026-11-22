"""Tiện ích dùng chung cho các script nhập liệu và dịch bù trong scripts/du_lieu/."""

from __future__ import annotations

import datetime
import os
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent

# Tái sử dụng logic Supabase client từ scripts.media.common
sys.path.insert(0, str(ROOT.resolve()))
from scripts.media import common as media_common  # noqa: E402


def tai_env() -> dict[str, str]:
    return media_common.tai_env()


def tao_supabase_client(env: dict[str, str] | None = None) -> tuple[Any, str]:
    return media_common.tao_supabase_client(env=env)


def iso_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def co_the_ghi_de_truong(nguon_truong: dict[str, Any] | None, truong: str) -> bool:
    """Kiểm tra luật ghi đè docs/07 mục 3:
    - 'nguoi', 'excel': AI tuyệt đối không được ghi đè.
    - 'ai', 'dong_bo' hoặc chưa có thông tin: AI được ghi đè/bổ sung.
    """
    if not nguon_truong or not isinstance(nguon_truong, dict):
        return True
    info = nguon_truong.get(truong)
    if not info or not isinstance(info, dict):
        return True
    nguon_hien_tai = str(info.get("nguon", "")).lower()
    if nguon_hien_tai in ("nguoi", "excel"):
        return False
    return True


def ghi_san_pham_ai(
    sb: Any,
    pid: str,
    cac_truong: dict[str, Any],
    url_nguon: str | None = None,
    boi: str = "media",
) -> dict[str, Any]:
    """Cập nhật các trường cho sản phẩm do AI thực hiện.
    Tuân thủ nghiêm ngặt docs/07:
    1. Kiểm tra từng trường trong nguon_truong: bỏ qua nếu đã do 'nguoi' hoặc 'excel' ghi.
    2. Ghi nhận thông tin nguồn vào nguon_truong[truong].
    3. Cập nhật san_pham.
    4. Chuẩn hóa bản ghi lich_su_san_pham sinh bởi trigger sang nguon='ai', boi='media'.
    """
    # 1. Lấy thông tin hiện tại của sản phẩm
    sp_res = (
        sb.table("san_pham")
        .select("id,nguon_truong")
        .eq("id", pid)
        .limit(1)
        .execute()
    )
    if not sp_res.data:
        raise ValueError(f"Không tìm thấy sản phẩm với id: {pid}")

    sp = sp_res.data[0]
    nguon_truong: dict[str, Any] = dict(sp.get("nguon_truong") or {})

    # 2. Lọc các trường được phép cập nhật
    truong_hop_le: dict[str, Any] = {}
    truong_bi_bo_qua: list[str] = []
    thoi_diem = iso_now()

    for k, v in cac_truong.items():
        if not co_the_ghi_de_truong(nguon_truong, k):
            truong_bi_bo_qua.append(k)
            continue
        truong_hop_le[k] = v
        nguon_truong[k] = {
            "nguon": "ai",
            "boi": boi,
            "luc": thoi_diem,
            "url": url_nguon,
        }

    if not truong_hop_le:
        return {
            "id": pid,
            "da_cap_nhat": {},
            "bo_qua": truong_bi_bo_qua,
            "ly_do": "Mọi trường yêu cầu đều đã do 'nguoi' hoặc 'excel' bảo vệ",
        }

    # 3. Chuẩn bị payload cập nhật
    payload = dict(truong_hop_le)
    payload["nguon_truong"] = nguon_truong
    payload["cap_nhat"] = thoi_diem

    moc_truoc = iso_now()
    sb.table("san_pham").update(payload).eq("id", pid).execute()

    # 4. Chuẩn hóa dòng lịch sử mới được ghi bởi trigger
    try:
        sb.table("lich_su_san_pham").update({"nguon": "ai", "boi": boi}).eq(
            "san_pham_id", pid
        ).eq("nguon", "khong_ro").gte("luc", moc_truoc).execute()
    except Exception:
        pass

    return {
        "id": pid,
        "da_cap_nhat": truong_hop_le,
        "bo_qua": truong_bi_bo_qua,
    }


def tao_lo_nhap_lieu(
    sb: Any,
    ten_file: str,
    kenh: str = "drive_ai",
    boi: str = "media",
) -> str:
    """Tạo một dòng lô nhập liệu mới, trả về UUID của lô."""
    res = (
        sb.table("lo_nhap_lieu")
        .insert(
            {
                "ten_file": ten_file,
                "kenh": kenh,
                "trang_thai": "xem_truoc",
                "boi": boi,
            }
        )
        .execute()
    )
    if not res.data:
        raise RuntimeError(f"Không thể tạo lo_nhap_lieu cho file {ten_file}")
    return str(res.data[0]["id"])


def cap_nhat_lo_nhap_lieu(
    sb: Any,
    lo_id: str,
    trang_thai: str,
    so_dong: int,
    so_moi: int,
    so_sua: int,
    so_loi: int,
    ket_qua: dict[str, Any] | None = None,
) -> None:
    """Cập nhật kết quả xử lý của lô nhập liệu."""
    payload: dict[str, Any] = {
        "trang_thai": trang_thai,
        "so_dong": so_dong,
        "so_moi": so_moi,
        "so_sua": so_sua,
        "so_loi": so_loi,
        "ket_qua": ket_qua or {},
    }
    if trang_thai == "da_ap_dung":
        payload["ap_dung_luc"] = iso_now()
    sb.table("lo_nhap_lieu").update(payload).eq("id", lo_id).execute()
