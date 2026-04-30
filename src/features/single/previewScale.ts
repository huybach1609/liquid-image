export function previewMaxEdgeFromSetting(setting: string): number {
  switch (setting) {
    case "800px":
      return 800;
    case "1200px":
      return 1200;
    case "full":
      return 99999;
    default:
      return 1200;
  }
}

/** Must match `PREVIEW_TARGET` in `magick-service.rs` (`create_image_proxy`). */
export const PROXY_PREVIEW_MAX_EDGE = 1200;

/**
 * Approximate pixel size of the WebP proxy (`-thumbnail WxH>`), used when decoded
 * preview dimensions are not available yet.
 */
export function estimateProxyDimensions(
  fullWidth: number,
  fullHeight: number,
  maxResolution: string = "1200px",
): { width: number; height: number } {
  const max = previewMaxEdgeFromSetting(maxResolution);
  if (
    !Number.isFinite(fullWidth) ||
    !Number.isFinite(fullHeight) ||
    fullWidth <= 0 ||
    fullHeight <= 0
  ) {
    return { width: 1, height: 1 };
  }
  if (fullWidth <= max && fullHeight <= max) {
    return { width: Math.round(fullWidth), height: Math.round(fullHeight) };
  }
  const s = Math.min(max / fullWidth, max / fullHeight);
  return {
    width: Math.max(1, Math.round(fullWidth * s)),
    height: Math.max(1, Math.round(fullHeight * s)),
  };
}

/**
 * Map **free-crop** geometry from proxy/preview pixels to full-resolution input pixels.
 * Shave and trim are not scaled here (shave UI is always full-res px; trim uses %).
 */
export type PreviewToFullImageScale = {
  fullWidth: number;
  fullHeight: number;
  previewWidth: number;
  previewHeight: number;
};
