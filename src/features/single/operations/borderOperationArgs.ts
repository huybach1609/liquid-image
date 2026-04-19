import { getNumberParam, getStringParam } from "@/lib/functionParams";

import { quoteCliToken } from "./quoteCli";

export function buildBorderOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const size = Math.round(getNumberParam(effectiveParams, "borderSize", 10));
  const color = getStringParam(effectiveParams, "borderColor", "black");
  return ["-bordercolor", quoteCliToken(color), "-border", `${size}x${size}`];
}
