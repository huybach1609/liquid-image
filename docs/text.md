Quá hợp lý. Đây là cây thư mục “final” để bạn scale sạch cho `single` + `batch`, bám đúng 2 template UI.

## Cây thư mục đề xuất

```txt
src/
  app/
    AppShell.tsx
    AppHeader.tsx
    AppFooter.tsx
    ModeSwitch.tsx
    routes.ts

  pages/
    SingleModePage.tsx
    BatchModePage.tsx

  features/
    single/
      components/
        SingleTopbar.tsx
        SingleCanvas.tsx
        SingleOptionsPanel.tsx
        SingleCliPreview.tsx
      hooks/
        useSingleActions.ts
      state/
        single.store.ts
      types.ts
      mappers.ts

    batch/
      components/
        BatchQueuePanel.tsx
        BatchPipelinePanel.tsx
        BatchOutputPanel.tsx
        BatchLogPanel.tsx
        BatchSettingsPanel.tsx
        BatchBottomBar.tsx
      hooks/
        useBatchActions.ts
        useBatchRunner.ts
      state/
        batch.store.ts
      types.ts
      mappers.ts

    settings/
      components/
        SharedDestinationForm.tsx
        SharedOutputRulesForm.tsx
        SharedConcurrencyForm.tsx
      state/
        settings.store.ts
      types.ts

    presets/
      hooks/
        usePresetActions.ts
      state/
        preset.store.ts
      types.ts

  shared/
    tauri/
      commands.ts
      errors.ts
      channels.ts
    hooks/
      useMagickVersion.ts
      useDebouncedValue.ts
    components/
      panels/
        Panel.tsx
        PanelHeader.tsx
      status/
        StatusBadge.tsx
      forms/
        FieldRow.tsx
      ui/                 # shadcn wrappers nếu cần
    lib/
      format.ts
      path.ts
      estimate.ts
    types/
      common.ts

  main.tsx
  App.css
```

---

## Trách nhiệm từng cụm (rất quan trọng)

- `app/`: chỉ layout tổng + điều hướng mode, **không chứa business logic**.
- `pages/`: compose feature components thành màn hình.
- `features/single`: mọi thứ của single mode (canvas, option, preview command).
- `features/batch`: queue/pipeline/run/log/settings cho batch.
- `features/settings`: các setting dùng chung cả 2 mode.
- `features/presets`: save/load preset, import/export.
- `shared/tauri/commands.ts`: nơi duy nhất gọi `invoke`.
- `shared/components`: component tái sử dụng thuần UI.

---

## Skeleton trách nhiệm file chính

- `app/AppShell.tsx`
  - Render `AppHeader`, `ModeSwitch`, `AppFooter`
  - Switch page theo mode (`single` | `batch`)
- `pages/SingleModePage.tsx`
  - `SingleTopbar + SingleCanvas + SingleOptionsPanel + SingleCliPreview`
- `pages/BatchModePage.tsx`
  - `BatchQueuePanel + BatchPipelinePanel + right panel tabs + BatchBottomBar`
- `features/*/state/*.store.ts`
  - Chỉ giữ state + action sync (zustand/reducer)
- `features/*/hooks/use*Actions.ts`
  - Orchestrate async: gọi command, update store, handle loading/error
- `shared/tauri/commands.ts`
  - Ví dụ: `checkVersion()`, `runSingle()`, `runBatchDryRun()`, `runBatchStart()`, `cancelJob()`
- `shared/tauri/errors.ts`
  - Chuẩn hóa error message từ Rust -> UI

---

## Hợp với 2 template như nào

- `imagemagick_desktop_ui.html` -> map vào `single/*`
- `imagemagick_batch_mode.html` -> map vào `batch/*`
- Các phần giống nhau (destination, workers, naming, on conflict) -> `features/settings/*`

---

## Quy tắc để không “toang” sau này

- Không gọi `invoke` trong component render.
- Không để `App.tsx` chứa logic mode.
- Tách `types.ts` theo feature, chỉ đưa type thực sự shared vào `shared/types`.
- Effect chạy 1 lần (như version) để ở hook riêng (`useMagickVersion`), tránh copy/paste.

---

Nếu bạn muốn, bước kế mình gửi luôn **skeleton code thực tế cho 8 file đầu tiên** (`AppShell`, 2 page, 2 store, `commands.ts`, `useMagickVersion`, `ModeSwitch`) để bạn paste chạy ngay.