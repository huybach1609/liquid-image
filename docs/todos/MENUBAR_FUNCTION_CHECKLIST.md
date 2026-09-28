# Bảng Đánh Giá & Checklist Chức Năng Thanh Menu (WebMenubar Feature Checklist)

> **Tài liệu kiểm tra và rà soát toàn bộ các chức năng menu trong `src/app/menubar/WebMenubar.tsx`**  
> *Ngày tạo:* 28/09/2026 (Cập nhật sau đợt triển khai P0, P1 và Kiến trúc Hybrid Contextual Menu)  
> *Phạm vi quét:* Giao diện thanh menu (`WebMenubar.tsx`), cầu nối menu macOS (`useMenubarBridge.ts`, `app_menu.rs`, `menuIds.ts`), App Store (`app.store.ts`), Single Store (`single.store.ts`), Batch Store (`batch.store.ts`), Settings Store (`settings.store.ts`), Viewer Store (`viewer.store.ts`), Presets (`usePresetActions.ts`), và khả năng liên kết với các hook / backend hiện có.

---

## 1. Tổng quan tình trạng (Executive Summary)

Thanh menu ứng dụng Web (`WebMenubar.tsx`) được hiển thị trên môi trường Windows và Linux (khi `menubarUsesNative() === false`), nằm trên header của `AppShell.tsx`. Trên macOS, hệ thống sử dụng Native Menubar của hệ điều hành thông qua Tauri `app_menu.rs` và bắt sự kiện qua `useMenubarBridge.ts`.

### Kiến trúc Menu Ngữ Cảnh Lai (Hybrid Contextual Menu)
Để tối ưu trải nghiệm người dùng giữa các chế độ xử lý (**Single file**, **Batch**, **Quick viewer**), thanh menu áp dụng mô hình kết hợp:
1. **File, Edit, Mode, View (Cố định, ngữ cảnh hóa bằng `disabled`):** Luôn hiển thị vị trí cố định để giữ thói quen phản xạ không gian (muscle memory). Các mục không tương thích sẽ tự động mờ đi (`disabled`).
   - `Open image…` (`⌘O`): Hoạt động cho cả **Single file** và **Quick viewer**; disabled trong **Batch**.
   - `Open folder…` (`⌘⇧O`): Hoạt động cho **Batch**; disabled trong **Single** và **Viewer**.
   - `Close file` (`⌘W`): Đóng tệp / giải phóng canvas trong **Single** và **Viewer**; tự động disable khi chưa mở tệp.
   - `Show CLI preview` & `Show metadata bar`: Disabled khi không ở chế độ Single file.
2. **Run & Presets (Ẩn hoàn toàn trong Viewer mode):** Chỉ xuất hiện khi ở **Single** và **Batch** mode nhằm giữ thanh menu gọn gàng, tránh làm rối mắt khi người dùng chỉ xem ảnh nhanh.
3. **Image Menu (Chỉ xuất hiện riêng trong Viewer mode):** Cung cấp các thao tác xem ảnh nhanh (Ảnh trước `←`, Ảnh kế `→`, Xoay 90° xuôi `⌘R` / ngược `⌘⇧R`, Đặt lại chế độ xem `⌘0`, Đổi màu nền `B`).
4. **Mode Menu:** Hỗ trợ đủ 3 chế độ cốt lõi qua phím tắt: Single file (`⌘1`), Batch (`⌘2`), Quick viewer (`⌘3`).

### Tóm tắt phân loại
| Ký hiệu | Trạng thái | Số lượng | Mô tả |
| :---: | :--- | :---: | :--- |
| 🟢 | **Hoạt động tốt (Fully Working)** | **32** | UI tương tác mượt mà, chuyển đổi mode chính xác, phản hồi phím tắt và liên kết trực tiếp với backend/logic ứng dụng. |
| 🟡 | **Hoạt động một phần (Partially Working)** | **0** | Toàn bộ các mục trong nhóm P0, P1, Contextual Viewer và Recent Files đã hoàn thành trọn vẹn. |
| 🔴 | **Chưa hoạt động / Stub (Not Implemented / Mock)** | **6** | Bị vô hiệu hoá (`disabled`), gồm nhóm Undo/Redo, các thao tác chỉnh sửa Pipeline nâng cao trong Edit menu, và Save output as. |
| 🚧 | **Đang phát triển / Kế hoạch (In Development / Soon)** | **1** | Tính năng chưa sẵn sàng trong core engine, có gắn badge hiển thị `soon` (`Watch folder`). |

