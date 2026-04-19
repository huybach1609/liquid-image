import { getNumberParam } from "@/lib/functionParams";

export function buildContrastOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const amount = Math.round(getNumberParam(effectiveParams, "contrastAmount", 0));
  return ["-brightness-contrast", `0x${amount}`];
}
