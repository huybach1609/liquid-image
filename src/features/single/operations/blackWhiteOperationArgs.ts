import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildBlackWhiteOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const method = getStringParam(effectiveParams, "bwMethod", "gray");
  const intensity = getNumberParam(effectiveParams, "bwIntensity", 54);
  const dither = effectiveParams.bwDither === true || effectiveParams.bwDither === "true";
  const thresholdEnabled = effectiveParams.bwThresholdEnabled !== false && effectiveParams.bwThresholdEnabled !== "false";

  if (method === "mono") {
    return ["-monochrome"];
  }

  const args: string[] = [];
  
  if (method === "gray") {
    args.push("-colorspace", "Gray");
    if (dither) {
      args.push("-dither", "FloydSteinberg");
    }
  } else {
    // rec709 or rec601
    const grayscaleMethod = method === "rec709" ? "Rec709Luma" : "Rec601Luma";
    args.push("-grayscale", grayscaleMethod);
  }

  if (thresholdEnabled) {
    args.push("-threshold", `${intensity}%`);
  }

  return args;
}
