import type { SettingsState } from "../types";

export const initialSettingsState: SettingsState = {
  outputFolder: "./out/",
  namingPattern: "same-name",
  conflictPolicy: "overwrite",
  workers: 4,
  onErrorPolicy: "skip-and-continue",
};

export const settingsStore = {
  getState(): SettingsState {
    return initialSettingsState;
  },
};
