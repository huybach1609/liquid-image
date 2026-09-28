import { useState, useEffect, useRef, useCallback } from "react";
import { useViewerStore } from "@/features/viewer/state/viewer.store";
import { ViewerCanvas } from "@/features/viewer/components/ViewerCanvas";
import { ViewerHud } from "@/features/viewer/components/ViewerHud";
import { useViewerShortcuts } from "@/features/viewer/hooks/useViewerShortcuts";
import { useImagePreloader } from "@/features/viewer/hooks/useImagePreloader";
import { Image as ImageIcon } from "lucide-react";

const AUTO_HIDE_DELAY_MS = 2500;

export function ViewerPage() {
  const currentImagePath = useViewerStore((s) => s.currentImagePath);
  const bgMode = useViewerStore((s) => s.bgMode);

  // Enable global keyboard navigation and preloading
  useViewerShortcuts();
  useImagePreloader();

  const [isHudVisible, setIsHudVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringHudRef = useRef(false);

  const resetHideTimer = useCallback(() => {
    setIsHudVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    if (!isHoveringHudRef.current) {
      hideTimerRef.current = setTimeout(() => {
        if (!isHoveringHudRef.current) {
          setIsHudVisible(false);
        }
      }, AUTO_HIDE_DELAY_MS);
    }
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [resetHideTimer, currentImagePath]);

  const handlePointerMove = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

  const handleMouseEnterHud = useCallback(() => {
    isHoveringHudRef.current = true;
    setIsHudVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
  }, []);

  const handleMouseLeaveHud = useCallback(() => {
    isHoveringHudRef.current = false;
    resetHideTimer();
  }, [resetHideTimer]);

  const bgClass =
    bgMode === "dark"
      ? "bg-[#0c0c0e]"
      : bgMode === "checker"
        ? "viewer-checkerboard"
        : "bg-background";

  return (
    <div
      className={`relative size-full overflow-hidden ${bgClass} text-foreground select-none transition-colors duration-200`}
      onPointerMove={handlePointerMove}
    >
      {currentImagePath ? (
        <>
          <ViewerCanvas />
          <ViewerHud
            isHudVisible={isHudVisible}
            onMouseEnterHud={handleMouseEnterHud}
            onMouseLeaveHud={handleMouseLeaveHud}
          />
        </>
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="size-16 rounded-2xl bg-muted/20 border border-muted/30 flex items-center justify-center">
            <ImageIcon className="size-8 stroke-[1.5]" />
          </div>
          <p className="text-sm font-medium">No image loaded</p>
          <p className="text-xs text-muted-foreground/70">
            Open an image with Liquid Image Quick Viewer
          </p>
        </div>
      )}
    </div>
  );
}
