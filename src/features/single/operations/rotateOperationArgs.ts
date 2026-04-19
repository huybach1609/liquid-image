import { getNumberParam } from "@/lib/functionParams";

export function buildRotateOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const autoOrient = effectiveParams.rotateAutoOrient === true;
  if (autoOrient) {
    return ["-auto-orient"];
  }
  const degrees = Math.round(getNumberParam(effectiveParams, "rotateDegrees", 0));
  if (degrees === 0) {
    return [];
  }
  return ["-rotate", String(degrees)];
}
