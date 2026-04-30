---
name: pages
description: "Skill for the Pages area of liquid-image. 13 symbols across 6 files."
---

# Pages

13 symbols | 6 files | Cohesion: 82%

## When to Use

- Working with code in `src/`
- Understanding how SingleModePage, updateCompactState, generatePreview work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/pages/SettingPage.tsx` | SettingPage, fetchMagickSource, handleBrowseBinary, handleTestBinary |
| `src/pages/SingleModePage.tsx` | slugForFunctionId, SingleModePage, updateCompactState |
| `src/features/single/hooks/usePreviewPipeline.ts` | usePreviewPipeline, decodeImageDimensions |
| `src/shared/hooks/useAppInfo.ts` | useAppInfo, fetchAppInfo |
| `src/shared/tauri/commands.ts` | generatePreview |
| `src/features/single/previewScale.ts` | estimateProxyDimensions |

## Entry Points

Start here when exploring this area:

- **`SingleModePage`** (Function) — `src/pages/SingleModePage.tsx:40`
- **`updateCompactState`** (Function) — `src/pages/SingleModePage.tsx:107`
- **`generatePreview`** (Function) — `src/shared/tauri/commands.ts:56`
- **`estimateProxyDimensions`** (Function) — `src/features/single/previewScale.ts:7`
- **`usePreviewPipeline`** (Function) — `src/features/single/hooks/usePreviewPipeline.ts:34`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `SingleModePage` | Function | `src/pages/SingleModePage.tsx` | 40 |
| `updateCompactState` | Function | `src/pages/SingleModePage.tsx` | 107 |
| `generatePreview` | Function | `src/shared/tauri/commands.ts` | 56 |
| `estimateProxyDimensions` | Function | `src/features/single/previewScale.ts` | 7 |
| `usePreviewPipeline` | Function | `src/features/single/hooks/usePreviewPipeline.ts` | 34 |
| `decodeImageDimensions` | Function | `src/features/single/hooks/usePreviewPipeline.ts` | 146 |
| `SettingPage` | Function | `src/pages/SettingPage.tsx` | 120 |
| `fetchMagickSource` | Function | `src/pages/SettingPage.tsx` | 137 |
| `handleBrowseBinary` | Function | `src/pages/SettingPage.tsx` | 153 |
| `handleTestBinary` | Function | `src/pages/SettingPage.tsx` | 188 |
| `useAppInfo` | Function | `src/shared/hooks/useAppInfo.ts` | 9 |
| `fetchAppInfo` | Function | `src/shared/hooks/useAppInfo.ts` | 19 |
| `slugForFunctionId` | Function | `src/pages/SingleModePage.tsx` | 34 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `SingleModePage → GetStringParam` | cross_community | 5 |
| `SingleModePage → GetNumberParam` | cross_community | 5 |
| `SingleModePage → NormalizeOutputDir` | cross_community | 4 |
| `SingleModePage → MapOutputFormatToExt` | cross_community | 4 |
| `UsePreviewPipeline → GetNumberParam` | cross_community | 4 |
| `UsePreviewPipeline → GetStringParam` | cross_community | 4 |
| `SingleModePage → GeneratePreview` | intra_community | 3 |
| `SingleModePage → DecodeImageDimensions` | intra_community | 3 |
| `SingleModePage → GetBaseName` | cross_community | 3 |
| `SingleModePage → QuoteCliToken` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Single | 3 calls |
| Ui | 1 calls |
| Operations | 1 calls |

## How to Explore

1. `gitnexus_context({name: "SingleModePage"})` — see callers and callees
2. `gitnexus_query({query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
