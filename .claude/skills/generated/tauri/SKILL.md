---
name: tauri
description: "Skill for the Tauri area of liquid-image. 16 symbols across 8 files."
---

# Tauri

16 symbols | 8 files | Cohesion: 83%

## When to Use

- Working with code in `src/`
- Understanding how formatFileSize, SingleModePage, handleDetachFile work
- Modifying tauri-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/shared/tauri/commands.ts` | getImageMetadata, createImageProxy, removeProxyFile, generatePreview, checkVersion (+1) |
| `src/pages/SingleModePage.tsx` | SingleModePage, handleDetachFile |
| `src/features/single/hooks/usePreviewPipeline.ts` | usePreviewPipeline, decodeImageDimensions |
| `src/shared/hooks/useMagickVersion.ts` | useMagickVersion, loadVersion |
| `src/lib/utils.ts` | formatFileSize |
| `src/shared/tauri/errors.ts` | normalizeTauriError |
| `src/app/AppShell.tsx` | AppShell |
| `src/app/menubar/useMenubarBridge.ts` | useMenubarBridge |

## Entry Points

Start here when exploring this area:

- **`formatFileSize`** (Function) — `src/lib/utils.ts:7`
- **`SingleModePage`** (Function) — `src/pages/SingleModePage.tsx:196`
- **`handleDetachFile`** (Function) — `src/pages/SingleModePage.tsx:426`
- **`getImageMetadata`** (Function) — `src/shared/tauri/commands.ts:23`
- **`createImageProxy`** (Function) — `src/shared/tauri/commands.ts:27`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `formatFileSize` | Function | `src/lib/utils.ts` | 7 |
| `SingleModePage` | Function | `src/pages/SingleModePage.tsx` | 196 |
| `handleDetachFile` | Function | `src/pages/SingleModePage.tsx` | 426 |
| `getImageMetadata` | Function | `src/shared/tauri/commands.ts` | 23 |
| `createImageProxy` | Function | `src/shared/tauri/commands.ts` | 27 |
| `removeProxyFile` | Function | `src/shared/tauri/commands.ts` | 31 |
| `generatePreview` | Function | `src/shared/tauri/commands.ts` | 50 |
| `usePreviewPipeline` | Function | `src/features/single/hooks/usePreviewPipeline.ts` | 32 |
| `decodeImageDimensions` | Function | `src/features/single/hooks/usePreviewPipeline.ts` | 133 |
| `normalizeTauriError` | Function | `src/shared/tauri/errors.ts` | 0 |
| `checkVersion` | Function | `src/shared/tauri/commands.ts` | 12 |
| `useMagickVersion` | Function | `src/shared/hooks/useMagickVersion.ts` | 12 |
| `loadVersion` | Function | `src/shared/hooks/useMagickVersion.ts` | 20 |
| `menubarUsesNative` | Function | `src/shared/tauri/commands.ts` | 8 |
| `AppShell` | Function | `src/app/AppShell.tsx` | 20 |
| `useMenubarBridge` | Function | `src/app/menubar/useMenubarBridge.ts` | 13 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `SingleModePage → GetNumberParam` | cross_community | 4 |
| `SingleModePage → GetStringParam` | cross_community | 4 |
| `SingleModePage → QuoteIfNeeded` | cross_community | 4 |
| `SingleModePage → NormalizeOutputDir` | cross_community | 4 |
| `SingleModePage → MapOutputFormatToExt` | cross_community | 4 |
| `SingleModePage → GeneratePreview` | intra_community | 3 |
| `SingleModePage → DecodeImageDimensions` | intra_community | 3 |
| `SingleModePage → GetBaseName` | cross_community | 3 |
| `UseMagickVersion → CheckVersion` | intra_community | 3 |
| `UseMagickVersion → NormalizeTauriError` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Pages | 4 calls |
| Single | 3 calls |

## How to Explore

1. `gitnexus_context({name: "formatFileSize"})` — see callers and callees
2. `gitnexus_query({query: "tauri"})` — find related execution flows
3. Read key files listed above for implementation details
