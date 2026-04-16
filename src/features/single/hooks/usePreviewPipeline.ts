import { convertFileSrc } from "@tauri-apps/api/core";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { generatePreview } from "@/shared/tauri/commands";

type UsePreviewPipelineArgs = {
  selectedFile: string | null;
  selectedFunction: string;
  functionParams: Record<string, unknown>;
  isManualPreview?: boolean;
  previewRequestId?: number;
  debounceMs?: number;
};

export type PreviewState = {
  originUrl: string | null;
  previewUrl: string | null;
  width: number | null;
  height: number | null;
  isPending: boolean;
  error: string | null;
};

const DEFAULT_DEBOUNCE_MS = 180;

export function usePreviewPipeline({
  selectedFile,
  selectedFunction,
  functionParams,
  isManualPreview = false,
  previewRequestId = 0,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UsePreviewPipelineArgs): PreviewState {
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
  const handledManualRequestRef = useRef(0);

  const optionsJson = useMemo(() => JSON.stringify(functionParams), [functionParams]);
  const originUrl = useMemo(
    () => (selectedFile ? convertFileSrc(selectedFile, "asset") : null),
    [selectedFile],
  );
  const previewUrl = useMemo(
    () => (previewPath ? convertFileSrc(previewPath, "asset") : null),
    [previewPath],
  );

  useEffect(() => {
    if (!selectedFile) {
      setPreviewPath(null);
      setPreviewWidth(null);
      setPreviewHeight(null);
      setError(null);
      setIsPending(false);
      return;
    }

    if (isManualPreview) {
      if (previewRequestId === 0 || previewRequestId === handledManualRequestRef.current) {
        return;
      }
      handledManualRequestRef.current = previewRequestId;
    }

    const ticket = ++requestRef.current;
    const timeout = setTimeout(() => {
      setIsPending(true);
      setError(null);

      startTransition(() => {
        void (async () => {
          try {
            const response = await generatePreview({
              inputPath: selectedFile,
              operation: selectedFunction,
              optionsJson,
            });

            if (requestRef.current !== ticket) {
              return;
            }

            setPreviewPath(response.previewPath);
            setPreviewWidth(response.width);
            setPreviewHeight(response.height);
          } catch (err) {
            if (requestRef.current !== ticket) {
              return;
            }
            const message = err instanceof Error ? err.message : "Failed to build preview";
            setError(message);
          } finally {
            if (requestRef.current === ticket) {
              setIsPending(false);
            }
          }
        })();
      });
    }, isManualPreview ? 0 : debounceMs);

    return () => clearTimeout(timeout);
  }, [
    debounceMs,
    isManualPreview,
    optionsJson,
    previewRequestId,
    selectedFile,
    selectedFunction,
  ]);

  return {
    originUrl,
    previewUrl,
    width: previewWidth,
    height: previewHeight,
    isPending,
    error,
  };
}
