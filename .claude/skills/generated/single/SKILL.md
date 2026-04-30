---
name: single
description: "Skill for the Single area of liquid-image. 19 symbols across 5 files."
---

# Single

19 symbols | 5 files | Cohesion: 86%

## When to Use

- Working with code in `src/`
- Understanding how getImageMetadata, createImageProxy, removeProxyFile work
- Modifying single-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/features/single/pathUtils.ts` | getFileNameFromPath, getFileNameWithoutExtension, getFileExtension, getDirectoryPath, normalizeOutputDir (+2) |
| `src/features/single/buildSingleCliPreview.ts` | getBaseName, normalizeOutputDir, mapOutputFormatToExt, buildOutputPath, buildSingleCliPipeline (+1) |
| `src/shared/tauri/commands.ts` | getImageMetadata, createImageProxy, removeProxyFile, runSingle |
| `src/features/single/hooks/useSingleActions.ts` | useSingleActions |
| `src/features/single/operations/quoteCli.ts` | quoteCliToken |

## Entry Points

Start here when exploring this area:

- **`getImageMetadata`** (Function) — `src/shared/tauri/commands.ts:23`
- **`createImageProxy`** (Function) — `src/shared/tauri/commands.ts:27`
- **`removeProxyFile`** (Function) — `src/shared/tauri/commands.ts:31`
- **`runSingle`** (Function) — `src/shared/tauri/commands.ts:74`
- **`getFileNameFromPath`** (Function) — `src/features/single/pathUtils.ts:0`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getImageMetadata` | Function | `src/shared/tauri/commands.ts` | 23 |
| `createImageProxy` | Function | `src/shared/tauri/commands.ts` | 27 |
| `removeProxyFile` | Function | `src/shared/tauri/commands.ts` | 31 |
| `runSingle` | Function | `src/shared/tauri/commands.ts` | 74 |
| `getFileNameFromPath` | Function | `src/features/single/pathUtils.ts` | 0 |
| `getFileNameWithoutExtension` | Function | `src/features/single/pathUtils.ts` | 6 |
| `getFileExtension` | Function | `src/features/single/pathUtils.ts` | 13 |
| `getDirectoryPath` | Function | `src/features/single/pathUtils.ts` | 20 |
| `normalizeOutputDir` | Function | `src/features/single/pathUtils.ts` | 29 |
| `normalizeOutputName` | Function | `src/features/single/pathUtils.ts` | 36 |
| `normalizeOutputExt` | Function | `src/features/single/pathUtils.ts` | 43 |
| `useSingleActions` | Function | `src/features/single/hooks/useSingleActions.ts` | 49 |
| `buildSingleCliPipeline` | Function | `src/features/single/buildSingleCliPreview.ts` | 116 |
| `buildSingleCliPreview` | Function | `src/features/single/buildSingleCliPreview.ts` | 142 |
| `quoteCliToken` | Function | `src/features/single/operations/quoteCli.ts` | 1 |
| `getBaseName` | Function | `src/features/single/buildSingleCliPreview.ts` | 45 |
| `normalizeOutputDir` | Function | `src/features/single/buildSingleCliPreview.ts` | 51 |
| `mapOutputFormatToExt` | Function | `src/features/single/buildSingleCliPreview.ts` | 58 |
| `buildOutputPath` | Function | `src/features/single/buildSingleCliPreview.ts` | 65 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `BuildSingleCliPreview → GetStringParam` | cross_community | 5 |
| `BuildSingleCliPreview → GetNumberParam` | cross_community | 5 |
| `SingleModePage → NormalizeOutputDir` | cross_community | 4 |
| `SingleModePage → MapOutputFormatToExt` | cross_community | 4 |
| `BuildSingleCliPreview → NormalizeOutputDir` | intra_community | 4 |
| `BuildSingleCliPreview → MapOutputFormatToExt` | intra_community | 4 |
| `SingleModePage → GetBaseName` | cross_community | 3 |
| `SingleModePage → QuoteCliToken` | cross_community | 3 |
| `UseSingleActions → GetFileNameFromPath` | intra_community | 3 |
| `BuildSingleCliPreview → GetBaseName` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Operations | 3 calls |

## How to Explore

1. `gitnexus_context({name: "getImageMetadata"})` — see callers and callees
2. `gitnexus_query({query: "single"})` — find related execution flows
3. Read key files listed above for implementation details
