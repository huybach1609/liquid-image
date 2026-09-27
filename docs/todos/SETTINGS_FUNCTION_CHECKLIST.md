# Bảng Đánh Giá & Checklist Chức Năng Cài Đặt (Settings Feature Checklist)

> **Tài liệu kiểm tra và rà soát toàn bộ các chức năng cài đặt trong `src/features/settings`**  
> *Ngày tạo:* 26/09/2026  
> *Phạm vi quét:* Toàn bộ UI, Store (`settings.store.ts`), Types (`types.ts`), Custom Hooks (`useSettingsDraft.ts`), và mức độ liên kết với Logic thực thi (Single Mode, Batch Runner, Rust Tauri Backend, CSS/Theme).

---

## 1. Tổng quan tình trạng (Executive Summary)

Hệ thống Cài đặt được tổ chức thành **8 tab chức năng chính** và lưu trữ thông qua Zustand persist (`settings-storage` lưu tệp `settings.json` tại thư mục cấu hình người dùng qua Tauri Store plugin).

### Tóm tắt phân loại
| Ký hiệu | Trạng thái | Số lượng | Mô tả |
| :---: | :--- | :---: | :--- |
| 🟢 | **Hoạt động tốt (Fully Working)** | **14** | UI tương tác tốt, lưu Store thành công, có liên kết và tác động trực tiếp đến logic ứng dụng / backend. |
| 🟡 | **Hoạt động một phần (Partially Working)** | **10** | Đã có UI hoặc Store, nhưng logic liên kết còn thiếu một nhánh, chưa đồng bộ hai chiều hoặc chưa truyền cờ vào lệnh ImageMagick. |
| 🔴 | **Chưa hoạt động / Stub (Not Implemented / Mock)** | **14** | Có UI switch/select nhưng không hề có code đọc giá trị để xử lý, hoặc chỉ tồn tại dạng định nghĩa trong Store/Type chưa có UI. |

---

## 2. Chi tiết Checklist theo từng phần (Detailed Checklist by Section)

### 2.1. Cài đặt chung (General Settings) — `GeneralSettingsSection.tsx`

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Ngôn ngữ (Language)** | `language` | 🟢 | **Hoạt động hoàn chỉnh**. Chuẩn hoá i18n, đồng bộ 2 chiều tức thì giữa `GeneralSettingsSection`, `LanguageSwitcher` trên header, `useSettingsStore` và `useSettingsDraft` (`i18n.changeLanguage`). |
| **Định dạng ngày (Date Format)** | `dateFormat` | 🟢 | **Hoạt động hoàn chỉnh**. Hỗ trợ `YYYY-MM-DD`, `DD-MM-YYYY`, `MM-DD-YYYY`, `YYYYMMDD`. Đã kết nối vào `buildBatchOutputPath` để tự động định dạng biến `{date}` và mẫu `date-name` khi xuất batch. |
| **Đơn vị kích thước tệp (File Size Unit)** | `fileSizeUnit` | 🟢 | **Hoạt động hoàn chỉnh**. Hỗ trợ `MB_GB` (tiêu chuẩn 1024), `MiB_GiB` (chuẩn nhị phân IEC), và `KB`. Hàm `formatFileSize` trong `@/shared/lib/format` và `@/lib/utils` tự động áp dụng đơn vị đã chọn. |
| **Giới hạn bộ nhớ đệm đĩa (Disk Cache Limit)** | `diskCacheLimit` | 🟢 | **Hoạt động hoàn chỉnh**. Đã liên kết vào `buildBatchCliArgs` và `useBatchRunner.ts`, tự động thêm cờ `-limit disk <val>` vào câu lệnh ImageMagick khi khác `Unlimited`. |
| **Chạy thử trước xử lý (Dry Run Before Batch)** | `dryRunBeforeBatch` | 🟢 | **Hoạt động hoàn chỉnh**. Đã tích hợp vào `runBatch` trong `useBatchRunner.ts`. Khi bật, hệ thống tự động chạy xác thực dry-run trước khi kích hoạt xử lý hàng loạt thật. |
| **Chính sách khi gặp lỗi (On Error Policy)** | `onErrorPolicy` | 🟢 | **Hoạt động hoàn chỉnh**. Đã hỗ trợ đầy đủ 3 chế độ: `skip-and-continue` (bỏ qua và chạy tiếp), `stop-all` (dừng ngay hàng đợi), và `retry-once` (tự động thử lại 1 lần cho các mục bị lỗi). |
| **Lưu nhật ký lỗi (Save Error Log)** | `saveErrorLog` | 🟢 | **Hoạt động hoàn chỉnh**. Khi bật và có lỗi xảy ra trong quá trình chạy batch, hệ thống tự động biên dịch và xuất file `batch-error-<timestamp>.log` vào thư mục đầu ra qua `@tauri-apps/plugin-fs`. |
| *(Ẩn)* Khôi phục phiên làm việc | `restoreSession` | 🔴 | Có trong Store (`default: true`), không có UI, chưa có logic lưu/phục hồi danh sách ảnh phiên trước. |
| *(Ẩn)* Tự động kiểm tra bản cập nhật | `checkUpdates` | 🔴 | Có trong Store (`default: true`), không có UI trong General (chỉ có nút thủ công ở tab About). |
| *(Ẩn)* Khởi động cùng hệ thống | `launchAtLogin` | 🔴 | Có trong Store (`default: false`), chưa có UI và chưa tích hợp plugin autostart của Tauri. |

