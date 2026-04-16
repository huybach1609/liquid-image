import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { BatchModePage } from "@/pages/BatchModePage";
import { SingleModePage } from "@/pages/SingleModePage";
import { AppMode } from "@/shared/types/common";

export function AppShell() {
  const [mode, setMode] = useState<AppMode>("single");
  const isFullFrameMode = mode === "single" || mode === "batch";
  const appWindow = getCurrentWindow();

  return (
    <main className={isFullFrameMode ? "app-window-frame bg-background text-foreground" : "min-h-screen bg-background p-6 text-foreground"}>
      <header className="app-titlebar">
        <div
          className="app-titlebar__drag"
          data-tauri-drag-region
          onMouseDown={(event) => {
            if (event.button === 0) {
              void appWindow.startDragging();
            }
          }}
        >
          <span className="app-titlebar__name">liquid-image</span>
        </div>
        <div className="app-titlebar__controls">
          <button className="app-titlebar__button" type="button" aria-label="Minimize window" onClick={() => void appWindow.minimize()}>
            -
          </button>
          <button className="app-titlebar__button" type="button" aria-label="Toggle maximize window" onClick={() => void appWindow.toggleMaximize()}>
            □
          </button>
          <button className="app-titlebar__button app-titlebar__button--close" type="button" aria-label="Close window" onClick={() => void appWindow.close()}>
            ×
          </button>
        </div>
      </header>
      <div className={isFullFrameMode ? "app-window-content" : "app-shell-grid mx-auto w-full max-w-[1200px]"}>
        {mode === "single" ? (
          <SingleModePage mode={mode} onModeChange={setMode} />
        ) : mode === "batch" ? (
          <BatchModePage mode={mode} onModeChange={setMode} />
        ) : (
          <section className="app-shell-content" />
        )}
      </div>
    </main>
  );
}
