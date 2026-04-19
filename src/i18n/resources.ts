import enCommon from "@/locales/en/common.json";
import enSingle from "@/locales/en/single.json";
import viCommon from "@/locales/vi/common.json";
import viSingle from "@/locales/vi/single.json";

export const defaultNS = "common" as const;

export const namespaces = [defaultNS, "single"] as const;

export const resources = {
  en: { common: enCommon, single: enSingle },
  vi: { common: viCommon, single: viSingle },
} as const;

export type AppLocale = keyof typeof resources;

export const supportedLocales = Object.keys(resources) as AppLocale[];