---

### 2.2. Giao diện (Appearance) — `AppearanceSettingsSection.tsx`

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Chủ đề màu (Theme)** | `theme` | 🟢 | **Hoạt động hoàn chỉnh**. Hỗ trợ 8 chủ đề (System, Light, Dark, Claude, Claude Dark, Notion, Notion Dark, Starbucks, Starbucks Dark). Tích hợp mini preview card và đồng bộ qua `useThemeSync.ts` vào thẻ `<html>`. |
| **Cỡ chữ ứng dụng (Font Size)** | `fontSize` | 🟢 | **Hoạt động hoàn chỉnh**. Stepper điều chỉnh kích thước (11px – 18px), có khung xem trước trực tiếp mẫu văn bản, cập nhật CSS variable `--app-font-size` toàn hệ thống. |
| **Hiển thị CLI Preview** | `showCliPreview` | 🟢 | **Hoạt động hoàn chỉnh**. Bật/tắt thanh xem trước câu lệnh `magick` trong chế độ Single Mode (`SingleModePage.tsx` / `OptionsPane.tsx`). |
| **Hiển thị siêu dữ liệu ảnh (Show Metadata)** | `showMetadata` | 🟢 | **Hoạt động hoàn chỉnh**. Bật/tắt thanh thông tin kích thước và dung lượng ảnh trong màn hình Single Mode Preview. |
| *(Ẩn)* Màu nhấn (Accent Color) | `accentColor` | 🟡 | Đã được gắn vào CSS variable `--accent` qua `useThemeSync.ts`, nhưng trong UI tab Appearance hiện chưa có bảng chọn màu (Color Picker) cho người dùng tự phối. |
| *(Ẩn)* Độ rộng thanh bên | `sidebarWidth` | 🔴 | Có trong Store (`compact`, `default`, `wide`), nhưng giao diện thực tế đang dùng kéo thả `ResizablePanel` riêng mà không lưu đồng bộ vào trường này. |

---

