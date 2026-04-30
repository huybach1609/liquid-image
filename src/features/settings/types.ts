export type Language = "en" | "vi" | "zh" | "ja" | "ko" | "fr" | "de";
export type DateFormat = "YYYY-MM-DD" | "DD-MM-YYYY" | "MM-DD-YYYY" | "YYYYMMDD";
export type FileSizeUnit = "MB_GB" | "MiB_GiB" | "KB";
export type Theme = "system" | "light" | "dark" | "claude" | "claude-dark" | "notion" | "notion-dark" | "starbucks" | "starbucks-dark";
export type FontSize = "small" | "default" | "large";
export type SidebarWidth = "compact" | "default" | "wide";
export type NamingPattern = "same-name" | "name-out" | "name-op" | "date-name" | "custom";
export type ConflictPolicy = "ask" | "overwrite" | "rename" | "skip";
export type OnErrorPolicy = "skip-and-continue" | "stop-all" | "retry-once";
export type PreviewResolution = "800px" | "1200px" | "full";
export type ColorProfile = "sRGB" | "Adobe RGB" | "CMYK" | "None";

export type SettingsState = {
  // General
  language: Language;
  dateFormat: DateFormat;
  fileSizeUnit: FileSizeUnit;
  restoreSession: boolean;
  checkUpdates: boolean;
  launchAtLogin: boolean;

  // Appearance
  theme: Theme;
  accentColor: string;
  fontSize: FontSize;
  sidebarWidth: SidebarWidth;
  showCliPreview: boolean;
  showMetadata: boolean;

  // Files & Output
  outputFolder: string;
  presetFolder: string;
  namingPattern: string;
  customNamingPattern: string;
  conflictPolicy: ConflictPolicy;
  autoOpenOutput: boolean;
  recentFilesLimit: number;

  // Processing
  workers: number;
  memoryLimit: string;
  diskCacheLimit: string;
  livePreview: boolean;
  previewMaxResolution: PreviewResolution;
  dryRunBeforeBatch: boolean;
  onErrorPolicy: OnErrorPolicy;
  saveErrorLog: boolean;

  // ImageMagick
  magickBinaryPath: string;
  stripMetadata: boolean;
  interlacePng: boolean;
  defaultColorProfile: ColorProfile;
  extraGlobalFlags: string;

  // Notifications
  notifyBatchComplete: boolean;
  notifyError: boolean;
  notifySingleDone: boolean;
  playSound: boolean;
  showDockProgress: boolean;
  showTrayBadge: boolean;
};
