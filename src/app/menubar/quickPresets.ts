import type { BatchPipelineStep } from "@/features/batch/types";

/**
 * Pre-defined quick presets shared between WebMenubar and useMenubarBridge.
 * Each preset is an array of pipeline steps applied instantly to the batch pipeline.
 */
export const QUICK_PRESETS: Record<string, BatchPipelineStep[]> = {
  webOptimise: [
    {
      id: "preset-web",
      functionId: "Convert",
      enabled: true,
      isExpanded: true,
      params: { outputFormat: "WEBP", quality: 80, stripMetadata: true },
    },
  ],
  thumbnail200: [
    {
      id: "preset-thumb-scale",
      functionId: "Scale / resize",
      enabled: true,
      isExpanded: true,
      params: {
        resizeWidth: 200,
        resizeHeight: 200,
        resizeKeepRatio: true,
        resizeMethod: "thumbnail",
      },
    },
    {
      id: "preset-thumb-convert",
      functionId: "Convert",
      enabled: true,
      isExpanded: true,
      params: { outputFormat: "JPEG", quality: 85, stripMetadata: true },
    },
  ],
  bwFilm: [
    {
      id: "preset-bw",
      functionId: "Black & white",
      enabled: true,
      isExpanded: true,
      params: { bwMethod: "rec709", bwThresholdEnabled: false },
    },
    {
      id: "preset-contrast",
      functionId: "Contrast",
      enabled: true,
      isExpanded: true,
      params: { contrastAmount: 15 },
    },
  ],
  watermark: [
    {
      id: "preset-watermark",
      functionId: "Text / logo",
      enabled: true,
      isExpanded: true,
      params: {
        textLogoText: "Liquid Image",
        textLogoSize: 28,
        textLogoGravity: "SouthEast",
        textLogoColor: "#ffffff",
      },
    },
  ],
};
