import { getNumberParam } from "@/lib/functionParams";

export function buildBlackWhiteOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const intensity = Math.round(getNumberParam(effectiveParams, "bwIntensity", 80));
  const threshold = Math.max(0, Math.min(100, intensity));
  return ["-colorspace", "Gray", "-threshold", `${threshold}%`];
}
