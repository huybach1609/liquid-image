import "i18next";

import enCommon from "../locales/en/common.json";
import enSingle from "../locales/en/single.json";
import enBatch from "../locales/en/batch.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof enCommon;
      single: typeof enSingle;
      batch: typeof enBatch;
    };
  }
}
