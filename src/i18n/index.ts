import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { LOCALE_STORAGE_KEY } from "@/i18n/constants";
import {
  defaultNS,
  namespaces,
  resources,
  supportedLocales,
} from "@/i18n/resources";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: supportedLocales,
    load: "languageOnly",
    defaultNS,
    ns: [...namespaces],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ["localStorage"],
    },
  });

export { i18n };
