---
name: tauri
description: "Skill for the Tauri area of liquid-image. 18 symbols across 10 files."
---

# Tauri

18 symbols | 10 files | Cohesion: 97%

## When to Use

- Working with code in `src/`
- Understanding how runBatch, runBatchDryRun, cancelBatch work
- Modifying tauri-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/shared/tauri/commands.ts` | runBatch, runBatchDryRun, cancelBatch, menubarUsesNative, checkVersion |
| `src/features/batch/buildBatchCliPipeline.ts` | buildBatchCliArgs, mapOutputFormatToExt, buildBatchOutputPath |
| `src/features/batch/hooks/useBatchRunner.ts` | useBatchRunner, setupListeners |
| `src/shared/hooks/useMagickVersion.ts` | useMagickVersion, loadVersion |
| `src/features/batch/components/BatchBottomBar.tsx` | BatchBottomBar |
| `src/app/AppShell.tsx` | AppShell |
| `src/app/menubar/useMenubarBridge.ts` | useMenubarBridge |
| `src/features/presets/state/preset.store.ts` | getState |
| `src/features/batch/components/BatchPipelinePanel.tsx` | BatchPipelinePanel |
| `src/shared/tauri/errors.ts` | normalizeTauriError |

## Entry Points

Start here when exploring this area:

- **`runBatch`** (Function) — `src/shared/tauri/commands.ts:99`
- **`runBatchDryRun`** (Function) — `src/shared/tauri/commands.ts:103`
- **`cancelBatch`** (Function) — `src/shared/tauri/commands.ts:107`
- **`buildBatchCliArgs`** (Function) — `src/features/batch/buildBatchCliPipeline.ts:8`
- **`buildBatchOutputPath`** (Function) — `src/features/batch/buildBatchCliPipeline.ts:37`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `runBatch` | Function | `src/shared/tauri/commands.ts` | 99 |
| `runBatchDryRun` | Function | `src/shared/tauri/commands.ts` | 103 |
| `cancelBatch` | Function | `src/shared/tauri/commands.ts` | 107 |
| `buildBatchCliArgs` | Function | `src/features/batch/buildBatchCliPipeline.ts` | 8 |
| `buildBatchOutputPath` | Function | `src/features/batch/buildBatchCliPipeline.ts` | 37 |
| `useBatchRunner` | Function | `src/features/batch/hooks/useBatchRunner.ts` | 13 |
| `setupListeners` | Function | `src/features/batch/hooks/useBatchRunner.ts` | 30 |
| `BatchBottomBar` | Function | `src/features/batch/components/BatchBottomBar.tsx` | 5 |
| `menubarUsesNative` | Function | `src/shared/tauri/commands.ts` | 8 |
| `AppShell` | Function | `src/app/AppShell.tsx` | 14 |
| `useMenubarBridge` | Function | `src/app/menubar/useMenubarBridge.ts` | 13 |
| `BatchPipelinePanel` | Function | `src/features/batch/components/BatchPipelinePanel.tsx` | 20 |
| `normalizeTauriError` | Function | `src/shared/tauri/errors.ts` | 0 |
| `checkVersion` | Function | `src/shared/tauri/commands.ts` | 12 |
| `useMagickVersion` | Function | `src/shared/hooks/useMagickVersion.ts` | 12 |
| `loadVersion` | Function | `src/shared/hooks/useMagickVersion.ts` | 20 |
| `getState` | Method | `src/features/presets/state/preset.store.ts` | 13 |
| `mapOutputFormatToExt` | Function | `src/features/batch/buildBatchCliPipeline.ts` | 26 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `BatchBottomBar → GetStringParam` | cross_community | 6 |
| `BatchBottomBar → GetNumberParam` | cross_community | 6 |
| `BatchBottomBar → MapOutputFormatToExt` | intra_community | 4 |
| `AppShell → GetState` | intra_community | 3 |
| `UseMagickVersion → CheckVersion` | intra_community | 3 |
| `UseMagickVersion → NormalizeTauriError` | intra_community | 3 |
| `BatchBottomBar → SetupListeners` | intra_community | 3 |
| `BatchBottomBar → RunBatch` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Operations | 1 calls |

## How to Explore

1. `gitnexus_context({name: "runBatch"})` — see callers and callees
2. `gitnexus_query({query: "tauri"})` — find related execution flows
3. Read key files listed above for implementation details
