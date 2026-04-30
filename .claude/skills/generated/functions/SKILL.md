---
name: functions
description: "Skill for the Functions area of liquid-image. 10 symbols across 4 files."
---

# Functions

10 symbols | 4 files | Cohesion: 73%

## When to Use

- Working with code in `src/`
- Understanding how useSingleT, CropFunction, setNumberParam work
- Modifying functions-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/shared/components/functions/Crop.tsx` | parseCropMethod, parseGravity, CropFunction, setNumberParam |
| `src/shared/components/functions/Convert.tsx` | normalizeOutputFormat, getQualityLabel, getQualityHint, ConvertFunction |
| `src/i18n/useSingleT.ts` | useSingleT |
| `src/shared/components/functions/Mirror.tsx` | MirrorFunction |

## Entry Points

Start here when exploring this area:

- **`useSingleT`** (Function) — `src/i18n/useSingleT.ts:6`
- **`CropFunction`** (Function) — `src/shared/components/functions/Crop.tsx:42`
- **`setNumberParam`** (Function) — `src/shared/components/functions/Crop.tsx:92`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `useSingleT` | Function | `src/i18n/useSingleT.ts` | 6 |
| `CropFunction` | Function | `src/shared/components/functions/Crop.tsx` | 42 |
| `setNumberParam` | Function | `src/shared/components/functions/Crop.tsx` | 92 |
| `MirrorFunction` | Function | `src/shared/components/functions/Mirror.tsx` | 10 |
| `parseCropMethod` | Function | `src/shared/components/functions/Crop.tsx` | 27 |
| `parseGravity` | Function | `src/shared/components/functions/Crop.tsx` | 32 |
| `normalizeOutputFormat` | Function | `src/shared/components/functions/Convert.tsx` | 27 |
| `getQualityLabel` | Function | `src/shared/components/functions/Convert.tsx` | 37 |
| `getQualityHint` | Function | `src/shared/components/functions/Convert.tsx` | 43 |
| `ConvertFunction` | Function | `src/shared/components/functions/Convert.tsx` | 61 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Operations | 4 calls |
| Ui | 2 calls |

## How to Explore

1. `gitnexus_context({name: "useSingleT"})` — see callers and callees
2. `gitnexus_query({query: "functions"})` — find related execution flows
3. Read key files listed above for implementation details