---

## 2. Chi tiết Checklist theo từng Menu (Detailed Checklist by Menu)

### 2.1. Menu Tệp (File Menu)

| Chức năng | Phím tắt | Trạng thái | Chi tiết hiện trạng & Khả năng kết nối |
| :--- | :---: | :---: | :--- |
| **Open image…** | `⌘O` | 🟢 | **Hoạt động tốt (Single & Viewer Mode)**. Khi ở Single mode, kích hoạt `requestOpenImageFromMenu()`. Khi ở Viewer mode, mở Tauri file dialog và nạp ảnh vào `useViewerStore.openImage()`. Tự động vô hiệu hoá khi ở Batch mode. Đã bắt phím tắt `Mod+O`. |
| **Open folder…** | `⌘⇧O` | 🟢 | **Hoạt động tốt (Batch Mode)**. Mở Tauri folder dialog chọn thư mục, lọc tệp ảnh hợp lệ và tự động nạp vào `useBatchStore`. Bị vô hiệu hoá khi ở Single và Viewer mode. Bắt phím tắt `Mod+Shift+O`. |
| **Recent files (Submenu)** | — | 🟢 | **Hoạt động hoàn chỉnh**. Quản lý động qua `useRecentFilesStore` (lưu tệp `recent-files.json`), tự động ghi nhận khi mở ảnh ở Single hoặc Viewer mode. Giới hạn số lượng hiển thị theo `recentFilesLimit` trong Settings. Bấm vào tệp để mở lại ngay (tự chuyển mode nếu cần) và có nút `Clear recent` để xoá lịch sử. |
| **Save output as…** | `⌘S` | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. |
| ~~Export CLI script…~~ | `⌘E` | 🗑️ | **Đã gỡ bỏ**. Đã loại bỏ hoàn toàn khỏi menu theo yêu cầu. |
| **Close file** | `⌘W` | 🟢 | **Hoạt động hoàn chỉnh**. Xóa tệp hiện tại trong Single Mode (reset proxy & metadata) hoặc Viewer Mode (reset ảnh đang xem). Tự động enable khi có file đang mở và bắt phím tắt `Mod+W`. |
| **Settings…** | `⌘,` | 🟢 | **Hoạt động hoàn chỉnh**. Bấm vào gọi `openSettings()`, mở hộp thoại `SettingsDialog`. Bắt phím tắt `Mod+,`. |
| **Quit** | `⌘Q` | 🟢 | **Hoạt động hoàn chỉnh**. Nút dạng `destructive`, kích hoạt `getCurrentWindow().close()` đóng ứng dụng ngay lập tức. |

---

### 2.2. Menu Chỉnh Sửa (Edit Menu)

| Chức năng | Phím tắt | Trạng thái | Chi tiết hiện trạng & Khả năng kết nối |
| :--- | :---: | :---: | :--- |
| ~~**Undo**~~ | `⌘Z` | ⏸️ | **Tạm ẩn (Hoãn phát triển bản sau)**. Đã ẩn khỏi giao diện menu Edit theo yêu cầu. Sẽ phát triển middleware ghi nhận lịch sử thay đổi (Undo stack) ở phiên bản sau. |
| ~~**Redo**~~ | `⌘⇧Z` | ⏸️ | **Tạm ẩn (Hoãn phát triển bản sau)**. Đã ẩn khỏi giao diện menu Edit theo yêu cầu. Sẽ phát triển cùng hệ thống Redo stack ở phiên bản sau. |
| *(Pipeline)* **Add step…** | `⌘N` | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. Trong `useBatchStore` đã có sẵn hàm `addStep(functionId)`, có thể kết nối mở menu chọn bước thêm vào quy trình xử lý. |
| *(Pipeline)* **Remove step** | `⌫` | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. Trong `useBatchStore` có `removeStep(id)` nhưng cần biết bước nào đang được active / focus. |
| *(Pipeline)* **Move step up** | `⌘↑` | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. Có thể kết nối với `reorderSteps` trong `batch.store.ts`. |
| *(Pipeline)* **Move step down** | `⌘↓` | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. Có thể kết nối với `reorderSteps` trong `batch.store.ts`. |
| *(Pipeline)* **Clear pipeline** | — | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. Có thể kết nối để reset mảng `pipeline` trong `useBatchStore`. |
| *(Pipeline)* **Reset to defaults** | — | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. |

