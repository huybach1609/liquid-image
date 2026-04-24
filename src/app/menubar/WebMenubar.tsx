import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getCurrentWindow } from "@tauri-apps/api/window";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useAppStore } from "@/app/store/app.store";
import type { AppMode } from "@/shared/types/common";
import { cn } from "@/lib/utils";

const menubarRootClass =
  "h-full min-h-0 gap-0.5 rounded-none border-0 bg-transparent p-0 shadow-none";

const triggerClass = "px-2 py-0.5 text-[12px] font-medium";

const contentClass = "min-w-[220px] text-[12px]";

const soonBadge = (
  <span className="ml-1.5 rounded px-1 py-px text-[9px] font-medium uppercase tracking-wide bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100">
    soon
  </span>
);

export function WebMenubar() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const requestOpenImage = useAppStore((s) => s.requestOpenImageFromMenu);
  const [themeMounted, setThemeMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const themeLabel =
    !themeMounted || theme == null ? "system" : theme;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "o" && !e.shiftKey) {
        e.preventDefault();
        if (mode === "single") {
          requestOpenImage();
        }
      }

      if (mod && e.key === ",") {
        e.preventDefault();
        setMode("settings");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, requestOpenImage, setMode]);

  return (
    <Menubar
      className={menubarRootClass}
      data-tauri-drag-region={false}
    >
      {/* File — mockup: context toggles Open image vs Open folder (skeleton: disabled when wrong mode) */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>File</MenubarTrigger>
        <MenubarContent className={contentClass} align="start">
          <MenubarItem
            disabled={mode !== "single"}
            onSelect={() => requestOpenImage()}
          >
            Open image…
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={mode !== "batch"}>
            Open folder…
            <MenubarShortcut>⌘⇧O</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Recent files</MenubarSubTrigger>
            <MenubarSubContent className={contentClass}>
              <MenubarItem disabled className="text-muted-foreground">
                photo_01.jpg
              </MenubarItem>
              <MenubarItem disabled className="text-muted-foreground">
                portrait.png
              </MenubarItem>
              <MenubarItem disabled className="text-muted-foreground">
                banner.webp
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>Clear recent</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem disabled>
            Save output as…
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Export CLI script…
            <MenubarShortcut>⌘E</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            Close file
            <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onSelect={() => setMode("settings")}>
            Settings…
            <MenubarShortcut>⌘,</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            variant="destructive"
            onSelect={() => void getCurrentWindow().close()}
          >
            Quit
            <MenubarShortcut>⌘Q</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Edit */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>Edit</MenubarTrigger>
        <MenubarContent className={contentClass} align="start">
          <MenubarItem disabled>
            Undo
            <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Redo
            <MenubarShortcut>⌘⇧Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarLabel className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Pipeline
          </MenubarLabel>
          <MenubarItem disabled>
            Add step…
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Remove step
            <MenubarShortcut>⌫</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Move step up
            <MenubarShortcut>⌘↑</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Move step down
            <MenubarShortcut>⌘↓</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Clear pipeline</MenubarItem>
          <MenubarItem disabled>Reset to defaults</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Mode */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>Mode</MenubarTrigger>
        <MenubarContent className={contentClass} align="start">
          <MenubarRadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as AppMode)}
          >
            <MenubarRadioItem value="single">
              Single file
              <MenubarShortcut>⌘1</MenubarShortcut>
            </MenubarRadioItem>
            <MenubarRadioItem value="batch">
              Batch
              <MenubarShortcut>⌘2</MenubarShortcut>
            </MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem disabled className="opacity-80">
            <span className="flex items-center">
              Watch folder
              {soonBadge}
            </span>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Run */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>Run</MenubarTrigger>
        <MenubarContent className={contentClass} align="start">
          <MenubarItem disabled>
            Run
            <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Dry run (first file)
            <MenubarShortcut>⌘⇧R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            Stop
            <MenubarShortcut>⌘.</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            Show live preview
            <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Copy CLI command
            <MenubarShortcut>⌘⇧C</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>
            Open output folder
            <MenubarShortcut>⌘⇧F</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* Presets */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>Presets</MenubarTrigger>
        <MenubarContent className={contentClass} align="start">
          <MenubarItem disabled>
            Save preset…
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Load preset…
            <MenubarShortcut>⌘L</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarLabel className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Quick load
          </MenubarLabel>
          <MenubarItem disabled>Web optimise (WEBP q80)</MenubarItem>
          <MenubarItem disabled>Thumbnail 200px</MenubarItem>
          <MenubarItem disabled>{"B\u0026W film"}</MenubarItem>
          <MenubarItem disabled>Watermark logo</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Manage presets…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {/* View */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>View</MenubarTrigger>
        <MenubarContent className={cn(contentClass, "min-w-[240px]")} align="end">
          <MenubarItem disabled>
            Show CLI preview
            <MenubarShortcut>⌘`</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Show metadata bar</MenubarItem>
          <MenubarItem disabled>Show pipeline steps</MenubarItem>
          <MenubarSeparator />
          <MenubarLabel className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Canvas zoom
          </MenubarLabel>
          <MenubarItem disabled>
            Zoom in
            <MenubarShortcut>⌘+</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Zoom out
            <MenubarShortcut>⌘-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Fit to window
            <MenubarShortcut>⌘0</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Theme: {themeLabel}</MenubarSubTrigger>
            <MenubarSubContent className={contentClass}>
              <MenubarRadioGroup
                value={
                  themeMounted ? (theme ?? "system") : "system"
                }
                onValueChange={(v) => setTheme(v)}
              >
                <MenubarRadioItem value="system">
                  System default
                </MenubarRadioItem>
                <MenubarRadioItem value="light">Light</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem disabled>
            Help / shortcuts
            <MenubarShortcut>⌘/</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