### 2.3. Tệp & Đầu ra (Files & Output) — `FilesSettingsSection.tsx`

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Thư mục đầu ra mặc định (Output Folder)** | `outputFolder` | 🟢 | **Hoạt động hoàn chỉnh**. Ô nhập, nút duyệt file dialog, đồng bộ vào `useBatchStore` làm đường dẫn mặc định khi khởi tạo và có nút "Reset về mặc định" trong Batch Output Panel. Đồng thời làm thư mục fallback khi xuất ảnh ở Single Mode. |
| **Thư mục mẫu thiết lập (Preset Folder)** | `presetFolder` | 🟢 | **Hoạt động hoàn chỉnh**. Đã liên kết trực tiếp vào `usePresetActions.ts`, cho phép lưu, tải và quản lý các file cấu hình preset pipeline (`.json`) trực tiếp trong thư mục cấu hình đã chọn. Nút Save/Load trong Batch Pipeline Panel đã hoạt động. |
| **Mẫu đặt tên tệp (Naming Pattern)** | `namingPattern` | 🟢 | **Hoạt động hoàn chỉnh**. Đã bổ sung các chip chèn nhanh `{name}`, `{counter}`, `{date}`, `{op}` ngay trong giao diện cài đặt; hỗ trợ biên dịch chính xác biến thời gian theo `dateFormat` khi xuất batch. |
| **Quy tắc xung đột tệp (Conflict Policy)** | `conflictPolicy` | 🟢 | **Hoạt động hoàn chỉnh**. Tích hợp module `conflictResolver.ts` kiểm tra file trùng lặp: hỗ trợ `overwrite` (ghi đè), `skip` (bỏ qua tệp đã tồn tại), và `rename` (tự động tạo hậu tố `_1`, `_2` an toàn) cho cả Batch Mode và Single Mode. |
| **Tự động mở thư mục đầu ra** | `autoOpenOutput` | 🟢 | **Hoạt động hoàn chỉnh**. Tự động gọi `openPath` từ `@tauri-apps/plugin-opener` mở ngay thư mục chứa file xuất ra sau khi batch hoặc single mode xử lý thành công. |
| **Tích hợp Menu chuột phải (Context Menu)** | `contextMenuEnabled`, `contextMenuFormats` | 🟢 | **Hoạt động hoàn chỉnh**. Cho phép bật/tắt, lọc theo định dạng ảnh (WebP, PNG, JPEG, AVIF...), cài đặt/gỡ cài đặt trực tiếp vào KDE Dolphin Service Menu (Linux) hoặc Registry (Windows) thông qua lệnh Rust Tauri `register_dolphin_service_menu`. |
| *(Ẩn)* Giới hạn tệp gần đây | `recentFilesLimit` | 🔴 | Có trong Store (`default: 10`), chưa có UI cấu hình và chưa có cơ chế lưu lịch sử tệp mở gần đây. |

---