---

### 2.3. Menu Chế Độ (Mode Menu)

| Chức năng | Phím tắt | Trạng thái | Chi tiết hiện trạng & Khả năng kết nối |
| :--- | :---: | :---: | :--- |
| **Single file** | `⌘1` | 🟢 | **Hoạt động hoàn chỉnh**. Radio item giá trị `single`. Đã bắt phím tắt `Mod+1` chuyển tức thì sang Single Mode và đồng bộ xuống `app.store.ts`. |
| **Batch** | `⌘2` | 🟢 | **Hoạt động hoàn chỉnh**. Radio item giá trị `batch`. Đã bắt phím tắt `Mod+2` chuyển tức thì sang Batch Mode và đồng bộ xuống `app.store.ts`. |
| **Quick viewer** | `⌘3` | 🟢 | **Hoạt động hoàn chỉnh**. Radio item giá trị `viewer`. Đã bắt phím tắt `Mod+3` chuyển tức thì sang Quick Viewer Mode và đồng bộ xuống `app.store.ts`. |
| **Watch folder** | — | 🚧 | **Đang phát triển (Soon)**. Đang `disabled` kèm nhãn huy hiệu `soon`. Chưa có backend theo dõi thư mục tự động (file watcher). |

---

### 2.4. Menu Thực Thi (Run Menu) — *(Chỉ hiển thị trong Single & Batch Mode)*

| Chức năng | Phím tắt | Trạng thái | Chi tiết hiện trạng & Khả năng kết nối |
| :--- | :---: | :---: | :--- |
| **Run** | `⌘R` | 🟢 | **Hoạt động hoàn chỉnh**. Bắt phím tắt `Mod+R` và nút bấm menu.<br>- Single Mode: kích hoạt `handleRunSingle()` khi đã chọn ảnh.<br>- Batch Mode: kích hoạt `runBatch()` khi hàng đợi và pipeline hợp lệ.<br>- Tự động kiểm tra điều kiện để disable/enable. |
| **Dry run (first file)** | `⌘⇧R` | 🟢 | **Hoạt động hoàn chỉnh (Batch Mode)**. Bắt phím tắt `Mod+Shift+R` và nút bấm menu. Kích hoạt `useBatchRunner().runDryRun()`. |
| **Stop** | `⌘.` | 🟢 | **Hoạt động hoàn chỉnh (Batch Mode)**. Bắt phím tắt `Mod+.` và nút bấm menu. Cho phép hủy tiến trình batch đang chạy qua `cancelBatch()`. Tự động enable khi `isBatchRunning`. |
| **Show live preview** | `⌘P` | 🟢 | **Hoạt động hoàn chỉnh (Single Mode)**. MenubarCheckboxItem hiển thị trạng thái xem trước tức thì, toggle `isManualPreview` trong `useSingleStore`, bắt phím tắt `Mod+P`. |
| **Copy CLI command** | `⌘⇧C` | 🟢 | **Hoạt động hoàn chỉnh**. Trích xuất câu lệnh CLI `magick` đầy đủ (bao gồm giới hạn bộ nhớ, strip metadata, màu sắc, tham số) và chép vào Clipboard qua `navigator.clipboard.writeText`. Bắt phím tắt `Mod+Shift+C`. |
| **Open output folder** | `⌘⇧F` | 🟢 | **Hoạt động hoàn chỉnh**. Bắt phím tắt `Mod+Shift+F` và nút bấm menu. Mở trực tiếp thư mục xuất file của Single Mode hoặc thư mục `outputDirectory` của Batch Mode qua Tauri opener API (`openPath`). |

---

### 2.5. Menu Mẫu Cấu Hình (Presets Menu) — *(Chỉ hiển thị trong Single & Batch Mode)*

