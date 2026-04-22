import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildRotateOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const autoOrient = effectiveParams.rotateAutoOrient === true || effectiveParams.rotateAutoOrient === "true";
  const background = getStringParam(effectiveParams, "rotateBackground", "none");
  const degrees = Math.round(getNumberParam(effectiveParams, "rotateDegrees", 0));

  const args: string[] = [];
  
  if (autoOrient) {
    args.push("-auto-orient");
  }

  if (background !== "none") {
    args.push("-background", background);
  }

  if (degrees !== 0 || !autoOrient) {
    args.push("-rotate", String(degrees));
  }

  return args;
}
