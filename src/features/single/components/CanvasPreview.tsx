import { Slider } from "@/components/ui/slider";
import { Button } from "@/shared/components/ui/button";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";

type Point = { x: number; y: number };
type DragStart = {
  pointerX: number;
  pointerY: number;
  offsetX: number;
  offsetY: number;
};

type CanvasPreviewProps = {
  originUrl: string | null;
  previewUrl: string | null;
  isPending: boolean;
  error: string | null;
  zoomPercent: number;
  onZoomChange: (nextZoom: number) => void;
};

const ZOOM_MIN = 25;
const ZOOM_MAX = 300;
const ZOOM_STEP = 10;
const DEFAULT_PAN_OFFSET: Point = { x: 0, y: 0 };

export function CanvasPreview({
  originUrl,
  previewUrl,
  isPending,
  error,
  zoomPercent,
  onZoomChange,
}: CanvasPreviewProps) {
  const [compareMode, setCompareMode] = useState<"preview" | "split">(
    "preview",
  );
  const [splitPercent, setSplitPercent] = useState(50);
  const [panOffset, setPanOffset] = useState<Point>(DEFAULT_PAN_OFFSET);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<DragStart | null>(null);
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

  const stopDragging = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }
    setIsDragging(false);
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, [isDragging]);

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

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) {
      return;
    }
    const deltaX = event.clientX - dragStartRef.current.pointerX;
    const deltaY = event.clientY - dragStartRef.current.pointerY;
    setPanOffset({
      x: dragStartRef.current.offsetX + deltaX,
      y: dragStartRef.current.offsetY + deltaY,
    });
  }, [isDragging]);

  const handleSetPreviewMode = useCallback(() => setCompareMode("preview"), []);
  const handleSetSplitMode = useCallback(() => setCompareMode("split"), []);
  const handleFit = useCallback(() => onZoomChange(100), [onZoomChange]);

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
        <img
          src={originUrl ?? undefined}
          alt="Original"
          className="h-full w-full object-contain"
          draggable={false}
        />

        {compareMode === "split" && canCompare ? (
          <>
            <img
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
            src={previewUrl ?? undefined}
            alt="Preview"
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        ) : null}
      </div>

      <div
        className="absolute right-3 top-3 z-20 flex items-center gap-2"
        data-preview-control="true"
      >
        <Button
          size="sm"
          type="button"
          className={
            compareMode === "preview"
              ? "border-primary bg-primary/35 text-primary backdrop-blur-2xl"
              : "border-border bg-background text-muted-foreground "
          }
          onClick={handleSetPreviewMode}
          disabled={!hasPreview}
        >
          Preview
        </Button>
        <Button
          size="sm"
          type="button"
          className={
            compareMode === "split"
              ? "border-primary bg-primary/35 text-primary backdrop-blur-2xl"
              : "border-border bg-background text-muted-foreground"
          }
          onClick={handleSetSplitMode}
          disabled={!canCompare}
        >
          Split
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