| Chức năng | Phím tắt | Trạng thái | Chi tiết hiện trạng & Khả năng kết nối |
| :--- | :---: | :---: | :--- |
| **Save preset…** | `⌘S` | 🟢 | **Hoạt động hoàn chỉnh**. Nhập tên preset và lưu cấu hình pipeline thành tệp JSON vào thư mục cấu hình qua `usePresetActions().savePreset()`. Tự động disable khi pipeline trống. |
| **Load preset…** | `⌘L` | 🟢 | **Hoạt động hoàn chỉnh**. Mở Tauri file dialog chọn tệp preset `.json` và nạp vào pipeline qua `usePresetActions().loadPreset()`, tự động chuyển sang Batch Mode. Bắt phím tắt `Mod+L`. |
| *(Quick load)* **Web optimise** | — | 🟢 | **Hoạt động hoàn chỉnh**. Nạp cấu hình mẫu chuyển đổi WebP q80 kèm cờ xoá siêu dữ liệu (`-strip`). |
| *(Quick load)* **Thumbnail 200px** | — | 🟢 | **Hoạt động hoàn chỉnh**. Nạp cấu hình gồm 2 bước: Scale / resize thu nhỏ 200px (`thumbnail` mode) và Convert JPEG q85. |
| *(Quick load)* **B&W film** | — | 🟢 | **Hoạt động hoàn chỉnh**. Nạp cấu hình gồm 2 bước: Black & white (`Rec709Luma`) và Contrast tăng độ tương phản phim. |
| *(Quick load)* **Watermark logo** | — | 🟢 | **Hoạt động hoàn chỉnh**. Nạp cấu hình đóng dấu bản quyền góc dưới bên phải (`SouthEast`) chữ trắng. |
| **Manage presets…** | — | 🟢 | **Hoạt động hoàn chỉnh**. Mở trực tiếp thư mục lưu trữ presets trên hệ thống tệp OS bằng `openPath`. |

---

### 2.6. Menu Ảnh (Image Menu) — *(Chỉ hiển thị riêng trong Quick Viewer Mode)*

| Chức năng | Phím tắt | Trạng thái | Chi tiết hiện trạng & Khả năng kết nối |
| :--- | :---: | :---: | :--- |
| **Previous image** | `←` | 🟢 | **Hoạt động hoàn chỉnh**. Chuyển về ảnh trước đó trong cùng thư mục qua `useViewerStore.prevImage()`. Tự động disable khi chưa mở ảnh. |
| **Next image** | `→` | 🟢 | **Hoạt động hoàn chỉnh**. Chuyển tới ảnh tiếp theo trong cùng thư mục qua `useViewerStore.nextImage()`. Tự động disable khi chưa mở ảnh. |
| **Rotate clockwise 90°** | `⌘R` | 🟢 | **Hoạt động hoàn chỉnh**. Xoay ảnh 90° theo chiều kim đồng hồ qua `useViewerStore.rotateCW()`. Bắt phím tắt `Mod+R` khi đang ở Viewer mode. |
| **Rotate counter-clockwise 90°** | `⌘⇧R` | 🟢 | **Hoạt động hoàn chỉnh**. Xoay ảnh 90° ngược chiều kim đồng hồ qua `useViewerStore.rotateCCW()`. Bắt phím tắt `Mod+Shift+R` khi đang ở Viewer mode. |
| **Reset view** | `⌘0` | 🟢 | **Hoạt động hoàn chỉnh**. Đặt lại tỉ lệ zoom 100%, góc xoay 0° và căn giữa canvas qua `useViewerStore.resetView()`. Bắt phím tắt `Mod+0`. |
| **Cycle background** | `B` | 🟢 | **Hoạt động hoàn chỉnh**. Xoay vòng chế độ màu nền canvas (Theme default, Dark, Transparent checkerboard) qua `useViewerStore.cycleBgMode()`. |

---

### 2.7. Menu Hiển Thị & Giao Diện (View Menu)

