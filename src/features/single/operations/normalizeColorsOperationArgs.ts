import { getNumberParam } from "@/lib/functionParams";

export function buildNormalizeColorsOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const strength = getNumberParam(effectiveParams, "normalizeStrength", 60);
  const gamma = Math.max(0.5, Math.min(2.5, 1 + (strength - 50) / 200));
  return ["-normalize", "-gamma", String(gamma)];
}
