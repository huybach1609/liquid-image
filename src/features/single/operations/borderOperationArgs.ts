import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildBorderOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const size = Math.round(getNumberParam(effectiveParams, "borderSize", 10));
  const color = getStringParam(effectiveParams, "borderColor", "#ffffff");
  const isFrame = effectiveParams.borderIsFrame === true || effectiveParams.borderIsFrame === "true";
  const frameDepth = Math.round(getNumberParam(effectiveParams, "borderFrameDepth", 6));

  if (isFrame) {
    return ["-bordercolor", color, "-frame", `${frameDepth}x${frameDepth}`];
  }

  return ["-bordercolor", color, "-border", `${size}x${size}`];
}
