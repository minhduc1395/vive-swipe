"""Unit tests kiểm tra tính đúng đắn và quy tắc của scripts/du_lieu/."""

from __future__ import annotations

import json
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

    nguon_truong_ai = {
        "ten_en": {"nguon": "ai", "boi": "media", "luc": "2026-11-18T10:00:00Z"}
    }
    assert common.co_the_ghi_de_truong(nguon_truong_ai, "ten_en") is True

    nguon_truong_dong_bo = {
        "quy_cach": {"nguon": "dong_bo", "boi": "seed", "luc": "2026-11-18T10:00:00Z"}
    }
    assert common.co_the_ghi_de_truong(nguon_truong_dong_bo, "quy_cach") is True

    assert common.co_the_ghi_de_truong({}, "ten_en") is True
    assert common.co_the_ghi_de_truong(None, "ten_en") is True


def test_tao_ten_tieng_anh_chuan_hoa():
    """Kiểm tra hàm tạo tên tiếng Anh loại bỏ tiền tố tiếng Việt và chuyển sắc thái/màu chuẩn."""
    assert dich_bu.tao_ten_tieng_anh("Toner pad Heartleaf BHA Peeling Pad", "Heartleaf BHA Peeling Pad") == "Heartleaf BHA Peeling Pad"
    assert dich_bu.tao_ten_tieng_anh("Tinh chất Better Balance Ampoule (30ml)", "Better Balance Ampoule") == "Better Balance Ampoule (30ml)"
    assert dich_bu.tao_ten_tieng_anh("Sữa rửa mặt Egg White Pore Cleansing Foam (150ml)", "Egg White Pore Cleansing Foam") == "Egg White Pore Cleansing Foam (150ml)"
    assert dich_bu.tao_ten_tieng_anh("Kem dưỡng Aqua Cream", "Aqua Cream") == "Aqua Cream"

    assert dich_bu.tao_ten_tieng_anh("Toner pad Zero Pore Pad · Xanh dương", "Zero Pore Pad") == "Zero Pore Pad · Blue"
    assert dich_bu.tao_ten_tieng_anh("Máy chăm sóc da Age-R Booster Pro X2 · Trắng", "Age-R Booster Pro X2") == "Age-R Booster Pro X2 · White"
    assert dich_bu.tao_ten_tieng_anh("Máy chăm sóc da Age-R Booster Pro X2 · Hồng", "Age-R Booster Pro X2") == "Age-R Booster Pro X2 · Pink"
    assert dich_bu.tao_ten_tieng_anh("Toner pad Deep Vita C Pad · Nâu", "Deep Vita C Pad") == "Deep Vita C Pad · Brown"


def test_thong_tin_chinh_hang_chi_giu_url_va_ten():
    """THONG_TIN_CHINH_HANG chỉ được giữ url và ten, không gõ sẵn nội dung mô tả hay thành phần."""
    cam_khoa = {"trich_dan_goc", "mo_ta", "mo_ta_en", "thanh_phan", "van_de"}
    for pid, info in dien_thieu.THONG_TIN_CHINH_HANG.items():
        assert set(info.keys()) == {"url", "ten"}, f"Mã {pid} chứa khóa ngoài url/ten: {set(info.keys())}"
        assert info["url"].startswith("http"), f"Mã {pid} url không hợp lệ: {info['url']}"
        assert info["ten"].strip(), f"Mã {pid} thiếu ten"
        assert not (set(info.keys()) & cam_khoa)


def test_thanh_phan_khong_chua_chat_khong_co_tren_trang(monkeypatch: pytest.MonkeyPatch):
    """Trang giả không chứa chất X (vd Retinol) thì thanh_phan trích ra không được có X."""
    html_gia = (
        "<html><head><meta name='description' content='Soothing toner with Niacinamide and Panthenol.'></head>"
        "<body><p>Daily hydrating care formulated with Niacinamide and Panthenol for calm skin.</p></body></html>"
    ).encode("utf-8")

    class _FakeResp:
        status = 200
        headers = {"Content-Type": "text/html; charset=utf-8"}

        def read(self) -> bytes:
            return html_gia

        def __enter__(self):
            return self

        def __exit__(self, *_a):
            return False

    monkeypatch.setattr(dien_thieu.urllib.request, "urlopen", lambda *_a, **_kw: _FakeResp())
    kq = dien_thieu.tai_va_trich_xuat_trang("https://example.com/product")
    assert kq["thanh_cong"] is True
    assert "Niacinamide" in kq["thanh_phan_trich"]
    assert "Panthenol" in kq["thanh_phan_trich"]
    assert "Retinol" not in kq["thanh_phan_trich"]
    assert "Tranexamic Acid" not in kq["thanh_phan_trich"]


def test_ghi_db_chi_ghi_muc_da_duyet(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """--ghi-db chỉ đọc báo cáo JSON và chỉ ghi mục có da_duyet: true."""
    bao_cao = tmp_path / "bao_cao_dien_thieu.json"
    bao_cao.write_text(
        json.dumps(
            [
                {
                    "id": "SP_CHUA_DUYET",
                    "url": "https://example.com/1",
                    "da_duyet": False,
                    "mo_ta": "Không được ghi",
                    "thanh_phan": ["Niacinamide"],
                },
                {
                    "id": "SP_DA_DUYET",
                    "url": "https://example.com/2",
                    "da_duyet": True,
                    "mo_ta": "Mô tả đã duyệt",
                    "mo_ta_en": "Approved description",
                    "thanh_phan": ["Panthenol"],
                    "van_de": ["cap-am"],
                },
            ],
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    da_ghi_calls: list[tuple[str, dict]] = []
    monkeypatch.setattr(
        common,
        "ghi_san_pham_ai",
        lambda _sb, pid, updates, url_nguon=None, boi="": da_ghi_calls.append((pid, updates)),
    )
    kq = dien_thieu.ghi_db_tu_bao_cao_da_duyet(file_bao_cao=bao_cao, sb=object())
    assert kq["da_ghi"] == 1
    assert kq["bo_qua"] == 1
    assert len(da_ghi_calls) == 1
    assert da_ghi_calls[0][0] == "SP_DA_DUYET"
    assert da_ghi_calls[0][1]["thanh_phan"] == ["Panthenol"]
