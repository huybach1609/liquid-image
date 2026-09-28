import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createTauriStorage } from "@/shared/lib/zustand-tauri-store";

import type { AppMode } from "@/shared/types/common";

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
      setMode: (mode) =>
        set((s) => ({
          mode,
          // Avoid SingleModePage remount re-firing the last menu request after visiting Batch.
          openImageMenuRequestId: mode === "single" ? s.openImageMenuRequestId : 0,
          runRequestId: 0,
          dryRunRequestId: 0,
          stopRequestId: 0,
          openOutputFolderRequestId: 0,
        })),
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
