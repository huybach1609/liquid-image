import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildTextLogoOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const text = getStringParam(effectiveParams, "textLogoText", "Watermark");
  const font = getStringParam(effectiveParams, "textLogoFont", "Default");
  const size = getNumberParam(effectiveParams, "textLogoSize", 36);
  const angle = getNumberParam(effectiveParams, "textLogoAngle", 0);
  const gravity = getStringParam(
    effectiveParams,
    "textLogoGravity",
    "SouthEast",
  );
  const color = getStringParam(effectiveParams, "textLogoColor", "#ffffff");

  const args: string[] = [];

  if (font !== "Default") {
    args.push("-font", font);
  }

  args.push(
    "-pointsize",
    String(size),
    "-fill",
    color,
    "-gravity",
    gravity,
    "-annotate",
    angle === 0 ? "+10+10" : `${angle}x${angle}+10+10`,
    text,
  );

  return args;
}
