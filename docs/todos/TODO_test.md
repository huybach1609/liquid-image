# TODO: Test Plan for Liquid Image

This document lists the necessary tests to ensure the stability and correctness of the Liquid Image application across both Frontend (Bun/TypeScript) and Backend (Rust/Cargo).

## 1. Frontend Tests (`bun test` / `vitest`)

### 1.1. Unit Tests (Logic & Utilities)
- [ ] **`src/shared/lib/path.ts`**: Verify path normalization across OS (Windows/Linux/macOS).
- [ ] **`src/shared/lib/format.ts`**: Verify file size formatting (MB, MiB, etc.).
- [ ] **`src/shared/lib/estimate.ts`**: Test time estimation logic for batch processing.
- [ ] **`src/features/single/buildSingleCliPreview.ts`**: Verify CLI command generation for all operations (Crop, Resize, Rotate, etc.).
- [ ] **`src/features/batch/buildBatchCliPipeline.ts`**: Verify complex pipeline command generation.
- [ ] **`src/features/single/pathUtils.ts`**: Verify specialized path handling for single mode.

### 1.2. State Management (Zustand Stores)
- [ ] **`single.store.ts`**: 
    - Test updating operation parameters.
    - Test resetting state.
    - Test preview synchronization.
- [ ] **`batch.store.ts`**:
    - Test adding/removing files from the queue.
    - Test adding/reordering pipeline steps.
    - Test progress tracking state.
- [ ] **`settings.store.ts`**:
    - Test persistence of user preferences (language, theme, concurrency).

### 1.3. Custom Hooks
- [ ] **`useBatchRunner.ts`**: Test the orchestration of batch processing, including concurrency and error handling.
- [ ] **`useMagickVersion.ts`**: Test detection of ImageMagick version and handling of "not found" state.

### 1.4. Component Tests (React Testing Library)
- [ ] **`ModeSwitch.tsx`**: Verify switching between Single and Batch modes updates the UI correctly.
- [ ] **`BatchQueuePanel.tsx`**: Verify file list rendering and "Remove" functionality.
- [ ] **`SingleCanvas.tsx`**: Verify image placeholder and preview rendering.
- [ ] **`ConvertPanel.tsx` (and other operation panels)**: Verify input changes reflect in the store.

---

## 2. Backend Tests (`cargo test`)

### 2.1. Magick Core
- [x] **`magick/runner.rs`**: 
    - [x] Test `detect_magick_source()` to correctly find `magick` binary.
    - [x] Test `MagickSource` Display impl and serde serialization/deserialization.
    - [x] Test `get_magick_source()` / `set_magick_source()` roundtrip.
    - [x] Test environment variable parsing (`LI_MAGICK_SOURCE`) with all valid values.
- [x] **`magick/service.rs`**:
    - [x] Test `parse_magick_version()` with standard, multiline, empty, and partial outputs.
    - [x] Test `format_cli_token_for_log()` with simple, empty, spaced, quoted, and escaped tokens.
    - [x] Test `args_slice_contains_shave()` with and without shave flags.
    - [x] Test `parse_shave_geometry()` with valid, invalid, and edge case inputs.
    - [x] Test `rescale_shave_tokens_for_proxy_preview()` with single/multiple shave flags and zero dimensions.
    - [x] Test serde serialization/deserialization of `BatchItem`, `RunBatchRequest`, `RunSingleRequest`, `GeneratePreviewRequest`, `BatchProgressEvent`.

### 2.2. Contracts & Models
- [x] **`contracts/signle.rs`**: 
    - [x] Test serialization/deserialization of all enums: `OutputFormat`, `OnConflict`, `ResizeFit`, `Gravity`, `MirrorAxis`.
    - [x] Test serialization/deserialization of all `Operation` variants with tagged serde.
    - [x] Test `RunSingleRequest`, `CliPreview`, `RunSingleResponse` camelCase serialization.

### 2.3. App Logic
- [x] **`lib.rs`**: 
    - [x] Test `greet` command with normal, empty, and special character inputs.
    - [x] Test `menubar_uses_native` platform detection.
    - [x] Test `AppState` initialization and cancel token storage.

---

## 3. Integration & E2E Tests

### 3.1. Single Mode Flow
- [ ] User selects an image -> Applies Crop -> Preview updates -> Clicks "Run" -> Output file is created.

### 3.2. Batch Mode Flow
- [ ] User drops a folder -> Adds "Resize" and "Convert" steps -> Sets 4 workers -> Clicks "Run" -> All files are processed correctly.

### 3.3. Error Handling
- [ ] Attempting to process a corrupt or non-image file.
- [ ] ImageMagick not installed or path incorrect.
- [ ] Output folder not writable.

---

## 4. Performance & Stress Tests
- [ ] **Concurrency**: Processing 100+ images with varying worker counts.
- [ ] **Memory**: Monitoring memory usage when processing ultra-high-res (4K/8K) images.
- [ ] **IPC Bottlenecks**: Verifying that high-frequency preview updates (from sliders) don't lag the UI.
