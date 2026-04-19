/** Shared readers for `Record<string, unknown>` function UI / CLI params. */

export function getStringParam(
  params: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const v = params[key];
  return typeof v === "string" && v.trim().length > 0 ? v : fallback;
}

export function getNumberParam(
  params: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const v = params[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim().length > 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}
