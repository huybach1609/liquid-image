import { mock } from "bun:test";

// Define window for Tauri apps
if (typeof window === "undefined") {
  (global as any).window = {
    __TAURI_INTERNALS__: {
      invoke: async () => ({})
    }
  };
}

// Mock Tauri modules
mock.module("@tauri-apps/api/core", () => ({
  invoke: async () => ({}),
  transformCallback: () => 0,
  Resource: class {},
  Channel: class {},
  convertFileSrc: (path: string) => path,
  isTauri: () => false,
}));

mock.module("@tauri-apps/api/event", () => ({
  listen: async () => () => {},
  emit: async () => {},
}));

mock.module("@tauri-apps/plugin-store", () => ({
  LazyStore: class {
    get = async () => null;
    set = async () => {};
    save = async () => {};
    delete = async () => {};
  }
}));

mock.module("@/shared/lib/zustand-tauri-store", () => ({
  createTauriStorage: () => ({
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  })
}));
