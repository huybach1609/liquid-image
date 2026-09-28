import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type WheelEvent,
  type PointerEvent,
} from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { createImageProxy } from "@/shared/tauri/commands";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon } from "lucide-react";

const FALLBACK_EXTENSIONS = new Set([
  "heic",
  "heif",
  "psd",
  "raw",
  "cr2",
  "nef",
  "arw",
  "dng",
  "tiff",
  "tif",
]);

export function ViewerCanvas() {
  const currentImagePath = useViewerStore((s) => s.currentImagePath);
  const zoomLevel = useViewerStore((s) => s.zoomLevel);
  const rotation = useViewerStore((s) => s.rotation);
  const panOffset = useViewerStore((s) => s.panOffset);
  const proxyUrl = useViewerStore((s) => s.proxyUrl);
  const imageDimensions = useViewerStore((s) => s.imageDimensions);

  const zoomAtPoint = useViewerStore((s) => s.zoomAtPoint);
  const setPanOffset = useViewerStore((s) => s.setPanOffset);
  const resetView = useViewerStore((s) => s.resetView);
  const setZoom = useViewerStore((s) => s.setZoom);
  const setImageDimensions = useViewerStore((s) => s.setImageDimensions);
  const setProxyUrl = useViewerStore((s) => s.setProxyUrl);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [isLoadingProxy, setIsLoadingProxy] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset loading state when image path changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [currentImagePath, proxyUrl]);

  // Check if format needs proxy fallback upfront
  useEffect(() => {
    if (!currentImagePath) return;
    setHasError(false);

    const ext = currentImagePath.split(".").pop()?.toLowerCase();
    if (ext && FALLBACK_EXTENSIONS.has(ext)) {
      setIsLoadingProxy(true);
      createImageProxy(currentImagePath)
        .then((proxyPath) => {
          setProxyUrl(convertFileSrc(proxyPath));
        })
        .catch((err) => {
          console.error("[ViewerCanvas] Failed to create proxy for raw/psd image", err);
          setHasError(true);
        })
        .finally(() => {
          setIsLoadingProxy(false);
        });
    }
  }, [currentImagePath, setProxyUrl]);

  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const delta = -Math.sign(e.deltaY);
      zoomAtPoint(delta, e.clientX, e.clientY, rect);
    },
    [zoomAtPoint]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return; // Only primary button
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: panOffset.x,
        offsetY: panOffset.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [panOffset]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanOffset({
        x: dragStartRef.current.offsetX + dx,
        y: dragStartRef.current.offsetY + dy,
      });
    },
    [isDragging, setPanOffset]
  );

  const stopDragging = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (isDragging) {
        setIsDragging(false);
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    },
    [isDragging]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (zoomLevel > 1.0) {
        resetView();
      } else {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        zoomAtPoint(1, e.clientX, e.clientY, rect);
        setZoom(2.0);
      }
    },
    [zoomLevel, resetView, zoomAtPoint, setZoom]
  );

  const handleImageError = useCallback(() => {
    if (!currentImagePath || proxyUrl) {
      setHasError(true);
      return;
    }

    // Try fallback to ImageMagick proxy once
    setIsLoadingProxy(true);
    createImageProxy(currentImagePath)
      .then((proxyPath) => {
        setProxyUrl(convertFileSrc(proxyPath));
      })
      .catch((err) => {
        console.error("[ViewerCanvas] Image load and proxy fallback failed", err);
        setHasError(true);
      })
      .finally(() => {
        setIsLoadingProxy(false);
      });
  }, [currentImagePath, proxyUrl, setProxyUrl]);

  if (!currentImagePath) {
    return null;
  }

  const imageSrc = proxyUrl || convertFileSrc(currentImagePath);

  const cursorClass =
    zoomLevel > 1.0 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default";

  return (
    <div
      ref={containerRef}
      className={`relative size-full overflow-hidden select-none touch-none flex items-center justify-center ${cursorClass}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onDoubleClick={handleDoubleClick}
    >
      {hasError ? (
        <div className="flex flex-col items-center justify-center gap-2 text-destructive">
          <p className="text-sm font-semibold">Unable to display image</p>
          <p className="text-xs text-muted-foreground font-mono max-w-sm text-center">
            {currentImagePath}
          </p>
        </div>
      ) : (
        <>
          {/* Skeleton Placeholder when image or proxy is loading */}
          {(isLoadingProxy || isImageLoading) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none">
              <div
                className="relative rounded-2xl overflow-hidden border border-border/40 bg-muted/30 backdrop-blur-sm flex items-center justify-center shadow-xl transition-all"
                style={{
                  width: imageDimensions?.width ? `min(85vw, ${imageDimensions.width}px)` : "min(72vw, 820px)",
                  height: imageDimensions?.height ? `min(80vh, ${imageDimensions.height}px)` : "min(68vh, 540px)",
                  aspectRatio: imageDimensions ? `${imageDimensions.width} / ${imageDimensions.height}` : "16 / 10",
                }}
              >
                <Skeleton className="absolute inset-0 size-full bg-muted/40" />
                <div className="relative z-10 flex flex-col items-center justify-center gap-3 text-muted-foreground/50">
                  <ImageIcon className="size-12 stroke-[1.2] animate-pulse" />
                  <div className="h-1.5 w-24 rounded-full bg-muted-foreground/20 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Canvas Transform Container */}
          <div
            className="relative max-h-full max-w-full flex items-center justify-center will-change-transform"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.12s cubic-bezier(0, 0, 0.2, 1)",
            }}
          >
            <img
              key={imageSrc}
              src={imageSrc}
              alt="Viewer Display"
              draggable={false}
              className={`max-h-[85vh] max-w-[90vw] object-contain pointer-events-none select-none shadow-2xl shadow-black/20 dark:shadow-black/60 transition-opacity duration-200 ease-out ${
                isImageLoading || isLoadingProxy ? "opacity-0" : "opacity-100"
              }`}
              onLoad={(e) => {
                const img = e.currentTarget;
                setImageDimensions({
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
                setIsImageLoading(false);
              }}
              onError={() => {
                setIsImageLoading(false);
                handleImageError();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
