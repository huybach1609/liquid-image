import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createTauriStorage } from "@/shared/lib/zustand-tauri-store";

import type { AppMode } from "@/shared/types/common";
import { useSingleStore } from "@/features/single/state/single.store";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { useBatchStore } from "@/features/batch/state/batch.store";

export function syncActiveImageBetweenModes(prevMode: AppMode, nextMode: AppMode) {
  if (prevMode === nextMode) return;
  if (prevMode === "settings" || nextMode === "settings") return;

  // 1. Resolve current active image from previous mode
  let activeImage: string | null = null;
  if (prevMode === "viewer") {
    activeImage = useViewerStore.getState().currentImagePath;
  } else if (prevMode === "single") {
    activeImage = useSingleStore.getState().selectedFile;
  } else if (prevMode === "batch") {
    const batchState = useBatchStore.getState();
    const selected = batchState.selectedFileId
      ? batchState.queue.find((i) => i.id === batchState.selectedFileId)
      : null;
    activeImage = selected?.path ?? batchState.queue[0]?.path ?? null;
  }

  if (!activeImage) return;

  // 2. Transfer active image to nextMode
  if (nextMode === "single") {
    const singleStore = useSingleStore.getState();
    singleStore.setSelectedFile(activeImage);
    // User requested: "không giữ lịch sự edit" -> reset edit history & params
    singleStore.resetAllFunctionParams();
    singleStore.resetRunState();
  } else if (nextMode === "viewer") {
    const viewerStore = useViewerStore.getState();
    if (viewerStore.currentImagePath !== activeImage) {
      void viewerStore.openImage(activeImage);
    }
  } else if (nextMode === "batch") {
    const batchStore = useBatchStore.getState();
    const existing = batchStore.queue.find((item) => item.path === activeImage);
    if (existing) {
      batchStore.setSelectedFileId(existing.id);
    } else {
      const fileName = activeImage.split(/[/\\]/).pop() || "image";
      batchStore.addFiles([{ path: activeImage, name: fileName }]);
      const updatedQueue = useBatchStore.getState().queue;
      const newlyAdded = updatedQueue.find((item) => item.path === activeImage);
      if (newlyAdded) {
        batchStore.setSelectedFileId(newlyAdded.id);
      }
    }
  }
}

export type AppStoreState = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  /** Incremented when user requests “Open image” (menu bar / shortcut). Single mode only. */
  openImageMenuRequestId: number;
  requestOpenImageFromMenu: () => void;
  /** Incremented when user requests "Run" (menu bar / shortcut) */
  runRequestId: number;
  requestRun: () => void;
  /** Incremented when user requests "Dry run" (menu bar / shortcut) */
  dryRunRequestId: number;
  requestDryRun: () => void;
  /** Incremented when user requests "Stop" (menu bar / shortcut) */
  stopRequestId: number;
  requestStop: () => void;
  /** Incremented when user requests "Open output folder" (menu bar / shortcut) */
  openOutputFolderRequestId: number;
  requestOpenOutputFolder: () => void;
  /** Settings popup state */
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
};

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      mode: "single",
      setMode: (mode) => {
        const prevMode = get().mode;
        if (prevMode !== mode) {
          syncActiveImageBetweenModes(prevMode, mode);
        }
        set((s) => ({
          mode,
          // Avoid SingleModePage remount re-firing the last menu request after visiting Batch.
          openImageMenuRequestId: mode === "single" ? s.openImageMenuRequestId : 0,
          runRequestId: 0,
          dryRunRequestId: 0,
          stopRequestId: 0,
          openOutputFolderRequestId: 0,
        }));
      },
      openImageMenuRequestId: 0,
      requestOpenImageFromMenu: () => {
        if (get().mode !== "single") {
          return;
        }
        set((s) => ({ openImageMenuRequestId: s.openImageMenuRequestId + 1 }));
      },
      runRequestId: 0,
      requestRun: () => set((s) => ({ runRequestId: s.runRequestId + 1 })),
      dryRunRequestId: 0,
      requestDryRun: () => set((s) => ({ dryRunRequestId: s.dryRunRequestId + 1 })),
      stopRequestId: 0,
      requestStop: () => set((s) => ({ stopRequestId: s.stopRequestId + 1 })),
      openOutputFolderRequestId: 0,
      requestOpenOutputFolder: () =>
        set((s) => ({ openOutputFolderRequestId: s.openOutputFolderRequestId + 1 })),
      isSettingsOpen: false,
      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => createTauriStorage("app.json")),
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
