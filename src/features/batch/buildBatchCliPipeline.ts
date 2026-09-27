import { buildSingleOperationArgs } from "@/features/single/buildSingleCliPreview";
import type { DateFormat } from "@/features/settings/types";
import type { BatchPipelineStep } from "./types";

export interface BatchCliArgsOptions {
  diskCacheLimit?: string;
  memoryLimit?: string;
  stripMetadata?: boolean;
  defaultColorProfile?: string;
}

export function formatDateByPattern(
  date: Date = new Date(),
  format: DateFormat = "YYYY-MM-DD"
): string {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");

  switch (format) {
    case "DD-MM-YYYY":
      return `${dd}-${mm}-${yyyy}`;
    case "MM-DD-YYYY":
      return `${mm}-${dd}-${yyyy}`;
    case "YYYYMMDD":
      return `${yyyy}${mm}${dd}`;
    case "YYYY-MM-DD":
    default:
      return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Translates the batch pipeline steps into a flat array of ImageMagick CLI arguments.
 * Note: These args are applied AFTER the input file and BEFORE the output file
 * in the final 'magick <input> <args...> <output>' command.
 */
export function buildBatchCliArgs(
  pipeline: BatchPipelineStep[],
  options?: BatchCliArgsOptions
): string[] {
  const allArgs: string[] = [];

  if (options?.diskCacheLimit && options.diskCacheLimit !== "Unlimited") {
    const cleanDisk = options.diskCacheLimit.replace(/\s+/g, "");
    allArgs.push("-limit", "disk", cleanDisk);
  }
  if (options?.memoryLimit && options.memoryLimit !== "Unlimited") {
    const cleanMem = options.memoryLimit.replace(/\s+/g, "");
    allArgs.push("-limit", "memory", cleanMem);
  }

  for (const step of pipeline) {
    if (!step.enabled) continue;

    const stepArgs = buildSingleOperationArgs(
      step.functionId,
      step.params,
      null // No preview-to-full scaling in batch mode for now
    );

    allArgs.push(...stepArgs);
  }

  const hasConvertStep = pipeline.some((s) => s.functionId === "Convert" && s.enabled);
  if (!hasConvertStep) {
    if (options?.stripMetadata) {
      allArgs.push("-strip");
    }
    if (options?.defaultColorProfile && options.defaultColorProfile !== "None") {
      const cs =
        options.defaultColorProfile === "Adobe RGB"
          ? "Adobe98"
          : options.defaultColorProfile;
      allArgs.push("-colorspace", cs);
    }
  }

  return allArgs;
}

function mapOutputFormatToExt(outputFormat: string): string {
  const normalized = outputFormat.trim().toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "jpg";
  if (normalized === "heic") return "heic";
  return normalized || "png";
}

export interface BuildBatchOutputPathOptions {
  dateFormat?: DateFormat;
  now?: Date;
  opName?: string;
}

/**
 * Builds the full output path for a batch item.
 * Supports naming patterns like {name}, {counter}, {date}, {op}, and custom text.
 */
export function buildBatchOutputPath(
  inputPath: string,
  outputDirectory: string,
  outputFormat: string | undefined,
  namingPattern: string = "{name}",
  index: number = 0,
  options?: BuildBatchOutputPathOptions
): string {
  const normalizedDir = outputDirectory.trim();
  const dir = normalizedDir.endsWith("/") ? normalizedDir.slice(0, -1) : normalizedDir;

  // Get filename without extension
  const parts = inputPath.replace(/\\/g, "/").split("/");
  const fileNameWithExt = parts[parts.length - 1] || "image.png";
  const lastDotIndex = fileNameWithExt.lastIndexOf(".");
  const fileName = lastDotIndex === -1 ? fileNameWithExt : fileNameWithExt.slice(0, lastDotIndex);

  const dateStr = formatDateByPattern(
    options?.now ?? new Date(),
    options?.dateFormat ?? "YYYY-MM-DD"
  );
  const opStr = options?.opName || "converted";

  let pattern = namingPattern;
  if (pattern === "same-name") pattern = "{name}";
  else if (pattern === "name-out") pattern = "{name}_out";
  else if (pattern === "name-op") pattern = "{name}_{op}";
  else if (pattern === "date-name") pattern = "{date}_{name}";

  // Apply naming pattern
  let resultFileName = pattern
    .replace(/{name}/g, fileName)
    .replace(/{counter}/g, (index + 1).toString().padStart(3, "0"))
    .replace(/{date}/g, dateStr)
    .replace(/{op}/g, opStr);

  // Fallback if pattern resulted in empty string
  if (!resultFileName) resultFileName = fileName;

  const ext = mapOutputFormatToExt(outputFormat || "");

  // Ensure we handle both Windows and Unix paths for the output dir if needed, 
  // but for now we'll stick to simple slash join
  return `${dir}/${resultFileName}.${ext}`;
}
