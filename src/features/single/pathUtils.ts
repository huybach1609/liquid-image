export function getFileNameFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || filePath;
}

export function getFileNameWithoutExtension(filePath: string): string {
  const filename = getFileNameFromPath(filePath);
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0) return filename;
  return filename.slice(0, dotIndex);
}

export function getFileExtension(filePath: string): string {
  const filename = getFileNameFromPath(filePath);
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0) return "";
  return filename.slice(dotIndex + 1).toLowerCase();
}

export function getDirectoryPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash <= 0) {
    return ".";
  }
  return normalized.slice(0, lastSlash);
}

export function normalizeOutputDir(outputDir: unknown, fallback = "./output"): string {
  if (typeof outputDir !== "string" || outputDir.trim().length === 0) {
    return fallback;
  }
  return outputDir.trim().replace(/[\\/]+$/, "");
}

export function normalizeOutputName(outputName: unknown, fallback = "photo_out"): string {
  if (typeof outputName !== "string" || outputName.trim().length === 0) {
    return fallback;
  }
  return outputName.trim();
}

export function normalizeOutputExt(outputFormat: unknown, fallback = "png"): string {
  if (typeof outputFormat !== "string" || outputFormat.trim().length === 0) {
    return fallback;
  }
  const normalized = outputFormat.trim().toLowerCase();
  return normalized === "jpeg" ? "jpg" : normalized;
}
