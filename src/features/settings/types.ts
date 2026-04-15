export type NamingPattern = "same-name" | "name-out" | "name-op" | "date-name" | "custom";
export type ConflictPolicy = "overwrite" | "skip" | "rename";
export type OnErrorPolicy = "skip-and-continue" | "stop-all" | "retry-once";

export type SettingsState = {
  outputFolder: string;
  namingPattern: NamingPattern;
  conflictPolicy: ConflictPolicy;
  workers: number;
  onErrorPolicy: OnErrorPolicy;
};
