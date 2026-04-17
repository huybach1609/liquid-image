import { convertFileSrc } from "@tauri-apps/api/core";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { buildSingleOperationArgs } from "@/features/single/buildSingleCliPreview";
import { generatePreview } from "@/shared/tauri/commands";

type UsePreviewPipelineArgs = {
  selectedFile: string | null;
  operations: Array<{
    selectedFunction: string;
    functionParams: Record<string, unknown>;
  }>;
  operationLabel: string;
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
const DISCRETE_CHANGE_DEBOUNCE_MS = 60;
const CONTINUOUS_CHANGE_DEBOUNCE_MS = 160;

export function usePreviewPipeline({
  selectedFile,
  operations,
  operationLabel,
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
  const previousSignatureRef = useRef("");
  const lastSignatureChangeAtRef = useRef(0);
  const droppedResponseCountRef = useRef(0);

  const optionsJson = useMemo(() => JSON.stringify(operations), [operations]);
  const operationArgs = useMemo(
    () =>
      operations.flatMap((operation) =>
        buildSingleOperationArgs(operation.selectedFunction, operation.functionParams),
      ),
    [operations],
  );
  const originUrl = useMemo(
    () => (selectedFile ? convertFileSrc(selectedFile, "asset") : null),
    [selectedFile],
  );
  const previewUrl = useMemo(
    () => (previewPath ? convertFileSrc(previewPath, "asset") : null),
    [previewPath],
  );
  const signature = useMemo(
    () => `${operationLabel}|${optionsJson}|${operationArgs.join(" ")}`,
    [operationArgs, operationLabel, optionsJson],
  );
  const effectiveDebounceMs = useMemo(() => {
    if (isManualPreview) {
      return 0;
    }

    const now = Date.now();
    if (previousSignatureRef.current !== signature) {
      const delta = now - lastSignatureChangeAtRef.current;
      lastSignatureChangeAtRef.current = now;
      previousSignatureRef.current = signature;
      if (delta > 0 && delta < 120) {
        return CONTINUOUS_CHANGE_DEBOUNCE_MS;
      }
      return DISCRETE_CHANGE_DEBOUNCE_MS;
    }

    return debounceMs;
  }, [debounceMs, isManualPreview, signature]);

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
          const startedAt = performance.now();
          try {
            const response = await generatePreview({
              inputPath: selectedFile,
              operation: operationLabel,
              optionsJson,
              args: operationArgs,
            });

            if (requestRef.current !== ticket) {
              droppedResponseCountRef.current += 1;
              console.debug("[preview] dropped stale response", {
                droppedResponses: droppedResponseCountRef.current,
                ticket,
                activeTicket: requestRef.current,
              });
              return;
            }

            setPreviewPath(response.previewPath);
            setPreviewWidth(response.width);
            setPreviewHeight(response.height);
            console.debug("[preview] completed", {
              ticket,
              elapsedMs: Math.round(performance.now() - startedAt),
              totalMs: response.totalMs,
              renderMs: response.renderMs,
              identifyMs: response.identifyMs,
              debounceMs: effectiveDebounceMs,
            });
          } catch (err) {
            if (requestRef.current !== ticket) {
              droppedResponseCountRef.current += 1;
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
    }, effectiveDebounceMs);

    return () => clearTimeout(timeout);
  }, [
    debounceMs,
    effectiveDebounceMs,
    isManualPreview,
    signature,
    optionsJson,
    operationArgs,
    previewRequestId,
    selectedFile,
    operationLabel,
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
