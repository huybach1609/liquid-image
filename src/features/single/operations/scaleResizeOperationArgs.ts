import { getNumberParam } from "@/lib/functionParams";

export function buildScaleResizeOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const width = getNumberParam(effectiveParams, "resizeWidth", NaN);
  const height = getNumberParam(effectiveParams, "resizeHeight", NaN);
  if (Number.isFinite(width) && Number.isFinite(height)) {
    return ["-resize", `${width}x${height}`];
  }
  if (Number.isFinite(width)) {
    return ["-resize", `${width}x`];
  }
  if (Number.isFinite(height)) {
    return ["-resize", `x${height}`];
  }
  return [];
}
