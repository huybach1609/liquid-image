import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  open as openDialog,
  save as saveDialog,
} from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";

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
  Ellipsis,
  FlipHorizontal2,
  FolderOpen,
  ImageIcon,
  ImageUpscale,
  Palette,
  Play,
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
import { useAppStore } from "@/app/store/app.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { Button } from "@/shared/components/ui/button";
import {
  createImageProxy,
  getImageMetadata,
  removeProxyFile,
  runSingle,
} from "@/shared/tauri/commands";
import { formatFileSize } from "@/lib/utils";
import {
  CanvasPreview,
  type NaturalCropRect,
} from "@/features/single/components/CanvasPreview";
import { SingleCliPreview } from "@/features/single/components/SingleCliPreview";
import { usePreviewPipeline } from "@/features/single/hooks/usePreviewPipeline";
import {
  buildSingleOperationArgs,
  buildSingleCliPipeline,
  buildSingleCliPreview,
  estimateProxyDimensions,
  type PreviewToFullImageScale,
} from "@/features/single/buildSingleCliPreview";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";

function getFileNameFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || filePath;
}

function getFileNameWithoutExtension(filePath: string): string {
  const filename = getFileNameFromPath(filePath);
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0) return filename;
  return filename.slice(0, dotIndex);
}

function getFileExtension(filePath: string): string {
  const filename = getFileNameFromPath(filePath);
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0) return "";
  return filename.slice(dotIndex + 1).toLowerCase();
}

function getDirectoryPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const lastSlash = normalized.lastIndexOf("/");
  if (lastSlash <= 0) {
    return ".";
  }

  return normalized.slice(0, lastSlash);
}

function normalizeOutputDir(outputDir: unknown, fallback = "./output"): string {
  if (typeof outputDir !== "string" || outputDir.trim().length === 0) {
    return fallback;
  }

  return outputDir.trim().replace(/[\\/]+$/, "");
}

function normalizeOutputName(outputName: unknown, fallback = "photo_out"): string {
  if (typeof outputName !== "string" || outputName.trim().length === 0) {
    return fallback;
  }

  return outputName.trim();
}

function normalizeOutputExt(outputFormat: unknown, fallback = "png"): string {
  if (typeof outputFormat !== "string" || outputFormat.trim().length === 0) {
    return fallback;
  }

  const normalized = outputFormat.trim().toLowerCase();
  return normalized === "jpeg" ? "jpg" : normalized;
}

type FunctionSlug =
  | "convert"
  | "crop"
  | "mirror"
  | "blackWhite"
  | "contrast"
  | "normalizeColors"
  | "vignette"
  | "border"
  | "rotate"
  | "scaleResize"
  | "textLogo"
  | "compose";

type SingleFunctionCatalogEntry = {
  /** Stable id used in store and ImageMagick routing (English labels). */
  id: string;
  slug: FunctionSlug;
  component: ComponentType;
  icon: ReactNode;
};

const SINGLE_FUNCTION_CATALOG: readonly SingleFunctionCatalogEntry[] = [
  {
    id: "Convert",
    slug: "convert",
    component: ConvertFunction,
    icon: <ImageIcon className="size-4" />,
  },
  {
    id: "Crop",
    slug: "crop",
    component: CropFunction,
    icon: <CropIcon className="size-4" />,
  },
  {
    id: "Mirror",
    slug: "mirror",
    component: MirrorFunction,
    icon: <FlipHorizontal2 className="size-4" />,
  },
  {
    id: "Black & white",
    slug: "blackWhite",
    component: BlackWhiteFunction,
    icon: <Blend className="size-4" />,
  },
  {
    id: "Contrast",
    slug: "contrast",
    component: ContrastFunction,
    icon: <Contrast className="size-4" />,
  },
  {
    id: "Normalize colors",
    slug: "normalizeColors",
    component: NormalizeColorFunction,
    icon: <Palette className="size-4" />,
  },
  {
    id: "Vignette",
    slug: "vignette",
    component: VignetteFunction,
    icon: <Disc3 className="size-4" />,
  },
  {
    id: "Border",
    slug: "border",
    component: BorderFunction,
    icon: <SquareRoundCorner className="size-4" />,
  },
  {
    id: "Rotate",
    slug: "rotate",
    component: RotateFunction,
    icon: <Rotate3d className="size-4" />,
  },
  {
    id: "Scale / resize",
    slug: "scaleResize",
    component: ScaleResizeFunction,
    icon: <ImageUpscale className="size-4" />,
  },
  {
    id: "Text / logo",
    slug: "textLogo",
    component: TextLogoFunction,
    icon: <ALargeSmall className="size-4" />,
  },
  {
    id: "Compose",
    slug: "compose",
    component: ComposeFunction,
    icon: <SquaresUnite className="size-4" />,
  },
];

