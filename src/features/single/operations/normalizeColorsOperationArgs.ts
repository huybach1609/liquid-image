import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildNormalizeColorsOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const method = getStringParam(effectiveParams, "normalizeMethod", "normalize");
  const strength = getNumberParam(effectiveParams, "normalizeStrength", 60);

  if (method === "auto-level") {
    return ["-auto-level"];
  }

  if (method === "auto-gamma") {
    return ["-auto-gamma"];
  }

  // default: normalize
  const gamma = Math.max(0.5, Math.min(2.5, 1 + (strength - 50) / 200));
  return ["-normalize", "-gamma", String(gamma)];
}
