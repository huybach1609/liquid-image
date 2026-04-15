import type {
  BatchLogLine,
  BatchPipelineStep,
  BatchQueueItem,
  BatchRunStats,
} from "../types";

export type BatchState = {
  queue: BatchQueueItem[];
  pipeline: BatchPipelineStep[];
  logs: BatchLogLine[];
  isRunning: boolean;
  stats: BatchRunStats;
};

export const initialBatchState: BatchState = {
  queue: [],
  pipeline: [],
  logs: [],
  isRunning: false,
  stats: { total: 0, queued: 0, running: 0, done: 0, error: 0 },
};

export const batchStore = {
  getState(): BatchState {
    return initialBatchState;
  },
};
