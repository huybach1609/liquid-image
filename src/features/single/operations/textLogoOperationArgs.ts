import { getStringParam } from "@/lib/functionParams";

export function buildTextLogoOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const text = getStringParam(effectiveParams, "textLogoText", "Your text");
  const position = getStringParam(
    effectiveParams,
    "textLogoPosition",
    "bottom-right",
  );

  const gravity =
    position === "bottom-left"
      ? "SouthWest"
      : position === "center"
        ? "Center"
        : "SouthEast";

  const x = position === "center" ? 0 : 20;
  const y = position === "center" ? 0 : 20;

  return [
    "-font",
    "Helvetica",
    "-pointsize",
    "48",
    "-fill",
    "white",
    "-gravity",
    gravity,
    "-annotate",
    `+${x}+${y}`,
    text,
  ];
}
