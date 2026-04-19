import { getNumberParam, getStringParam } from "@/lib/functionParams";

import { quoteCliToken } from "./quoteCli";

export function buildComposeOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const overlayPath = getStringParam(
    effectiveParams,
    "composeOverlayPath",
    "overlay.png",
  );
  const blendMode = getStringParam(effectiveParams, "composeBlendMode", "over");
  const opacity = Math.round(getNumberParam(effectiveParams, "composeOpacity", 100));

  return [
    quoteCliToken(overlayPath),
    "-gravity",
    "SouthEast",
    "-compose",
    blendMode,
    "-define",
    `compose:args=${Math.max(0, Math.min(1, opacity / 100))}`,
    "-composite",
  ];
}
