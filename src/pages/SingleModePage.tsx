import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FUNCTION_CATALOG,
  type FunctionSlug,
} from "@/shared/constants/functionCatalog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAppStore } from "@/app/store/app.store";
import { useSingleStore } from "@/features/single/state/single.store";
import { type NaturalCropRect } from "@/features/single/components/CanvasPreview";
import { OperationsNav } from "@/features/single/components/OperationsNav";
import { PreviewPane } from "@/features/single/components/PreviewPane";
import { OptionsPane } from "@/features/single/components/OptionsPane";
import { usePreviewPipeline } from "@/features/single/hooks/usePreviewPipeline";
import { useSingleActions } from "@/features/single/hooks/useSingleActions";
import {
  buildSingleCliPipeline,
  buildSingleCliPreview,
  estimateProxyDimensions,
  type PreviewToFullImageScale,
} from "@/features/single/buildSingleCliPreview";
import { getFileNameFromPath } from "@/features/single/pathUtils";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

function slugForFunctionId(functionId: string): FunctionSlug {
  return (
    FUNCTION_CATALOG.find((e) => e.id === functionId)?.slug ?? "convert"
  );
}

export function SingleModePage() {
  const { t } = useTranslation("single");
  const [cliPreviewMode, setCliPreviewMode] = useState<"function" | "all">(
    "all",
  );
  const [isOperationsPanelCompact, setIsOperationsPanelCompact] = useState(false);
  const operationsPanelRef = useRef<HTMLElement | null>(null);
  const {
    selectedFile,
    proxyPath,
    fileMetadata,
    setSelectedFile,
    setProxyPath,
    setFileMetadata,
    selectedFunctionName,
    setSelectedFunctionName,
    previewZoom,
    setPreviewZoom,
    functionParams,
    functionParamsByFunction,
    runState,
    isManualPreview,
    previewRequestId,
    setIsManualPreview,
    requestPreview,
    resetCurrentFunctionParams,
    resetAllFunctionParams,
    setFunctionParams,
    setRunStatus,
  } = useSingleStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      proxyPath: state.proxyPath,
      fileMetadata: state.fileMetadata,
      setSelectedFile: state.setSelectedFile,
      setProxyPath: state.setProxyPath,
      setFileMetadata: state.setFileMetadata,
      selectedFunctionName: state.selectedFunction,
      setSelectedFunctionName: state.setSelectedFunction,
      previewZoom: state.previewZoom,
      setPreviewZoom: state.setPreviewZoom,
      functionParams: state.functionParams,
      functionParamsByFunction: state.functionParamsByFunction,
      runState: state.runState,
      isManualPreview: state.isManualPreview,
      previewRequestId: state.previewRequestId,
      setIsManualPreview: state.setIsManualPreview,
      requestPreview: state.requestPreview,
      resetCurrentFunctionParams: state.resetCurrentFunctionParams,
      resetAllFunctionParams: state.resetAllFunctionParams,
      setFunctionParams: state.setFunctionParams,
      setRunStatus: state.setRunStatus,
    })),
  );
  const openImageMenuRequestId = useAppStore(
    (state) => state.openImageMenuRequestId,
  );

  const isRunning = runState.status === "running";
  const message = runState.message;

  useEffect(() => {
    const panelEl = operationsPanelRef.current;
    if (!panelEl) {
      return;
    }

    const updateCompactState = (width: number) => {
      setIsOperationsPanelCompact(width < 90);
    };

    updateCompactState(panelEl.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      updateCompactState(entry.contentRect.width);
    });

    observer.observe(panelEl);
    return () => observer.disconnect();
  }, []);

  const selectedCatalogEntry = useMemo(
    () =>
      FUNCTION_CATALOG.find((e) => e.id === selectedFunctionName) ??
      FUNCTION_CATALOG[0],
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
      FUNCTION_CATALOG.map((entry) => ({
        ...entry,
        label: t(`functions.${entry.slug}.name`),
        description: t(`functions.${entry.slug}.note`),
      })),
    [t],
  );

  const editedFunctionNames = useMemo(
    () =>
      FUNCTION_CATALOG.map((entry) => entry.id).filter(
        (functionName) =>
          Object.keys(functionParamsByFunction[functionName] ?? {}).length > 0,
      ),
    [functionParamsByFunction],
  );
  const editedFunctionNameSet = useMemo(
    () => new Set(editedFunctionNames),
    [editedFunctionNames],
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
      setFunctionParams((prev: Record<string, unknown>) => ({
        ...prev,
        cropX: rect.x,
        cropY: rect.y,
        cropW: rect.width,
        cropH: rect.height,
        cropGravity: "NW",
      }));
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

  const { isPreparingProxy, lastOutputPath, handleRunSingle, handleOpenOutputFolder } =
    useSingleActions({
      t,
      openImageMenuRequestId,
      selectedFile,
      proxyPath,
      selectedFunctionName,
      functionParamsByFunction,
      editedFunctionNames,
      cliPreviewMode,
      previewToFullScale,
      isRunning,
      setSelectedFile,
      setProxyPath,
      setFileMetadata,
      setRunStatus,
    });

  return (
    <ResizablePanelGroup className="h-full border border-border/70 bg-card">
      <ResizablePanel
        defaultSize={30}
        minSize={50}
        maxSize={220}
        className="bg-muted/20"
        
      >
        <OperationsNav
          operationsPanelRef={operationsPanelRef}
          isCompact={isOperationsPanelCompact}
          functionNavItems={functionNavItems}
          selectedFunctionName={selectedFunctionName}
          editedFunctionNameSet={editedFunctionNameSet}
          onSelectFunction={setSelectedFunctionName}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={40} minSize={20}>
        <PreviewPane
          isManualPreview={isManualPreview}
          setIsManualPreview={setIsManualPreview}
          selectedFile={selectedFile}
          proxyPath={proxyPath}
          isPreparingProxy={isPreparingProxy}
          isRunning={isRunning}
          requestPreview={requestPreview}
          handleRunSingle={handleRunSingle}
          previewState={previewState}
          previewZoom={previewZoom}
          setPreviewZoom={setPreviewZoom}
          canvasFreeCrop={canvasFreeCrop}
          fileMetadata={fileMetadata}
          message={message}
          defaultStatusMessage={t("status.imagemagickDefault")}
          lastOutputPath={lastOutputPath}
          runStatus={runState.status}
          onOpenOutputFolder={handleOpenOutputFolder}
          getFileNameFromPath={getFileNameFromPath}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={30} minSize={20}>
        <OptionsPane
          selectedFunctionNameLabel={selectedFunctionLabels.name}
          resetCurrentFunctionParams={resetCurrentFunctionParams}
          resetAllFunctionParams={resetAllFunctionParams}
          SelectedFunctionComponent={SelectedFunctionComponent}
          commandPreviews={commandPreviews}
          cliPreviewMode={cliPreviewMode}
          setCliPreviewMode={setCliPreviewMode}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
