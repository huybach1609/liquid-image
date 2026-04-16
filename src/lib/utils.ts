import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(fileSizeBytes: number) : string | undefined {
  if (fileSizeBytes < 1024) {
    return `${fileSizeBytes} B`;
  }
  if (fileSizeBytes < 1024 * 1024) {
    return `${(fileSizeBytes / 1024).toFixed(2)} KB`;
  }
  if (fileSizeBytes < 1024 * 1024 * 1024) {
    return `${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB`;
  }
}
