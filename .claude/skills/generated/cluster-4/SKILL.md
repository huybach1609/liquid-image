---
name: cluster-4
description: "Skill for the Cluster_4 area of liquid-image. 3 symbols across 3 files."
---

# Cluster_4

3 symbols | 3 files | Cohesion: 100%

## When to Use

- Working with code in `src-tauri/`
- Understanding how run, setup_native_menubar work
- Modifying cluster_4-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src-tauri/src/main.rs` | main |
| `src-tauri/src/lib.rs` | run |
| `src-tauri/src/app_menu.rs` | setup_native_menubar |

## Entry Points

Start here when exploring this area:

- **`run`** (Function) — `src-tauri/src/lib.rs:22`
- **`setup_native_menubar`** (Function) — `src-tauri/src/app_menu.rs:5`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `run` | Function | `src-tauri/src/lib.rs` | 22 |
| `setup_native_menubar` | Function | `src-tauri/src/app_menu.rs` | 5 |
| `main` | Function | `src-tauri/src/main.rs` | 3 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → Setup_native_menubar` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "run"})` — see callers and callees
2. `gitnexus_query({query: "cluster_4"})` — find related execution flows
3. Read key files listed above for implementation details
