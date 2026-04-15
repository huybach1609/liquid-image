import type { BatchQueueItem, BatchRunStats } from "./types";

export function toBatchRunStats(queue: BatchQueueItem[]): BatchRunStats {
  const stats: BatchRunStats = {
    total: queue.length,
    queued: 0,
    running: 0,
    done: 0,
    error: 0,
  };

  for (const item of queue) {
    stats[item.status] += 1;
  }

  return stats;
}
