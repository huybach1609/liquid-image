import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildComposeOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const overlayPath = getStringParam(
    effectiveParams,
    "composeOverlayPath",
    "overlay.png",
  );
  const blendMode = getStringParam(effectiveParams, "composeBlendMode", "Over");
  const opacity = getNumberParam(effectiveParams, "composeOpacity", 100);
  const x = getNumberParam(effectiveParams, "composeOffsetX", 0);
  const y = getNumberParam(effectiveParams, "composeOffsetY", 0);

  const geometry = `${x >= 0 ? "+" : ""}${x}${y >= 0 ? "+" : ""}${y}`;

  return [
    overlayPath,
    "-gravity", "NorthWest", // Use NorthWest so offsets are predictable from top-left
    "-compose", blendMode,
    "-define", `compose:args=${opacity}`,
    "-geometry", geometry,
    "-composite",
  ];
}
