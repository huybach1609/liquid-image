import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";

import BlackWhiteFunction from "@/shared/components/functions/BlackWhite";
import BorderFunction from "@/shared/components/functions/Border";
import ComposeFunction from "@/shared/components/functions/Compose";
import ContrastFunction from "@/shared/components/functions/Contrast";
import ConvertFunction from "@/shared/components/functions/Convert";
import { CropFunction } from "@/shared/components/functions/Crop";
import MirrorFunction from "@/shared/components/functions/Mirror";
import NormalizeColorFunction from "@/shared/components/functions/NormalizeColor";
import RotateFunction from "@/shared/components/functions/Rotate";
import ScaleResizeFunction from "@/shared/components/functions/ScaleResize";
import TextLogoFunction from "@/shared/components/functions/TextLogo";
import VignetteFunction from "@/shared/components/functions/Vignette";
import {
  ALargeSmall,
  Blend,
  ChevronDown,
  Contrast,
  CropIcon,
  Disc3,
  FlipHorizontal2,
  ImageIcon,
  ImageUpscale,
  Palette,
  PlusIcon,
  Rotate3d,
  SquareRoundCorner,
  SquaresUnite,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSingleStore } from "@/features/single/state/single.store";
import { Button } from "@/shared/components/ui/button";
import { getImageMetadata } from "@/shared/tauri/commands";
import { formatFileSize } from "@/lib/utils";
import { CanvasPreview } from "@/features/single/components/CanvasPreview";
import { SingleCliPreview } from "@/features/single/components/SingleCliPreview";
import { usePreviewPipeline } from "@/features/single/hooks/usePreviewPipeline";
import {
  buildSingleCliPipeline,
  buildSingleCliPreview,
} from "@/features/single/buildSingleCliPreview";

function getFileNameFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || filePath;
}

type SingleFunctionItem = {
  name: string;
  component: ComponentType;
  icon?: ReactNode;
  note?: string;
};

const SINGLE_FUNCTION_ITEMS: SingleFunctionItem[] = [
  {
    name: "Convert",
    component: ConvertFunction,
    icon: <ImageIcon className="size-4" />,
    note: "Convert image to different format",
  },
  {
    name: "Crop",
    component: CropFunction,
    icon: <CropIcon className="size-4" />,
    note: "Crop image to a specific size",
  },
  {
    name: "Mirror",
    component: MirrorFunction,
    icon: <FlipHorizontal2 className="size-4" />,
    note: "Flip image horizontally",
  },
  {
    name: "Black & white",
    component: BlackWhiteFunction,
    icon: <Blend className="size-4" />,
    note: "Convert image to black and white",
  },
  {
    name: "Contrast",
    component: ContrastFunction,
    icon: <Contrast className="size-4" />,
    note: "Adjust image contrast",
  },
  {
    name: "Normalize colors",
    component: NormalizeColorFunction,
    icon: <Palette className="size-4" />,
    note: "Normalize image colors",
  },
  {
    name: "Vignette",
    component: VignetteFunction,
    icon: <Disc3 className="size-4" />,
    note: "Add vignette effect",
  },
  {
    name: "Border",
    component: BorderFunction,
    icon: <SquareRoundCorner className="size-4" />,
    note: "Add border to image",
  },
  {
    name: "Rotate",
    component: RotateFunction,
    icon: <Rotate3d className="size-4" />,
    note: "Rotate image",
  },
  {
    name: "Scale / resize",
    component: ScaleResizeFunction,
    icon: <ImageUpscale className="size-4" />,
    note: "Scale/resize image",
  },
  {
    name: "Text / logo",
    component: TextLogoFunction,
    icon: <ALargeSmall className="size-4" />,
    note: "Add text or logo to image",
  },
  {
    name: "Compose",
    component: ComposeFunction,
    icon: <SquaresUnite className="size-4" />,
    note: "Compose images",
  },
];