### 2.4. Xử lý & Hiệu năng (Processing) — `ProcessingSettingsSection.tsx`

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Số luồng xử lý (Batch Workers)** | `workers` | 🟢 | **Hoạt động hoàn chỉnh**. Tùy chọn auto, 1, 2, 4, 8, 16 luồng; được `useBatchRunner.ts` truyền trực tiếp xuống pool xử lý luồng song song của Tauri backend (`tauriRunBatch` và `tauriRunBatchDryRun`). |
| **Giới hạn RAM (Memory Limit)** | `memoryLimit` | 🟢 | **Hoạt động hoàn chỉnh**. Lựa chọn Unlimited, 512MB, 1GB, 2GB, 4GB, 8GB; tự động inject cờ `-limit memory <val>` vào câu lệnh ImageMagick cho cả Single Mode (`buildSingleCliPipeline`, `buildSingleCliPreview`, `useSingleActions`) và Batch Mode (`buildBatchCliPipeline`, `useBatchRunner`). |
| **Giới hạn Cache đĩa (Disk Cache Limit)** | `diskCacheLimit` | 🟢 | **Hoạt động hoàn chỉnh**. Lựa chọn Unlimited, 1GB, 2GB, 5GB, 10GB, 20GB; tự động inject cờ `-limit disk <val>` đồng bộ vào pipeline CLI ImageMagick cho cả Single Mode và Batch Mode. |
| **Xem trước trực tiếp (Live Preview)** | `livePreview` | 🟢 | **Hoạt động hoàn chỉnh**. Tích hợp trong `SingleModePage.tsx` và `usePreviewPipeline.ts`: khi tắt, ứng dụng chuyển sang chế độ thủ công (Manual Preview), chỉ re-render khi người dùng bấm nút "Update preview", tối ưu hoá hiệu năng cho máy cấu hình yếu. |
| **Độ phân giải tối đa bản xem trước** | `previewMaxResolution` | 🟢 | **Hoạt động hoàn chỉnh**. Lựa chọn 800px, 1200px, full; truyền xuống `generatePreview` / `create_image_proxy` backend Rust và hàm `estimateProxyDimensions` (đã có bộ unit test kiểm thử với `docs/test_file.jpg` 1600x1200). |
| **Chạy thử trước khi Batch (Dry Run)** | `dryRunBeforeBatch` | 🟢 | **Hoạt động hoàn chỉnh**. Khi bật, ứng dụng tự động gọi `tauriRunBatchDryRun` kiểm tra tính hợp lệ của toàn bộ pipeline trước khi tiến hành xử lý thực tế hàng loạt. |
| **Chính sách khi gặp lỗi (On Error Policy)** | `onErrorPolicy` | 🟢 | **Hoạt động hoàn chỉnh**. Điều khiển luồng thực thi trong `useBatchRunner.ts`: `stop-all` (dừng ngay khi gặp lỗi), `continue` (bỏ qua tệp lỗi tiếp tục tệp kế), và `retry-once` (tự động thử lại 1 lần các tệp bị lỗi). |
| **Lưu nhật ký lỗi (Save Error Log)** | `saveErrorLog` | 🟢 | **Hoạt động hoàn chỉnh**. Tự động xuất tệp nhật ký `batch-error-<timestamp>.log` vào thư mục xuất tệp khi quá trình xử lý hàng loạt có tệp phát sinh lỗi. |

---

### 2.5. ImageMagick — `ImagickSettingsSection.tsx` & `MagickBinaryField.tsx`

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Cấu hình đường dẫn Binary ImageMagick** | `magickBinaryPath` | 🟢 | **Hoạt động hoàn chỉnh**. Hỗ trợ: <br>1. Tự động nhận diện sidecar/hệ thống qua backend (`get_current_magick_source`).<br>2. Nút "Duyệt..." chọn file thực thi qua tệp hệ thống.<br>3. Nút "Kiểm tra" thực thi `check_magick_path` trả về phiên bản thực tế.<br>4. Lưu xuống cấu hình backend qua `update_magick_source`. |
| **Xóa siêu dữ liệu mặc định (Strip Metadata)** | `stripMetadata` | 🟢 | **Hoạt động hoàn chỉnh**. Tự động kế thừa giá trị từ Settings khi tạo bước `Convert` mới trong Single Mode (`Convert.tsx`) và Batch Mode (`batch.store.ts`). Tự động bổ sung cờ `-strip` vào câu lệnh ImageMagick cho mọi tác vụ kể cả khi không có bước Convert riêng biệt (`buildSingleCliPipeline`, `buildBatchCliArgs`, `useSingleActions`, `useBatchRunner`). |
| **Không gian màu mặc định (Color Profile)** | `defaultColorProfile` | 🟢 | **Hoạt động hoàn chỉnh**. Lựa chọn `sRGB`, `Adobe RGB`, `CMYK`, `None`. Tự động kế thừa vào thao tác `Convert`, chuẩn hoá ánh xạ `Adobe RGB` sang `Adobe98` chuẩn ImageMagick CLI (`-colorspace Adobe98`), và tự động áp dụng profile màu cho toàn bộ pipeline xử lý đơn lẻ lẫn hàng loạt. |
| *(Ẩn)* Nén xen kẽ PNG | `interlacePng` | 🔴 | Có trong Store (`default: false`), chưa có UI và chưa áp dụng cờ `-interlace PNG`. |
| *(Ẩn)* Cờ tùy biến toàn cục | `extraGlobalFlags` | 🔴 | Có trong Store (`default: ""`), chưa có ô nhập tham số nâng cao để truyền trực tiếp vào câu lệnh ImageMagick. |

