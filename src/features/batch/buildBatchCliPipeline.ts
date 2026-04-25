import { buildSingleOperationArgs } from "@/features/single/buildSingleCliPreview";
import type { BatchPipelineStep } from "./types";

/**
 * Translates the batch pipeline steps into a flat array of ImageMagick CLI arguments.
 * Note: These args are applied AFTER the input file and BEFORE the output file
 * in the final 'magick <input> <args...> <output>' command.
 */
export function buildBatchCliArgs(pipeline: BatchPipelineStep[]): string[] {
  const allArgs: string[] = [];

  for (const step of pipeline) {
    if (!step.enabled) continue;

    const stepArgs = buildSingleOperationArgs(
      step.functionId,
      step.params,
      null // No preview-to-full scaling in batch mode for now
    );
    
    allArgs.push(...stepArgs);
  }

  return allArgs;
}

function mapOutputFormatToExt(outputFormat: string): string {
  const normalized = outputFormat.trim().toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "jpg";
  if (normalized === "heic") return "heic";
  return normalized || "png";
}

/**
 * Builds the full output path for a batch item.
 * Supports naming patterns like {name}, {counter}, and custom text.
 */
export function buildBatchOutputPath(
  inputPath: string,
  outputDirectory: string,
  outputFormat: string | undefined,
  namingPattern: string = "{name}",
  index: number = 0
): string {
  const normalizedDir = outputDirectory.trim();
  const dir = normalizedDir.endsWith("/") ? normalizedDir.slice(0, -1) : normalizedDir;
  
  // Get filename without extension
  const parts = inputPath.replace(/\\/g, "/").split("/");
  const fileNameWithExt = parts[parts.length - 1] || "image.png";
  const lastDotIndex = fileNameWithExt.lastIndexOf(".");
  const fileName = lastDotIndex === -1 ? fileNameWithExt : fileNameWithExt.slice(0, lastDotIndex);
  
  // Apply naming pattern
  let resultFileName = namingPattern
    .replace("{name}", fileName)
    .replace("{counter}", (index + 1).toString().padStart(3, "0"));

  // Fallback if pattern resulted in empty string
  if (!resultFileName) resultFileName = fileName;

  const ext = mapOutputFormatToExt(outputFormat || "");
  
  // Ensure we handle both Windows and Unix paths for the output dir if needed, 
  // but for now we'll stick to simple slash join
  return `${dir}/${resultFileName}.${ext}`;
}