| Chức năng | Phím tắt | Trạng thái | Chi tiết hiện trạng & Khả năng kết nối |
| :--- | :---: | :---: | :--- |
| **Show CLI preview** | `⌘\`` | 🟢 | **Hoạt động hoàn chỉnh**. MenubarCheckboxItem bật/tắt khung xem trước lệnh ImageMagick CLI, đồng bộ lưu trữ vào `useSettingsStore`, bắt phím tắt `Mod+\``. Tự động disabled khi không ở Single Mode. |
| **Show metadata bar** | — | 🟢 | **Hoạt động hoàn chỉnh**. MenubarCheckboxItem bật/tắt thanh siêu dữ liệu ảnh dưới khung canvas xem trước, đồng bộ lưu trữ vào `useSettingsStore`. Tự động disabled khi không ở Single Mode. |
| **Show pipeline steps** | — | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. |
| *(Canvas zoom)* **Zoom in** | `⌘+` | 🟢 | **Hoạt động hoàn chỉnh**. Tăng tỉ lệ zoom (+25%) trong Single Mode (`useSingleStore`) hoặc Quick Viewer Mode (`useViewerStore.zoomIn`). Bắt phím tắt `Mod++` / `Mod+=`. |
| *(Canvas zoom)* **Zoom out** | `⌘-` | 🟢 | **Hoạt động hoàn chỉnh**. Giảm tỉ lệ zoom (-25%) trong Single Mode hoặc Quick Viewer Mode (`useViewerStore.zoomOut`). Bắt phím tắt `Mod+-` / `Mod+_`. |
| *(Canvas zoom)* **Fit to window** | `⌘0` | 🟢 | **Hoạt động hoàn chỉnh**. Đặt lại tỉ lệ zoom chuẩn 100% trong Single Mode hoặc reset view trong Viewer Mode (`setActualSize`). Bắt phím tắt `Mod+0`. |
| **Theme (Submenu)** | — | 🟢 | **Hoạt động tốt**. Hiển thị theme hiện tại trên nhãn (`Theme: system / light / dark`), cho phép chọn System default, Light, Dark qua `next-themes` (`setTheme`). |
| **Help / shortcuts** | `⌘/` | 🔴 | **Chưa hoạt động (Stub)**. Đang `disabled`. Chưa có màn hình hoặc popup tra cứu bảng phím tắt. |

---

## 3. Đánh Giá Kiến Trúc Cầu Nối Menu (Menu Bridge & Native Menubar)

1. **Đồng nhất hoàn toàn giữa Web Menubar và macOS Native Menubar:**
   - Trên **macOS**, `setup_native_menubar` (`src-tauri/src/app_menu.rs`) đã được xây dựng đầy đủ 8 cụm submenu chuẩn macOS:
     - **Liquid Image (App)**: About, Preferences / Settings (`⌘,`), Services, Hide (`⌘H`), Hide Others (`⌘⌥H`), Show All, Quit (`⌘Q`).
     - **File**: Open Image… (`⌘O`), Open Folder… (`⌘⇧O`), Close File (`⌘W`).
     - **Edit**: Undo (`⌘Z`), Redo (`⌘⇧Z`), Cut (`⌘X`), Copy (`⌘C`), Paste (`⌘V`), Select All (`⌘A`) dùng native platform actions.
     - **Mode**: Single File Mode (`⌘1`), Batch Processing Mode (`⌘2`), Quick Viewer Mode (`⌘3`).
     - **Run**: Run (`⌘R`), Dry Run (`⌘⇧R`), Stop (`⌘.`), Show Live Preview (`⌘P`), Copy CLI Command (`⌘⇧C`), Open Output Folder (`⌘⇧F`).
     - **Presets**: Save Preset… (`⌘S`), Load Preset… (`⌘L`), Quick presets (Web optimise, Thumbnail 200px, B&W film, Watermark logo), Manage Presets….
     - **View**: Show CLI Preview (`⌘\``), Show Metadata Bar, Zoom In (`⌘+`), Zoom Out (`⌘-`), Fit to Window (`⌘0`).
     - **Window**: Minimize (`⌘M`), Zoom / Maximize, Fullscreen (`Ctrl+⌘F`), Close (`⌘W`).
   - `src-tauri/src/lib.rs` forward mọi sự kiện menu ID qua kênh `app:menu-action`.
   - `src/app/menubar/menuIds.ts` định nghĩa trọn bộ 25 ID đồng nhất.
   - `src/app/menubar/useMenubarBridge.ts` lắng nghe `app:menu-action` và điều hướng chính xác đến từng store (`useNavigationStore`, `useSingleStore`, `useBatchStore`, `useBatchRunner`, `useViewerStore`, `useSettingsStore`, `usePresetActions`).
   - Trên **Windows / Linux**, giao diện `WebMenubar.tsx` hoạt động song song với đầy đủ tính năng tương ứng.

2. **Cơ chế Phím tắt (Keyboard Shortcuts) và Action Bus:**
   - Các phím tắt phổ dụng (`⌘1`, `⌘2`, `⌘3`, `⌘O`, `⌘⇧O`, `⌘R`, `⌘⇧R`, `⌘.`, `⌘⇧F`, `⌘P`, `⌘⇧C`, `⌘S`, `⌘L`, `⌘\``, `⌘+`, `⌘-`, `⌘0`, `⌘,`, `⌘Q`) đã được gắn kết tập trung và kiểm tra điều kiện ngữ cảnh an toàn trên cả macOS native menubar và Web Menubar.

