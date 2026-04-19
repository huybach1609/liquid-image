---
name: ui
description: "Skill for the Ui area of liquid-image. 44 symbols across 16 files."
---

# Ui

44 symbols | 16 files | Cohesion: 100%

## When to Use

- Working with code in `src/`
- Understanding how cn, AppFooter, WebMenubar work
- Modifying ui-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/components/ui/menubar.tsx` | Menubar, MenubarTrigger, MenubarContent, MenubarItem, MenubarCheckboxItem (+6) |
| `src/components/ui/dropdown-menu.tsx` | DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel (+4) |
| `src/components/ui/select.tsx` | SelectGroup, SelectTrigger, SelectContent, SelectLabel, SelectItem (+3) |
| `src/components/ui/button-group.tsx` | ButtonGroup, ButtonGroupText, ButtonGroupSeparator |
| `src/components/ui/radio-group.tsx` | RadioGroup, RadioGroupItem |
| `src/lib/utils.ts` | cn |
| `src/app/AppFooter.tsx` | AppFooter |
| `src/components/ui/switch.tsx` | Switch |
| `src/components/ui/spinner.tsx` | Spinner |
| `src/components/ui/slider.tsx` | Slider |

## Entry Points

Start here when exploring this area:

- **`cn`** (Function) — `src/lib/utils.ts:3`
- **`AppFooter`** (Function) — `src/app/AppFooter.tsx:10`
- **`WebMenubar`** (Function) — `src/app/menubar/WebMenubar.tsx:36`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `src/lib/utils.ts` | 3 |
| `AppFooter` | Function | `src/app/AppFooter.tsx` | 10 |
| `WebMenubar` | Function | `src/app/menubar/WebMenubar.tsx` | 36 |
| `Switch` | Function | `src/components/ui/switch.tsx` | 5 |
| `Spinner` | Function | `src/components/ui/spinner.tsx` | 3 |
| `Slider` | Function | `src/components/ui/slider.tsx` | 5 |
| `Separator` | Function | `src/components/ui/separator.tsx` | 5 |
| `SelectGroup` | Function | `src/components/ui/select.tsx` | 12 |
| `SelectTrigger` | Function | `src/components/ui/select.tsx` | 31 |
| `SelectContent` | Function | `src/components/ui/select.tsx` | 57 |
| `SelectLabel` | Function | `src/components/ui/select.tsx` | 90 |
| `SelectItem` | Function | `src/components/ui/select.tsx` | 103 |
| `SelectSeparator` | Function | `src/components/ui/select.tsx` | 127 |
| `SelectScrollUpButton` | Function | `src/components/ui/select.tsx` | 140 |
| `SelectScrollDownButton` | Function | `src/components/ui/select.tsx` | 159 |
| `RadioGroup` | Function | `src/components/ui/radio-group.tsx` | 5 |
| `RadioGroupItem` | Function | `src/components/ui/radio-group.tsx` | 18 |
| `Menubar` | Function | `src/components/ui/menubar.tsx` | 6 |
| `MenubarTrigger` | Function | `src/components/ui/menubar.tsx` | 48 |
| `MenubarContent` | Function | `src/components/ui/menubar.tsx` | 64 |

## How to Explore

1. `gitnexus_context({name: "cn"})` — see callers and callees
2. `gitnexus_query({query: "ui"})` — find related execution flows
3. Read key files listed above for implementation details
