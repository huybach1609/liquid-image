import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

import { MENU_IDS } from "@/app/menubar/menuIds";
import { useAppStore } from "@/app/store/app.store";

type MenuActionPayload = {
  id: string;
};

/**
 * Forwards native macOS menu events into the app store (same contract as web menubar clicks).
 */
export function useMenubarBridge() {
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void listen<MenuActionPayload>("app:menu-action", (event) => {
      const id = event.payload?.id;
      if (id === MENU_IDS.FILE_OPEN_IMAGE) {
        useAppStore.getState().requestOpenImageFromMenu();
      }
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {
        /* non-Tauri / permission */
      });

    return () => {
      unlisten?.();
    };
  }, []);
}
