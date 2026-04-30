---
name: operations
description: "Skill for the Operations area of liquid-image. 28 symbols across 23 files."
---

# Operations

28 symbols | 23 files | Cohesion: 88%

## When to Use

- Working with code in `src/`
- Understanding how getStringParam, getNumberParam, buildSingleOperationArgs work
- Modifying operations-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/lib/functionParams.ts` | getStringParam, getNumberParam |
| `src/shared/components/functions/ScaleResize.tsx` | ScaleResizeFunction, setSize |
| `src/shared/components/functions/Rotate.tsx` | RotateFunction, setAngle |
| `src/shared/components/functions/BlackWhite.tsx` | BlackWhiteFunction, handleIntensityChange |
| `src/features/single/operations/cropOperationArgs.ts` | scaledCropParamsForFullInput, buildCropOperationArgs |
| `src/features/single/buildSingleCliPreview.ts` | buildSingleOperationArgs |
| `src/shared/components/functions/Vignette.tsx` | VignetteFunction |
| `src/shared/components/functions/TextLogo.tsx` | TextLogoFunction |
| `src/shared/components/functions/NormalizeColor.tsx` | NormalizeColorFunction |
| `src/features/single/operations/vignetteOperationArgs.ts` | buildVignetteOperationArgs |

## Entry Points

Start here when exploring this area:

- **`getStringParam`** (Function) — `src/lib/functionParams.ts:2`
- **`getNumberParam`** (Function) — `src/lib/functionParams.ts:11`
- **`buildSingleOperationArgs`** (Function) — `src/features/single/buildSingleCliPreview.ts:75`
- **`buildVignetteOperationArgs`** (Function) — `src/features/single/operations/vignetteOperationArgs.ts:2`
- **`buildTextLogoOperationArgs`** (Function) — `src/features/single/operations/textLogoOperationArgs.ts:2`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `getStringParam` | Function | `src/lib/functionParams.ts` | 2 |
| `getNumberParam` | Function | `src/lib/functionParams.ts` | 11 |
| `buildSingleOperationArgs` | Function | `src/features/single/buildSingleCliPreview.ts` | 75 |
| `buildVignetteOperationArgs` | Function | `src/features/single/operations/vignetteOperationArgs.ts` | 2 |
| `buildTextLogoOperationArgs` | Function | `src/features/single/operations/textLogoOperationArgs.ts` | 2 |
| `buildScaleResizeOperationArgs` | Function | `src/features/single/operations/scaleResizeOperationArgs.ts` | 2 |
| `buildRotateOperationArgs` | Function | `src/features/single/operations/rotateOperationArgs.ts` | 2 |
| `buildNormalizeColorsOperationArgs` | Function | `src/features/single/operations/normalizeColorsOperationArgs.ts` | 2 |
| `buildMirrorOperationArgs` | Function | `src/features/single/operations/mirrorArgs.ts` | 2 |
| `scaledCropParamsForFullInput` | Function | `src/features/single/operations/cropOperationArgs.ts` | 7 |
| `buildCropOperationArgs` | Function | `src/features/single/operations/cropOperationArgs.ts` | 40 |
| `buildConvertOperationArgs` | Function | `src/features/single/operations/convertOperationArgs.ts` | 2 |
| `buildContrastOperationArgs` | Function | `src/features/single/operations/contrastOperationArgs.ts` | 2 |
| `buildComposeOperationArgs` | Function | `src/features/single/operations/composeOperationArgs.ts` | 2 |
| `buildBorderOperationArgs` | Function | `src/features/single/operations/borderOperationArgs.ts` | 2 |
| `buildBlackWhiteOperationArgs` | Function | `src/features/single/operations/blackWhiteOperationArgs.ts` | 2 |
| `VignetteFunction` | Function | `src/shared/components/functions/Vignette.tsx` | 11 |
| `TextLogoFunction` | Function | `src/shared/components/functions/TextLogo.tsx` | 22 |
| `ScaleResizeFunction` | Function | `src/shared/components/functions/ScaleResize.tsx` | 21 |
| `setSize` | Function | `src/shared/components/functions/ScaleResize.tsx` | 36 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `BatchBottomBar → GetStringParam` | cross_community | 6 |
| `BatchBottomBar → GetNumberParam` | cross_community | 6 |
| `SingleModePage → GetStringParam` | cross_community | 5 |
| `SingleModePage → GetNumberParam` | cross_community | 5 |
| `BuildSingleCliPreview → GetStringParam` | cross_community | 5 |
| `BuildSingleCliPreview → GetNumberParam` | cross_community | 5 |
| `UsePreviewPipeline → GetNumberParam` | cross_community | 4 |
| `UsePreviewPipeline → GetStringParam` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Ui | 7 calls |

## How to Explore

1. `gitnexus_context({name: "getStringParam"})` — see callers and callees
2. `gitnexus_query({query: "operations"})` — find related execution flows
3. Read key files listed above for implementation details
