# 06 · Ảnh và video sản phẩm: quy trình và hạ tầng

Cập nhật: 18/11/2026. Người làm chính là **Antigravity Media**: một chat Antigravity riêng, chạy song song với Antigravity làm code. Tên trong handoff là `media`.

## 1. Mục tiêu
Mọi sản phẩm `hien_thi = true` (129 mã) có ảnh thẻ đúng mã trước 24/11. Thứ tự làm theo W004: LOPOE, Medicube, Celimax, SKINFOOD, Rep!el, Uniura, salTherapy, Tiela, Dermal.
Sau đó làm thêm:
- ảnh bối cảnh cho landing và deal;
- video ngắn cho TikTok, Reels và web.

Media lưu một chỗ, web đọc thẳng từ đó, không cần deploy lại.

## 2. Hạ tầng (Claude đã tạo 18/11)
| Tầng | Ở đâu | Ai ghi | Ghi chú |
|---|---|---|---|
| Ảnh thô (đầu vào) | Google Drive `Her Bazaar Pop up/08 Mockup sản phẩm/` | Chủ dự án, nhân viên, Media | Thư mục `00 Inbox` cho ảnh chụp ở booth (https://drive.google.com/drive/folders/1EgROHqS-Nfg0lFpe7lK2B64u4N3c_df6). Trên máy Windows dùng Google Drive for desktop; đường dẫn đặt trong biến `MEDIA_NGUON_DIR` của `.env.local` |
| Kho chính (đầu ra) | Supabase Storage, bucket `media` (công khai để đọc) | Chỉ script phía máy (service role) | URL: `https://dsrejhghgbvnwgxpdhee.supabase.co/storage/v1/object/public/media/<đường dẫn>` |
| Sổ quản lý | Bảng `public.media` | Chỉ script (service role) | Mỗi file một dòng: loại, nguồn, trạng thái duyệt |
| Ảnh chính của sản phẩm | Cột `san_pham.anh` | **Trigger tự cập nhật** | Một dòng `media` có `loai = 'the'` chuyển sang `duyet` thì `san_pham.anh = url`. Bị `loai` thì gỡ |
| File tạm | `media/tmp/` trong repo | Media | Đã gitignore, không commit file nhị phân |

Đường dẫn trong bucket:
```
san-pham/<id>/the.webp            ảnh thẻ 1000×1000, nền trong suốt hoặc trắng, < 150KB
san-pham/<id>/the-nho.webp        400×400, < 40KB
san-pham/<id>/tach-nen.png        bản PNG trong suốt gốc (để làm bối cảnh, video)
san-pham/<id>/boi-canh-<n>.webp   ảnh bối cảnh 1080×1350 (4:5)
chien-dich/<ma>/<ten>.webp|mp4    ảnh/video cho landing, mạng xã hội
video/<id>/9x16.mp4 | 1x1.mp4     video sản phẩm
```
Ghi đè cùng đường dẫn thì thêm `?v=<số>` vào `url` trong bảng để web không giữ ảnh cũ trong bộ nhớ đệm.

Bảng `public.media`:
- `san_pham_id` hoặc `chien_dich` (phải có ít nhất một).
- `loai`: `goc | tach_nen | the | the_nho | boi_canh | video_9x16 | video_1x1 | video_4x5`.
- `duong_dan` (duy nhất), `url`, `rong`, `cao`, `dung_luong`, `thoi_luong`.
- `nguon`: `drive | booth | thuong_hieu | ai_boi_canh | tong_hop`.
- `nguon_chi_tiet`: id file Drive hoặc URL trang gốc.
- `trang_thai`: `cho_duyet | duyet | loai`.
- `ghi_chu`.

## 3. Nguồn ảnh: được dùng và không được dùng
Theo thứ tự ưu tiên:
1. **Drive 08**: ảnh tách nền sẵn có (hiện có Dermal).
2. **Ảnh chụp tại booth** (`00 Inbox`). Media viết hướng dẫn chụp cho nhân viên (mục 6).
3. **Ảnh chính hãng** từ website của chính thương hiệu (bản Hàn hoặc global), gian hàng chính thức do thương hiệu vận hành, hoặc ảnh nhà phân phối gửi.
   - Chủ dự án cho phép **mọi thương hiệu** (18/11, `media/nguon-duoc-phep.yaml`). Đây là nguồn chính để lấp nhanh 129 mã.
   - Ghi URL trang sản phẩm vào `nguon_chi_tiet`.
   - Chọn ảnh packshot nền trơn, mặt trước, không chữ quảng cáo đè lên. Ảnh có chữ quảng cáo thì cắt bỏ phần chữ; không cắt được thì bỏ.
   - Chủ dự án sẽ tự chụp hoặc quay thêm góc đặc biệt khi cần, rồi tải vào `00 Inbox`. Ảnh của chủ dự án được ưu tiên hơn ảnh web nếu cùng mã.

**Không bao giờ:**
- Lấy ảnh từ trang bán lẻ khác (Shopee, Lazada, Olive Young, Hasaki, Watsons…), ảnh có watermark, hoặc ảnh có chữ của bên khác.
- Dùng AI vẽ lại hoặc "làm đẹp" bao bì, nhãn, chữ, màu sản phẩm. Ảnh sản phẩm phải là ảnh thật, đúng mã, đúng màu, đúng dung tích.
- Ghép sai mã. Không chắc mã thì bỏ qua và ghi vào danh sách cần chụp.

**AI chỉ được dùng cho nền và bối cảnh** (`nguon = ai_boi_canh`): đá, nước, vải, ánh sáng theo màu thương hiệu. Ảnh tách nền thật đặt lên trên, giữ nguyên từng điểm ảnh của sản phẩm (chỉ được thu phóng và đổ bóng).

## 4. Quy chuẩn kỹ thuật
- **Ảnh thẻ:**
  - Khung vuông 1000×1000, sản phẩm chiếm khoảng 80% cạnh dài, căn giữa, có bóng mềm nhẹ.
  - WebP chất lượng 82–88, dưới 150KB.
  - Nền trong suốt; nếu ảnh gốc không tách sạch được thì dùng nền trắng #FFFFFF.
- **Tách nền:**
  - `rembg` (model `isnet-general-use` hoặc `birefnet-general`) rồi làm mượt viền.
  - Kiểm tra viền: không còn quầng trắng, không mất nắp, vòi hay dây.
- **Ảnh bối cảnh:** 1080×1350 (4:5), dưới 300KB, màu theo docs/03 (hồng #E8D2CC, bạc hà #CFE3D5, nền nhạt #F7EEEB / #EAF3ED), ít chữ, chỉ từ khóa.
- **Video:**
  - Kích thước: 9:16 là 1080×1920; 1:1 là 1080×1080.
  - Độ dài 6–10 giây, H.264 `-preset veryfast -crf 23`, 30fps, không tiếng (hoặc tiếng có bản quyền rõ), dưới 4MB.
  - Dựng bằng ffmpeg từ ảnh tách nền thật: zoom chậm, trượt lớp, xoay nhẹ, đổi nền theo màu thương hiệu.
  - TikTok: chữ và sản phẩm nằm trong vùng y 170–1500, tránh 380px dưới cùng và 140px bên phải.
- **Tên file nguồn:** `<id>_<n>.jpg` (id = mã vạch theo `data/products.csv`). Ảnh booth chưa đặt tên thì Media đọc mã vạch trong ảnh (`pyzbar`) hoặc đối chiếu tab "Mockup sản phẩm" của tracker.

## 5. Duyệt
- **Tự duyệt (`duyet` ngay):** ảnh thẻ từ nguồn `drive` hoặc `booth`, khi qua đủ các kiểm tra tự động:
  - đúng kích thước và dung lượng;
  - đã đối chiếu mã vạch hoặc tên file khớp `id`;
  - tỉ lệ điểm ảnh trong suốt ở viền > 95%;
  - không phát hiện chữ lạ (OCR không thấy tên sàn hay watermark).
- **Tự duyệt thêm cho nguồn `thuong_hieu`:** khi qua mọi kiểm tra trên **và** khớp mã chắc chắn:
  - trang sản phẩm ghi đúng tên, dung tích/quy cách và màu/số tông (nếu có) như `data/products.csv`;
  - trang chỉ có 1 biến thể, hoặc ảnh gắn đúng biến thể đã chọn.
  Ghi cách khớp vào `ghi_chu` (ví dụ "tên + 50ml khớp trang").
- **Chờ duyệt (`cho_duyet`):**
  - ảnh `thuong_hieu` không khớp chắc chắn: nhiều biến thể, khác dung tích, bao bì đời cũ/mới;
  - mọi ảnh `ai_boi_canh` và mọi video;
  - mọi trường hợp còn nghi ngờ.
  - Media tạo trang duyệt `media/tmp/duyet.html` (lưới ảnh, mã, tên, nguồn), đẩy lên artifact hoặc gửi đường dẫn trong handoff.
  - Claude QA rồi chuyển `duyet` hoặc `loai` (lý do ghi ở `ghi_chu`).
- Chủ dự án xem được mọi lúc bằng bảng `media` hoặc trang duyệt.

## 6. Việc Media tự làm khi thiếu ảnh
Media không ngồi chờ. Media tạo `media/can-chup.md`, gồm:
- danh sách mã còn thiếu, theo thứ tự ưu tiên;
- mã vạch, tên, vị trí trên kệ nếu biết.

Kèm hướng dẫn chụp 5 bước cho nhân viên:
1. Đặt sản phẩm trước tường hoặc tấm giấy trắng, ánh sáng cửa sổ hoặc đèn trắng, không flash.
2. Chụp thẳng mặt nhãn chính, sản phẩm đứng, điện thoại ngang tầm, chiếm khoảng 70% khung.
3. Mỗi ảnh 1 sản phẩm. Chụp thêm 1 ảnh mã vạch ngay sau ảnh đó.
4. Không cầm bằng tay trong khung, lau sạch bụi và dấu tay.
5. Tải lên `08 Mockup sản phẩm/00 Inbox` (hoặc gửi Zalo cho người phụ trách).

Gửi bản này cho chủ dự án qua handoff `hoi` gửi `nguoi`.

## 7. Phân việc
- **W034 (Claude):** hạ tầng (đã làm).
- **W035 (Media):** bộ script `scripts/media/` (mục 8).
- **W036 (Media):** ảnh thẻ cho 129 mã.
- **W037 (Media):** bối cảnh và video cho LOPOE, rồi các deal chính.
- **W005 (Antigravity code):** web đọc ảnh từ URL Supabase.

## 8. Bộ script `scripts/media/` (Python 3.11+, chạy được trên Windows)
| Lệnh | Làm gì |
|---|---|
| `python scripts/media/kiem_ke.py` | Lấy danh sách sản phẩm `hien_thi` từ Supabase, đối chiếu bảng `media`, in mã còn thiếu theo thứ tự ưu tiên. Ghi `media/tmp/kiem-ke.csv` |
| `python scripts/media/nhap.py <thư mục>` | Quét ảnh mới trong Inbox hoặc Drive 08, xác định mã (tên file, mã vạch, bảng tracker), chép vào `media/tmp/nguon/<id>/` |
| `python scripts/media/xu_ly.py <id>…` | Tách nền, cắt, chuẩn hóa ra `tach-nen.png`, `the.webp`, `the-nho.webp`; chạy kiểm tra tự động; in kết quả |
| `python scripts/media/tai_len.py <id>…` | Đẩy lên bucket `media`, ghi hoặc cập nhật dòng `public.media` (tự duyệt hoặc chờ duyệt theo mục 5) |
| `python scripts/media/video.py <id> --kieu 9x16` | Dựng video từ `tach-nen.png` bằng ffmpeg, đẩy lên bucket, `cho_duyet` |
| `python scripts/media/trang_duyet.py` | Sinh `media/tmp/duyet.html` cho các dòng `cho_duyet` |

- Khóa: đọc `NEXT_PUBLIC_SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` từ `.env.local` (đã có trên máy). Không in khóa ra màn hình, không commit.
- Thư viện: `pillow`, `rembg[cpu]`, `pyzbar`, `supabase`, `python-dotenv`; ffmpeg cài riêng. Ghi vào `scripts/media/requirements.txt`.
