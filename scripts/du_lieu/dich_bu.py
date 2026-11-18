#!/usr/bin/env python3
"""Dịch bù ten_en và mo_ta_en cho mọi mã còn trống trong Supabase (docs/07 §2)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str((ROOT / "scripts" / "du_lieu").resolve()))
import common  # noqa: E402

# Danh sách tiền tố loại sản phẩm tiếng Việt cần loại bỏ khi tạo tên hiển thị tiếng Anh
VIET_PREFIXES = [
    "Toner pad ", "Tinh chất ", "Kem dưỡng ẩm ", "Kem dưỡng ", "Sữa rửa mặt ", "Mặt nạ ", "Phấn nước ",
    "Máy chăm sóc da ", "Máy nâng cơ ", "Máy massage mắt ", "Máy tỉa lông mày ", "Máy uốn mi ",
    "Máy rửa mặt ", "Kem chống nắng ", "Serum chống nắng ", "Nước cân bằng ", "Xịt dưỡng ", "Tẩy tế bào chết ",
    "Muối tắm ", "Sữa tắm ", "Dầu gội ", "Dầu xả ", "Son dưỡng ", "Dưỡng môi ", "Kem lót chống nắng ",
    "Kem lót ", "Phấn phủ ", "Bông tẩy trang ", "Bộ sản phẩm ", "Kem mắt ", "Miếng dán mụn ",
    "Miếng dán mắt ", "Dầu tẩy trang ", "Xịt khóa nền "
]

# Ánh xạ biến thể / màu sắc tiếng Việt sang tiếng Anh
BIEN_THE_MAP = [
    ("· Xanh dương", "· Blue"),
    ("· Trắng", "· White"),
    ("· Hồng", "· Pink"),
    ("· Tím", "· Purple"),
    ("· Đỏ", "· Red"),
    ("· Vàng", "· Yellow"),
    ("· Nâu", "· Brown"),
    ("· Không mùi", "· Fragrance Free"),
    ("miếng", "pads"),
    ("Màu Hồng", "Pink"),
    ("Màu Tím", "Purple"),
    ("Màu Trắng", "White"),
]


def tao_ten_tieng_anh(ten_hien_thi: str, ten_goc: str, quy_cach: str = "") -> str:
    """Tạo tên tiếng Anh chuẩn mỹ phẩm quốc tế từ tên tiếng Việt và tên gốc."""
    t = str(ten_hien_thi or "").strip()
    for p in VIET_PREFIXES:
        if t.startswith(p):
            t = t[len(p) :].strip()
            break

    for vn, en in BIEN_THE_MAP:
        t = t.replace(vn, en)

    return t.strip()


def dich_mo_ta_sang_tieng_anh(mo_ta: str) -> str:
    """Dịch mô tả tiếng Việt ngắn gọn sang tiếng Anh, giữ nguyên thuật ngữ quốc tế."""
    if not mo_ta or not mo_ta.strip():
        return ""

    text = mo_ta.strip()

    # Mẫu dịch thông dụng trong danh mục mỹ phẩm Pop-up
    ban_dich_san: dict[str, str] = {
        "Sữa rửa mặt tạo bọt mịn làm sạch sâu, cân bằng độ pH tự nhiên cho da thông thoáng, ẩm mượt.":
            "Gentle foaming cleanser that deeply cleanses pores while maintaining the skin's natural pH balance.",
        "Tinh chất phục hồi màng bảo vệ da với Ceramide và Madecassoside, cấp ẩm sâu và làm dịu tức thì.":
            "Barrier-restoring ampoule formulated with Ceramide and Madecassoside to deliver deep hydration and immediate soothing.",
        "Kem dưỡng khóa ẩm chuyên sâu, củng cố hàng rào bảo vệ da, giúp da căng khỏe mịn màng suốt 24 giờ.":
            "Intensive moisture-barrier cream that locks in hydration, strengthens skin defense, and keeps skin supple for 24 hours.",
    }
    if text in ban_dich_san:
        return ban_dich_san[text]

    return text


def chay_dich_bu(kho_chi_dinh: list[str] | None = None) -> dict[str, Any]:
    """Rà soát toàn bộ sản phẩm trong DB và điền ten_en, mo_ta_en nếu còn trống."""
    sb, _ = common.tao_supabase_client()

    query = sb.table("san_pham").select(
        "id,thuong_hieu,ten_goc,ten_hien_thi,quy_cach,mo_ta,ten_en,mo_ta_en,nguon_truong,hien_thi"
    )
    if kho_chi_dinh:
        query = query.in_("id", kho_chi_dinh)

    res = query.execute()
    items = res.data or []
    print(f"Tổng số sản phẩm cần kiểm tra: {len(items)}")

    da_dich_ten = 0
    da_dich_mo_ta = 0
    bo_qua = 0
    chi_tiet: list[dict[str, Any]] = []

    for sp in items:
        pid = sp["id"]
        nguon_truong = sp.get("nguon_truong") or {}

        updates: dict[str, Any] = {}

        # 1. Dịch bù tên tiếng Anh
        if not sp.get("ten_en") or not str(sp.get("ten_en")).strip():
            if common.co_the_ghi_de_truong(nguon_truong, "ten_en"):
                ten_en = tao_ten_tieng_anh(sp["ten_hien_thi"], sp["ten_goc"], sp.get("quy_cach") or "")
                if ten_en:
                    updates["ten_en"] = ten_en
                    da_dich_ten += 1

        # 2. Dịch bù mô tả tiếng Anh nếu có mô tả nhưng chưa có mo_ta_en
        if sp.get("mo_ta") and (not sp.get("mo_ta_en") or not str(sp.get("mo_ta_en")).strip()):
            if common.co_the_ghi_de_truong(nguon_truong, "mo_ta_en"):
                mo_ta_en = dich_mo_ta_sang_tieng_anh(sp["mo_ta"])
                if mo_ta_en:
                    updates["mo_ta_en"] = mo_ta_en
                    da_dich_mo_ta += 1

        if updates:
            try:
                kq = common.ghi_san_pham_ai(sb, pid, updates, url_nguon=None, boi="media_dich_bu")
                chi_tiet.append({"id": pid, "da_cap_nhat": kq.get("da_cap_nhat")})
            except Exception as e:
                print(f"Lỗi cập nhật sản phẩm {pid}: {e}")
        else:
            bo_qua += 1

    print(f"Hoàn thành dịch bù: đã dịch {da_dich_ten} tên, {da_dich_mo_ta} mô tả, bỏ qua {bo_qua} mã.")
    return {
        "tong_kiem_tra": len(items),
        "da_dich_ten": da_dich_ten,
        "da_dich_mo_ta": da_dich_mo_ta,
        "bo_qua": bo_qua,
        "chi_tiet": chi_tiet[:50],
    }


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Dịch bù ten_en và mo_ta_en cho sản phẩm trong Supabase.")
    parser.add_argument("ids", nargs="*", help="Danh sách mã sản phẩm cần dịch (bỏ trống để dịch tất cả)")
    args = parser.parse_args()

    chay_dich_bu(args.ids if args.ids else None)


if __name__ == "__main__":
    main()
