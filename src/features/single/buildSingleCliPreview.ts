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

function quoteIfNeeded(value: string): string {
  // ImageMagick accepts quoted paths; we use quotes for safety with spaces.
  const escaped = value.replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function getStringParam(params: Record<string, unknown>, key: string, fallback: string) {
  const v = params[key];
  return typeof v === "string" && v.trim().length > 0 ? v : fallback;
}

function getNumberParam(params: Record<string, unknown>, key: string, fallback: number) {
  const v = params[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim().length > 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/** Must match `PREVIEW_TARGET` in `magick-service.rs` (`create_image_proxy`). */
export const PROXY_PREVIEW_MAX_EDGE = 1600;

/**
 * Approximate pixel size of the WebP proxy (`-thumbnail WxH>`), used when decoded
 * preview dimensions are not available yet.
 */
export function estimateProxyDimensions(
  fullWidth: number,
  fullHeight: number,
): { width: number; height: number } {
  const max = PROXY_PREVIEW_MAX_EDGE;
  if (
    !Number.isFinite(fullWidth) ||
    !Number.isFinite(fullHeight) ||
    fullWidth <= 0 ||
    fullHeight <= 0
  ) {
    return { width: 1, height: 1 };
  }
  if (fullWidth <= max && fullHeight <= max) {
    return { width: Math.round(fullWidth), height: Math.round(fullHeight) };
  }
  const s = Math.min(max / fullWidth, max / fullHeight);
  return {
    width: Math.max(1, Math.round(fullWidth * s)),
    height: Math.max(1, Math.round(fullHeight * s)),
  };
}

/**
 * Map **free-crop** geometry from proxy/preview pixels to full-resolution input pixels.
 * Shave and trim are not scaled here (shave UI is always full-res px; trim uses %).
 */
export type PreviewToFullImageScale = {
  fullWidth: number;
  fullHeight: number;
  previewWidth: number;
  previewHeight: number;
};

function scaledCropParamsForFullInput(
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

  // Shave UI values are always in **full-resolution/original** pixel space.
  // `run_single` reads the full-res file — do not scale shave here (avoids double / wrong depth).

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

  const parts: string[] = [];

  switch (selectedFunction) {
    case "Convert": {
      const quality = getNumberParam(effectiveParams, "quality", 85);
      parts.push("-quality", String(quality));

      const stripMetadata = effectiveParams.stripMetadata;
      if (stripMetadata === true || stripMetadata === "true") {
        parts.push("-strip");
      }

      const profile = getStringParam(effectiveParams, "colorProfile", "sRGB");
      if (profile) {
        parts.push("-profile", quoteIfNeeded(profile));
      }
      break;
    }
    case "Crop": {
      const method = getStringParam(effectiveParams, "cropMethod", "free").toLowerCase();

      if (method === "trim") {
        const fuzz = Math.round(getNumberParam(effectiveParams, "cropTrimFuzz", 10));
        const clamped = Math.max(0, Math.min(100, fuzz));
        parts.push("-fuzz", `${clamped}%`, "-trim", "+repage");
        break;
      }

      if (method === "shave") {
        const shH = Math.max(0, Math.round(getNumberParam(effectiveParams, "cropShaveH", 0)));
        const shV = Math.max(0, Math.round(getNumberParam(effectiveParams, "cropShaveV", 0)));
        if (shH > 0 || shV > 0) {
          parts.push("-shave", `${shH}x${shV}`);
        }
        break;
      }

      const ratio = getStringParam(effectiveParams, "cropAspectRatio", "Free");
      if (ratio === "1:1") {
        parts.push("-gravity", "Center", "-crop", "800x800+0+0", "+repage");
        break;
      }
      if (ratio === "16:9") {
        parts.push("-gravity", "Center", "-crop", "1280x720+0+0", "+repage");
        break;
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
      break;
    }
    case "Mirror": {
      const axis = getStringParam(effectiveParams, "mirrorAxis", "Horizontal");
      if (axis === "Horizontal") {
        parts.push("-flop");
      } else if (axis === "Vertical") {
        parts.push("-flip");
      } else if (axis === "Both") {
        parts.push("-flop", "-flip");
      }
      break;
    }
    case "Black & white": {
      const intensity = Math.round(
        getNumberParam(effectiveParams, "bwIntensity", 80),
      );
      const threshold = Math.max(0, Math.min(100, intensity));
      parts.push("-colorspace", "Gray", "-threshold", `${threshold}%`);
      break;
    }
    case "Contrast": {
      const amount = Math.round(getNumberParam(effectiveParams, "contrastAmount", 0));
      parts.push("-brightness-contrast", `0x${amount}`);
      break;
    }
    case "Normalize colors": {
      const strength = getNumberParam(effectiveParams, "normalizeStrength", 60);
      const gamma = Math.max(0.5, Math.min(2.5, 1 + (strength - 50) / 200));
      parts.push("-normalize", "-gamma", String(gamma));
      break;
    }
    case "Vignette": {
      const radius = Math.round(getNumberParam(effectiveParams, "vignetteRadius", 40));
      const softness = Math.round(getNumberParam(effectiveParams, "vignetteSoftness", 60));
      parts.push("-vignette", `${radius}x${softness}+5+5`);
      break;
    }
    case "Border": {
      const size = Math.round(getNumberParam(effectiveParams, "borderSize", 10));
      const color = getStringParam(effectiveParams, "borderColor", "black");
      parts.push("-bordercolor", quoteIfNeeded(color), "-border", `${size}x${size}`);
      break;
    }
    case "Rotate": {
      const autoOrient = effectiveParams.rotateAutoOrient === true;
      if (autoOrient) {
        parts.push("-auto-orient");
      } else {
        const degrees = Math.round(getNumberParam(effectiveParams, "rotateDegrees", 0));
        if (degrees !== 0) {
          parts.push("-rotate", String(degrees));
        }
      }
      break;
    }
    case "Scale / resize": {
      const width = getNumberParam(effectiveParams, "resizeWidth", NaN);
      const height = getNumberParam(effectiveParams, "resizeHeight", NaN);
      if (Number.isFinite(width) && Number.isFinite(height)) {
        parts.push("-resize", `${width}x${height}`);
      } else if (Number.isFinite(width)) {
        parts.push("-resize", `${width}x`);
      } else if (Number.isFinite(height)) {
        parts.push("-resize", `x${height}`);
      }
      break;
    }
    case "Text / logo": {
      const text = getStringParam(effectiveParams, "textLogoText", "Your text");
      const position = getStringParam(effectiveParams, "textLogoPosition", "bottom-right");

      const gravity =
        position === "bottom-left"
          ? "SouthWest"
          : position === "center"
            ? "Center"
            : "SouthEast";

      const x = position === "center" ? 0 : 20;
      const y = position === "center" ? 0 : 20;

      parts.push(
        "-font",
        "Helvetica",
        "-pointsize",
        "48",
        "-fill",
        "white",
        "-gravity",
        gravity,
        "-annotate",
        `+${x}+${y}`,
        quoteIfNeeded(text),
      );
      break;
    }
    case "Compose": {
      const overlayPath = getStringParam(effectiveParams, "composeOverlayPath", "overlay.png");
      const blendMode = getStringParam(effectiveParams, "composeBlendMode", "over");
      const opacity = Math.round(getNumberParam(effectiveParams, "composeOpacity", 100));

      parts.push(quoteIfNeeded(overlayPath));
      parts.push("-gravity", "SouthEast");
      parts.push("-compose", blendMode);
      parts.push("-define", `compose:args=${Math.max(0, Math.min(1, opacity / 100))}`);
      parts.push("-composite");
      break;
    }
    default: {
      break;
    }
  }

  return parts;
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

  const parts: string[] = ["magick", quoteIfNeeded(inputBaseName)];
  for (const operation of operations) {
    parts.push(
      ...buildSingleOperationArgs(
        operation.selectedFunction,
        operation.functionParams,
        previewToFullScale,
      ),
    );
  }
  parts.push(quoteIfNeeded(outputPath));
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