export function SingleModePage() {
  const [cliPreviewMode, setCliPreviewMode] = useState<"function" | "all">(
    "function",
  );
  const selectedFile = useSingleStore((state) => state.selectedFile);
  const fileMetadata = useSingleStore((state) => state.fileMetadata);
  const setSelectedFile = useSingleStore((state) => state.setSelectedFile);
  const setFileMetadata = useSingleStore((state) => state.setFileMetadata);
  const selectedFunctionName = useSingleStore(
    (state) => state.selectedFunction,
  );
  const setSelectedFunctionName = useSingleStore(
    (state) => state.setSelectedFunction,
  );
  const previewZoom = useSingleStore((state) => state.previewZoom);
  const setPreviewZoom = useSingleStore((state) => state.setPreviewZoom);
  const functionParams = useSingleStore((state) => state.functionParams);
  const functionParamsByFunction = useSingleStore(
    (state) => state.functionParamsByFunction,
  );
  const runState = useSingleStore((state) => state.runState);
  const isManualPreview = useSingleStore((state) => state.isManualPreview);
  const previewRequestId = useSingleStore((state) => state.previewRequestId);
  const setIsManualPreview = useSingleStore(
    (state) => state.setIsManualPreview,
  );
  const requestPreview = useSingleStore((state) => state.requestPreview);
  const resetCurrentFunctionParams = useSingleStore(
    (state) => state.resetCurrentFunctionParams,
  );
  const resetAllFunctionParams = useSingleStore(
    (state) => state.resetAllFunctionParams,
  );

  const isRunning = runState.status === "running";
  const message = runState.message;
  const selectedFunction = useMemo(
    () =>
      SINGLE_FUNCTION_ITEMS.find(
        (item) => item.name === selectedFunctionName,
      ) ?? SINGLE_FUNCTION_ITEMS[0],
    [selectedFunctionName],
  );
  const SelectedFunctionComponent = selectedFunction.component;
  const previewState = usePreviewPipeline({
    selectedFile,
    selectedFunction: selectedFunctionName,
    functionParams,
    isManualPreview,
    previewRequestId,
  });

  const editedFunctionNames = useMemo(
    () =>
      Object.entries(functionParamsByFunction)
        .filter(([, params]) => Object.keys(params).length > 0)
        .map(([name]) => name),
    [functionParamsByFunction],
  );

  const commandPreviews = useMemo(() => {
    if (cliPreviewMode === "all") {
      const targetFunctions =
        editedFunctionNames.length > 0 ? editedFunctionNames : [selectedFunctionName];

      const mergedCommand = targetFunctions
        .map((functionName) => ({
          selectedFunction: functionName,
          functionParams: functionParamsByFunction[functionName] ?? {},
        }));

      const pipelineCommand = buildSingleCliPipeline({
        selectedFile,
        operations: mergedCommand,
        outputParams:
          functionParamsByFunction[targetFunctions[targetFunctions.length - 1]] ??
          functionParams,
      });

      return [
        {
          label: "All edited functions",
          command: pipelineCommand,
        },
      ];
    }

    return [
      {
        label: selectedFunctionName,
        command: buildSingleCliPreview({
          selectedFile,
          selectedFunction: selectedFunctionName,
          functionParams,
        }),
      },
    ];
  }, [
    cliPreviewMode,
    editedFunctionNames,
    functionParams,
    functionParamsByFunction,
    selectedFile,
    selectedFunctionName,
  ]);

  const handleSelectFile = async () => {
    const picked = await openDialog({
      filters: [
        {
          name: "Image",
          extensions: [
            "png",
            "jpg",
            "jpeg",
            "gif",
            "webp",
            "tiff",
            "bmp",
            "heic",
          ],
        },
      ],
    });

    if (!picked) {
      return;
    }

    const selectedPath = Array.isArray(picked) ? picked[0] : picked;
    if (!selectedPath) {
      return;
    }

    setSelectedFile(selectedPath);
    const meta = await getImageMetadata(selectedPath);
    setFileMetadata(meta ?? null);
  };

  const handleDetachFile = () => {
    setSelectedFile(null);
    setFileMetadata(null);
  };

  return (
    <section className="grid h-full grid-cols-[180px_1fr_240px] border border-border/70 bg-card">
      <aside className="border-r border-border/70 bg-muted/20">
        <div className="flex h-14 items-center border-b border-border/70 px-5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Operations
        </div>
        <nav className="py-2">
          {SINGLE_FUNCTION_ITEMS.map((item) => {
            const isSelected = selectedFunctionName === item.name;
            const isEdited =
              Object.keys(functionParamsByFunction[item.name] ?? {}).length > 0;
            return (
              <Tooltip key={item.name} delayDuration={700}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-2 border-r-2 px-5 py-2 text-left text-[13px] leading-5 transition-colors outline-none ${
                      isSelected
                        ? "border-primary bg-background/80 font-medium text-primary"
                        : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
                    }`}
                    onClick={() => setSelectedFunctionName(item.name)}
                  >
                    {item.icon}
                    <span className="inline-flex items-center gap-1.5">
                      {item.name}
                      {isEdited ? (
                        <span
                          className="size-1.5 rounded-full bg-primary/80"
                          aria-label={`${item.name} has edited settings`}
                          title="Edited settings"
                        />
                      ) : null}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.note}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>

      <div className="grid min-w-0 grid-rows-[auto_1fr_auto]">
        <header className="flex h-14 items-center gap-2 border-b border-border/70 px-4">
          {selectedFile ? (
            <div className="group inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground">
              <span>{getFileNameFromPath(selectedFile)}</span>
              <button
                type="button"
                aria-label="Detach selected file"
                onClick={handleDetachFile}
                className="inline-flex size-4 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ) : (
            <Button
              type="button"
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              onClick={handleSelectFile}
            >
              <PlusIcon className="size-4" />
              Select file
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg px-3"
                >
                  {isManualPreview ? "Manual preview" : "Auto preview"}
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => setIsManualPreview(false)}
                  className="cursor-pointer"
                >
                  Auto preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setIsManualPreview(true)}
                  className="cursor-pointer"
                >
                  Manual preview
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isManualPreview ? (
              <Button
                type="button"
                size="sm"
                disabled={!selectedFile || !isManualPreview || previewState.isPending}
                onClick={requestPreview}
                className="rounded-lg"
              >
                {isManualPreview
                  ? previewState.isPending
                    ? "Previewing..."
                    : "Preview"
                  : "Preview"}
              </Button>
            ) : null}

            <Button
              type="button"
              disabled={isRunning}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Run"}
            </Button>
          </div>
        </header>

        <div className="relative flex items-center justify-center bg-muted/25">
          <CanvasPreview
            originUrl={previewState.originUrl}
            previewUrl={previewState.previewUrl}
            isPending={previewState.isPending}
            error={previewState.error}
            zoomPercent={previewZoom}
            onZoomChange={setPreviewZoom}
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
                {fileMetadata?.width} × {fileMetadata?.height}
              </span>
              {previewState.width && previewState.height ? (
                <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
                  preview {previewState.width} × {previewState.height}
                </span>
              ) : null}
              <span className="rounded-md border border-border bg-muted/40 px-2 py-1">
                {formatFileSize(fileMetadata?.fileSizeBytes)}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {message || "ImageMagick 7.1"}
          </p>
        </footer>
      </div>

      <aside className="grid min-h-0 grid-rows-[auto_1fr_auto] border-l border-border/70">
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border/70 px-4">
          <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {selectedFunction.name} - Options
          </span>
          <div className="inline-flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={resetCurrentFunctionParams}
            >
              Reset current
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={resetAllFunctionParams}
            >
              Reset all
            </Button>
          </div>
        </div>
        <div className="space-y-3 overflow-auto px-4 py-3">
          <SelectedFunctionComponent />
        </div>
        <div className="border-t border-border/70 px-4 py-3">
          <div className="mb-2 inline-flex rounded-md border border-border/80 bg-muted/30 p-0.5">
            <button
              type="button"
              className={`rounded px-2 py-1 text-[11px] transition-colors ${
                cliPreviewMode === "function"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setCliPreviewMode("function")}
            >
              See function
            </button>
            <button
              type="button"
              className={`rounded px-2 py-1 text-[11px] transition-colors ${
                cliPreviewMode === "all"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setCliPreviewMode("all")}
            >
              See all
            </button>
          </div>
          <SingleCliPreview commandPreviews={commandPreviews} />
        </div>
      </aside>
    </section>
  );
}