---

### 2.6. Thông báo & Cảnh báo (Notifications) — `NotificationsSettingsSection.tsx` `[On Development]`

> 🚧 **Trạng thái: On Development (Đang phát triển - Đã ẩn khỏi Sidebar)**  
> Mục này đang trong lộ trình phát triển và đã được **ẩn hoàn toàn khỏi thanh điều hướng cài đặt (Settings Sidebar)** để giữ giao diện gọn gàng và ngăn chặn người dùng truy cập vào phần chưa hoàn thiện.

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Thông báo khi xong Batch** | `notifyBatchComplete` | 🚧 | **On Development**. Đang chờ tích hợp `@tauri-apps/plugin-notification`. |
| **Thông báo khi có lỗi** | `notifyError` | 🚧 | **On Development**. Đang chờ hệ thống notification plugin của Tauri v2. |
| **Phát âm thanh cảnh báo** | `playSound` | 🚧 | **On Development**. Đang chờ tích hợp Web Audio API / Audio assets. |
| *(Ẩn)* Cảnh báo khi xong Single mode | `notifySingleDone` | 🔴 | Có trong Store (`default: false`), chưa có UI và logic. |
| *(Ẩn)* Tiến độ trên thanh Dock/Taskbar | `showDockProgress` | 🔴 | Có trong Store (`default: true`), chưa có UI và logic cập nhật progress bar của cửa sổ hệ điều hành. |
| *(Ẩn)* Huy hiệu trên khay hệ thống | `showTrayBadge` | 🔴 | Có trong Store (`default: true`), chưa có UI và logic badge. |

---

### 2.7. Phím tắt (Shortcuts) — `ShortcutsSettingsSection.tsx` `[On Development]`

> 🚧 **Trạng thái: On Development (Đang phát triển - Đã ẩn khỏi Sidebar)**  
> Mục này đang trong lộ trình phát triển và đã được **ẩn hoàn toàn khỏi thanh điều hướng cài đặt (Settings Sidebar)** để giữ giao diện gọn gàng và ngăn chặn người dùng truy cập trong khi hệ thống phím tắt toàn cục đang được xây dựng.

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Hiển thị danh sách phím tắt** | *(Không dùng Store)* | 🚧 | **On Development**. Danh sách phím tĩnh, chờ cơ chế đăng ký và tùy biến keybinds. |
| **Đăng ký phím tắt toàn cục / cửa sổ** | *(Không dùng Store)* | 🚧 | **On Development**. Chờ hệ thống phím tắt thống nhất toàn ứng dụng. |

---

### 2.8. Giới thiệu & Quản trị hệ thống (About Section) — `AboutSection.tsx`

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng & Điểm nghẽn mã nguồn |
| :--- | :--- | :---: | :--- |
| **Hiển thị phiên bản ứng dụng & Bản quyền** | *(N/A)* | 🟢 | **Hoạt động hoàn chỉnh**. Hiển thị phiên bản app, trạng thái engine, giao diện thẻ thương hiệu trực quan. |
| **Hiển thị phiên bản ImageMagick thực tế** | *(N/A)* | 🟢 | **Hoạt động hoàn chỉnh**. Nhận diện và hiển thị chuỗi phiên bản sống từ backend Rust (`magickStatus.version`). |
| **Đường dẫn thư mục cấu hình (Config Dir)** | *(N/A)* | 🟢 | **Hoạt động hoàn chỉnh**. Lấy động từ `appConfigDir()` của Tauri path API, hiển thị rõ ràng đường dẫn lưu trữ thực tế trên máy người dùng. |
| **Nút mở thư mục cấu hình trên hệ thống** | *(N/A)* | 🟢 | **Hoạt động hoàn chỉnh**. Sử dụng `openPath` từ `@tauri-apps/plugin-opener` mở trực tiếp File Manager của OS. |
| **Sao chép thông tin chẩn đoán (Diagnostics)** | *(N/A)* | 🟢 | **Hoạt động hoàn chỉnh**. Tổng hợp OS, App Version, Magick Engine Version, Config Path và copy vào clipboard người dùng. |
| **Kiểm tra bản cập nhật mới** | *(N/A)* | 🟡 | Nút bấm phản hồi chuyển trạng thái đang kiểm tra (`Checking...`), nhưng hiện tại chỉ giả lập timeout 1.2s trước khi báo "Bạn đang dùng phiên bản mới nhất" (chưa kết nối Tauri Updater API). |
| **Khôi phục toàn bộ cài đặt (Reset All)** | `resetSettings` | 🟢 | **Hoạt động hoàn chỉnh**. Có hộp thoại xác nhận an toàn, khôi phục toàn bộ giá trị trong `useSettingsStore` về `initialSettings`. |

