"""Unit test cho bộ script scripts/media/."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common  # noqa: E402
import nhap  # noqa: E402
import video  # noqa: E402


class TestDatTenDuongDan:
    def test_san_pham_paths(self) -> None:
        assert common.dat_ten_duong_dan("the", "8809369850248") == "san-pham/8809369850248/the.webp"
        assert common.dat_ten_duong_dan("the_nho", "8809369850248") == "san-pham/8809369850248/the-nho.webp"
        assert common.dat_ten_duong_dan("tach_nen", "LOPOE-CF") == "san-pham/LOPOE-CF/tach-nen.png"
        assert common.dat_ten_duong_dan("boi_canh", "LOPOE-AMP", so_thu_tu=2) == "san-pham/LOPOE-AMP/boi-canh-2.webp"
        assert common.dat_ten_duong_dan("video_9x16", "LOPOE-CR") == "video/LOPOE-CR/9x16.mp4"
        assert common.dat_ten_duong_dan("video_1x1", "LOPOE-CR") == "video/LOPOE-CR/1x1.mp4"

    def test_chien_dich_paths(self) -> None:
        assert (
            common.dat_ten_duong_dan(
                "video_9x16", chien_dich="lopoe-better-balance", ten_file="bo-ba-9x16.mp4"
            )
            == "chien-dich/lopoe-better-balance/bo-ba-9x16.mp4"
        )
        assert (
            common.dat_ten_duong_dan(
                "boi_canh", chien_dich="lopoe-better-balance", ten_file="banner.webp"
            )
            == "chien-dich/lopoe-better-balance/banner.webp"
        )

    def test_loi_khi_thieu_id_hoac_loai_sai(self) -> None:
        with pytest.raises(ValueError):
            common.dat_ten_duong_dan("khong_ton_tai", "LOPOE-CF")
        with pytest.raises(ValueError):
            common.dat_ten_duong_dan("the")
        with pytest.raises(ValueError):
            common.dat_ten_duong_dan("the", chien_dich="lopoe-better-balance")


class TestTaoUrlCongKhai:
    def test_url_moi_va_tang_phien_ban(self) -> None:
        base = "https://dsrejhghgbvnwgxpdhee.supabase.co"
        dd = "san-pham/8809369850248/the.webp"
        url1 = common.tao_url_cong_khai(base, dd)
        assert url1 == f"{base}/storage/v1/object/public/media/{dd}"
        url2 = common.tao_url_cong_khai(base, dd, url_cu=url1)
        assert url2 == f"{url1}?v=2"
        url3 = common.tao_url_cong_khai(base, dd, url_cu=url2)
        assert url3 == f"{url1}?v=3"


class TestQuyetDinhTrangThai:
    def test_tu_duyet_drive_va_booth(self) -> None:
        st, ly_do = common.quyet_dinh_trang_thai(
            loai="the",
            nguon="drive",
            kich_thuoc=(1000, 1000),
            dung_luong=85_000,
            khop_ma=True,
            ty_le_vien_trong_suot=0.99,
            chu_la=[],
        )
        assert st == "duyet"
        assert ly_do == []

        st2, _ = common.quyet_dinh_trang_thai(
            loai="the_nho",
            nguon="booth",
            kich_thuoc=(400, 400),
            dung_luong=25_000,
            khop_ma=True,
            ty_le_vien_trong_suot=0.98,
        )
        assert st2 == "duyet"

    def test_nguon_thuong_hieu_theo_luat_moi(self) -> None:
        st_cho, ld = common.quyet_dinh_trang_thai(
            loai="the",
            nguon="thuong_hieu",
            kich_thuoc=(1000, 1000),
            dung_luong=70_000,
            khop_ma=True,
            ty_le_vien_trong_suot=1.0,
            khop_ma_chac_chan=False,
        )
        assert st_cho == "cho_duyet"
        assert len(ld) >= 1

        st_ok, ld_ok = common.quyet_dinh_trang_thai(
            loai="the",
            nguon="thuong_hieu",
            kich_thuoc=(1000, 1000),
            dung_luong=70_000,
            khop_ma=True,
            ty_le_vien_trong_suot=1.0,
            khop_ma_chac_chan=True,
        )
        assert st_ok == "duyet"
        assert ld_ok == []

    def test_cho_duyet_khi_vi_pham_quy_chuan_hoac_chu_la(self) -> None:
        # Ai bối cảnh / video luôn cho_duyet
        st_ai, _ = common.quyet_dinh_trang_thai(
            loai="boi_canh",
            nguon="ai_boi_canh",
            kich_thuoc=(1080, 1350),
            dung_luong=120_000,
            khop_ma=True,
            ty_le_vien_trong_suot=0.0,
        )
        assert st_ai == "cho_duyet"

        # Quá dung lượng 150KB
        st_heavy, _ = common.quyet_dinh_trang_thai(
            loai="the",
            nguon="drive",
            kich_thuoc=(1000, 1000),
            dung_luong=160 * 1024,
            khop_ma=True,
            ty_le_vien_trong_suot=1.0,
        )
        assert st_heavy == "cho_duyet"

        # Viền không trong suốt <= 95%
        st_bg, _ = common.quyet_dinh_trang_thai(
            loai="the",
            nguon="drive",
            kich_thuoc=(1000, 1000),
            dung_luong=50_000,
            khop_ma=True,
            ty_le_vien_trong_suot=0.90,
        )
        assert st_bg == "cho_duyet"

        # Có chữ sàn bán lẻ / watermark
        chu_la = common.phat_hien_chu_la("san-pham-shopee-official.png")
        assert "shopee" in chu_la
        st_wm, _ = common.quyet_dinh_trang_thai(
            loai="the",
            nguon="drive",
            kich_thuoc=(1000, 1000),
            dung_luong=50_000,
            khop_ma=True,
            ty_le_vien_trong_suot=1.0,
            chu_la=chu_la,
        )
        assert st_wm == "cho_duyet"


class TestChuanHoaKichThuoc:
    def _tao_chai_mau(self, w: int = 200, h: int = 500) -> Image.Image:
        img = Image.new("RGBA", (600, 600), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        x0 = (600 - w) // 2
        y0 = (600 - h) // 2
        draw.rectangle((x0, y0, x0 + w - 1, y0 + h - 1), fill=(120, 180, 220, 255))
        return img

    def test_chuan_hoa_1000_va_400_chiem_80_phan_tram(self) -> None:
        sp = self._tao_chai_mau(200, 500)
        the = common.chuan_hoa_kich_thuoc(sp, kich_thuoc=1000, ty_le_san_pham=0.80)
        assert the.size == (1000, 1000)
        assert common.tinh_ty_le_trong_suot_vien(the) > 0.99

        # Kiểm tra chiều cao vùng lõi đặc (alpha >= 200) đạt ~800px (80%)
        alpha_solid = the.getchannel("A").point(lambda a: 255 if a >= 200 else 0)
        bx0, by0, bx1, by1 = alpha_solid.getbbox()
        assert 795 <= (by1 - by0) <= 805
        assert abs((bx0 + bx1) / 2 - 500) <= 2

        the_nho = common.chuan_hoa_kich_thuoc(sp, kich_thuoc=400, ty_le_san_pham=0.80)
        assert the_nho.size == (400, 400)
        alpha_nho = the_nho.getchannel("A").point(lambda a: 255 if a >= 200 else 0)
        nx0, ny0, nx1, ny1 = alpha_nho.getbbox()
        assert 316 <= (ny1 - ny0) <= 324

    def test_nen_trang_fallback(self) -> None:
        sp = self._tao_chai_mau(300, 300)
        out = common.chuan_hoa_kich_thuoc(sp, kich_thuoc=1000, nen_trang=True)
        assert out.size == (1000, 1000)
        assert out.mode == "RGB"
        assert out.getpixel((0, 0)) == (255, 255, 255)


class TestNhapVaSafeZone:
    def test_nhan_dien_ma_ten_file_va_tracker(self, tmp_path: Path) -> None:
        chi_muc = {"8809369850248": "8809369850248", "lopoe-cf": "LOPOE-CF"}
        p1 = tmp_path / "8809369850248_1.jpg"
        p1.write_bytes(b"")
        pid1, _ = nhap.nhan_dien_ma(p1, chi_muc, quet_barcode=False)
        assert pid1 == "8809369850248"

        p2 = tmp_path / "anh_booth_01.jpg"
        p2.write_bytes(b"")
        pid2, cach2 = nhap.nhan_dien_ma(
            p2, chi_muc, tracker_map={"anh_booth_01.jpg": "LOPOE-CF"}, quet_barcode=False
        )
        assert pid2 == "LOPOE-CF"
        assert cach2 == "tracker"

    def test_video_9x16_nam_trong_safe_zone_tiktok(self) -> None:
        _, hops = video.ve_khung_overlay_video(
            1080,
            1920,
            brand="LOPOE",
            tieu_de="Better Balance Cleansing Foam",
            phu_de="160ml · Cấp ẩm",
            deal_text="LOPOE giảm 25% khi mua kèm",
        )
        assert len(hops) >= 3
        for x0, y0, x1, y1 in hops:
            assert y0 >= 170
            assert y1 <= 1500
            assert x1 <= 940
