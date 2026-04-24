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
        })),
      openImageMenuRequestId: 0,
      requestOpenImageFromMenu: () => {
        if (get().mode !== "single") {
          return;
        }
        set((s) => ({ openImageMenuRequestId: s.openImageMenuRequestId + 1 }));
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => createTauriStorage("app.json")),
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
