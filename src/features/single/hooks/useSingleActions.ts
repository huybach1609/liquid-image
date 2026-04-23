import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { open as openDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import type { TFunction } from "i18next";

import {
  createImageProxy,
  getImageMetadata,
  removeProxyFile,
  runSingle,
  type ImageMetadata,
} from "@/shared/tauri/commands";
import { buildSingleOperationArgs, type PreviewToFullImageScale } from "@/features/single/buildSingleCliPreview";
import {
  getDirectoryPath,
  getFileExtension,
  getFileNameFromPath,
  getFileNameWithoutExtension,
  normalizeOutputDir,
  normalizeOutputExt,
  normalizeOutputName,
} from "@/features/single/pathUtils";

type RunStatus = "idle" | "running" | "success" | "error";

type UseSingleActionsArgs = {
  t: TFunction<"single">;
  openImageMenuRequestId: number;
  selectedFile: string | null;
  proxyPath: string | null;
  selectedFunctionName: string;
  functionParamsByFunction: Record<string, Record<string, unknown>>;
  editedFunctionNames: string[];
  cliPreviewMode: "function" | "all";
  previewToFullScale: PreviewToFullImageScale | undefined;
  isRunning: boolean;
  setSelectedFile: (value: string | null) => void;
  setProxyPath: (value: string | null) => void;
  setFileMetadata: (value: ImageMetadata | null) => void;
  setRunStatus: (status: RunStatus, message?: string) => void;
};

type UseSingleActionsResult = {
  isPreparingProxy: boolean;
  lastOutputPath: string | null;
  handleRunSingle: () => Promise<void>;
  handleOpenOutputFolder: () => Promise<void>;
};

export function useSingleActions({
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
}: UseSingleActionsArgs): UseSingleActionsResult {
  const [outputPathOverride, setOutputPathOverride] = useState<string | null>(null);
  const [lastOutputPath, setLastOutputPath] = useState<string | null>(null);
  const [isPreparingProxy, setIsPreparingProxy] = useState(false);
  const lastProcessedOpenImageMenuRequestId = useRef(0);
  const previousProxyPathRef = useRef<string | null>(null);

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

  useEffect(() => {
    const previous = previousProxyPathRef.current;
    if (previous && previous !== proxyPath) {
      void removeProxyFile(previous).catch(() => {
        /* best-effort cleanup */
      });
    }
    previousProxyPathRef.current = proxyPath;
  }, [proxyPath]);

  const ingestSelectedImagePath = useCallback(
    async (selectedPath: string) => {
      setSelectedFile(selectedPath);
      setProxyPath(null);
      setFileMetadata(null);
      setLastOutputPath(null);
      setRunStatus("idle");
      setIsPreparingProxy(true);

      try {
        const proxyPromise = createImageProxy(selectedPath)
          .then((proxy) => {
            setProxyPath(proxy);
          })
          .catch((error) => {
            const message =
              error instanceof Error ? error.message : t("errors.previewProxyFailed");
            console.error("Failed to create preview proxy", error);
            setRunStatus("error", message);
            setProxyPath(null);
          });

        const metadataPromise = getImageMetadata(selectedPath)
          .then((meta) => {
            setFileMetadata(meta ?? null);
          })
          .catch((error) => {
            const message =
              error instanceof Error ? error.message : t("errors.runCommandFailed");
            setRunStatus("error", message);
            setFileMetadata(null);
          });

        await Promise.allSettled([proxyPromise, metadataPromise]);
      } finally {
        setIsPreparingProxy(false);
      }
    },
    [setFileMetadata, setProxyPath, setRunStatus, setSelectedFile, t],
  );

  const pickAndOpenSingleImage = useCallback(async () => {
    const picked = await openDialog({
      filters: [
        {
          name: t("dialog.imageFilter"),
          extensions: ["png", "jpg", "jpeg", "gif", "webp", "tiff", "bmp", "heic"],
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

  const handleOpenOutputFolder = useCallback(async () => {
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
  }, [lastOutputPath, setRunStatus, t]);

  const handleRunSingle = useCallback(async () => {
    if (!selectedFile || isRunning) {
      return;
    }
    if (cliPreviewMode === "function") {
      const confirmed = window.confirm(
        t("run.functionModeConfirm", {
          name: selectedFunctionName,
          defaultValue: `You are running in function mode (${selectedFunctionName}). Continue?`,
        }),
      );
      if (!confirmed) {
        return;
      }
    }

    const convertParams = functionParamsByFunction["Convert"] ?? {};
    const inputExt = getFileExtension(selectedFile);
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

    const outputPath = Array.isArray(picked) ? picked[0] : picked;
    if (!outputPath) {
      return;
    }

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
      args.push(...buildSingleOperationArgs(functionName, params, previewToFullScale));
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
  }, [
    cliPreviewMode,
    defaultOutputPath,
    editedFunctionNames,
    functionParamsByFunction,
    isRunning,
    outputPathOverride,
    previewToFullScale,
    selectedFile,
    selectedFunctionName,
    setRunStatus,
    t,
  ]);

  return {
    isPreparingProxy,
    lastOutputPath,
    handleRunSingle,
    handleOpenOutputFolder,
  };
}
