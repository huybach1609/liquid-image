import { useTranslation } from "react-i18next";

/**
 * `single` JSON is large; i18next's inferred `t()` key union can omit deeper paths
 * (e.g. `mirrorForm.*`, `cropForm.*`). Use this hook in those panels so keys type-check.
 */
export function useSingleT() {
  const r = useTranslation("single");
  return {
    ...r,
    t: r.t as (key: string, options?: Record<string, unknown>) => string,
  };
}
