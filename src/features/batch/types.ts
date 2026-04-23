export type BatchJobStatus = "queued" | "running" | "done" | "error";

export type BatchQueueItem = {
  id: string;
  path: string;
  fileName: string;
  status: BatchJobStatus;
  errorMessage?: string;
  progress?: number;
};

export type BatchPipelineStep = {
  id: string; // Unique instance ID
  functionId: string; // ID from FUNCTION_CATALOG (e.g., "Scale / resize")
  enabled: boolean;
  params: Record<string, any>;
  isExpanded?: boolean;
};

export type BatchRunStats = {
  total: number;
  queued: number;
  running: number;
  done: number;
  error: number;
};

export type BatchLogLine = {
  id: string;
  level: "info" | "success" | "error";
  message: string;
  createdAt: number;
};
