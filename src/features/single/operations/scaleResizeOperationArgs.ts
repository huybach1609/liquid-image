import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildScaleResizeOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const width = getNumberParam(effectiveParams, "resizeWidth", 1920);
  const height = getNumberParam(effectiveParams, "resizeHeight", 1080);
  const keepRatio = effectiveParams.resizeKeepRatio !== false && effectiveParams.resizeKeepRatio !== "false";
  const method = getStringParam(effectiveParams, "resizeMethod", "resize");

  const geometry = `${width}x${height}${keepRatio ? "" : "!"}`;
  
  const flag = method === "thumbnail" ? "-thumbnail" : method === "sample" ? "-sample" : "-resize";
  
  return [flag, geometry];
}
