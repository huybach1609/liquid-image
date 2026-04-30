import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createTauriStorage } from "@/shared/lib/zustand-tauri-store";
import type { 
  SettingsState,
  Theme,
} from "../types";

export interface SettingsStoreState extends SettingsState {
  // Generic setter
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
  resetSection: (keys: (keyof SettingsState)[]) => void;
}

export const initialSettings: SettingsState = {
  // General
  language: "vi",
  dateFormat: "YYYY-MM-DD",
  fileSizeUnit: "MB_GB",
  restoreSession: true,
  checkUpdates: true,
  launchAtLogin: false,

  // Appearance
  theme: "system" as Theme,
  accentColor: "#7F77DD",
  fontSize: "default",
  sidebarWidth: "default",
  showCliPreview: true,
  showMetadata: true,

  // Files & Output
  outputFolder: "~/Pictures/output/",
  presetFolder: "~/.config/imgui/presets/",
  namingPattern: "{name}_out",
  customNamingPattern: "",
  conflictPolicy: "rename",
  autoOpenOutput: false,
  recentFilesLimit: 10,

  // Processing
  workers: 4,
  memoryLimit: "512 MB",
  diskCacheLimit: "2 GB",
  livePreview: false,
  previewMaxResolution: "1200px",
  dryRunBeforeBatch: true,
  onErrorPolicy: "skip-and-continue",
  saveErrorLog: true,

  // ImageMagick
  magickBinaryPath: "/usr/local/bin/magick",
  stripMetadata: true,
  interlacePng: false,
  defaultColorProfile: "sRGB",
  extraGlobalFlags: "",

  // Notifications
  notifyBatchComplete: true,
  notifyError: true,
  notifySingleDone: false,
  playSound: true,
  showDockProgress: true,
  showTrayBadge: true,
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      ...initialSettings,

      setSetting: (key, value) => set({ [key]: value }),
      
      resetSettings: () => set(initialSettings),
      
      resetSection: (keys) => {
        const resetValues: Partial<SettingsState> = {};
        for (const key of keys) {
          (resetValues[key] as any) = initialSettings[key];
        }
        set(resetValues);
      },
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => createTauriStorage("settings.json")),
    }
  )
);
