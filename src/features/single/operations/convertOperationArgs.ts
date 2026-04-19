import { getNumberParam, getStringParam } from "@/lib/functionParams";

import { quoteCliToken } from "./quoteCli";

export function buildConvertOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const parts: string[] = [];
  const quality = getNumberParam(effectiveParams, "quality", 85);
  parts.push("-quality", String(quality));

  const stripMetadata = effectiveParams.stripMetadata;
  if (stripMetadata === true || stripMetadata === "true") {
    parts.push("-strip");
  }

  const profile = getStringParam(effectiveParams, "colorProfile", "sRGB");
  if (profile) {
    parts.push("-profile", quoteCliToken(profile));
  }
  return parts;
}