function slugForFunctionId(functionId: string): FunctionSlug {
  return (
    SINGLE_FUNCTION_CATALOG.find((e) => e.id === functionId)?.slug ?? "convert"
  );
}

export function SingleModePage() {
  const { t } = useTranslation("single");
  const [cliPreviewMode, setCliPreviewMode] = useState<"function" | "all">(
    "function",
  );
  const [outputPathOverride, setOutputPathOverride] = useState<string | null>(
    null,
  );
  const [lastOutputPath, setLastOutputPath] = useState<string | null>(null);
  const [isPreparingProxy, setIsPreparingProxy] = useState(false);
  const selectedFile = useSingleStore((state) => state.selectedFile);
  const proxyPath = useSingleStore((state) => state.proxyPath);
  const fileMetadata = useSingleStore((state) => state.fileMetadata);
  const setSelectedFile = useSingleStore((state) => state.setSelectedFile);
  const setProxyPath = useSingleStore((state) => state.setProxyPath);
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
  const setFunctionParams = useSingleStore((state) => state.setFunctionParams);
  const setRunStatus = useSingleStore((state) => state.setRunStatus);
  const openImageMenuRequestId = useAppStore(
    (state) => state.openImageMenuRequestId,
  );
  const lastProcessedOpenImageMenuRequestId = useRef(0);

  const isRunning = runState.status === "running";
  const message = runState.message;

  const selectedCatalogEntry = useMemo(
    () =>
      SINGLE_FUNCTION_CATALOG.find((e) => e.id === selectedFunctionName) ??
      SINGLE_FUNCTION_CATALOG[0],
    [selectedFunctionName],
  );
  const selectedFunctionLabels = useMemo(
    () => ({
      name: t(`functions.${selectedCatalogEntry.slug}.name`),
      note: t(`functions.${selectedCatalogEntry.slug}.note`),
    }),
    [selectedCatalogEntry.slug, t],
  );
  const SelectedFunctionComponent = selectedCatalogEntry.component;

  const functionNavItems = useMemo(
    () =>
      SINGLE_FUNCTION_CATALOG.map((entry) => ({
        ...entry,
        label: t(`functions.${entry.slug}.name`),
        description: t(`functions.${entry.slug}.note`),
      })),
    [t],
  );

  const editedFunctionNames = useMemo(
    () =>
      Object.entries(functionParamsByFunction)
        .filter(([, params]) => Object.keys(params).length > 0)
        .map(([name]) => name),
    [functionParamsByFunction],
  );
  const previewOperations = useMemo(() => {
    if (cliPreviewMode === "all") {
      const targetFunctions =
        editedFunctionNames.length > 0
          ? editedFunctionNames
          : [selectedFunctionName];
      return targetFunctions
        .filter((name) => name !== "Convert")
        .map((functionName) => ({
          selectedFunction: functionName,
          functionParams: functionParamsByFunction[functionName] ?? {},
        }));
    }

    if (selectedFunctionName === "Convert") {
      return [];
    }

    return [
      {
        selectedFunction: selectedFunctionName,
        functionParams,
      },
    ];
  }, [
    cliPreviewMode,
    editedFunctionNames,
    functionParams,
    functionParamsByFunction,
    selectedFunctionName,
  ]);
  const previewOperationLabel =
    cliPreviewMode === "all" ? "all-edited-functions" : selectedFunctionName;
  const previewState = usePreviewPipeline({
    previewInputPath: proxyPath,
    operations: previewOperations,
    operationLabel: previewOperationLabel,
    isManualPreview,
    previewRequestId,
    fullImageDimensions:
      fileMetadata && fileMetadata.width > 0 && fileMetadata.height > 0
        ? { width: fileMetadata.width, height: fileMetadata.height }
        : null,
  });

  const previewToFullScale = useMemo(():
    | PreviewToFullImageScale
    | undefined => {
    if (!fileMetadata) {
      return undefined;
    }
    let previewW = previewState.width ?? 0;
    let previewH = previewState.height ?? 0;
    if (previewW <= 0 || previewH <= 0) {
      const est = estimateProxyDimensions(
        fileMetadata.width,
        fileMetadata.height,
      );
      previewW = est.width;
      previewH = est.height;
    }
    return {
      fullWidth: fileMetadata.width,
      fullHeight: fileMetadata.height,
      previewWidth: previewW,
      previewHeight: previewH,
    };
  }, [fileMetadata, previewState.width, previewState.height]);

  const cropMethodRaw = functionParams.cropMethod;
  const cropMethod =
    cropMethodRaw === "trim" ||
    cropMethodRaw === "shave" ||
    cropMethodRaw === "free"
      ? cropMethodRaw
      : "free";

  const cropFreeApplyReview = useSingleStore((s) => s.cropFreeApplyReview);

  const freeCropInteractive =
    selectedFunctionName === "Crop" && cropMethod === "free";

  const cropAspectRatioStr =
    typeof functionParams.cropAspectRatio === "string" &&
    functionParams.cropAspectRatio.trim().length > 0
      ? functionParams.cropAspectRatio.trim()
      : "Free";

  const freeCropAspect = useMemo(() => {
    if (cropAspectRatioStr === "Free" || cropAspectRatioStr === "Custom") {
      return undefined;
    }
    const m = cropAspectRatioStr.match(/^(\d+)\s*:\s*(\d+)$/);
    if (!m) {
      return undefined;
    }
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
      return undefined;
    }
    return a / b;
  }, [cropAspectRatioStr]);

  const freeCropNatural = useMemo(
    (): NaturalCropRect => ({
      x: Math.round(Number(functionParams.cropX)) || 0,
      y: Math.round(Number(functionParams.cropY)) || 0,
      width: Math.round(Number(functionParams.cropW)) || 0,
      height: Math.round(Number(functionParams.cropH)) || 0,
    }),
    [
      functionParams.cropX,
      functionParams.cropY,
      functionParams.cropW,
      functionParams.cropH,
    ],
  );

  const handleFreeCropComplete = useCallback(
    (rect: NaturalCropRect) => {
      const fp = useSingleStore.getState().functionParams;
      setFunctionParams({
        ...fp,
        cropX: rect.x,
        cropY: rect.y,
        cropW: rect.width,
        cropH: rect.height,
        cropGravity: "NW",
      });
    },
    [setFunctionParams],
  );

  const canvasFreeCrop = useMemo(
    () =>
      freeCropInteractive && !cropFreeApplyReview
        ? {
            enabled: true as const,
            aspect: freeCropAspect,
            natural: freeCropNatural,
            onComplete: handleFreeCropComplete,
          }
        : undefined,
    [
      freeCropInteractive,
      cropFreeApplyReview,
      freeCropAspect,
      freeCropNatural,
      handleFreeCropComplete,
    ],
  );

  const commandPreviews = useMemo(() => {
    if (cliPreviewMode === "all") {
      const targetFunctions =
        editedFunctionNames.length > 0
          ? editedFunctionNames
          : [selectedFunctionName];

      const mergedCommand = targetFunctions.map((functionName) => ({
        selectedFunction: functionName,
        functionParams: functionParamsByFunction[functionName] ?? {},
      }));

      const pipelineCommand = buildSingleCliPipeline({
        selectedFile,
        operations: mergedCommand,
        outputParams:
          functionParamsByFunction[
            targetFunctions[targetFunctions.length - 1]
          ] ?? functionParams,
        previewToFullScale,
      });

      return [
        {
          label: t("cli.allEditedFunctions"),
          command: pipelineCommand,
        },
      ];
    }

    return [
      {
        label: t(`functions.${slugForFunctionId(selectedFunctionName)}.name`),
        command: buildSingleCliPreview({
          selectedFile,
          selectedFunction: selectedFunctionName,
          functionParams,
          previewToFullScale,
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
    t,
    previewToFullScale,
  ]);

  const defaultOutputPath = useMemo(() => {
    const convertParams = functionParamsByFunction["Convert"] ?? {};

    const inputDir = selectedFile ? getDirectoryPath(selectedFile) : "./output";
    const inputName = selectedFile
      ? getFileNameWithoutExtension(selectedFile)
      : "photo_out";
    const inputExt = selectedFile ? getFileExtension(selectedFile) : "png";

    const outputDir = normalizeOutputDir(convertParams.outputDir, inputDir);
    const outputName = normalizeOutputName(convertParams.outputName, inputName);
    const outputExt = normalizeOutputExt(convertParams.outputFormat, inputExt);

    return `${outputDir}/${outputName}.${outputExt}`;
  }, [selectedFile, functionParamsByFunction]);

  const ingestSelectedImagePath = useCallback(
    async (selectedPath: string) => {
      const previousProxy = useSingleStore.getState().proxyPath;
      if (previousProxy) {
        try {
          await removeProxyFile(previousProxy);
        } catch {
          /* best-effort cleanup */
        }
      }

      setSelectedFile(selectedPath);
      setProxyPath(null);
      setIsPreparingProxy(true);

      try {
        try {
          const proxy = await createImageProxy(selectedPath);
          setProxyPath(proxy);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : t("errors.previewProxyFailed");
          console.error("Failed to create preview proxy", error);
          setRunStatus("error", message);
          setProxyPath(null);
        }

        const meta = await getImageMetadata(selectedPath);
        setFileMetadata(meta ?? null);
      } finally {
        setIsPreparingProxy(false);
      }
    },
    [setSelectedFile, setProxyPath, setRunStatus, setFileMetadata, t],
  );

  const pickAndOpenSingleImage = useCallback(async () => {
    const picked = await openDialog({
      filters: [
        {
          name: t("dialog.imageFilter"),
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

    await ingestSelectedImagePath(selectedPath);
  }, [ingestSelectedImagePath, t]);

  useEffect(() => {
    if (
      openImageMenuRequestId === 0 ||
      openImageMenuRequestId === lastProcessedOpenImageMenuRequestId.current
    ) {
      return;
    }
    lastProcessedOpenImageMenuRequestId.current = openImageMenuRequestId;
    void pickAndOpenSingleImage();
  }, [openImageMenuRequestId, pickAndOpenSingleImage]);

  const handleChooseOutputPath = async () => {
    // Sync suggested extension with chosen format (from Convert tab or input file fallback)
    const convertParams = functionParamsByFunction["Convert"] ?? {};
    const inputExt = selectedFile ? getFileExtension(selectedFile) : "png";
    const outputExt = normalizeOutputExt(convertParams.outputFormat, inputExt);

    let defaultPath = outputPathOverride ?? defaultOutputPath;
    if (outputPathOverride) {
      const dir = getDirectoryPath(outputPathOverride);
      const name = getFileNameWithoutExtension(outputPathOverride);
      defaultPath = `${dir}/${name}.${outputExt}`;
    }

    const picked = await saveDialog({
      defaultPath,
      filters: [
        {
          name: t("dialog.imageOutputFilter"),
          extensions: ["png", "jpg", "jpeg", "webp", "tiff", "bmp", "heic"],
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

    setOutputPathOverride(selectedPath);
    setRunStatus(
      "idle",
      t("status.outputSet", { file: getFileNameFromPath(selectedPath) }),
    );
  };

  const handleOpenOutputFolder = async () => {
    if (!lastOutputPath) {
      return;
    }

    try {
      await openPath(getDirectoryPath(lastOutputPath));
    } catch (error) {
      console.error("[SingleModePage] Failed to open output folder", {
        lastOutputPath,
        outputDir: getDirectoryPath(lastOutputPath),
        error,
      });
      setRunStatus("error", t("errors.openOutputFolder"));
    }
  };

  const handleRunSingle = async () => {
    if (!selectedFile || isRunning) {
      return;
    }

    // Sync suggested extension with chosen format (from Convert tab or input file fallback)
    const convertParams = functionParamsByFunction["Convert"] ?? {};
    const inputExt = getFileExtension(selectedFile);
    const outputExt = normalizeOutputExt(convertParams.outputFormat, inputExt);

    let defaultPath = outputPathOverride ?? defaultOutputPath;
    if (outputPathOverride) {
      const dir = getDirectoryPath(outputPathOverride);
      const name = getFileNameWithoutExtension(outputPathOverride);
      defaultPath = `${dir}/${name}.${outputExt}`;
    }

    // 1. Force the user to choose an output path (Save As)
    const picked = await saveDialog({
      defaultPath,
      filters: [
        {
          name: t("dialog.imageOutputFilter"),
          extensions: ["png", "jpg", "jpeg", "webp", "tiff", "bmp", "heic"],
        },
      ],
    });

    if (!picked) {
      return;
    }

    const outputPath = Array.isArray(picked) ? picked[0] : picked;
    if (!outputPath) {
      return;
    }

    // Update override so the next run defaults to this location/name
    setOutputPathOverride(outputPath);

    const targetFunctions =
      cliPreviewMode === "all"
        ? editedFunctionNames.length > 0
          ? editedFunctionNames
          : [selectedFunctionName]
        : [selectedFunctionName];

    const args: string[] = [];
    for (const functionName of targetFunctions) {
      const params = functionParamsByFunction[functionName] ?? {};
      args.push(
        ...buildSingleOperationArgs(functionName, params, previewToFullScale),
      );
    }

    try {
      setRunStatus("running", t("status.runningMagick"));
      const response = await runSingle({
        inputPath: selectedFile,
        outputPath,
        args,
      });
      setLastOutputPath(response.outputPath);
      setRunStatus(
        "success",
        t("status.done", {
          file: getFileNameFromPath(response.outputPath),
          width: response.width,
          height: response.height,
        }),
      );
    } catch (error) {
      console.error("[SingleModePage] runSingle failed:", error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : t("errors.runCommandFailed");
      setRunStatus("error", message);
    }
  };

  return (
    <section className="grid h-full grid-cols-[180px_1fr_240px] border border-border/70 bg-card">
      <aside className="border-r border-border/70 bg-muted/20">
        <div className="flex h-14 items-center border-b border-border/70 px-5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t("operations.heading")}
        </div>
        <nav className="py-2">
          {functionNavItems.map((item) => {
            const isSelected = selectedFunctionName === item.id;
            const isEdited =
              Object.keys(functionParamsByFunction[item.id] ?? {}).length > 0;
            return (
              <Tooltip key={item.id} delayDuration={700}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-2 border-r-2 px-5 py-2 text-left text-[13px] leading-5 transition-colors outline-none ${
                      isSelected
                        ? "border-primary bg-background/80 font-medium text-primary"
                        : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
                    }`}
                    onClick={() => setSelectedFunctionName(item.id)}
                  >
                    {item.icon}
                    <span className="inline-flex items-center gap-1.5">
                      {item.label}
                      {isEdited ? (
                        <span
                          className="size-1.5 rounded-full bg-primary/80"
                          aria-label={t("operations.editedBadgeAria", {
                            name: item.label,
                          })}
                          title={t("operations.editedBadgeTitle")}
                        />
                      ) : null}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>

      <div className="grid min-w-0 grid-rows-[auto_1fr_auto]">
        <header className="flex h-14 items-center gap-2 border-b border-border/70 px-4">
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg px-3"
                >
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
                {fileMetadata?.width} × {fileMetadata?.height}
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
                {formatFileSize(fileMetadata?.fileSizeBytes)}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {message || t("status.imagemagickDefault")}
          </p>
          {runState.status === "success" && lastOutputPath ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-3 h-7"
              onClick={handleOpenOutputFolder}
            >
              {t("output.openOutputFolder")}
            </Button>
          ) : null}
        </footer>
      </div>

      <aside className="grid min-h-0 grid-rows-[auto_1fr_auto] border-l border-border/70">
        <div className="flex h-14 items-center justify-between gap-2 border-b border-border/70 px-4">
          <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {t("optionsPanel.title", { name: selectedFunctionLabels.name })}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-7"
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={resetCurrentFunctionParams}>
                {t("reset.current", { name: selectedFunctionLabels.name })}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={resetAllFunctionParams}>
                {t("reset.all")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-3 overflow-auto px-4 py-3">
          <SelectedFunctionComponent />
        </div>
        <div className="border-t border-border/70 px-4 py-3">
          {/* <div className="mb-2 inline-flex rounded-md border border-border/80 bg-muted/30 p-0.5">
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
          </div> */}
          <SingleCliPreview
            commandPreviews={commandPreviews}
            cliPreviewMode={cliPreviewMode}
            setCliPreviewMode={setCliPreviewMode}
          />
        </div>
      </aside>
    </section>
  );
}
