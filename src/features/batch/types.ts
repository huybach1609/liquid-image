export type BatchJobStatus = "queued" | "running" | "done" | "error";

export type BatchQueueItem = {
  id: string;
  path: string;
  fileName: string;
  status: BatchJobStatus;
  errorMessage?: string;
};

export type BatchPipelineStep = {
  id: string;
  label: string;
  enabled: boolean;
  summary?: string;
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
