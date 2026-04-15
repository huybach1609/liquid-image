import { useCallback } from "react";

export function useBatchActions() {
  const addFiles = useCallback(async (_paths: string[]) => {
    // TODO: connect to queue store + file picker flow.
  }, []);

  const removeFile = useCallback((_: string) => {
    // TODO: remove file from queue.
  }, []);

  const clearQueue = useCallback(() => {
    // TODO: clear queue state.
  }, []);

  return {
    addFiles,
    removeFile,
    clearQueue,
  };
}
