import { memo } from "react";
import { ChevronDown, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CanvasPreview,
  type NaturalCropRect,
} from "@/features/single/components/CanvasPreview";
import type { ImageMetadata } from "@/shared/tauri/commands";
import type { PreviewState } from "@/features/single/hooks/usePreviewPipeline";
import { formatFileSize } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

type PreviewPaneProps = {
  isManualPreview: boolean;
  setIsManualPreview: (value: boolean) => void;
  selectedFile: string | null;
  proxyPath: string | null;
  isPreparingProxy: boolean;
  isRunning: boolean;
  requestPreview: () => void;
  handleRunSingle: () => void;
  previewState: PreviewState;
  previewZoom: number;
  setPreviewZoom: (value: number) => void;
  canvasFreeCrop:
    | {
        enabled: true;
        aspect?: number;
        natural: NaturalCropRect;
        onComplete: (rect: NaturalCropRect) => void;
      }
    | undefined;
  fileMetadata: ImageMetadata | null;
  message: string;
  defaultStatusMessage: string;
  lastOutputPath: string | null;
  runStatus: "idle" | "running" | "success" | "error";
  onOpenOutputFolder: () => void;
  getFileNameFromPath: (filePath: string) => string;
};

export const PreviewPane = memo(function PreviewPane({
  isManualPreview,
  setIsManualPreview,
  selectedFile,
  proxyPath,
  isPreparingProxy,
  isRunning,
  requestPreview,
  handleRunSingle,
  previewState,
  previewZoom,
  setPreviewZoom,
  canvasFreeCrop,
  fileMetadata,
  message,
  defaultStatusMessage,
  lastOutputPath,
  runStatus,
  onOpenOutputFolder,
  getFileNameFromPath,
}: PreviewPaneProps) {
  const { t } = useTranslation("single");

  return (
    <div className="grid h-full min-w-0 grid-rows-[auto_1fr_auto]">
      <header className="flex h-14 items-center gap-2 border-b border-border/70 px-4">
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="rounded-lg px-3">
                {isManualPreview ? t("preview.manual") : t("preview.auto")}
                <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => setIsManualPreview(false)}
                className="cursor-pointer"
              >
                {t("preview.auto")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setIsManualPreview(true)}
                className="cursor-pointer"
              >
                {t("preview.manual")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isManualPreview ? (
            <Button
              type="button"
              size="sm"
              disabled={
                !selectedFile ||
                !proxyPath ||
                isPreparingProxy ||
                !isManualPreview ||
                previewState.isPending
              }
              onClick={requestPreview}
              className="rounded-lg"
            >
              {isManualPreview
                ? previewState.isPending
                  ? t("preview.previewing")
                  : t("preview.preview")
                : t("preview.preview")}
            </Button>
          ) : null}

          <Button
            type="button"
            disabled={isRunning || !selectedFile || isPreparingProxy}
            className="size-7"
            variant={isRunning ? "default" : "outline"}
            onClick={handleRunSingle}
          >
            {isRunning ? <Spinner /> : <Play />}
          </Button>
        </div>
      </header>

      <div className="relative flex items-center justify-center bg-muted/25">
        <CanvasPreview
          originUrl={previewState.originUrl}
          previewUrl={previewState.previewUrl}
          isPending={previewState.isPending}
          isSourcePreparing={isPreparingProxy}
          error={previewState.error}
          zoomPercent={previewZoom}
          onZoomChange={setPreviewZoom}
          freeCrop={canvasFreeCrop}
        />
      </div>

      <footer className="flex items-center justify-between border-t border-border/70 px-4 py-3">
        {fileMetadata && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
                  {getFileNameFromPath(selectedFile ?? "photo.jpg")}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{selectedFile ?? "photo.jpg"}</p>
              </TooltipContent>
            </Tooltip>
            <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
              {fileMetadata.width} × {fileMetadata.height}
            </span>
            {previewState.width && previewState.height ? (
              <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
                {t("metadata.previewDimensions", {
                  w: previewState.width,
                  h: previewState.height,
                })}
              </span>
            ) : null}
            <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
              {formatFileSize(fileMetadata.fileSizeBytes)}
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {message || defaultStatusMessage}
        </p>
        {runStatus === "success" && lastOutputPath ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-3 h-7"
            onClick={onOpenOutputFolder}
          >
            {t("output.openOutputFolder")}
          </Button>
        ) : null}
      </footer>
    </div>
  );
});
