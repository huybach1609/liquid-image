import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createTauriStorage } from "@/shared/lib/zustand-tauri-store";
import { useSettingsStore } from "@/features/settings/state/settings.store";

export type RecentFilesState = {
  recentFiles: string[];
  addRecentFile: (filePath: string) => void;
  removeRecentFile: (filePath: string) => void;
  clearRecentFiles: () => void;
};

export const useRecentFilesStore = create<RecentFilesState>()(
  persist(
    (set) => ({
      recentFiles: [],
      addRecentFile: (filePath: string) => {
        const path = filePath?.trim();
        if (!path) return;
        const limitSetting = useSettingsStore.getState().recentFilesLimit;
        const limit = typeof limitSetting === "number" && limitSetting > 0 ? limitSetting : 10;
        set((state) => {
          const filtered = state.recentFiles.filter((f) => f !== path);
          return {
            recentFiles: [path, ...filtered].slice(0, limit),
          };
        });
      },
      removeRecentFile: (filePath: string) => {
        set((state) => ({
          recentFiles: state.recentFiles.filter((f) => f !== filePath),
        }));
      },
      clearRecentFiles: () => {
        set({ recentFiles: [] });
      },
    }),
    {
      name: "recent-files-storage",
      storage: createJSONStorage(() => createTauriStorage("recent-files.json")),
    }
  )
);
