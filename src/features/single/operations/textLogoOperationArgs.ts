import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildTextLogoOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const text = getStringParam(effectiveParams, "textLogoText", "Watermark");
  const font = getStringParam(effectiveParams, "textLogoFont", "Arial");
  const size = getNumberParam(effectiveParams, "textLogoSize", 36);
  const angle = getNumberParam(effectiveParams, "textLogoAngle", 0);
  const gravity = getStringParam(effectiveParams, "textLogoGravity", "SouthEast");
  const color = getStringParam(effectiveParams, "textLogoColor", "#ffffff");

  return [
    "-font", font,
    "-pointsize", String(size),
    "-fill", color,
    "-gravity", gravity,
    "-annotate", `${angle}x${angle}+10+10`,
    text,
  ];
}
