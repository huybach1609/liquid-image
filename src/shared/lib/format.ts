import type { FileSizeUnit } from "@/features/settings/types";
import { useSettingsStore } from "@/features/settings/state/settings.store";

export function formatFileSize(
  bytes: number,
  decimalPoint = 2,
  unit?: FileSizeUnit
): string {
  if (bytes === 0) return "0 Bytes";

  let activeUnit = unit;
  if (!activeUnit) {
    try {
      activeUnit = useSettingsStore.getState().fileSizeUnit;
    } catch {
      activeUnit = "MB_GB";
    }
  }

  const dm = decimalPoint < 0 ? 0 : decimalPoint;

  if (activeUnit === "KB") {
    const kb = bytes / 1024;
    return `${parseFloat(kb.toFixed(dm))} KB`;
  }

  const k = 1024;
  if (activeUnit === "MiB_GiB") {
    const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const safeIdx = Math.min(Math.max(i, 0), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, safeIdx)).toFixed(dm))} ${sizes[safeIdx]}`;
  }

  // Standard "MB_GB"
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeIdx = Math.min(Math.max(i, 0), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeIdx)).toFixed(dm))} ${sizes[safeIdx]}`;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}
