import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { useAppStore } from "@/app/store/app.store";
import { useSingleStore } from "@/features/single/state/single.store";

export function useViewerShortcuts() {
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore shortcut if user is focusing an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const store = useViewerStore.getState();

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A": {
          e.preventDefault();
          store.prevImage();
          break;
        }
        case "ArrowRight":
        case "d":
        case "D": {
          e.preventDefault();
          store.nextImage();
          break;
        }
        case "r":
        case "R": {
          e.preventDefault();
          store.rotateCW();
          break;
        }
        case "l":
        case "L": {
          e.preventDefault();
          store.rotateCCW();
          break;
        }
        case "+":
        case "=": {
          e.preventDefault();
          store.zoomIn();
          break;
        }
        case "-":
        case "_": {
          e.preventDefault();
          store.zoomOut();
          break;
        }
        case "0": {
          e.preventDefault();
          store.resetView();
          break;
        }
        case "1": {
          e.preventDefault();
          store.setActualSize();
          break;
        }
        case "f":
        case "F":
        case "F11": {
          e.preventDefault();
          try {
            const win = getCurrentWindow();
            const isFs = await win.isFullscreen();
            await win.setFullscreen(!isFs);
          } catch (err) {
            console.error("[useViewerShortcuts] Failed to toggle fullscreen", err);
          }
          break;
        }
        case "Escape": {
          try {
            const win = getCurrentWindow();
            const isFs = await win.isFullscreen();
            if (isFs) {
              e.preventDefault();
              await win.setFullscreen(false);
            }
          } catch (err) {
            console.error("[useViewerShortcuts] Failed to exit fullscreen", err);
          }
          break;
        }
        case "e":
        case "E": {
          e.preventDefault();
          const current = store.currentImagePath;
          if (current) {
            useSingleStore.getState().setSelectedFile(current);
          }
          useAppStore.getState().setMode("single");
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
