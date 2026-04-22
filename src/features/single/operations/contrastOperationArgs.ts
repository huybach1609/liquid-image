import { getNumberParam, getStringParam } from "@/lib/functionParams";

export function buildContrastOperationArgs(
  effectiveParams: Record<string, unknown>,
): string[] {
  const mode = getStringParam(effectiveParams, "contrastMode", "bc");
  const contrast = getNumberParam(effectiveParams, "contrastAmount", 0);
  const brightness = getNumberParam(effectiveParams, "brightnessAmount", 0);

  switch (mode) {
    case "bc":
      return ["-brightness-contrast", `${brightness}x${contrast}`];
    case "sig": {
      const mid = Math.round(50 + contrast * 0.3);
      return ["-sigmoidal-contrast", `${Math.abs(contrast)}x${mid}%`];
    }
    case "stretch": {
      const bp = Math.max(0, -contrast);
      const wp = Math.max(0, contrast);
      return ["-contrast-stretch", `${bp}x${wp}`];
    }
    case "level": {
      const bl = Math.max(0, -contrast * 0.5).toFixed(0);
      const wl = Math.min(100, 100 - contrast * 0.3).toFixed(0);
      return ["-level", `${bl}%,${wl}%,1.0`];
    }
    case "clahe":
      return ["-clahe", "25x25%+128+3"];
    case "norm":
      return ["-normalize"];
    default:
      return ["-brightness-contrast", `0x${contrast}`];
  }
}
