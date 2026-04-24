import { createStore, Store } from "@tauri-apps/plugin-store";
import type { StateStorage } from "zustand/middleware";

/**
 * Custom Zustand storage implementation that uses tauri-plugin-store
 * for native persistence on the user's filesystem.
 */
export const createTauriStorage = (path: string): StateStorage => {
  let store: Store | null = null;

  const getStore = async () => {
    if (!store) {
      store = await createStore(path);
    }
    return store;
  };

  return {
    getItem: async (name: string): Promise<string | null> => {
      const s = await getStore();
      const val = await s.get<{ state: any }>(name);
      return val ? JSON.stringify(val) : null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
      const s = await getStore();
      const parsedValue = JSON.parse(value);
      await s.set(name, parsedValue);
      await s.save();
    },
    removeItem: async (name: string): Promise<void> => {
      const s = await getStore();
      await s.delete(name);
      await s.save();
    },
  };
};
