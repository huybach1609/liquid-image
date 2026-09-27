import { useCallback, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { useBatchStore } from "../state/batch.store";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { 
  runBatch as tauriRunBatch, 
  runBatchDryRun as tauriRunBatchDryRun,
  cancelBatch as tauriCancelBatch,
  BatchProgressEvent,
  BatchItem
} from "@/shared/tauri/commands";
import { buildBatchCliArgs, buildBatchOutputPath } from "../buildBatchCliPipeline";
import { resolvePathConflict } from "@/shared/lib/conflictResolver";

export function useBatchRunner() {
  const { 
    queue, 
    pipeline, 
    isRunning, 
    setRunning, 
    updateItemStatus, 
    addLog,
    outputDirectory
  } = useBatchStore();
  
  const {
    workers,
    onErrorPolicy,
    notifyBatchComplete,
    namingPattern,
    dateFormat,
    diskCacheLimit,
    memoryLimit,
    dryRunBeforeBatch,
    saveErrorLog,
    conflictPolicy,
    autoOpenOutput,
    stripMetadata,
    defaultColorProfile,
  } = useSettingsStore();

  const errorsRef = useRef<string[]>([]);

  useEffect(() => {
    let unlistenProgress: (() => void) | undefined;
    let unlistenDryRun: (() => void) | undefined;

    const setupListeners = async () => {
      unlistenProgress = await listen<BatchProgressEvent>("batch-progress", (event) => {
        const { index, status, message } = event.payload;
        
        if (status === "success") {
          updateItemStatus(index, "done");
          addLog("success", `Finished: ${queue[index]?.fileName || index}`);
        } else {
          const errMsg = `Item ${index + 1} (${queue[index]?.fileName || "unknown"}): ${message}`;
          errorsRef.current.push(errMsg);
          updateItemStatus(index, "error", message);
          addLog("error", `Error processing ${queue[index]?.fileName || index}: ${message}`);
        }
      });

      unlistenDryRun = await listen<BatchProgressEvent>("batch-dry-run-progress", (event) => {
        const { index, status, message } = event.payload;
        if (status === "success") {
          addLog("info", `Dry run OK: ${queue[index]?.fileName || index}`);
        } else {
          addLog("error", `Dry run FAILED: ${queue[index]?.fileName || index}: ${message}`);
        }
      });
    };

    setupListeners();

    return () => {
      if (unlistenProgress) unlistenProgress();
      if (unlistenDryRun) unlistenDryRun();
    };
  }, [updateItemStatus, addLog, queue]);

  const runBatch = useCallback(async () => {
    if (isRunning || queue.length === 0) return;

    errorsRef.current = [];
    setRunning(true);
    addLog("info", "Starting batch processing...");

    const args = buildBatchCliArgs(pipeline, {
      diskCacheLimit,
      memoryLimit,
      stripMetadata,
      defaultColorProfile,
    });
    
    // Find output format from the first enabled Convert step if it exists
    const convertStep = pipeline.find(s => s.functionId === "Convert" && s.enabled);
    const outputFormat = convertStep?.params?.outputFormat as string | undefined;

    // Optional pre-batch dry-run validation
    if (dryRunBeforeBatch) {
      addLog("info", "Running pre-batch dry-run validation...");
      const dryItems: BatchItem[] = queue.map((item) => ({
        inputPath: item.path,
        outputPath: "",
      }));

      try {
        await tauriRunBatchDryRun({
          items: dryItems,
          args,
          workers,
          stopOnError: true,
        });
        addLog("info", "Pre-batch dry-run validation passed.");
      } catch (dryError) {
        addLog("error", `Pre-batch dry-run validation failed: ${dryError}`);
        setRunning(false);
        return;
      }
    }

    const rawItems = queue.map((item, index) => ({
      inputPath: item.path,
      outputPath: buildBatchOutputPath(
        item.path,
        outputDirectory,
        outputFormat,
        namingPattern,
        index,
        { dateFormat }
      ),
      originalIndex: index,
    }));

    // Resolve path conflicts based on conflictPolicy (overwrite / skip / rename)
    const items: BatchItem[] = [];
    for (const raw of rawItems) {
      const conflict = await resolvePathConflict(raw.outputPath, conflictPolicy);
      if (conflict.skip) {
        updateItemStatus(raw.originalIndex, "done");
        addLog("info", `Skipped (already exists): ${queue[raw.originalIndex]?.fileName || raw.originalIndex}`);
      } else {
        items.push({
          inputPath: raw.inputPath,
          outputPath: conflict.path,
        });
        updateItemStatus(raw.originalIndex, "queued");
      }
    }

    if (items.length === 0) {
      addLog("info", "All items skipped per conflict policy.");
      setRunning(false);
      return;
    }

    try {
      await tauriRunBatch({
        items,
        args,
        workers,
        stopOnError: onErrorPolicy === "stop-all",
      });

      // Handle retry-once policy if items failed
      if (onErrorPolicy === "retry-once" && errorsRef.current.length > 0) {
        const failedIndices = queue
          .map((_, i) => i)
          .filter((i) => queue[i]?.status === "error");

        if (failedIndices.length > 0) {
          addLog("info", `Retrying ${failedIndices.length} failed items once...`);
          const retryItems = failedIndices.map((idx) => items[idx]).filter(Boolean);
          try {
            await tauriRunBatch({
              items: retryItems,
              args,
              workers,
              stopOnError: false,
            });
          } catch (retryErr) {
            addLog("error", `Retry pass encountered errors: ${retryErr}`);
          }
        }
      }

      addLog("success", "Batch processing finished.");

      // Auto open output folder if enabled
      if (autoOpenOutput && outputDirectory) {
        try {
          const { openPath } = await import("@tauri-apps/plugin-opener");
          await openPath(outputDirectory);
        } catch (openErr) {
          console.warn("Failed to auto-open output directory:", openErr);
        }
      }
    } catch (error) {
      addLog("error", `Batch failed: ${error}`);
      errorsRef.current.push(`Batch execution error: ${error}`);
    } finally {
      // Save error log to file if enabled and errors occurred
      if (saveErrorLog && errorsRef.current.length > 0) {
        try {
          const { writeTextFile } = await import("@tauri-apps/plugin-fs");
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const logFileName = `batch-error-${timestamp}.log`;
          const normalizedDir = outputDirectory.trim().replace(/\/$/, "");
          const logFilePath = `${normalizedDir}/${logFileName}`;
          const content = [
            "=== LIQUID IMAGE BATCH ERROR LOG ===",
            `Timestamp: ${new Date().toLocaleString()}`,
            `Queue items: ${queue.length}`,
            `Total errors: ${errorsRef.current.length}`,
            "",
            "--- ERROR DETAILS ---",
            ...errorsRef.current,
          ].join("\n");

          await writeTextFile(logFilePath, content);
          addLog("info", `Saved error log to: ${logFilePath}`);
        } catch (logErr) {
          console.error("Failed to write error log file", logErr);
        }
      }

      setRunning(false);
    }
  }, [
    isRunning,
    queue,
    pipeline,
    outputDirectory,
    workers,
    onErrorPolicy,
    notifyBatchComplete,
    namingPattern,
    dateFormat,
    diskCacheLimit,
    memoryLimit,
    dryRunBeforeBatch,
    saveErrorLog,
    setRunning,
    addLog,
    updateItemStatus,
  ]);

  const runDryRun = useCallback(async () => {
    if (isRunning || queue.length === 0) return;

    setRunning(true);
    addLog("info", "Starting dry run validation...");

    const args = buildBatchCliArgs(pipeline, {
      diskCacheLimit,
      memoryLimit,
    });
    const items: BatchItem[] = queue.map((item) => ({
      inputPath: item.path,
      outputPath: "", // Not used in dry run
    }));

    try {
      await tauriRunBatchDryRun({
        items,
        args,
        workers,
        stopOnError: false,
      });
      addLog("success", "Dry run validation finished.");
    } catch (error) {
      addLog("error", `Dry run failed: ${error}`);
    } finally {
      setRunning(false);
    }
  }, [isRunning, queue, pipeline, workers, diskCacheLimit, memoryLimit, setRunning, addLog]);

  const cancelBatch = useCallback(async () => {
    try {
      await tauriCancelBatch();
      addLog("info", "Batch processing cancelled by user.");
    } catch (error) {
      addLog("error", `Failed to cancel batch: ${error}`);
    } finally {
      setRunning(false);
    }
  }, [addLog, setRunning]);

  return {
    isRunning,
    runBatch,
    runDryRun,
    cancelBatch,
  };
}
