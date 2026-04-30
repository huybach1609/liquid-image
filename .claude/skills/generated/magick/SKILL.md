---
name: magick
description: "Skill for the Magick area of liquid-image. 27 symbols across 5 files."
---

# Magick

27 symbols | 5 files | Cohesion: 88%

## When to Use

- Working with code in `src-tauri/`
- Understanding how check_magick_path, get_current_magick_source, convert_image work
- Modifying magick-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src-tauri/src/magick/service.rs` | check_magick_path, get_current_magick_source, parse_magick_version, convert_image, check_version (+14) |
| `src-tauri/src/magick/runner.rs` | get_magick_source, create_magick_command, global_source, detect_magick_source, set_magick_source |
| `src-tauri/src/main.rs` | main |
| `src-tauri/src/lib.rs` | run |
| `src-tauri/src/app_menu.rs` | setup_native_menubar |

## Entry Points

Start here when exploring this area:

- **`check_magick_path`** (Function) — `src-tauri/src/magick/service.rs:6`
- **`get_current_magick_source`** (Function) — `src-tauri/src/magick/service.rs:19`
- **`convert_image`** (Function) — `src-tauri/src/magick/service.rs:65`
- **`check_version`** (Function) — `src-tauri/src/magick/service.rs:77`
- **`get_image_metadata`** (Function) — `src-tauri/src/magick/service.rs:100`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `check_magick_path` | Function | `src-tauri/src/magick/service.rs` | 6 |
| `get_current_magick_source` | Function | `src-tauri/src/magick/service.rs` | 19 |
| `convert_image` | Function | `src-tauri/src/magick/service.rs` | 65 |
| `check_version` | Function | `src-tauri/src/magick/service.rs` | 77 |
| `get_image_metadata` | Function | `src-tauri/src/magick/service.rs` | 100 |
| `create_image_proxy` | Function | `src-tauri/src/magick/service.rs` | 142 |
| `generate_preview` | Function | `src-tauri/src/magick/service.rs` | 343 |
| `run_batch_dry_run` | Function | `src-tauri/src/magick/service.rs` | 622 |
| `get_magick_source` | Function | `src-tauri/src/magick/runner.rs` | 51 |
| `create_magick_command` | Function | `src-tauri/src/magick/runner.rs` | 60 |
| `run` | Function | `src-tauri/src/lib.rs` | 28 |
| `setup_native_menubar` | Function | `src-tauri/src/app_menu.rs` | 5 |
| `update_magick_source` | Function | `src-tauri/src/magick/service.rs` | 24 |
| `detect_magick_source` | Function | `src-tauri/src/magick/runner.rs` | 28 |
| `set_magick_source` | Function | `src-tauri/src/magick/runner.rs` | 55 |
| `run_single` | Function | `src-tauri/src/magick/service.rs` | 492 |
| `run_batch` | Function | `src-tauri/src/magick/service.rs` | 541 |
| `parse_magick_version` | Function | `src-tauri/src/magick/service.rs` | 37 |
| `args_slice_contains_shave` | Function | `src-tauri/src/magick/service.rs` | 249 |
| `parse_shave_geometry` | Function | `src-tauri/src/magick/service.rs` | 253 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Generate_preview → Detect_magick_source` | cross_community | 5 |
| `Main → Detect_magick_source` | intra_community | 5 |
| `Run_batch → Detect_magick_source` | cross_community | 5 |
| `Run_batch_dry_run → Detect_magick_source` | cross_community | 5 |
| `Run_single → Detect_magick_source` | cross_community | 5 |
| `Check_version → Detect_magick_source` | cross_community | 4 |
| `Get_image_metadata → Detect_magick_source` | cross_community | 4 |
| `Create_image_proxy → Detect_magick_source` | cross_community | 4 |
| `Get_current_magick_source → Detect_magick_source` | cross_community | 4 |
| `Update_magick_source → Detect_magick_source` | intra_community | 4 |

## How to Explore

1. `gitnexus_context({name: "check_magick_path"})` — see callers and callees
2. `gitnexus_query({query: "magick"})` — find related execution flows
3. Read key files listed above for implementation details