---

## 4. Kế Hoạch & Tiến Độ Thực Hiện (Actionable Roadmap)

### Ưu tiên cao (P0 - Quick Wins & Kết nối chức năng cốt lõi) — ✅ ĐÃ HOÀN THÀNH
- [x] **Kích hoạt phím tắt chuyển Mode (`⌘1`, `⌘2`):** Đã gắn `Mod+1` chuyển `single` và `Mod+2` chuyển `batch`.
- [x] **Kết nối Open Folder cho Batch Mode (`⌘⇧O`):** Đã kết nối Tauri folder dialog, quét ảnh tự động và thêm vào `useBatchStore`.
- [x] **Kết nối Run / Dry Run / Stop (`⌘R`, `⌘⇧R`, `⌘.`):**
  - Khi `mode === "batch"`: kích hoạt `runBatch()`, `runDryRun()`, `cancelBatch()`.
  - Khi `mode === "single"`: kích hoạt `handleRunSingle()`.
  - Tự động vô hiệu hoá (disabled) khi không đủ điều kiện chạy.
- [x] **Kết nối Open Output Folder (`⌘⇧F`):** Kích hoạt mở thư mục xuất file qua `openPath`.
- [x] **Gỡ bỏ tính năng Export CLI script (`⌘E`):** Đã loại bỏ hoàn toàn khỏi UI menu.

### Ưu tiên trung bình (P1 - Hoàn thiện các tiện ích View & Presets) — ✅ ĐÃ HOÀN THÀNH
- [x] **Kết nối menu View với Settings & Canvas Zoom:**
  - Bật/tắt `showCliPreview`: toggle giá trị `showCliPreview` trong `useSettingsStore` kèm phím tắt `⌘\`` và checkbox indicator.
  - Bật/tắt `showMetadata`: toggle giá trị `showMetadata` trong `useSettingsStore` kèm checkbox indicator.
  - Phím tắt Zoom (`⌘+`, `⌘-`, `⌘0`): điều khiển `previewZoom` trong `useSingleStore` và `useViewerStore` linh hoạt theo từng mode.
- [x] **Kết nối Copy CLI Command (`⌘⇧C`):**
  - Trích xuất câu lệnh ImageMagick chuẩn xác của Single Mode hoặc Batch Mode và sao chép vào clipboard qua `navigator.clipboard.writeText`.
- [x] **Kết nối Presets Menu:**
  - Kích hoạt `Save preset…`, `Load preset…` (`⌘L`), `Manage presets…` (mở thư mục bằng `openPath`).
  - Định nghĩa sẵn 4 mẫu quick presets (Web optimise, Thumbnail 200px, B&W film, Watermark logo) áp dụng tức thì.
- [x] **Kết nối Show Live Preview (`⌘P`):**
  - Kích hoạt toggle `isManualPreview` trong Single Mode kèm phím tắt `⌘P` và checkbox indicator.

### Ưu tiên dài hạn (P2 - Tích hợp hệ thống sâu)
- [x] **Xây dựng Recent Files Manager:**
  - Tạo store `useRecentFilesStore` lưu trữ danh sách các đường dẫn tệp ảnh đã mở gần đây (giới hạn theo `recentFilesLimit`).
  - Tự động ghi nhận khi mở ảnh ở cả Single file mode và Quick viewer mode.
  - Hiển thị động danh sách này trong submenu `Recent files`, bấm vào để mở lại tệp và bổ sung nút `Clear recent`.
- [ ] ~~**Hệ thống Edit / Undo Stack:**~~ *(Tạm ẩn khỏi menubar, hoãn phát triển ở phiên bản sau)*
  - Middleware ghi nhận lịch sử thay đổi để kích hoạt `Undo` (`⌘Z`) và `Redo` (`⌘⇧Z`).
- [x] **Đồng bộ với macOS Native Menubar:**
  - Mở rộng `src-tauri/src/app_menu.rs` với 8 submenu chuẩn macOS (App, File, Edit, Mode, Run, Presets, View, Window).
  - Mở rộng `menuIds.ts` định nghĩa 25 hằng số menu ID dùng chung giữa Rust và TypeScript.
  - Nâng cấp `useMenubarBridge.ts` lắng nghe `app:menu-action` từ Tauri và phân phối tới đúng action handlers tương ứng của Web Menubar.