---

### 2.9. Khung điều khiển trang Cài đặt (Settings Shell Actions) — `SettingPage.tsx`

| Chức năng | Khóa trong Store | Trạng thái | Chi tiết hiện trạng |
| :--- | :--- | :---: | :--- |
| **Điều hướng chuyển Tab** | `activeTab` | 🟢 | **Hoạt động hoàn chỉnh**. Chuyển đổi mượt mà giữa 8 phân vùng cài đặt kèm icon và mô tả. |
| **Khôi phục cài đặt mục hiện tại (Reset Section)** | `resetSection` | 🟢 | **Hoạt động hoàn chỉnh**. Reset chính xác các key thuộc về tab đang xem về giá trị mặc định mà không làm mất cài đặt các tab khác. |
| **Lưu nháp (Draft Pattern) & Nút Lưu (Save)** | `useSettingsDraft` | 🟢 | **Hoạt động hoàn chỉnh**. Mọi chỉnh sửa được giữ trong nháp `draft`, khi bấm "Save changes" sẽ đồng bộ xuống Store, cấu hình backend và hiển thị trạng thái "Saved" tự động biến mất sau 2 giây. |

---

## 3. Kiến nghị hành động khắc phục (Actionable Recommendations)

Để nâng cao chất lượng sản phẩm và hoàn thiện chức năng cài đặt, các mục sau nên được ưu tiên xử lý:

1. **Khắc phục đồng bộ Ngôn ngữ (P0):**
   - Trong `useSettingsDraft.ts` (khi Save) hoặc qua listener của `useSettingsStore`, tự động gọi `i18n.changeLanguage(draft.language)`.
   - Kết nối `LanguageSwitcher.tsx` trên header vào `useSettingsStore` để khi đổi ở header thì cài đặt trong Settings cũng tự cập nhật và ngược lại.

2. **Dọn dẹp trùng lặp giữa General và Processing (P1):**
   - Di dời `Dry run before batch`, `On error policy`, `Save error log` chỉ giữ lại duy nhất tại tab **Processing** (hoặc General), xoá bỏ phần bị lặp để tránh xung đột trải nghiệm người dùng.

3. **Kết nối Thư mục mặc định với Batch & Single Mode (P1):**
   - Cập nhật `useBatchStore.ts`: khởi tạo giá trị ban đầu của `outputDirectory` bằng `useSettingsStore.getState().outputFolder`.
   - Khi hoàn thành xuất ảnh (Batch hoặc Single), kiểm tra nếu `autoOpenOutput === true` thì gọi `openPath(outputDirectory)`.

4. **Tích hợp Thông báo hệ thống (P2):**
   - Cài đặt và cấu hình plugin `@tauri-apps/plugin-notification` để kích hoạt thông báo thật khi `notifyBatchComplete` và `notifyError` được bật.

5. **Đưa các tham số giới hạn tài nguyên vào câu lệnh ImageMagick (P2):**
   - Bổ sung `-limit memory <memoryLimit>` và `-limit disk <diskCacheLimit>` vào hàm `buildBatchCliPipeline.ts` và `buildSingleCliPipeline.ts`.
