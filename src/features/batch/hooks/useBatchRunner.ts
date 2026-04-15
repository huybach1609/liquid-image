import { useCallback, useState } from "react";

export function useBatchRunner() {
  const [isRunning, setIsRunning] = useState(false);

  const runBatch = useCallback(async () => {
    setIsRunning(true);
    try {
      // TODO: invoke tauri batch command.
    } finally {
      setIsRunning(false);
    }
  }, []);

  const cancelBatch = useCallback(async () => {
    // TODO: invoke tauri cancel command.
    setIsRunning(false);
  }, []);

  return {
    isRunning,
    runBatch,
    cancelBatch,
  };
}
