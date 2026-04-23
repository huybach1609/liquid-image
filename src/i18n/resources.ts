import enCommon from "@/locales/en/common.json";
import enSingle from "@/locales/en/single.json";
import enBatch from "@/locales/en/batch.json";
import viCommon from "@/locales/vi/common.json";
import viSingle from "@/locales/vi/single.json";
import viBatch from "@/locales/vi/batch.json";

export const defaultNS = "common" as const;

export const namespaces = [defaultNS, "single", "batch"] as const;

export const resources = {
  en: { common: enCommon, single: enSingle, batch: enBatch },
  vi: { common: viCommon, single: viSingle, batch: viBatch },
} as const;

export type AppLocale = keyof typeof resources;

export const supportedLocales = Object.keys(resources) as AppLocale[];
