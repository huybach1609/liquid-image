import { useCallback, useEffect } from "react";
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
  
  const { workers, onErrorPolicy, notifyBatchComplete, namingPattern } = useSettingsStore();

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

    setRunning(true);
    addLog("info", "Starting batch processing...");

    const args = buildBatchCliArgs(pipeline);
    
    // Find output format from the first enabled Convert step if it exists
    const convertStep = pipeline.find(s => s.functionId === "Convert" && s.enabled);
    const outputFormat = convertStep?.params?.outputFormat as string | undefined;

    const items: BatchItem[] = queue.map((item, index) => ({
      inputPath: item.path,
      outputPath: buildBatchOutputPath(item.path, outputDirectory, outputFormat, namingPattern, index),
    }));

    // Reset status of all items in queue before starting
    queue.forEach((_, index) => updateItemStatus(index, "queued"));

    try {
      await tauriRunBatch({
        items,
        args,
        workers,
        stopOnError: onErrorPolicy === "stop-all",
      });
      addLog("success", "Batch processing finished.");
    } catch (error) {
      addLog("error", `Batch failed: ${error}`);
    } finally {
      setRunning(false);
    }
  }, [isRunning, queue, pipeline, outputDirectory, workers, onErrorPolicy, notifyBatchComplete, namingPattern, setRunning, addLog, updateItemStatus]);

  const runDryRun = useCallback(async () => {
    if (isRunning || queue.length === 0) return;

    setRunning(true);
    addLog("info", "Starting dry run validation...");

    const args = buildBatchCliArgs(pipeline);
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
  }, [isRunning, queue, pipeline, workers, setRunning, addLog]);

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
