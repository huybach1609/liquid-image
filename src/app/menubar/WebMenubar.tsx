import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getCurrentWindow } from "@tauri-apps/api/window";

import {
  Menubar,
  MenubarCheckboxItem,
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
import { useBatchStore } from "@/features/batch/state/batch.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { useRecentFilesStore } from "@/app/store/recentFiles.store";
import { usePresetActions } from "@/features/presets/hooks/usePresetActions";
import { buildSingleCliPreview } from "@/features/single/buildSingleCliPreview";
import { buildBatchCliArgs } from "@/features/batch/buildBatchCliPipeline";
import type { BatchPipelineStep } from "@/features/batch/types";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import type { AppMode } from "@/shared/types/common";
import { cn } from "@/lib/utils";
import { QUICK_PRESETS } from "./quickPresets";

const menubarRootClass =
  "h-full min-h-0 gap-0.5 rounded-none border-0 bg-transparent p-0 shadow-none";

const triggerClass = "px-2 py-0.5 text-sm font-medium";

const contentClass = "min-w-[220px] text-sm";

const soonBadge = (
  <span className="ml-1.5 rounded px-1 py-px text-xs font-medium uppercase tracking-wide bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-100">
    soon
  </span>
);

export function WebMenubar() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const requestOpenImage = useAppStore((s) => s.requestOpenImageFromMenu);
  const openSettings = useAppStore((s) => s.openSettings);
  const requestRun = useAppStore((s) => s.requestRun);
  const requestDryRun = useAppStore((s) => s.requestDryRun);
  const requestStop = useAppStore((s) => s.requestStop);
  const requestOpenOutputFolder = useAppStore((s) => s.requestOpenOutputFolder);

  const isBatchRunning = useBatchStore((s) => s.isRunning);
  const batchQueueLength = useBatchStore((s) => s.queue.length);
  const batchPipelineLength = useBatchStore((s) => s.pipeline.length);
  const isSingleRunning = useSingleStore((s) => s.runState.status === "running");
  const singleSelectedFile = useSingleStore((s) => s.selectedFile);
  const isManualPreview = useSingleStore((s) => s.isManualPreview);
  const setIsManualPreview = useSingleStore((s) => s.setIsManualPreview);
  const previewZoom = useSingleStore((s) => s.previewZoom);
  const setPreviewZoom = useSingleStore((s) => s.setPreviewZoom);
  const viewerImagePath = useViewerStore((s) => s.currentImagePath);

  const recentFiles = useRecentFilesStore((s) => s.recentFiles);
  const clearRecentFiles = useRecentFilesStore((s) => s.clearRecentFiles);

  const showCliPreview = useSettingsStore((s) => s.showCliPreview);
  const showMetadata = useSettingsStore((s) => s.showMetadata);

  const { savePreset, loadPreset } = usePresetActions();

  const canRun =
    mode === "batch"
      ? !isBatchRunning && batchQueueLength > 0 && batchPipelineLength > 0
      : !isSingleRunning && !!singleSelectedFile;
  const canDryRun =
    mode === "batch" && !isBatchRunning && batchQueueLength > 0 && batchPipelineLength > 0;
  const canStop = mode === "batch" && isBatchRunning;
  const canCopyCli =
    (mode === "single" && !!singleSelectedFile) ||
    (mode === "batch" && batchPipelineLength > 0);
  const canCloseFile =
    (mode === "single" && !!singleSelectedFile) ||
    (mode === "viewer" && !!viewerImagePath);
  const canZoom =
    (mode === "single" && !!singleSelectedFile) ||
    (mode === "viewer" && !!viewerImagePath);

  const [themeMounted, setThemeMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const themeLabel =
    !themeMounted || theme == null ? "system" : theme;

  const handleOpenImage = async () => {
    if (mode === "single") {
      requestOpenImage();
    } else if (mode === "viewer") {
      try {
        const selected = await openDialog({
          multiple: false,
          filters: [
            {
              name: "Images",
              extensions: [
                "png",
                "jpg",
                "jpeg",
                "webp",
                "tif",
                "tiff",
                "bmp",
                "gif",
                "ico",
                "avif",
                "heic",
                "heif",
                "tga",
                "exr",
                "pbm",
                "pgm",
                "ppm",
                "hdr",
                "svg",
              ],
            },
          ],
        });
        if (selected && typeof selected === "string") {
          await useViewerStore.getState().openImage(selected);
        }
      } catch (e) {
        console.error("Failed to open image in viewer:", e);
      }
    }
  };

  const handleCloseFile = () => {
    if (mode === "single") {
      useSingleStore.setState({
        selectedFile: null,
        proxyPath: null,
        fileMetadata: null,
        runState: { status: "idle", message: "" },
      });
    } else if (mode === "viewer") {
      useViewerStore.setState({
        currentImagePath: null,
        proxyUrl: null,
        siblingImages: [],
        currentIndex: 0,
        imageDimensions: null,
      });
    }
  };

  const handleOpenRecentFile = async (filePath: string) => {
    try {
      if (mode === "viewer") {
        await useViewerStore.getState().openImage(filePath);
      } else {
        if (mode !== "single") {
          setMode("single");
        }
        useSingleStore.getState().setSelectedFile(filePath);
      }
    } catch (e) {
      console.error("Failed to open recent file:", e);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
      });
      if (!selected || typeof selected !== "string") return;

      const entries = await readDir(selected);
      const imageExts = /\.(png|jpe?g|webp|tif|tiff|bmp|heic|avif)$/i;
      const files: { path: string; name: string }[] = [];
      const sep = selected.includes("\\") ? "\\" : "/";
      for (const entry of entries) {
        if (entry.isFile && imageExts.test(entry.name)) {
          const fullPath = selected.endsWith(sep)
            ? `${selected}${entry.name}`
            : `${selected}${sep}${entry.name}`;
          files.push({ path: fullPath, name: entry.name });
        }
      }
      if (files.length > 0) {
        useBatchStore.getState().addFiles(files);
      }
    } catch (e) {
      console.error("Failed to open folder:", e);
    }
  };

  const handleOpenOutputFolder = async () => {
    if (mode === "single") {
      requestOpenOutputFolder();
    } else {
      try {
        const dir =
          useBatchStore.getState().outputDirectory?.trim() || "./out/";
        await openPath(dir);
      } catch (e) {
        console.error("Failed to open output directory:", e);
      }
    }
  };

  const handleCopyCliCommand = async () => {
    try {
      if (mode === "single") {
        const single = useSingleStore.getState();
        if (!single.selectedFile) return;
        const settings = useSettingsStore.getState();
        const cmd = buildSingleCliPreview({
          selectedFile: single.selectedFile,
          selectedFunction: single.selectedFunction,
          functionParams: single.functionParams,
          limits: {
            memoryLimit: settings.memoryLimit,
            diskCacheLimit: settings.diskCacheLimit,
          },
          defaultFlags: {
            stripMetadata: settings.stripMetadata,
            defaultColorProfile: settings.defaultColorProfile,
          },
        });
        await navigator.clipboard.writeText(cmd);
      } else if (mode === "batch") {
        const batch = useBatchStore.getState();
        const settings = useSettingsStore.getState();
        const firstItem = batch.queue[0];
        const inputPath = firstItem ? firstItem.path : "input.jpg";
        const args = buildBatchCliArgs(batch.pipeline, {
          diskCacheLimit: settings.diskCacheLimit,
          memoryLimit: settings.memoryLimit,
          stripMetadata: settings.stripMetadata,
          defaultColorProfile: settings.defaultColorProfile,
        });
        const outDir = batch.outputDirectory?.trim() || "./out/";
        const cmd = `magick "${inputPath}" ${args.join(" ")} "${outDir}"`;
        await navigator.clipboard.writeText(cmd);
      }
    } catch (e) {
      console.error("Failed to copy CLI command:", e);
    }
  };

  const handleSavePreset = async () => {
    const name = window.prompt("Enter preset name:", "My Preset");
    if (!name || !name.trim()) return;
    await savePreset(name.trim());
  };

  const handleLoadPreset = async () => {
    try {
      const selected = await openDialog({
        multiple: false,
        filters: [{ name: "Presets", extensions: ["json"] }],
      });
      if (selected && typeof selected === "string") {
        await loadPreset(selected);
        if (mode !== "batch") {
          setMode("batch");
        }
      }
    } catch (e) {
      console.error("Failed to load preset:", e);
    }
  };

  const handleManagePresets = async () => {
    try {
      const presetFolder =
        useSettingsStore.getState().presetFolder?.trim() ||
        "~/.config/imgui/presets/";
      await openPath(presetFolder);
    } catch (e) {
      console.error("Failed to open preset directory:", e);
    }
  };

  const applyQuickPreset = (steps: BatchPipelineStep[]) => {
    useBatchStore.setState({
      pipeline: steps.map((s) => ({ ...s, id: crypto.randomUUID() })),
    });
    if (mode !== "batch") {
      setMode("batch");
    }
  };

  const handleZoomIn = () => {
    if (mode === "single") {
      setPreviewZoom(Math.min(previewZoom + 25, 400));
    } else if (mode === "viewer") {
      useViewerStore.getState().zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mode === "single") {
      setPreviewZoom(Math.max(previewZoom - 25, 25));
    } else if (mode === "viewer") {
      useViewerStore.getState().zoomOut();
    }
  };

  const handleFitWindow = () => {
    if (mode === "single") {
      setPreviewZoom(100);
    } else if (mode === "viewer") {
      useViewerStore.getState().setActualSize();
    }
  };

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
      if (!mod) return;

      if (e.key === "1") {
        e.preventDefault();
        setMode("single");
        return;
      }

      if (e.key === "2") {
        e.preventDefault();
        setMode("batch");
        return;
      }

      if (e.key === "3") {
        e.preventDefault();
        setMode("viewer");
        return;
      }

      if (e.key.toLowerCase() === "w" && !e.shiftKey) {
        e.preventDefault();
        if (canCloseFile) {
          handleCloseFile();
        }
        return;
      }

      if (e.key.toLowerCase() === "o" && !e.shiftKey) {
        e.preventDefault();
        if (mode === "single" || mode === "viewer") {
          void handleOpenImage();
        }
        return;
      }

      if (e.key.toLowerCase() === "o" && e.shiftKey) {
        e.preventDefault();
        if (mode === "batch") {
          void handleOpenFolder();
        }
        return;
      }

      if (e.key.toLowerCase() === "r" && !e.shiftKey) {
        e.preventDefault();
        if (mode === "viewer") {
          if (viewerImagePath) {
            useViewerStore.getState().rotateCW();
          }
        } else if (canRun) {
          requestRun();
        }
        return;
      }

      if (e.key.toLowerCase() === "r" && e.shiftKey) {
        e.preventDefault();
        if (mode === "viewer") {
          if (viewerImagePath) {
            useViewerStore.getState().rotateCCW();
          }
        } else if (canDryRun) {
          requestDryRun();
        }
        return;
      }

      if (e.key === ".") {
        e.preventDefault();
        if (canStop) {
          requestStop();
        }
        return;
      }

      if (e.key.toLowerCase() === "f" && e.shiftKey) {
        e.preventDefault();
        void handleOpenOutputFolder();
        return;
      }

      if (e.key === ",") {
        e.preventDefault();
        openSettings();
        return;
      }

      if (e.key === "`") {
        e.preventDefault();
        useSettingsStore.getState().setSetting("showCliPreview", !showCliPreview);
        return;
      }

      if (e.key.toLowerCase() === "p" && !e.shiftKey) {
        e.preventDefault();
        if (mode === "single") {
          setIsManualPreview(!isManualPreview);
        }
        return;
      }

      if (e.key.toLowerCase() === "c" && e.shiftKey) {
        e.preventDefault();
        if (canCopyCli) {
          void handleCopyCliCommand();
        }
        return;
      }

      if (e.key.toLowerCase() === "l" && !e.shiftKey) {
        e.preventDefault();
        void handleLoadPreset();
        return;
      }

      if ((e.key === "+" || e.key === "=") && !e.shiftKey) {
        e.preventDefault();
        if (canZoom) {
          handleZoomIn();
        }
        return;
      }

      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        if (canZoom) {
          handleZoomOut();
        }
        return;
      }

      if (e.key === "0") {
        e.preventDefault();
        if (canZoom) {
          handleFitWindow();
        }
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    mode,
    setMode,
    openSettings,
    requestOpenImage,
    canRun,
    canDryRun,
    canStop,
    canCopyCli,
    canZoom,
    canCloseFile,
    viewerImagePath,
    handleCloseFile,
    handleOpenImage,
    requestRun,
    requestDryRun,
    requestStop,
    requestOpenOutputFolder,
    showCliPreview,
    isManualPreview,
    setIsManualPreview,
    previewZoom,
    setPreviewZoom,
  ]);

  return (
    <Menubar
      className={menubarRootClass}
      data-tauri-drag-region={false}
    >
      {/* File */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>File</MenubarTrigger>
        <MenubarContent className={contentClass} align="start">
          <MenubarItem
            disabled={mode === "batch"}
            onSelect={() => void handleOpenImage()}
          >
            Open image…
            <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            disabled={mode !== "batch"}
            onSelect={() => void handleOpenFolder()}
          >
            Open folder…
            <MenubarShortcut>⌘⇧O</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Recent files</MenubarSubTrigger>
            <MenubarSubContent className={cn(contentClass, "min-w-[260px]")}>
              {recentFiles.length === 0 ? (
                <MenubarItem disabled className="text-muted-foreground italic text-xs">
                  No recent files
                </MenubarItem>
              ) : (
                <>
                  {recentFiles.map((filePath) => {
                    const fileName = filePath.split(/[/\\]/).pop() || filePath;
                    return (
                      <MenubarItem
                        key={filePath}
                        title={filePath}
                        className="flex flex-col items-start gap-0.5 py-1.5 cursor-pointer"
                        onSelect={() => void handleOpenRecentFile(filePath)}
                      >
                        <span className="font-medium text-xs truncate max-w-[240px]">
                          {fileName}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[240px] opacity-70">
                          {filePath}
                        </span>
                      </MenubarItem>
                    );
                  })}
                  <MenubarSeparator />
                  <MenubarItem onSelect={() => clearRecentFiles()}>
                    Clear recent
                  </MenubarItem>
                </>
              )}
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem disabled>
            Save output as…
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled={!canCloseFile} onSelect={handleCloseFile}>
            Close file
            <MenubarShortcut>⌘W</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onSelect={() => openSettings()}>
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
          <MenubarLabel className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
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
            <MenubarRadioItem value="viewer">
              Quick viewer
              <MenubarShortcut>⌘3</MenubarShortcut>
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

      {/* Run (Single & Batch only) */}
      {mode !== "viewer" && (
        <MenubarMenu>
          <MenubarTrigger className={triggerClass}>Run</MenubarTrigger>
          <MenubarContent className={contentClass} align="start">
            <MenubarItem disabled={!canRun} onSelect={() => requestRun()}>
              Run
              <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!canDryRun} onSelect={() => requestDryRun()}>
              Dry run (first file)
              <MenubarShortcut>⌘⇧R</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={!canStop} onSelect={() => requestStop()}>
              Stop
              <MenubarShortcut>⌘.</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={mode === "single" && !isManualPreview}
              disabled={mode !== "single"}
              onCheckedChange={() => setIsManualPreview(!isManualPreview)}
            >
              Show live preview
              <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarCheckboxItem>
            <MenubarItem
              disabled={!canCopyCli}
              onSelect={() => void handleCopyCliCommand()}
            >
              Copy CLI command
              <MenubarShortcut>⌘⇧C</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={() => void handleOpenOutputFolder()}>
              Open output folder
              <MenubarShortcut>⌘⇧F</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}

      {/* Presets (Single & Batch only) */}
      {mode !== "viewer" && (
        <MenubarMenu>
          <MenubarTrigger className={triggerClass}>Presets</MenubarTrigger>
          <MenubarContent className={contentClass} align="start">
            <MenubarItem
              disabled={batchPipelineLength === 0}
              onSelect={() => void handleSavePreset()}
            >
              Save preset…
              <MenubarShortcut>⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onSelect={() => void handleLoadPreset()}>
              Load preset…
              <MenubarShortcut>⌘L</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarLabel className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Quick load
            </MenubarLabel>
            <MenubarItem onSelect={() => applyQuickPreset(QUICK_PRESETS.webOptimise)}>
              Web optimise (WEBP q80)
            </MenubarItem>
            <MenubarItem onSelect={() => applyQuickPreset(QUICK_PRESETS.thumbnail200)}>
              Thumbnail 200px
            </MenubarItem>
            <MenubarItem onSelect={() => applyQuickPreset(QUICK_PRESETS.bwFilm)}>
              {"B\u0026W film"}
            </MenubarItem>
            <MenubarItem onSelect={() => applyQuickPreset(QUICK_PRESETS.watermark)}>
              Watermark logo
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onSelect={() => void handleManagePresets()}>
              Manage presets…
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}

      {/* Image (Quick viewer mode only) */}
      {mode === "viewer" && (
        <MenubarMenu>
          <MenubarTrigger className={triggerClass}>Image</MenubarTrigger>
          <MenubarContent className={contentClass} align="start">
            <MenubarItem
              disabled={!viewerImagePath}
              onSelect={() => useViewerStore.getState().prevImage()}
            >
              Previous image
              <MenubarShortcut>←</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              disabled={!viewerImagePath}
              onSelect={() => useViewerStore.getState().nextImage()}
            >
              Next image
              <MenubarShortcut>→</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              disabled={!viewerImagePath}
              onSelect={() => useViewerStore.getState().rotateCW()}
            >
              Rotate clockwise 90°
              <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              disabled={!viewerImagePath}
              onSelect={() => useViewerStore.getState().rotateCCW()}
            >
              Rotate counter-clockwise 90°
              <MenubarShortcut>⌘⇧R</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              disabled={!viewerImagePath}
              onSelect={() => useViewerStore.getState().resetView()}
            >
              Reset view
              <MenubarShortcut>⌘0</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              disabled={!viewerImagePath}
              onSelect={() => useViewerStore.getState().cycleBgMode()}
            >
              Cycle background
              <MenubarShortcut>B</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}

      {/* View */}
      <MenubarMenu>
        <MenubarTrigger className={triggerClass}>View</MenubarTrigger>
        <MenubarContent className={cn(contentClass, "min-w-[240px]")} align="end">
          <MenubarCheckboxItem
            checked={showCliPreview}
            disabled={mode !== "single"}
            onCheckedChange={(checked) =>
              useSettingsStore.getState().setSetting("showCliPreview", checked)
            }
          >
            Show CLI preview
            <MenubarShortcut>⌘`</MenubarShortcut>
          </MenubarCheckboxItem>
          <MenubarCheckboxItem
            checked={showMetadata}
            disabled={mode !== "single"}
            onCheckedChange={(checked) =>
              useSettingsStore.getState().setSetting("showMetadata", checked)
            }
          >
            Show metadata bar
          </MenubarCheckboxItem>
          <MenubarItem disabled>Show pipeline steps</MenubarItem>
          <MenubarSeparator />
          <MenubarLabel className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Canvas zoom
          </MenubarLabel>
          <MenubarItem disabled={!canZoom} onSelect={handleZoomIn}>
            Zoom in
            <MenubarShortcut>⌘+</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!canZoom} onSelect={handleZoomOut}>
            Zoom out
            <MenubarShortcut>⌘-</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled={!canZoom} onSelect={handleFitWindow}>
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
