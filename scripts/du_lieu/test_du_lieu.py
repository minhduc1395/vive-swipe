"""Unit tests kiểm tra tính đúng đắn và quy tắc của scripts/du_lieu/."""

from __future__ import annotations

import sys
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str((ROOT / "scripts" / "du_lieu").resolve()))

import common
import dich_bu
import dien_thieu


def test_co_the_ghi_de_truong_luat_nguoi_va_excel():
    """Kiểm tra AI không bao giờ ghi đè trường do 'nguoi' hoặc 'excel' nhập (docs/07 §3)."""
    nguon_truong_nguoi = {
        "ten_en": {"nguon": "nguoi", "boi": "kho_admin", "luc": "2026-11-18T10:00:00Z"}
    }
    assert common.co_the_ghi_de_truong(nguon_truong_nguoi, "ten_en") is False

    nguon_truong_excel = {
        "mo_ta": {"nguon": "excel", "boi": "kho_file", "luc": "2026-11-18T10:00:00Z"}
    }
    assert common.co_the_ghi_de_truong(nguon_truong_excel, "mo_ta") is False

    # AI hoặc dong_bo hoặc chưa có nguồn -> được ghi đè/bổ sung
    nguon_truong_ai = {
        "ten_en": {"nguon": "ai", "boi": "media", "luc": "2026-11-18T10:00:00Z"}
    }
    assert common.co_the_ghi_de_truong(nguon_truong_ai, "ten_en") is True

    nguon_truong_dong_bo = {
        "quy_cach": {"nguon": "dong_bo", "boi": "seed", "luc": "2026-11-18T10:00:00Z"}
    }
    assert common.co_the_ghi_de_truong(nguon_truong_dong_bo, "quy_cach") is True

    # Trường chưa có trong nguon_truong
    assert common.co_the_ghi_de_truong({}, "ten_en") is True
    assert common.co_the_ghi_de_truong(None, "ten_en") is True


def test_tao_ten_tieng_anh_chuan_hoa():
    """Kiểm tra hàm tạo tên tiếng Anh loại bỏ tiền tố tiếng Việt và chuyển sắc thái/màu chuẩn."""
    # Tiền tố loại sản phẩm
    assert dich_bu.tao_ten_tieng_anh("Toner pad Heartleaf BHA Peeling Pad", "Heartleaf BHA Peeling Pad") == "Heartleaf BHA Peeling Pad"
    assert dich_bu.tao_ten_tieng_anh("Tinh chất Better Balance Ampoule (30ml)", "Better Balance Ampoule") == "Better Balance Ampoule (30ml)"
    assert dich_bu.tao_ten_tieng_anh("Sữa rửa mặt Egg White Pore Cleansing Foam (150ml)", "Egg White Pore Cleansing Foam") == "Egg White Pore Cleansing Foam (150ml)"
    assert dich_bu.tao_ten_tieng_anh("Kem dưỡng Aqua Cream", "Aqua Cream") == "Aqua Cream"

    # Màu sắc / biến thể tiếng Việt
    assert dich_bu.tao_ten_tieng_anh("Toner pad Zero Pore Pad · Xanh dương", "Zero Pore Pad") == "Zero Pore Pad · Blue"
    assert dich_bu.tao_ten_tieng_anh("Máy chăm sóc da Age-R Booster Pro X2 · Trắng", "Age-R Booster Pro X2") == "Age-R Booster Pro X2 · White"
    assert dich_bu.tao_ten_tieng_anh("Máy chăm sóc da Age-R Booster Pro X2 · Hồng", "Age-R Booster Pro X2") == "Age-R Booster Pro X2 · Pink"
    assert dich_bu.tao_ten_tieng_anh("Toner pad Deep Vita C Pad · Nâu", "Deep Vita C Pad") == "Deep Vita C Pad · Brown"


def test_thong_tin_chinh_hang_co_url_hop_le():
    """Kiểm tra toàn bộ mục dữ liệu chính hãng đều có URL nguồn và mô tả song ngữ."""
    for pid, info in dien_thieu.THONG_TIN_CHINH_HANG.items():
        assert "url" in info, f"Mã {pid} thiếu url nguồn"
        assert info["url"].startswith("http"), f"Mã {pid} url không hợp lệ: {info['url']}"
        assert "mo_ta" in info and len(info["mo_ta"]) > 10, f"Mã {pid} thiếu mo_ta"
        assert "mo_ta_en" in info and len(info["mo_ta_en"]) > 10, f"Mã {pid} thiếu mo_ta_en"
        assert "thanh_phan" in info and isinstance(info["thanh_phan"], list), f"Mã {pid} thiếu thanh_phan"
