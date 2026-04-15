import { useCallback } from "react";

export function usePresetActions() {
  const savePreset = useCallback(async (_name: string) => {
    // TODO: persist current settings as preset.
  }, []);

  const loadPreset = useCallback(async (_id: string) => {
    // TODO: load preset into relevant stores.
  }, []);

  const deletePreset = useCallback(async (_id: string) => {
    // TODO: remove preset from storage.
  }, []);

  return {
    savePreset,
    loadPreset,
    deletePreset,
  };
}
