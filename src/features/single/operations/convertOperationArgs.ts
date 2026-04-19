import { getNumberParam, getStringParam } from "@/lib/functionParams";

import { quoteCliToken } from "./quoteCli";

export function buildConvertOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const parts: string[] = [];
  const outputFormat = getStringParam(effectiveParams, "outputFormat", "PNG")
    .trim()
    .toUpperCase();
  const quality = getNumberParam(effectiveParams, "quality", 85);

  if (outputFormat === "WEBP") {
    const method = Math.min(
      6,
      Math.max(0, getNumberParam(effectiveParams, "webpMethod", 1)),
    );
    parts.push("-define", `webp:method=${method}`);
  } else {
    parts.push("-quality", String(quality));
    if (outputFormat === "PNG") {
      const zlibLevel = Math.min(9, Math.max(0, Math.round(quality / 10)));
      parts.push("-define", `png:compression-level=${zlibLevel}`);
    }
  }

  if (outputFormat === "GIF") {
    const dither = getStringParam(effectiveParams, "dither", "None");
    parts.push("-dither", dither === "Floyd-Steinberg" ? "FloydSteinberg" : "None");
  }

  const stripMetadata = effectiveParams.stripMetadata;
  if (stripMetadata === true || stripMetadata === "true") {
    parts.push("-strip");
  }

  const profile = getStringParam(effectiveParams, "colorProfile", "sRGB");
  if (profile && profile !== "None") {
    parts.push("-profile", quoteCliToken(profile));
  }

  const colorDepth = getNumberParam(effectiveParams, "colorDepth", 8);
  if (colorDepth > 0) {
    parts.push("-depth", String(colorDepth));
  }

  const dpi = getNumberParam(effectiveParams, "dpi", 72);
  if (dpi > 0) {
    parts.push("-density", String(dpi));
  }

  const progressive =
    effectiveParams.progressive === true || effectiveParams.progressive === "true";
  if (progressive) {
    if (outputFormat === "JPEG" || outputFormat === "JPG") {
      parts.push("-interlace", "Plane");
    } else if (outputFormat === "PNG" || outputFormat === "GIF") {
      parts.push("-interlace", "Line");
    }
  }
  return parts;
}
