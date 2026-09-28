import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";

import { MENU_IDS } from "@/app/menubar/menuIds";
import { useAppStore } from "@/app/store/app.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { useBatchStore } from "@/features/batch/state/batch.store";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { savePreset, loadPreset } from "@/features/presets/hooks/usePresetActions";
import { buildSingleCliPreview } from "@/features/single/buildSingleCliPreview";
import { buildBatchCliArgs } from "@/features/batch/buildBatchCliPipeline";
import { QUICK_PRESETS } from "./quickPresets";


export async function dispatchMenuAction(id: string): Promise<void> {
  const mode = useAppStore.getState().mode;

  switch (id) {
    case MENU_IDS.APP_SETTINGS:
      useAppStore.getState().openSettings();
      break;

    case MENU_IDS.FILE_OPEN_IMAGE:
      if (mode === "single") {
        useAppStore.getState().requestOpenImageFromMenu();
      } else if (mode === "viewer") {
        try {
          const selected = await openDialog({
            multiple: false,
            filters: [
              {
                name: "Images",
                extensions: [
                  "png", "jpg", "jpeg", "webp", "tif", "tiff",
                  "bmp", "gif", "ico", "avif", "heic", "heif",
                  "tga", "exr", "pbm", "pgm", "ppm", "hdr", "svg",
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
      } else {
        useAppStore.getState().setMode("single");
        useAppStore.getState().requestOpenImageFromMenu();
      }
      break;

    case MENU_IDS.FILE_OPEN_FOLDER:
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
          if (mode !== "batch") {
            useAppStore.getState().setMode("batch");
          }
          useBatchStore.getState().addFiles(files);
        }
      } catch (e) {
        console.error("Failed to open folder:", e);
      }
      break;

    case MENU_IDS.FILE_CLOSE_FILE:
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
      break;

    case MENU_IDS.MODE_SINGLE:
      useAppStore.getState().setMode("single");
      break;

    case MENU_IDS.MODE_BATCH:
      useAppStore.getState().setMode("batch");
      break;

    case MENU_IDS.MODE_VIEWER:
      useAppStore.getState().setMode("viewer");
      break;

    case MENU_IDS.RUN_START:
      useAppStore.getState().requestRun();
      break;

    case MENU_IDS.RUN_DRY_RUN:
      useAppStore.getState().requestDryRun();
      break;

    case MENU_IDS.RUN_STOP:
      useAppStore.getState().requestStop();
      break;

    case MENU_IDS.RUN_TOGGLE_PREVIEW:
      if (mode === "single") {
        useSingleStore.getState().setIsManualPreview(!useSingleStore.getState().isManualPreview);
      }
      break;

    case MENU_IDS.RUN_COPY_CLI:
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
      break;

    case MENU_IDS.RUN_OPEN_OUTPUT_FOLDER:
      if (mode === "single") {
        useAppStore.getState().requestOpenOutputFolder();
      } else {
        try {
          const dir = useBatchStore.getState().outputDirectory?.trim() || "./out/";
          await openPath(dir);
        } catch (e) {
          console.error("Failed to open output directory:", e);
        }
      }
      break;

    case MENU_IDS.PRESETS_SAVE: {
      const name = window.prompt("Enter preset name:", "My Preset");
      if (!name || !name.trim()) break;
      await savePreset(name.trim());
      break;
    }

    case MENU_IDS.PRESETS_LOAD: {
      try {
        const selected = await openDialog({
          multiple: false,
          filters: [{ name: "Presets", extensions: ["json"] }],
        });
        if (selected && typeof selected === "string") {
          await loadPreset(selected);
          if (mode !== "batch") {
            useAppStore.getState().setMode("batch");
          }
        }
      } catch (e) {
        console.error("Failed to load preset:", e);
      }
      break;
    }

    case MENU_IDS.PRESETS_QUICK_WEB:
      useBatchStore.setState({
        pipeline: QUICK_PRESETS.webOptimise.map((s) => ({ ...s, id: crypto.randomUUID() })),
      });
      if (mode !== "batch") useAppStore.getState().setMode("batch");
      break;

    case MENU_IDS.PRESETS_QUICK_THUMB:
      useBatchStore.setState({
        pipeline: QUICK_PRESETS.thumbnail200.map((s) => ({ ...s, id: crypto.randomUUID() })),
      });
      if (mode !== "batch") useAppStore.getState().setMode("batch");
      break;

    case MENU_IDS.PRESETS_QUICK_BW:
      useBatchStore.setState({
        pipeline: QUICK_PRESETS.bwFilm.map((s) => ({ ...s, id: crypto.randomUUID() })),
      });
      if (mode !== "batch") useAppStore.getState().setMode("batch");
      break;

    case MENU_IDS.PRESETS_QUICK_WATERMARK:
      useBatchStore.setState({
        pipeline: QUICK_PRESETS.watermark.map((s) => ({ ...s, id: crypto.randomUUID() })),
      });
      if (mode !== "batch") useAppStore.getState().setMode("batch");
      break;

    case MENU_IDS.PRESETS_MANAGE: {
      try {
        const presetFolder =
          useSettingsStore.getState().presetFolder?.trim() || "~/.config/imgui/presets/";
        await openPath(presetFolder);
      } catch (e) {
        console.error("Failed to open preset directory:", e);
      }
      break;
    }

    case MENU_IDS.VIEW_TOGGLE_CLI_PREVIEW:
      useSettingsStore.getState().setSetting(
        "showCliPreview",
        !useSettingsStore.getState().showCliPreview
      );
      break;

    case MENU_IDS.VIEW_TOGGLE_METADATA:
      useSettingsStore.getState().setSetting(
        "showMetadata",
        !useSettingsStore.getState().showMetadata
      );
      break;

    case MENU_IDS.VIEW_ZOOM_IN:
      if (mode === "single") {
        const cur = useSingleStore.getState().previewZoom;
        useSingleStore.getState().setPreviewZoom(Math.min(cur + 25, 400));
      } else if (mode === "viewer") {
        useViewerStore.getState().zoomIn();
      }
      break;

    case MENU_IDS.VIEW_ZOOM_OUT:
      if (mode === "single") {
        const cur = useSingleStore.getState().previewZoom;
        useSingleStore.getState().setPreviewZoom(Math.max(cur - 25, 25));
      } else if (mode === "viewer") {
        useViewerStore.getState().zoomOut();
      }
      break;

    case MENU_IDS.VIEW_ZOOM_RESET:
      if (mode === "single") {
        useSingleStore.getState().setPreviewZoom(100);
      } else if (mode === "viewer") {
        useViewerStore.getState().setActualSize();
      }
      break;

    default:
      console.warn("[MenubarBridge] Unhandled menu action id:", id);
      break;
  }
}

type MenuActionPayload = {
  id: string;
};

/**
 * Forwards native macOS menu events into the app store (same contract as web menubar clicks).
 */
export function useMenubarBridge() {
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void listen<MenuActionPayload>("app:menu-action", (event) => {
      const id = event.payload?.id;
      if (id) {
        void dispatchMenuAction(id);
      }
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        /* non-Tauri / permission */
      });

    return () => {
      unlisten?.();
    };
  }, []);
}
