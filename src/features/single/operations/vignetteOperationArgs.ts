import { getNumberParam } from "@/lib/functionParams";

export function buildVignetteOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const radius = Math.round(getNumberParam(effectiveParams, "vignetteRadius", 40));
  const softness = Math.round(getNumberParam(effectiveParams, "vignetteSoftness", 60));
  return ["-vignette", `${radius}x${softness}+5+5`];
}
