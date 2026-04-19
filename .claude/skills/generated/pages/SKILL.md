---
name: pages
description: "Skill for the Pages area of liquid-image. 9 symbols across 2 files."
---

# Pages

9 symbols | 2 files | Cohesion: 77%

## When to Use

- Working with code in `src/`
- Understanding how handleChooseOutputPath, handleRunSingle, runSingle work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/pages/SingleModePage.tsx` | getFileNameFromPath, normalizeOutputDir, normalizeOutputName, normalizeOutputExt, handleChooseOutputPath (+3) |
| `src/shared/tauri/commands.ts` | runSingle |

## Entry Points

Start here when exploring this area:

- **`handleChooseOutputPath`** (Function) — `src/pages/SingleModePage.tsx:438`
- **`handleRunSingle`** (Function) — `src/pages/SingleModePage.tsx:479`
- **`runSingle`** (Function) — `src/shared/tauri/commands.ts:68`
- **`handleOpenOutputFolder`** (Function) — `src/pages/SingleModePage.tsx:462`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `handleChooseOutputPath` | Function | `src/pages/SingleModePage.tsx` | 438 |
| `handleRunSingle` | Function | `src/pages/SingleModePage.tsx` | 479 |
| `runSingle` | Function | `src/shared/tauri/commands.ts` | 68 |
| `handleOpenOutputFolder` | Function | `src/pages/SingleModePage.tsx` | 462 |
| `getFileNameFromPath` | Function | `src/pages/SingleModePage.tsx` | 73 |
| `normalizeOutputDir` | Function | `src/pages/SingleModePage.tsx` | 89 |
| `normalizeOutputName` | Function | `src/pages/SingleModePage.tsx` | 97 |
| `normalizeOutputExt` | Function | `src/pages/SingleModePage.tsx` | 105 |
| `getDirectoryPath` | Function | `src/pages/SingleModePage.tsx` | 79 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandleRunSingle → GetNumberParam` | cross_community | 3 |
| `HandleRunSingle → GetStringParam` | cross_community | 3 |
| `HandleRunSingle → QuoteIfNeeded` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Single | 1 calls |

## How to Explore

1. `gitnexus_context({name: "handleChooseOutputPath"})` — see callers and callees
2. `gitnexus_query({query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
