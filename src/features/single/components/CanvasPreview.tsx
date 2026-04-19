import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { SquareSplitHorizontal } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
import ReactCrop, { type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type Point = { x: number; y: number };
type DragStart = {
  pointerX: number;
  pointerY: number;
  offsetX: number;
  offsetY: number;
};

/** Rectangle in **natural** pixels of the preview proxy (`originUrl` image). */
export type NaturalCropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CanvasPreviewProps = {
  originUrl: string | null;
  previewUrl: string | null;
  isPending: boolean;
  /** True while the temp proxy file is being created (no `originUrl` yet). */
  isSourcePreparing?: boolean;
  error: string | null;
  zoomPercent: number;
  onZoomChange: (nextZoom: number) => void;
  /**
   * When set, shows `react-image-crop` on the proxy/origin image (Crop → free method).
   * Coordinates are written via `onFreeCropComplete` in natural proxy pixels (same space as `cropX`…`cropH`).
   */
  freeCrop?: {
    enabled: boolean;
    aspect?: number;
    natural: NaturalCropRect;
    onComplete: (rect: NaturalCropRect) => void;
  };
};

const ZOOM_MIN = 25;
const ZOOM_MAX = 300;
const ZOOM_STEP = 10;
const DEFAULT_PAN_OFFSET: Point = { x: 0, y: 0 };

function objectContainMetrics(
  elW: number,
  elH: number,
  naturalW: number,
  naturalH: number,
) {
  if (
    naturalW <= 0 ||
    naturalH <= 0 ||
    elW <= 0 ||
    elH <= 0 ||
    !Number.isFinite(naturalW) ||
    !Number.isFinite(naturalH)
  ) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.min(elW / naturalW, elH / naturalH);
  const drawnW = naturalW * scale;
  const drawnH = naturalH * scale;
  const offsetX = (elW - drawnW) / 2;
  const offsetY = (elH - drawnH) / 2;
  return { scale, offsetX, offsetY };
}

function naturalToPixelCrop(
  r: NaturalCropRect,
  elW: number,
  elH: number,
  naturalW: number,
  naturalH: number,
): PixelCrop {
  const { scale, offsetX, offsetY } = objectContainMetrics(
    elW,
    elH,
    naturalW,
    naturalH,
  );
  return {
    unit: "px",
    x: offsetX + r.x * scale,
    y: offsetY + r.y * scale,
    width: r.width * scale,
    height: r.height * scale,
  };
}

function pixelCropToNatural(
  crop: PixelCrop,
  elW: number,
  elH: number,
  naturalW: number,
  naturalH: number,
): NaturalCropRect {
  const { scale, offsetX, offsetY } = objectContainMetrics(
    elW,
    elH,
    naturalW,
    naturalH,
  );
  if (scale <= 0 || !Number.isFinite(scale)) {
    return { x: 0, y: 0, width: naturalW, height: naturalH };
  }
  const x = Math.round((crop.x - offsetX) / scale);
  const y = Math.round((crop.y - offsetY) / scale);
  const width = Math.round(crop.width / scale);
  const height = Math.round(crop.height / scale);
  const maxW = Math.max(1, naturalW);
  const maxH = Math.max(1, naturalH);
  const cx = Math.max(0, Math.min(x, maxW - 1));
  const cy = Math.max(0, Math.min(y, maxH - 1));
  const cw = Math.max(1, Math.min(width, maxW - cx));
  const ch = Math.max(1, Math.min(height, maxH - cy));
  return { x: cx, y: cy, width: cw, height: ch };
}

function fullNaturalRect(naturalW: number, naturalH: number): NaturalCropRect {
  const w = Math.max(1, Math.round(naturalW));
  const h = Math.max(1, Math.round(naturalH));
  return { x: 0, y: 0, width: w, height: h };
}

export function CanvasPreview({
  originUrl,
  previewUrl,
  isPending,
  isSourcePreparing = false,
  error,
  zoomPercent,
  onZoomChange,
  freeCrop,
}: CanvasPreviewProps) {
  const [compareMode, setCompareMode] = useState<"preview" | "split">(
    "preview",
  );
  const [splitPercent, setSplitPercent] = useState(50);
  const [panOffset, setPanOffset] = useState<Point>(DEFAULT_PAN_OFFSET);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<DragStart | null>(null);
  const freeCropImgRef = useRef<HTMLImageElement | null>(null);
  const [freeCropPixel, setFreeCropPixel] = useState<PixelCrop | undefined>(
    undefined,
  );
  const [freeCropDragging, setFreeCropDragging] = useState(false);
  const hasSource = Boolean(originUrl);
  const hasPreview = Boolean(previewUrl);
  const canCompare = hasSource && hasPreview;
  const canPan = zoomPercent > 100;

  const splitClip = useMemo(
    () => `inset(0 ${100 - splitPercent}% 0 0)`,
    [splitPercent],
  );
  const zoomScale = zoomPercent / 100;
  const cursorClass = canPan
    ? isDragging
      ? "cursor-grabbing"
      : "cursor-grab"
    : "cursor-default";

  useEffect(() => {
    setPanOffset(DEFAULT_PAN_OFFSET);
  }, [originUrl]);

  useEffect(() => {
    if (zoomPercent <= 100) {
      setPanOffset(DEFAULT_PAN_OFFSET);
    }
  }, [zoomPercent]);

  const applyNaturalToFreeCropPixel = useCallback(() => {
    const img = freeCropImgRef.current;
    if (!img || !freeCrop?.enabled || img.naturalWidth <= 0) {
      return;
    }
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const elW = img.clientWidth;
    const elH = img.clientHeight;
    const natural =
      freeCrop.natural.width > 0 && freeCrop.natural.height > 0
        ? freeCrop.natural
        : fullNaturalRect(nw, nh);
    setFreeCropPixel(naturalToPixelCrop(natural, elW, elH, nw, nh));
  }, [freeCrop]);

  useLayoutEffect(() => {
    if (!freeCrop?.enabled) {
      setFreeCropPixel(undefined);
      setFreeCropDragging(false);
    }
  }, [freeCrop?.enabled]);

  useLayoutEffect(() => {
    if (!freeCrop?.enabled || freeCropDragging) {
      return;
    }
    applyNaturalToFreeCropPixel();
  }, [
    freeCrop?.enabled,
    freeCrop?.natural?.x,
    freeCrop?.natural?.y,
    freeCrop?.natural?.width,
    freeCrop?.natural?.height,
    freeCropDragging,
    originUrl,
    applyNaturalToFreeCropPixel,
  ]);

  useEffect(() => {
    if (!freeCrop?.enabled) {
      return;
    }
    const img = freeCropImgRef.current;
    if (!img) {
      return;
    }
    const ro = new ResizeObserver(() => {
      if (!freeCropDragging) {
        applyNaturalToFreeCropPixel();
      }
    });
    ro.observe(img);
    return () => ro.disconnect();
  }, [
    freeCrop?.enabled,
    freeCropDragging,
    applyNaturalToFreeCropPixel,
  ]);

  const stopDragging = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDragging) {
        return;
      }
      setIsDragging(false);
      dragStartRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [isDragging],
  );

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-preview-control='true']")) {
        return;
      }
      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      const nextZoom = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, zoomPercent + direction * ZOOM_STEP),
      );
      if (nextZoom === zoomPercent) {
        return;
      }

      const currentTarget = event.currentTarget;
      const rect = currentTarget.getBoundingClientRect();
      const cursorX = event.clientX - rect.left - rect.width / 2;
      const cursorY = event.clientY - rect.top - rect.height / 2;
      const ratio = nextZoom / zoomPercent;

      setPanOffset((prev) => ({
        x: cursorX - (cursorX - prev.x) * ratio,
        y: cursorY - (cursorY - prev.y) * ratio,
      }));
      onZoomChange(nextZoom);
    },
    [onZoomChange, zoomPercent],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-preview-control='true']")) {
        return;
      }
      if (!canPan || event.button !== 0) {
        return;
      }
      event.preventDefault();
      dragStartRef.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        offsetX: panOffset.x,
        offsetY: panOffset.y,
      };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [canPan, panOffset.x, panOffset.y],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !dragStartRef.current) {
        return;
      }
      const deltaX = event.clientX - dragStartRef.current.pointerX;
      const deltaY = event.clientY - dragStartRef.current.pointerY;
      setPanOffset({
        x: dragStartRef.current.offsetX + deltaX,
        y: dragStartRef.current.offsetY + deltaY,
      });
    },
    [isDragging],
  );

  const handleSetPreviewMode = useCallback(() => setCompareMode("preview"), []);
  const handleSetSplitMode = useCallback(() => setCompareMode("split"), []);
  const handleFit = useCallback(() => onZoomChange(100), [onZoomChange]);

  if (isSourcePreparing) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 border border-border/40 bg-background">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Preparing preview…
        </p>
      </div>
    );
  }

  if (!hasSource) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center border border-border/40 bg-background text-center">
        <p className="text-sm text-muted-foreground">
          Drop image or click to open
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          png · jpg · gif · webp · tiff · bmp
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden border border-border/40 bg-background ${cursorClass}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onPointerLeave={stopDragging}
    >
      <div
        className="absolute inset-0 touch-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
          transformOrigin: "center",
        }}
      >
        {/*
          In "preview" mode with a processed image, do not stack origin + preview: both use
          object-contain in the same box but different intrinsic sizes (e.g. after -shave) get
          different letterboxing/scale and misalign — looks like a torn/double image. Split mode
          still draws both for A/B compare.

          Free Crop: always draw the proxy with react-image-crop; optional preview overlay
          (pointer-events none) so compare modes still make sense.
        */}
        {freeCrop?.enabled ? (
          <>
            <div
              className="relative z-20 flex h-full w-full max-h-full max-w-full items-center justify-center"
              data-preview-control="true"
            >
              <ReactCrop
                className="flex max-h-full max-w-full items-center justify-center"
                crop={freeCropPixel}
                aspect={freeCrop.aspect}
                ruleOfThirds
                onDragStart={() => setFreeCropDragging(true)}
              onDragEnd={() => setFreeCropDragging(false)}
              onChange={(c) => setFreeCropPixel(c)}
              onComplete={(c) => {
                const img = freeCropImgRef.current;
                if (!img || img.naturalWidth <= 0) {
                  return;
                }
                freeCrop.onComplete(
                  pixelCropToNatural(
                    c,
                    img.clientWidth,
                    img.clientHeight,
                    img.naturalWidth,
                    img.naturalHeight,
                  ),
                );
              }}
            >
              <img
                ref={freeCropImgRef}
                src={originUrl ?? undefined}
                alt="Original"
                className="max-h-full max-w-full object-contain"
                draggable={false}
                onLoad={applyNaturalToFreeCropPixel}
              />
              </ReactCrop>
            </div>

            {compareMode === "split" && canCompare ? (
              <>
                <img
                  key={previewUrl ?? "preview"}
                  src={previewUrl ?? undefined}
                  alt="Preview"
                  className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
                  style={{ clipPath: splitClip }}
                  draggable={false}
                />
                <div
                  className="pointer-events-none absolute inset-y-0 z-10 border-r border-primary/80"
                  style={{ left: `${splitPercent}%` }}
                />
              </>
            ) : null}

            {compareMode === "preview" && hasPreview ? (
              <img
                key={previewUrl}
                src={previewUrl ?? undefined}
                alt="Preview"
                className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain opacity-55"
                draggable={false}
              />
            ) : null}
          </>
        ) : (
          <>
            {!(compareMode === "preview" && hasPreview) ? (
              <img
                src={originUrl ?? undefined}
                alt="Original"
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : null}

            {compareMode === "split" && canCompare ? (
              <>
                <img
                  key={previewUrl ?? "preview"}
                  src={previewUrl ?? undefined}
                  alt="Preview"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                  style={{ clipPath: splitClip }}
                  draggable={false}
                />
                <div
                  className="pointer-events-none absolute inset-y-0 z-10 border-r border-primary/80"
                  style={{ left: `${splitPercent}%` }}
                />
              </>
            ) : null}

            {compareMode === "preview" && hasPreview ? (
              <img
                key={previewUrl}
                src={previewUrl ?? undefined}
                alt="Preview"
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : null}
          </>
        )}
      </div>

      <div
        className="absolute right-3 top-3 z-20 flex items-center gap-2"
        data-preview-control="true"
      >
        <Button
          size="sm"
          type="button"
          className={
            compareMode === "split"
              ? "border-primary bg-primary/35 text-primary backdrop-blur-2xl size-7"
              : "border-border bg-background text-muted-foreground size-7"
          }
          onClick={
            compareMode === "split"
              ? handleSetPreviewMode
              : handleSetSplitMode
          }
        >
          <SquareSplitHorizontal className="size-4" strokeWidth={3} />
        </Button>
      </div>

      {compareMode === "split" && canCompare ? (
        <div
          className="absolute left-3 bottom-3 z-20 w-44 rounded-md bg-background/90 p-2"
          data-preview-control="true"
        >
          <Slider
            value={[splitPercent]}
            onValueChange={(value) => setSplitPercent(value[0])}
            max={100}
            step={1}
            className="mx-auto w-full max-w-xs"
          />
        </div>
      ) : null}

      <div
        className="absolute right-3 bottom-3 z-20 flex gap-2"
        data-preview-control="true"
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="px-3 text-xs backdrop-blur-2xl"
          disabled
        >
          {zoomPercent}%
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="px-3 text-xs backdrop-blur-2xl"
          onClick={handleFit}
        >
          Fit
        </Button>
      </div>

      {isPending ? (
        <div className="absolute left-3 bottom-3 z-20 rounded-md border border-border bg-background/90 px-2 py-1 text-xs text-muted-foreground">
          Rendering preview...
        </div>
      ) : null}

      {error ? (
        <div className="absolute left-3 bottom-3 z-20 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}
