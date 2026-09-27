import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { useAppStore } from "@/app/store/app.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { getFileNameFromPath } from "@/features/single/pathUtils";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Edit3,
  Ratio,
  SunMoon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

type ViewerHudProps = {
  isHudVisible: boolean;
  onMouseEnterHud: () => void;
  onMouseLeaveHud: () => void;
};

export function ViewerHud({ isHudVisible, onMouseEnterHud, onMouseLeaveHud }: ViewerHudProps) {
  const currentImagePath = useViewerStore((s) => s.currentImagePath);
  const siblingCount = useViewerStore((s) => s.siblingImages.length);
  const currentIndex = useViewerStore((s) => s.currentIndex);
  const zoomLevel = useViewerStore((s) => s.zoomLevel);
  const imageDimensions = useViewerStore((s) => s.imageDimensions);

  const prevImage = useViewerStore((s) => s.prevImage);
  const nextImage = useViewerStore((s) => s.nextImage);
  const zoomIn = useViewerStore((s) => s.zoomIn);
  const zoomOut = useViewerStore((s) => s.zoomOut);
  const resetView = useViewerStore((s) => s.resetView);
  const setActualSize = useViewerStore((s) => s.setActualSize);
  const rotateCW = useViewerStore((s) => s.rotateCW);
  const rotateCCW = useViewerStore((s) => s.rotateCCW);
  const bgMode = useViewerStore((s) => s.bgMode);
  const cycleBgMode = useViewerStore((s) => s.cycleBgMode);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    void win.isFullscreen().then(setIsFullscreen);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      const win = getCurrentWindow();
      const fs = await win.isFullscreen();
      await win.setFullscreen(!fs);
      setIsFullscreen(!fs);
    } catch (err) {
      console.error("[ViewerHud] Failed to toggle fullscreen", err);
    }
  };

  const handleEditInStudio = () => {
    if (currentImagePath) {
      useSingleStore.getState().setSelectedFile(currentImagePath);
    }
    useAppStore.getState().setMode("single");
  };

  const fileName = currentImagePath ? getFileNameFromPath(currentImagePath) : "";
  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <TooltipProvider delayDuration={300}>
      {/* Top Floating Title Header */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 pointer-events-none select-none ${
          isHudVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border/40 shadow-lg text-xs font-mono text-foreground/80">
          <span className="font-medium truncate max-w-xs">{fileName}</span>
          {imageDimensions ? (
            <>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground">
                {imageDimensions.width} × {imageDimensions.height}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isHudVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
        onMouseEnter={onMouseEnterHud}
        onMouseLeave={onMouseLeaveHud}
      >
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-background/85 backdrop-blur-lg border border-border/50 shadow-2xl text-foreground">
          {/* Previous image */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={prevImage}
                disabled={siblingCount <= 1}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Previous (← / A)</TooltipContent>
          </Tooltip>

          {/* Index Counter */}
          <div className="px-2 text-xs font-mono font-medium text-foreground/75 select-none min-w-[54px] text-center">
            {siblingCount > 0 ? `${currentIndex + 1} / ${siblingCount}` : "1 / 1"}
          </div>

          {/* Next image */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={nextImage}
                disabled={siblingCount <= 1}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Next (→ / D)</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Zoom Out */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={zoomOut}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Zoom Out (-)</TooltipContent>
          </Tooltip>

          {/* Zoom Percentage / Click to Reset */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={resetView}
                className="px-2 h-8 rounded-xl flex items-center justify-center text-xs font-mono text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors min-w-[48px]"
                aria-label="Reset zoom"
              >
                {zoomPercent}%
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Fit to Window (0)</TooltipContent>
          </Tooltip>

          {/* Zoom In */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={zoomIn}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Zoom In (+)</TooltipContent>
          </Tooltip>

          {/* 1:1 Actual Size */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={setActualSize}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="1:1 Actual Size"
              >
                <Ratio className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">1:1 Actual Size (1)</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Rotate CCW */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={rotateCCW}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Rotate CCW"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Rotate Left 90° (L)</TooltipContent>
          </Tooltip>

          {/* Rotate CW */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={rotateCW}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Rotate CW"
              >
                <RotateCw className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Rotate Right 90° (R)</TooltipContent>
          </Tooltip>

          {/* Background Mode Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={cycleBgMode}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Toggle background mode"
              >
                <SunMoon className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {bgMode === "theme"
                ? "Nền: Theo Theme (B)"
                : bgMode === "dark"
                  ? "Nền: Tối (B)"
                  : "Nền: Ca-rô (B)"}
            </TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Fullscreen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="size-8 rounded-xl flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="size-4" />
                ) : (
                  <Maximize className="size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle Fullscreen (F / F11)</TooltipContent>
          </Tooltip>

          {/* Open in Studio Editor */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleEditInStudio}
                className="h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors ml-0.5"
                aria-label="Open in Studio"
              >
                <Edit3 className="size-3.5" />
                <span>Studio</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Open in Studio Editor (E)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
