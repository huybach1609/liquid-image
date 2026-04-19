---
name: single
description: "Skill for the Single area of liquid-image. 10 symbols across 1 files."
---

# Single

10 symbols | 1 files | Cohesion: 70%

## When to Use

- Working with code in `src/`
- Understanding how buildSingleOperationArgs, buildSingleCliPipeline, buildSingleCliPreview work
- Modifying single-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/features/single/buildSingleCliPreview.ts` | getBaseName, quoteIfNeeded, getNumberParam, buildSingleOperationArgs, buildSingleCliPipeline (+5) |

## Entry Points

Start here when exploring this area:

- **`buildSingleOperationArgs`** (Function) — `src/features/single/buildSingleCliPreview.ts:66`
- **`buildSingleCliPipeline`** (Function) — `src/features/single/buildSingleCliPreview.ts:212`
- **`buildSingleCliPreview`** (Function) — `src/features/single/buildSingleCliPreview.ts:233`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `buildSingleOperationArgs` | Function | `src/features/single/buildSingleCliPreview.ts` | 66 |
| `buildSingleCliPipeline` | Function | `src/features/single/buildSingleCliPreview.ts` | 212 |
| `buildSingleCliPreview` | Function | `src/features/single/buildSingleCliPreview.ts` | 233 |
| `getBaseName` | Function | `src/features/single/buildSingleCliPreview.ts` | 15 |
| `quoteIfNeeded` | Function | `src/features/single/buildSingleCliPreview.ts` | 21 |
| `getNumberParam` | Function | `src/features/single/buildSingleCliPreview.ts` | 32 |
| `getStringParam` | Function | `src/features/single/buildSingleCliPreview.ts` | 27 |
| `normalizeOutputDir` | Function | `src/features/single/buildSingleCliPreview.ts` | 42 |
| `mapOutputFormatToExt` | Function | `src/features/single/buildSingleCliPreview.ts` | 49 |
| `buildOutputPath` | Function | `src/features/single/buildSingleCliPreview.ts` | 56 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `SingleModePage → GetNumberParam` | cross_community | 4 |
| `SingleModePage → GetStringParam` | cross_community | 4 |
| `SingleModePage → QuoteIfNeeded` | cross_community | 4 |
| `SingleModePage → NormalizeOutputDir` | cross_community | 4 |
| `SingleModePage → MapOutputFormatToExt` | cross_community | 4 |
| `BuildSingleCliPreview → NormalizeOutputDir` | cross_community | 4 |
| `BuildSingleCliPreview → GetStringParam` | cross_community | 4 |
| `BuildSingleCliPreview → MapOutputFormatToExt` | cross_community | 4 |
| `BuildSingleCliPreview → GetNumberParam` | intra_community | 4 |
| `BuildSingleCliPreview → QuoteIfNeeded` | intra_community | 4 |

## How to Explore

1. `gitnexus_context({name: "buildSingleOperationArgs"})` — see callers and callees
2. `gitnexus_query({query: "single"})` — find related execution flows
3. Read key files listed above for implementation details
