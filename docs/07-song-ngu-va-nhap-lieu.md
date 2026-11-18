# 07 · Song ngữ và nhập liệu sản phẩm

Cập nhật: 18/11/2026. Chủ dự án yêu cầu:
- web có lựa chọn song ngữ; mọi chữ hiện lên đều có bản dịch;
- thông tin sản phẩm được nhập và sửa song ngữ; bỏ trống thì AI dịch;
- nhân viên kho cập nhật lên server bằng 3 cách: sửa tay từng món, tải file Excel, hoặc thả file lên Drive để AI agent tự nhập, sửa và điền chỗ thiếu.

## 1. Ngôn ngữ
- **Tiếng Việt (mặc định) và tiếng Anh.** Mã ngôn ngữ `vi`, `en`. Thêm ngôn ngữ khác sau chỉ cần thêm file từ điển và cột dữ liệu.
- **Nút đổi ngôn ngữ "VI | EN":**
  - máy tính: thanh trên, cạnh Giỏ;
  - máy tính bảng: cuối rail;
  - điện thoại: thanh trên mảnh, cạnh Đăng nhập.
- **Ghi nhớ lựa chọn** bằng cookie `vive_lang`.
  - Lần đầu vào: theo `Accept-Language` của trình duyệt.
  - URL không đổi (không thêm `/en`).
  - Thêm `?lang=en` vào link nào cũng mở được bản tiếng Anh, để in QR riêng cho khách nước ngoài.

## 2. Chữ cần dịch và nơi để
| Loại chữ | Nơi để | Ai dịch |
|---|---|---|
| Chữ giao diện (nút, tiêu đề, thông báo, lỗi, email) | `messages/vi.json`, `messages/en.json` | Antigravity viết bản `en` khi code; Claude QA |
| Nhãn phân loại (loại sản phẩm, vấn đề da, loại da) | Từ điển trong `messages/*.json`, khóa theo mã (`mat-na`, `cap-am`…) | Như trên |
| Tên, mô tả sản phẩm | Supabase `san_pham.ten_hien_thi` / `ten_en`, `mo_ta` / `mo_ta_en` | Kho nhập; trống thì AI |
| Deal (tên, hook, điều kiện) | `data/deals.yaml`: `ten_en`, `hook_en`, `dieu_kien_en` | Claude và AI; Claude duyệt |
| Landing theo đợt | `data/chien-dich/*.yaml`: mỗi trường chữ có thêm `<trường>_en` | Như deal |
| Trang chính sách | `messages` hoặc file nội dung riêng `content/chinh-sach.{vi,en}.md` | Claude soạn bản `vi`, AI dịch `en`, Claude duyệt |

- **Không dịch:** tên thương hiệu, tên sản phẩm gốc (`ten_goc`), thành phần (tên INCI), giá, mã vạch, `@vive.k_beauty`, `@viveuniverse`.
- **Thiếu bản `en` thì hiện bản `vi`, không để trống.** Ghi log để AI agent dịch bù.

## 3. Nguồn dữ liệu và thứ tự ưu tiên
Supabase là **nguồn chính** cho thông tin sản phẩm.
- `data/products.csv` chỉ còn dùng để thêm mã mới và cập nhật giá, tồn, hiển thị từ bảng giá bên vive_poup.
- `scripts/build_seed.py` không còn ghi đè tên, mô tả, phân loại, ảnh (đã sửa 18/11).

Mỗi trường văn bản có nguồn, ghi trong `san_pham.nguon_truong`:
- `nguoi`: kho sửa tay trên web, hoặc chủ dự án sửa.
- `excel`: nhập từ file Excel trên web.
- `ai`: AI agent điền hoặc dịch.
- `dong_bo`: từ `products.csv` ban đầu.

**Luật ghi đè:**
- `nguoi`, `excel` ghi đè được mọi nguồn.
- `ai` chỉ ghi vào trường đang trống, hoặc trường có nguồn `ai`/`dong_bo`. Không bao giờ ghi đè `nguoi`/`excel`.
- Giá (`gia_goc`, `gia_ban`), `hien_thi`, luật deal: chỉ `quan_tri` sửa. AI và kho không sửa.

Mọi lần sửa đều ghi vào `lich_su_san_pham`: trường, giá trị cũ, giá trị mới, nguồn, người sửa, thời điểm. Người ghi đặt `set_config('vive.nguon', …, true)` và `set_config('vive.boi', …, true)` trong cùng giao dịch, hoặc gọi hàm RPC dùng chung (W045).

## 4. Ba cách nhập liệu cho kho
Vai trò mới `kho` (bảng `nhan_vien.vai_tro`):
- được thêm mã mới (ẩn đến khi quản trị đặt giá) và sửa thông tin sản phẩm;
- không sửa giá, không sửa deal.

