---
name: components
description: "Skill for the Components area of liquid-image. 5 symbols across 1 files."
---

# Components

5 symbols | 1 files | Cohesion: 100%

## When to Use

- Working with code in `src/`
- Understanding how CanvasPreview work
- Modifying components-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/features/single/components/CanvasPreview.tsx` | objectContainMetrics, naturalToPixelCrop, pixelCropToNatural, fullNaturalRect, CanvasPreview |

## Entry Points

Start here when exploring this area:

- **`CanvasPreview`** (Function) — `src/features/single/components/CanvasPreview.tsx:140`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `CanvasPreview` | Function | `src/features/single/components/CanvasPreview.tsx` | 140 |
| `objectContainMetrics` | Function | `src/features/single/components/CanvasPreview.tsx` | 59 |
| `naturalToPixelCrop` | Function | `src/features/single/components/CanvasPreview.tsx` | 83 |
| `pixelCropToNatural` | Function | `src/features/single/components/CanvasPreview.tsx` | 105 |
| `fullNaturalRect` | Function | `src/features/single/components/CanvasPreview.tsx` | 134 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `CanvasPreview → ObjectContainMetrics` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "CanvasPreview"})` — see callers and callees
2. `gitnexus_query({query: "components"})` — find related execution flows
3. Read key files listed above for implementation details
