import type { ConflictPolicy } from "@/features/settings/types";

/**
 * Generates a unique filename by appending _1, _2, etc. before the file extension
 * given a set of known occupied paths.
 */
export function getUniqueFilename(targetPath: string, existingPaths: Set<string>): string {
  const parts = targetPath.replace(/\\/g, "/").split("/");
  const fullFileName = parts.pop() || "output.png";
  const dir = parts.join("/");
  const lastDot = fullFileName.lastIndexOf(".");
  const base = lastDot === -1 ? fullFileName : fullFileName.slice(0, lastDot);
  const ext = lastDot === -1 ? "" : fullFileName.slice(lastDot);

  let counter = 1;
  let candidate = `${dir}/${base}_${counter}${ext}`;
  while (existingPaths.has(candidate)) {
    counter++;
    candidate = `${dir}/${base}_${counter}${ext}`;
  }
  return candidate;
}

/**
 * Resolves potential file conflict according to the user's ConflictPolicy:
 * - 'overwrite': keep path as-is
 * - 'skip': flag to skip processing if file already exists
 * - 'rename' / 'ask': find an available non-existing name (file_1.png, file_2.png...)
 */
export async function resolvePathConflict(
  targetPath: string,
  policy: ConflictPolicy = "rename"
): Promise<{ path: string; skip: boolean }> {
  if (policy === "overwrite") {
    return { path: targetPath, skip: false };
  }

  try {
    const { exists } = await import("@tauri-apps/plugin-fs");
    const isExisting = await exists(targetPath);
    if (!isExisting) {
      return { path: targetPath, skip: false };
    }

    if (policy === "skip") {
      return { path: targetPath, skip: true };
    }

    if (policy === "rename" || policy === "ask") {
      const parts = targetPath.replace(/\\/g, "/").split("/");
      const fullFileName = parts.pop() || "output.png";
      const dir = parts.join("/");
      const lastDot = fullFileName.lastIndexOf(".");
      const base = lastDot === -1 ? fullFileName : fullFileName.slice(0, lastDot);
      const ext = lastDot === -1 ? "" : fullFileName.slice(lastDot);

      let counter = 1;
      let candidate = `${dir}/${base}_${counter}${ext}`;
      while (await exists(candidate)) {
        counter++;
        candidate = `${dir}/${base}_${counter}${ext}`;
      }
      return { path: candidate, skip: false };
    }
  } catch {
    // If running in browser or plugin-fs unavailable, return target path
  }

  return { path: targetPath, skip: false };
}
