import { getNumberParam } from "@/lib/functionParams";

export function buildVignetteOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const radius = Math.round(getNumberParam(effectiveParams, "vignetteRadius", 40));
  const softness = Math.round(getNumberParam(effectiveParams, "vignetteSoftness", 60));
  const x = Math.round(getNumberParam(effectiveParams, "vignetteOffsetX", 5));
  const y = Math.round(getNumberParam(effectiveParams, "vignetteOffsetY", 5));
  
  const geometry = `${x >= 0 ? "+" : ""}${x}${y >= 0 ? "+" : ""}${y}`;
  return ["-vignette", `${radius}x${softness}${geometry}`];
}
