import type { PreviewToFullImageScale } from "@/features/single/previewScale";
import { getNumberParam, getStringParam } from "@/lib/functionParams";

/**
 * Scale free-crop geometry from proxy space to full-res for `run_single`.
 * Trim is unchanged; shave stays in full-res px (see `buildSingleCliPreview.ts`).
 */
export function scaledCropParamsForFullInput(
  params: Record<string, unknown>,
  scale: PreviewToFullImageScale,
): Record<string, unknown> {
  const { fullWidth: fw, fullHeight: fh, previewWidth: pw, previewHeight: ph } = scale;
  if (pw <= 0 || ph <= 0 || fw <= 0 || fh <= 0) {
    return params;
  }
  const sx = fw / pw;
  const sy = fh / ph;
  if (Math.abs(sx - 1) < 1e-9 && Math.abs(sy - 1) < 1e-9) {
    return params;
  }

  const method = getStringParam(params, "cropMethod", "free").toLowerCase();
  if (method === "trim") {
    return params;
  }

  if (method === "free") {
    return {
      ...params,
      cropX: Math.round(getNumberParam(params, "cropX", 0) * sx),
      cropY: Math.round(getNumberParam(params, "cropY", 0) * sy),
      cropW: Math.round(getNumberParam(params, "cropW", 0) * sx),
      cropH: Math.round(getNumberParam(params, "cropH", 0) * sy),
    };
  }

  return params;
}

/** ImageMagick argv tokens for the Crop function (trim / shave / free). */
export function buildCropOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const parts: string[] = [];
  const method = getStringParam(effectiveParams, "cropMethod", "free").toLowerCase();

  if (method === "trim") {
    const fuzz = Math.round(getNumberParam(effectiveParams, "cropTrimFuzz", 10));
    const clamped = Math.max(0, Math.min(100, fuzz));
    parts.push("-fuzz", `${clamped}%`, "-trim", "+repage");
    return parts;
  }

  if (method === "shave") {
    const shH = Math.max(0, Math.round(getNumberParam(effectiveParams, "cropShaveH", 0)));
    const shV = Math.max(0, Math.round(getNumberParam(effectiveParams, "cropShaveV", 0)));
    if (shH > 0 || shV > 0) {
      parts.push("-shave", `${shH}x${shV}`);
    }
    return parts;
  }

  const ratio = getStringParam(effectiveParams, "cropAspectRatio", "Free");
  if (ratio === "1:1") {
    parts.push("-gravity", "Center", "-crop", "800x800+0+0", "+repage");
    return parts;
  }
  if (ratio === "16:9") {
    parts.push("-gravity", "Center", "-crop", "1280x720+0+0", "+repage");
    return parts;
  }

  const g = getStringParam(effectiveParams, "cropGravity", "NW");
  const imGravity =
    g === "SE" ? "SouthEast" : g === "Center" ? "Center" : "NorthWest";

  const x = Math.round(getNumberParam(effectiveParams, "cropX", 0));
  const y = Math.round(getNumberParam(effectiveParams, "cropY", 0));
  const w = Math.round(getNumberParam(effectiveParams, "cropW", 0));
  const h = Math.round(getNumberParam(effectiveParams, "cropH", 0));
  if (w > 0 && h > 0) {
    parts.push("-gravity", imGravity, "-crop", `${w}x${h}+${x}+${y}`, "+repage");
  }
  return parts;
}
