import {
  buildBlackWhiteOperationArgs,
} from "@/features/single/operations/blackWhiteOperationArgs";
import { buildBorderOperationArgs } from "@/features/single/operations/borderOperationArgs";
import { buildComposeOperationArgs } from "@/features/single/operations/composeOperationArgs";
import {
  buildContrastOperationArgs,
} from "@/features/single/operations/contrastOperationArgs";
import { buildConvertOperationArgs } from "@/features/single/operations/convertOperationArgs";
import {
  buildCropOperationArgs,
  scaledCropParamsForFullInput,
} from "@/features/single/operations/cropOperationArgs";
import { buildMirrorOperationArgs } from "@/features/single/operations/mirrorArgs";
import {
  buildNormalizeColorsOperationArgs,
} from "@/features/single/operations/normalizeColorsOperationArgs";
import { quoteCliToken } from "@/features/single/operations/quoteCli";
import { buildRotateOperationArgs } from "@/features/single/operations/rotateOperationArgs";
import {
  buildScaleResizeOperationArgs,
} from "@/features/single/operations/scaleResizeOperationArgs";
import { buildTextLogoOperationArgs } from "@/features/single/operations/textLogoOperationArgs";
import { buildVignetteOperationArgs } from "@/features/single/operations/vignetteOperationArgs";
import type { PreviewToFullImageScale } from "@/features/single/previewScale";
import { getStringParam } from "@/lib/functionParams";

type BuildSingleCliPreviewArgs = {
  selectedFile: string | null;
  selectedFunction: string;
  functionParams: Record<string, unknown>;
  previewToFullScale?: PreviewToFullImageScale | null;
};

type BuildSingleCliPipelineArgs = {
  selectedFile: string | null;
  operations: Array<{
    selectedFunction: string;
    functionParams: Record<string, unknown>;
  }>;
  outputParams?: Record<string, unknown>;
  /** When set, Crop args in the string match full-res `run_single` (same as preview→full scaling). */
  previewToFullScale?: PreviewToFullImageScale | null;
};

function getBaseName(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || filePath;
}

function normalizeOutputDir(dir: string): string {
  const trimmed = dir.trim();
  if (trimmed.length === 0) return "./output";
  if (trimmed.endsWith("/")) return trimmed.slice(0, -1);
  return trimmed;
}

function mapOutputFormatToExt(outputFormat: string): string {
  const normalized = outputFormat.trim().toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "jpg";
  if (normalized === "heic") return "heic";
  return normalized || "png";
}

function buildOutputPath(functionParams: Record<string, unknown>): string {
  const outputDir = normalizeOutputDir(
    getStringParam(functionParams, "outputDir", "./output"),
  );
  const outputName = getStringParam(functionParams, "outputName", "photo_out");
  const outputFormat = getStringParam(functionParams, "outputFormat", "png");
  const outputExt = mapOutputFormatToExt(outputFormat);
  return `${outputDir}/${outputName}.${outputExt}`;
}

export function buildSingleOperationArgs(
  selectedFunction: string,
  functionParams: Record<string, unknown>,
  /** When set, free-crop geometry in proxy space is scaled up for full-res `run_single` input. */
  previewToFullScale?: PreviewToFullImageScale | null,
): string[] {
  const effectiveParams =
    selectedFunction === "Crop" && previewToFullScale
      ? scaledCropParamsForFullInput(functionParams, previewToFullScale)
      : functionParams;

  switch (selectedFunction) {
    case "Convert":
      return buildConvertOperationArgs(effectiveParams);
    case "Crop":
      return buildCropOperationArgs(effectiveParams);
    case "Mirror":
      return buildMirrorOperationArgs(effectiveParams);
    case "Black & white":
      return buildBlackWhiteOperationArgs(effectiveParams);
    case "Contrast":
      return buildContrastOperationArgs(effectiveParams);
    case "Normalize colors":
      return buildNormalizeColorsOperationArgs(effectiveParams);
    case "Vignette":
      return buildVignetteOperationArgs(effectiveParams);
    case "Border":
      return buildBorderOperationArgs(effectiveParams);
    case "Rotate":
      return buildRotateOperationArgs(effectiveParams);
    case "Scale / resize":
      return buildScaleResizeOperationArgs(effectiveParams);
    case "Text / logo":
      return buildTextLogoOperationArgs(effectiveParams);
    case "Compose":
      return buildComposeOperationArgs(effectiveParams);
    default:
      return [];
  }
}

export function buildSingleCliPipeline({
  selectedFile,
  operations,
  outputParams,
  previewToFullScale,
}: BuildSingleCliPipelineArgs): string {
  const inputBaseName = selectedFile ? getBaseName(selectedFile) : "photo.jpg";
  const lastOperation =
    operations.length > 0 ? operations[operations.length - 1] : undefined;
  const effectiveOutputParams = outputParams ?? lastOperation?.functionParams ?? {};
  const outputPath = buildOutputPath(effectiveOutputParams);

  const parts: string[] = ["magick", quoteCliToken(inputBaseName)];
  for (const operation of operations) {
    parts.push(
      ...buildSingleOperationArgs(
        operation.selectedFunction,
        operation.functionParams,
        previewToFullScale,
      ),
    );
  }
  parts.push(quoteCliToken(outputPath));
  return parts.join(" ");
}

export function buildSingleCliPreview({
  selectedFile,
  selectedFunction,
  functionParams,
  previewToFullScale,
}: BuildSingleCliPreviewArgs): string {
  return buildSingleCliPipeline({
    selectedFile,
    operations: [{ selectedFunction, functionParams }],
    outputParams: functionParams,
    previewToFullScale,
  });
}

export type { PreviewToFullImageScale } from "@/features/single/previewScale";
export {
  estimateProxyDimensions,
  PROXY_PREVIEW_MAX_EDGE,
} from "@/features/single/previewScale";
