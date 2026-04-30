---
name: ui
description: "Skill for the Ui area of liquid-image. 82 symbols across 28 files."
---

# Ui

82 symbols | 28 files | Cohesion: 93%

## When to Use

- Working with code in `src/`
- Understanding how cn, AppFooter, WebMenubar work
- Modifying ui-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/components/ui/menubar.tsx` | Menubar, MenubarTrigger, MenubarContent, MenubarItem, MenubarCheckboxItem (+6) |
| `src/components/ui/field.tsx` | FieldSet, FieldLegend, FieldGroup, Field, FieldContent (+5) |
| `src/components/ui/dropdown-menu.tsx` | DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel (+4) |
| `src/components/ui/select.tsx` | SelectGroup, SelectTrigger, SelectContent, SelectLabel, SelectItem (+3) |
| `src/components/ui/card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardAction (+2) |
| `src/components/ui/tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent |
| `src/components/ui/alert.tsx` | Alert, AlertTitle, AlertDescription, AlertAction |
| `src/components/ui/button-group.tsx` | ButtonGroup, ButtonGroupText, ButtonGroupSeparator |
| `src/features/settings/components/SettingUI.tsx` | SettingSection, SettingGroup, SettingRow |
| `src/components/ui/toggle-group.tsx` | ToggleGroup, ToggleGroupItem |

## Entry Points

Start here when exploring this area:

- **`cn`** (Function) — `src/lib/utils.ts:3`
- **`AppFooter`** (Function) — `src/app/AppFooter.tsx:10`
- **`WebMenubar`** (Function) — `src/app/menubar/WebMenubar.tsx:36`
- **`SettingSection`** (Function) — `src/features/settings/components/SettingUI.tsx:15`
- **`SettingGroup`** (Function) — `src/features/settings/components/SettingUI.tsx:35`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `cn` | Function | `src/lib/utils.ts` | 3 |
| `AppFooter` | Function | `src/app/AppFooter.tsx` | 10 |
| `WebMenubar` | Function | `src/app/menubar/WebMenubar.tsx` | 36 |
| `SettingSection` | Function | `src/features/settings/components/SettingUI.tsx` | 15 |
| `SettingGroup` | Function | `src/features/settings/components/SettingUI.tsx` | 35 |
| `SettingRow` | Function | `src/features/settings/components/SettingUI.tsx` | 55 |
| `Toggle` | Function | `src/components/ui/toggle.tsx` | 28 |
| `ToggleGroup` | Function | `src/components/ui/toggle-group.tsx` | 21 |
| `ToggleGroupItem` | Function | `src/components/ui/toggle-group.tsx` | 57 |
| `Tabs` | Function | `src/components/ui/tabs.tsx` | 6 |
| `TabsList` | Function | `src/components/ui/tabs.tsx` | 39 |
| `TabsTrigger` | Function | `src/components/ui/tabs.tsx` | 55 |
| `TabsContent` | Function | `src/components/ui/tabs.tsx` | 74 |
| `Switch` | Function | `src/components/ui/switch.tsx` | 5 |
| `Spinner` | Function | `src/components/ui/spinner.tsx` | 3 |
| `Slider` | Function | `src/components/ui/slider.tsx` | 5 |
| `Separator` | Function | `src/components/ui/separator.tsx` | 5 |
| `SelectGroup` | Function | `src/components/ui/select.tsx` | 12 |
| `SelectTrigger` | Function | `src/components/ui/select.tsx` | 31 |
| `SelectContent` | Function | `src/components/ui/select.tsx` | 57 |

## How to Explore

1. `gitnexus_context({name: "cn"})` — see callers and callees
2. `gitnexus_query({query: "ui"})` — find related execution flows
3. Read key files listed above for implementation details
