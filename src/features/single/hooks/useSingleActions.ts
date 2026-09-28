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
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { useAppStore } from "@/app/store/app.store";
import { useRecentFilesStore } from "@/app/store/recentFiles.store";
import { resolvePathConflict } from "@/shared/lib/conflictResolver";

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
  previewMaxResolution: string;
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
  previewMaxResolution,
}: UseSingleActionsArgs): UseSingleActionsResult {
  const [outputPathOverride, setOutputPathOverride] = useState<string | null>(null);
  const [lastOutputPath, setLastOutputPath] = useState<string | null>(null);
  const [isPreparingProxy, setIsPreparingProxy] = useState(false);
  const lastProcessedOpenImageMenuRequestId = useRef(0);
  const lastProcessedRunRequestId = useRef(0);
  const lastProcessedOpenOutputFolderRequestId = useRef(0);
  const previousProxyPathRef = useRef<string | null>(null);
  const proxyResolutionRef = useRef<string | null>(null);
  const lastIngestedFileRef = useRef<string | null>(null);

  const runRequestId = useAppStore((state) => state.runRequestId);
  const openOutputFolderRequestId = useAppStore((state) => state.openOutputFolderRequestId);

  const defaultOutputPath = useMemo(() => {
    const convertParams = functionParamsByFunction["Convert"] ?? {};
    const settingOutputFolder = useSettingsStore.getState().outputFolder;

    const inputDir = selectedFile
      ? getDirectoryPath(selectedFile)
      : (settingOutputFolder?.trim() || "./output");
    const inputName = selectedFile
      ? getFileNameWithoutExtension(selectedFile)
      : "photo_out";
    const inputExt = selectedFile ? getFileExtension(selectedFile) : "png";

    const outputDir = normalizeOutputDir(
      convertParams.outputDir,
      settingOutputFolder?.trim() || inputDir
    );
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

  const recreateProxy = useCallback(
    async (selectedPath: string) => {
      setProxyPath(null);
      setRunStatus("idle");
      setIsPreparingProxy(true);

      try {
        proxyResolutionRef.current = previewMaxResolution;
        await createImageProxy(selectedPath, previewMaxResolution)
          .then((proxy) => {
            setProxyPath(proxy);
          })
          .catch((error) => {
            const message =
              error instanceof Error ? error.message : t("errors.previewProxyFailed");
            console.error("Failed to recreate preview proxy", error);
            setRunStatus("error", message);
            setProxyPath(null);
          });
      } finally {
        setIsPreparingProxy(false);
      }
    },
    [previewMaxResolution, setProxyPath, setRunStatus, t],
  );

  useEffect(() => {
    if (!selectedFile) return;

    if (proxyResolutionRef.current === previewMaxResolution) return;

    void recreateProxy(selectedFile);
  }, [selectedFile, previewMaxResolution, recreateProxy]);

  const ingestSelectedImagePath = useCallback(
    async (selectedPath: string) => {
      lastIngestedFileRef.current = selectedPath;
      useRecentFilesStore.getState().addRecentFile(selectedPath);
      setSelectedFile(selectedPath);
      setProxyPath(null);
      setFileMetadata(null);
      setLastOutputPath(null);
      setRunStatus("idle");
      setIsPreparingProxy(true);

      try {
        proxyResolutionRef.current = previewMaxResolution;
        const proxyPromise = createImageProxy(selectedPath, previewMaxResolution)
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
    [setFileMetadata, setProxyPath, setRunStatus, setSelectedFile, t, previewMaxResolution],
  );

  useEffect(() => {
    if (!selectedFile) {
      lastIngestedFileRef.current = null;
      return;
    }
    if (lastIngestedFileRef.current !== selectedFile) {
      void ingestSelectedImagePath(selectedFile);
    }
  }, [selectedFile, ingestSelectedImagePath]);

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
    const settingOutputFolder = useSettingsStore.getState().outputFolder;
    const targetDir = lastOutputPath
      ? getDirectoryPath(lastOutputPath)
      : (settingOutputFolder?.trim() || (selectedFile ? getDirectoryPath(selectedFile) : null));

    if (!targetDir) {
      return;
    }

    try {
      await openPath(targetDir);
    } catch (error) {
      console.error("[SingleModePage] Failed to open output folder", {
        targetDir,
        error,
      });
      setRunStatus("error", t("errors.openOutputFolder"));
    }
  }, [lastOutputPath, selectedFile, setRunStatus, t]);

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

    const pickedPath = Array.isArray(picked) ? picked[0] : picked;
    if (!pickedPath) {
      return;
    }

    const pickedDir = getDirectoryPath(pickedPath);
    const pickedName = getFileNameWithoutExtension(pickedPath);
    const outputPath = `${pickedDir}/${pickedName}.${outputExt}`;

    setOutputPathOverride(outputPath);

    const targetFunctions =
      cliPreviewMode === "all"
        ? editedFunctionNames.length > 0
          ? editedFunctionNames
          : [selectedFunctionName]
        : [selectedFunctionName];

    const {
      conflictPolicy,
      autoOpenOutput,
      memoryLimit,
      diskCacheLimit,
      stripMetadata,
      defaultColorProfile,
    } = useSettingsStore.getState();

    const args: string[] = [];
    if (memoryLimit && memoryLimit !== "Unlimited") {
      args.push("-limit", "memory", memoryLimit.replace(/\s+/g, ""));
    }
    if (diskCacheLimit && diskCacheLimit !== "Unlimited") {
      args.push("-limit", "disk", diskCacheLimit.replace(/\s+/g, ""));
    }

    for (const functionName of targetFunctions) {
      const params = functionParamsByFunction[functionName] ?? {};
      args.push(...buildSingleOperationArgs(functionName, params, previewToFullScale));
    }

    const hasConvert = targetFunctions.includes("Convert");
    if (!hasConvert) {
      if (stripMetadata) {
        args.push("-strip");
      }
      if (defaultColorProfile && defaultColorProfile !== "None") {
        const cs =
          defaultColorProfile === "Adobe RGB" ? "Adobe98" : defaultColorProfile;
        args.push("-colorspace", cs);
      }
    }

    const conflict = await resolvePathConflict(outputPath, conflictPolicy);
    if (conflict.skip) {
      setRunStatus("success", t("status.skipped", { defaultValue: "Skipped (file exists)" }));
      return;
    }
    const finalOutputPath = conflict.path;

    try {
      setRunStatus("running", t("status.runningMagick"));
      const response = await runSingle({
        inputPath: selectedFile,
        outputPath: finalOutputPath,
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

      if (autoOpenOutput && response.outputPath) {
        try {
          const outDir = getDirectoryPath(response.outputPath);
          await openPath(outDir);
        } catch (openErr) {
          console.warn("Failed to auto-open output directory:", openErr);
        }
      }
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

  useEffect(() => {
    if (runRequestId === 0 || runRequestId === lastProcessedRunRequestId.current) {
      return;
    }
    lastProcessedRunRequestId.current = runRequestId;
    void handleRunSingle();
  }, [runRequestId, handleRunSingle]);

  useEffect(() => {
    if (
      openOutputFolderRequestId === 0 ||
      openOutputFolderRequestId === lastProcessedOpenOutputFolderRequestId.current
    ) {
      return;
    }
    lastProcessedOpenOutputFolderRequestId.current = openOutputFolderRequestId;
    void handleOpenOutputFolder();
  }, [openOutputFolderRequestId, handleOpenOutputFolder]);

  return {
    isPreparingProxy,
    lastOutputPath,
    handleRunSingle,
    handleOpenOutputFolder,
  };
}
