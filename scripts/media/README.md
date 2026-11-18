# Bộ script xử lý media VIVE Quẹt (`scripts/media/`)

Hướng dẫn cài đặt và vận hành cho **Antigravity Media** trên Windows (chạy trong worktree riêng `../vive-swipe-media`). Tài liệu quy chuẩn đầy đủ: [docs/06-anh-va-video.md](../../docs/06-anh-va-video.md).

## 1. Cài đặt (làm 1 lần)

1. **Python 3.11+**: kiểm tra bằng `python --version`.
2. **Thư viện Python**:
   ```powershell
   python -m pip install -r scripts/media/requirements.txt
   ```
3. **FFmpeg**: cài `ffmpeg` vào `PATH` (hoặc dùng bản đi kèm từ `imageio-ffmpeg` trong `requirements.txt`, script tự dò tìm).
4. **Google Drive for desktop**: đồng bộ thư mục `Her Bazaar Pop up/08 Mockup sản phẩm`.
5. **Cấu hình `.env.local`**: chép `.env.local` từ repo chính sang thư mục worktree và đảm bảo có đủ:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (không commit, không in ra màn hình)
   - `MEDIA_NGUON_DIR=<đường dẫn tới thư mục 08 Mockup sản phẩm trên máy>`

## 2. Sáu lệnh chính

Chạy từ thư mục gốc của worktree:

```powershell
# 1. Kiểm kê sản phẩm hien_thi=true chưa có ảnh thẻ duyệt -> ghi media/tmp/kiem-ke.csv
python scripts/media/kiem_ke.py

# 2. Quét thư mục nguồn (Inbox / Drive 08 / ảnh chính hãng), nhận diện mã -> media/tmp/nguon/<id>/
python scripts/media/nhap.py "<thư mục>" --nguon drive

# 3. Tách nền (rembg), chuẩn hóa 1000x1000 (<150KB) & 400x400 (<40KB), chạy kiểm tra tự động
python scripts/media/xu_ly.py <id1> <id2> ...

# 4. Đẩy lên Supabase bucket `media` và ghi/cập nhật bảng `public.media`
python scripts/media/tai_len.py <id1> <id2> ...

# 5. Dựng video 9:16 hoặc 1:1 từ tach-nen.png bằng ffmpeg (đặt trang_thai = cho_duyet)
python scripts/media/video.py <id> --kieu 9x16
# Hoặc dựng ảnh bối cảnh 4:5 (1080x1350, <300KB):
python scripts/media/video.py <id> --boi-canh
# Hoặc dựng video bộ ba chiến dịch:
python scripts/media/video.py --chien-dich lopoe-better-balance --bo-ba

# 6. Tạo trang duyệt media/tmp/duyet.html cho các dòng cho_duyet (và duyet)
python scripts/media/trang_duyet.py
```

## 3. Chạy unit test

```powershell
python -m pytest scripts/media/test_media.py -v
```
