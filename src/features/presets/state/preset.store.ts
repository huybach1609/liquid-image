import type { PresetSummary } from "../types";

export type PresetState = {
  items: PresetSummary[];
  selectedPresetId: string | null;
};

export const initialPresetState: PresetState = {
  items: [],
  selectedPresetId: null,
};

export const presetStore = {
  getState(): PresetState {
    return initialPresetState;
  },
};
