import { LazyStore } from "@tauri-apps/plugin-store";
import type { StateStorage } from "zustand/middleware";

/**
 * Custom Zustand storage implementation that uses tauri-plugin-store
 * for native persistence on the user's filesystem.
 */
export const createTauriStorage = (path: string): StateStorage => {
  const store = new LazyStore(path);

  return {
    getItem: async (name: string): Promise<string | null> => {
      const val = await store.get<{ state: any }>(name);
      return val ? JSON.stringify(val) : null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
      const parsedValue = JSON.parse(value);
      await store.set(name, parsedValue);
      await store.save();
    },
    removeItem: async (name: string): Promise<void> => {
      await store.delete(name);
      await store.save();
    },
  };
};