### 4.1 Sửa tay: `/quan-tri/san-pham`
- **Bảng danh sách:**
  - tìm theo tên hoặc mã vạch;
  - lọc theo thương hiệu, "thiếu tiếng Anh", "AI điền – cần xem", "thiếu ảnh";
  - ảnh nhỏ lấy từ kho media.
- **Màn sửa một món:**
  - Hai cột VI | EN đặt cạnh nhau cho tên và mô tả.
  - Phân loại, vấn đề da, loại da chọn từ danh sách có sẵn; thành phần nhập dạng thẻ.
  - Trường do AI điền có nhãn "AI" màu vàng. Kho bấm "Đã xem" hoặc sửa thì nguồn chuyển thành `nguoi`.
  - Có tab "Lịch sử" của món đó.
- Quét mã vạch bằng camera điện thoại để mở đúng món (nếu dễ làm; không bắt buộc).

### 4.2 Excel: `/quan-tri/san-pham/nhap`
- **Tải file mẫu `.xlsx`.** Cột theo bảng `san_pham`, thêm `ten_en`, `mo_ta_en`. Có sheet "Hướng dẫn" và danh sách mã phân loại hợp lệ.
- **Tải file lên** (`.xlsx`, `.csv`): file lưu vào bucket riêng tư `nhap-lieu`, tạo một dòng `lo_nhap_lieu` (`xem_truoc`).
- **Màn xem trước:** số mã mới, số mã sửa, số dòng lỗi; bảng so sánh cũ → mới từng ô; dòng lỗi ghi rõ lý do (sai mã phân loại, trùng mã vạch, thiếu tên…).
- **Bấm "Áp dụng":** ghi trong một giao dịch, nguồn `excel`, lô chuyển `da_ap_dung`. Ô trống trong file **không xóa** dữ liệu cũ.
- **Tải xuống Excel hiện tại** (để sửa hàng loạt rồi tải lên lại).

### 4.3 AI agent qua Drive
- **Thư mục Drive:** `Her Bazaar Pop up/09 Nhập liệu sản phẩm/` (https://drive.google.com/drive/folders/1kNdUSEPdM8iASPfb_UG3yUqL9Jb1p_Ld; Inbox: https://drive.google.com/drive/folders/1-SEBvf5iv1D1lVYi81eXogjsenpuOm5n). Trong đó có `00 Inbox` (kho thả file vào), `01 Đã xử lý`, `02 Lỗi`.
- **Kho thả vào Inbox bất kỳ file nào:** Excel, ảnh chụp nhãn hoặc hộp, PDF catalogue, ghi chú `.txt`/Google Doc.
- **Agent (Antigravity Media) chạy theo lượt:**
  1. Đọc file, nhận diện mã (mã vạch, tên).
  2. Đề xuất thay đổi.
  3. Ghi thẳng vào Supabase theo luật mục 3, nguồn `ai`, mỗi file một `lo_nhap_lieu` (`kenh = drive_ai`).
  4. Chuyển file sang `01 Đã xử lý` (hoặc `02 Lỗi`, kèm file `.txt` ghi lý do).
- **Agent điền chỗ thiếu:**
  - `ten_en`, `mo_ta_en`: dịch từ bản `vi`;
  - `mo_ta`, `thanh_phan`, `loai_da`, `van_de`: lấy từ website chính hãng, ghi URL vào `nguon_truong.<trường>.url`.
- **Không tự viết công dụng.** Mô tả chỉ tóm tắt những gì trang chính hãng ghi, câu ngắn, theo luật chữ ở docs/03. Không chắc thì để trống và ghi vào báo cáo.
- **Báo cáo mỗi lượt:** handoff `bao-xong` gửi Claude kèm số mã đã điền, đã dịch, lỗi; danh sách trường "AI – cần xem".

## 5. Phân việc
| Task | Ai | Việc |
|---|---|---|
| W043 | Claude | Schema Supabase (cột `_en`, `nguon_truong`, `lich_su_san_pham`, `lo_nhap_lieu`, vai trò `kho`, bucket `nhap-lieu`, view thêm cột `en`); seed không ghi đè; thư mục Drive 09; bản `en` cho deals.yaml, chiến dịch (QA bản AI) |
| W044 | Antigravity | Song ngữ giao diện: next-intl (không prefix URL), `messages/vi.json`/`en.json`, nút VI \| EN, hiển thị `_en` của sản phẩm, deal, landing, có fallback |
| W045 | Antigravity | Trang kho `/quan-tri/san-pham`: sửa tay song ngữ, lịch sử, nhãn AI |
| W046 | Antigravity | Nhập Excel: mẫu, tải lên, xem trước, áp dụng, tải xuống |
| W047 | Antigravity Media | Agent nhập liệu qua Drive 09 + dịch bù và điền thiếu cho 149 mã hiện có |
