import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createTauriStorage } from "@/shared/lib/zustand-tauri-store";
import type { SettingsState, NamingPattern, ConflictPolicy, OnErrorPolicy } from "../types";

export interface SettingsStoreState extends SettingsState {
  // Actions
  setOutputFolder: (path: string) => void;
  setNamingPattern: (pattern: NamingPattern) => void;
  setConflictPolicy: (policy: ConflictPolicy) => void;
  setWorkers: (count: number) => void;
  setOnErrorPolicy: (policy: OnErrorPolicy) => void;
  resetSettings: () => void;
}

export const initialSettings: SettingsState = {
  outputFolder: "./out/",
  namingPattern: "same-name",
  conflictPolicy: "overwrite",
  workers: 4,
  onErrorPolicy: "skip-and-continue",
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      ...initialSettings,

      setOutputFolder: (outputFolder) => set({ outputFolder }),
      setNamingPattern: (namingPattern) => set({ namingPattern }),
      setConflictPolicy: (conflictPolicy) => set({ conflictPolicy }),
      setWorkers: (workers) => set({ workers }),
      setOnErrorPolicy: (onErrorPolicy) => set({ onErrorPolicy }),
      
      resetSettings: () => set(initialSettings),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => createTauriStorage("settings.json")),
    }
  )
);
