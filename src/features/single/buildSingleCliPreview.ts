type BuildSingleCliPreviewArgs = {
  selectedFile: string | null;
  selectedFunction: string;
  functionParams: Record<string, unknown>;
};

type BuildSingleCliPipelineArgs = {
  selectedFile: string | null;
  operations: Array<{
    selectedFunction: string;
    functionParams: Record<string, unknown>;
  }>;
  outputParams?: Record<string, unknown>;
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
): string[] {
  const parts: string[] = [];

  switch (selectedFunction) {
    case "Convert": {
      const quality = getNumberParam(functionParams, "quality", 85);
      parts.push("-quality", String(quality));

      const stripMetadata = functionParams.stripMetadata;
      if (stripMetadata === true || stripMetadata === "true") {
        parts.push("-strip");
      }

      const profile = getStringParam(functionParams, "colorProfile", "sRGB");
      if (profile) {
        parts.push("-profile", quoteIfNeeded(profile));
      }
      break;
    }
    case "Crop": {
      const method = getStringParam(functionParams, "cropMethod", "free").toLowerCase();

      if (method === "trim") {
        const fuzz = Math.round(getNumberParam(functionParams, "cropTrimFuzz", 10));
        const clamped = Math.max(0, Math.min(100, fuzz));
        parts.push("-fuzz", `${clamped}%`, "-trim", "+repage");
        break;
      }

      if (method === "shave") {
        const shH = Math.max(0, Math.round(getNumberParam(functionParams, "cropShaveH", 0)));
        const shV = Math.max(0, Math.round(getNumberParam(functionParams, "cropShaveV", 0)));
        if (shH > 0 || shV > 0) {
          parts.push("-shave", `${shH}x${shV}`);
        }
        break;
      }

      const ratio = getStringParam(functionParams, "cropAspectRatio", "Free");
      if (ratio === "1:1") {
        parts.push("-gravity", "Center", "-crop", "800x800+0+0", "+repage");
        break;
      }
      if (ratio === "16:9") {
        parts.push("-gravity", "Center", "-crop", "1280x720+0+0", "+repage");
        break;
      }

      const g = getStringParam(functionParams, "cropGravity", "NW");
      const imGravity =
        g === "SE" ? "SouthEast" : g === "Center" ? "Center" : "NorthWest";

      const x = Math.round(getNumberParam(functionParams, "cropX", 0));
      const y = Math.round(getNumberParam(functionParams, "cropY", 0));
      const w = Math.round(getNumberParam(functionParams, "cropW", 0));
      const h = Math.round(getNumberParam(functionParams, "cropH", 0));
      if (w > 0 && h > 0) {
        parts.push("-gravity", imGravity, "-crop", `${w}x${h}+${x}+${y}`, "+repage");
      }
      break;
    }
    case "Mirror": {
      const axis = getStringParam(functionParams, "mirrorAxis", "Horizontal");
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
        getNumberParam(functionParams, "bwIntensity", 80),
      );
      const threshold = Math.max(0, Math.min(100, intensity));
      parts.push("-colorspace", "Gray", "-threshold", `${threshold}%`);
      break;
    }
    case "Contrast": {
      const amount = Math.round(getNumberParam(functionParams, "contrastAmount", 0));
      parts.push("-brightness-contrast", `0x${amount}`);
      break;
    }
    case "Normalize colors": {
      const strength = getNumberParam(functionParams, "normalizeStrength", 60);
      const gamma = Math.max(0.5, Math.min(2.5, 1 + (strength - 50) / 200));
      parts.push("-normalize", "-gamma", String(gamma));
      break;
    }
    case "Vignette": {
      const radius = Math.round(getNumberParam(functionParams, "vignetteRadius", 40));
      const softness = Math.round(getNumberParam(functionParams, "vignetteSoftness", 60));
      parts.push("-vignette", `${radius}x${softness}+5+5`);
      break;
    }
    case "Border": {
      const size = Math.round(getNumberParam(functionParams, "borderSize", 10));
      const color = getStringParam(functionParams, "borderColor", "black");
      parts.push("-bordercolor", quoteIfNeeded(color), "-border", `${size}x${size}`);
      break;
    }
    case "Rotate": {
      const autoOrient = functionParams.rotateAutoOrient === true;
      if (autoOrient) {
        parts.push("-auto-orient");
      } else {
        const degrees = Math.round(getNumberParam(functionParams, "rotateDegrees", 0));
        if (degrees !== 0) {
          parts.push("-rotate", String(degrees));
        }
      }
      break;
    }
    case "Scale / resize": {
      const width = getNumberParam(functionParams, "resizeWidth", NaN);
      const height = getNumberParam(functionParams, "resizeHeight", NaN);
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
      const text = getStringParam(functionParams, "textLogoText", "Your text");
      const position = getStringParam(functionParams, "textLogoPosition", "bottom-right");

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
      const overlayPath = getStringParam(functionParams, "composeOverlayPath", "overlay.png");
      const blendMode = getStringParam(functionParams, "composeBlendMode", "over");
      const opacity = Math.round(getNumberParam(functionParams, "composeOpacity", 100));

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
}: BuildSingleCliPipelineArgs): string {
  const inputBaseName = selectedFile ? getBaseName(selectedFile) : "photo.jpg";
  const lastOperation =
    operations.length > 0 ? operations[operations.length - 1] : undefined;
  const effectiveOutputParams = outputParams ?? lastOperation?.functionParams ?? {};
  const outputPath = buildOutputPath(effectiveOutputParams);

  const parts: string[] = ["magick", quoteIfNeeded(inputBaseName)];
  for (const operation of operations) {
    parts.push(
      ...buildSingleOperationArgs(operation.selectedFunction, operation.functionParams),
    );
  }
  parts.push(quoteIfNeeded(outputPath));
  return parts.join(" ");
}

export function buildSingleCliPreview({
  selectedFile,
  selectedFunction,
  functionParams,
}: BuildSingleCliPreviewArgs): string {
  return buildSingleCliPipeline({
    selectedFile,
    operations: [{ selectedFunction, functionParams }],
    outputParams: functionParams,
  });
}

