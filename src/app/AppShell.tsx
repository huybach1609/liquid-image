import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

import { LanguageSwitcher } from "@/app/LanguageSwitcher";
import { WebMenubar } from "@/app/menubar/WebMenubar";
import { useMenubarBridge } from "@/app/menubar/useMenubarBridge";
import { useAppStore } from "@/app/store/app.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { useBatchStore } from "@/features/batch/state/batch.store";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { BatchModePage } from "@/pages/BatchModePage";
import { SingleModePage } from "@/pages/SingleModePage";
import { SettingPage } from "@/pages/SettingPage";
import { ViewerPage } from "@/pages/ViewerPage";

const SettingsDialog = lazy(() => import("@/features/settings/SettingsDialog"));
import {
  menubarUsesNative,
  preloadImageFormatInfo,
} from "@/shared/tauri/commands";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useThemeSync } from "@/shared/hooks/useThemeSync";
import { useTranslation } from "react-i18next";

export function AppShell() {
  const { t } = useTranslation("common");
  const mode = useAppStore((s) => s.mode);
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const [nativeMenubar, setNativeMenubar] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullFrameMode =
    mode === "single" || mode === "batch" || mode === "settings" || mode === "viewer";
  const appWindow = useMemo(() => getCurrentWindow(), []);

  useThemeSync();
  useMenubarBridge();

  useEffect(() => {
    if (mode === "settings") {
      useAppStore.getState().setMode("single");
      useAppStore.getState().openSettings();
    }
  }, [mode]);

  useEffect(() => {
    void menubarUsesNative()
      .then(setNativeMenubar)
      .catch(() => setNativeMenubar(false));
  }, []);

  useEffect(() => {
    void preloadImageFormatInfo().catch((error) => {
      console.error("[magick] failed to preload format catalog", error);
    });
  }, []);

  useEffect(() => {
    type OpenFilesPayload =
      | string[]
      | {
          files: string[];
          mode?: "viewer" | "studio";
        };

    const unlistenPromise = listen<OpenFilesPayload>("app:open-files", (event) => {
      const payload = event.payload;
      if (!payload) return;

      const files = Array.isArray(payload) ? payload : payload.files;
      const targetMode = Array.isArray(payload) ? undefined : payload.mode;

      if (!files || files.length === 0) return;

      if (files.length === 1) {
        if (targetMode === "studio") {
          useAppStore.getState().setMode("single");
          useSingleStore.getState().setSelectedFile(files[0]);
        } else {
          // Default to Quick Viewer for single image
          useAppStore.getState().setMode("viewer");
          void useViewerStore.getState().openImage(files[0]);
        }
      } else {
        useAppStore.getState().setMode("batch");
        const items = files.map((f) => ({
          path: f,
          name: f.split("/").pop() || f,
        }));
        useBatchStore.getState().addFiles(items);
      }
    });

    return () => {
      void unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void appWindow.onResized(() => {
      void appWindow.isFullscreen().then(setIsFullscreen);
    }).then((fn) => {
      unlisten = fn;
    });
    void appWindow.isFullscreen().then(setIsFullscreen);
    return () => {
      unlisten?.();
    };
  }, [appWindow]);

  return (
    <main
      className={
        isFullFrameMode
          ? `app-window-frame bg-background text-foreground${isFullscreen ? " app-window-frame--fullscreen" : ""}`
          : "min-h-screen bg-background p-6 text-foreground"
      }
    >
      <TooltipProvider>
        <header className="grid h-[38px] select-none grid-cols-[minmax(0,1fr)_auto] items-center border-b-[0.5px] border-b-border/70 bg-background/95">
          <div
            className="flex h-full min-w-0 flex-1 items-center gap-3 px-3"
            data-tauri-drag-region
            onMouseDown={(event) => {
              if (event.button === 0) {
                void appWindow.startDragging();
              }
            }}
          >
            <span className="shrink-0 text-sm font-medium uppercase tracking-[0.04em] text-foreground/80">
              liquid-image
            </span>
            {nativeMenubar === false ? (
              <div
                className="shrink-0 border-l border-border/70 pl-3"
                data-tauri-drag-region={false}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <WebMenubar />
              </div>
            ) : null}
          </div>
          <div className="flex h-full items-stretch">
            <div
              className="flex items-center gap-1 border-l-[0.5px] border-l-border/70 px-1"
              data-tauri-drag-region={false}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* <ModeSwitch /> */}
              <LanguageSwitcher />
            </div>
            <button
              className="text-foreground/75 inline-flex h-full w-[42px] cursor-pointer items-center justify-center border-0 border-l-[0.5px] border-l-border/70 bg-transparent text-xs leading-none transition-colors duration-120 ease-in hover:bg-primary/10 hover:text-primary"
              type="button"
              aria-label={t("window.minimize")}
              onClick={() => void appWindow.minimize()}
            >
              -
            </button>
            <button
              className="text-foreground/75 inline-flex h-full w-[42px] cursor-pointer items-center justify-center border-0 border-l-[0.5px] border-l-border/70 bg-transparent text-xs leading-none transition-colors duration-120 ease-in hover:bg-primary/10 hover:text-primary"
              type="button"
              aria-label={t("window.maximize")}
              onClick={() => void appWindow.toggleMaximize()}
            >
              □
            </button>
            <button
              className="text-foreground/75 inline-flex h-full w-[42px] cursor-pointer items-center justify-center border-0 border-l-[0.5px] border-l-border/70 bg-transparent text-xs leading-none transition-colors duration-120 ease-in hover:bg-destructive/15 hover:text-destructive"
              type="button"
              aria-label={t("window.close")}
              onClick={() => void appWindow.close()}
            >
              ×
            </button>
          </div>
        </header>
        <div
          className={
            isFullFrameMode
              ? "app-window-content"
              : "app-shell-grid mx-auto w-full max-w-[1200px]"
          }
        >
          {mode === "single" ? (
            <SingleModePage />
          ) : mode === "batch" ? (
            <BatchModePage />
          ) : mode === "settings" ? (
            <SettingPage />
          ) : mode === "viewer" ? (
            <ViewerPage />
          ) : (
            <section className="app-shell-content" />
          )}
        </div>
        {isSettingsOpen && (
          <Suspense fallback={null}>
            <SettingsDialog />
          </Suspense>
        )}
      </TooltipProvider>
    </main>
  );
}
