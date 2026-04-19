import { getStringParam } from "@/lib/functionParams";

export function buildMirrorOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const axis = getStringParam(effectiveParams, "mirrorAxis", "Horizontal");
  if (axis === "Horizontal") {
    return ["-flop"];
  }
  if (axis === "Vertical") {
    return ["-flip"];
  }
  if (axis === "Both") {
    return ["-flop", "-flip"];
  }
  return [];
}
