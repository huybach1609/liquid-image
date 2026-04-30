/**
 * Estimates remaining time for a batch job.
 * @param processedCount Number of items finished
 * @param totalCount Total number of items
 * @param startTime Timestamp (ms) when the job started
 * @param now Current timestamp (ms)
 * @returns Estimated remaining seconds
 */
export function estimateRemainingTime(
  processedCount: number,
  totalCount: number,
  startTime: number,
  now: number = Date.now()
): number {
  if (processedCount <= 0 || totalCount <= processedCount) return 0;
  
  const elapsedMs = now - startTime;
  const msPerItem = elapsedMs / processedCount;
  const remainingItems = totalCount - processedCount;
  
  return (msPerItem * remainingItems) / 1000;
}
