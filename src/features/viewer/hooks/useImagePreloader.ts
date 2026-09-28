import { useEffect } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useViewerStore } from "@/features/viewer/state/viewer.store";

const WEB_SUPPORTED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "svg",
  "bmp",
  "ico",
]);

function isDirectRenderable(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase();
  return ext ? WEB_SUPPORTED_EXTENSIONS.has(ext) : false;
}

export function useImagePreloader() {
  const siblingImages = useViewerStore((s) => s.siblingImages);
  const currentIndex = useViewerStore((s) => s.currentIndex);

  useEffect(() => {
    if (!siblingImages || siblingImages.length <= 1) return;

    const total = siblingImages.length;
    const nextIdx = (currentIndex + 1) % total;
    const prevIdx = (currentIndex - 1 + total) % total;

    const preloadPaths = [siblingImages[nextIdx], siblingImages[prevIdx]];

    const imagesToPreload: HTMLImageElement[] = [];

    for (const path of preloadPaths) {
      if (path && isDirectRenderable(path)) {
        const img = new Image();
        img.src = convertFileSrc(path);
        imagesToPreload.push(img);
      }
    }

    return () => {
      for (const img of imagesToPreload) {
        img.src = "";
      }
    };
  }, [siblingImages, currentIndex]);
}
