import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildBorderOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const size = Math.round(getNumberParam(effectiveParams, "borderSize", 10));
  const color = getStringParam(effectiveParams, "borderColor", "black");
  return ["-bordercolor", color, "-border", `${size}x${size}`];
}
