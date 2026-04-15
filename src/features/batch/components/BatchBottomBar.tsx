import type { BatchRunStats } from "../types";

type BatchBottomBarProps = {
  stats?: BatchRunStats;
  isRunning?: boolean;
};

export function BatchBottomBar({ stats, isRunning = false }: BatchBottomBarProps) {
  const summary = stats
    ? `${stats.done}/${stats.total} done, ${stats.running} running, ${stats.error} error`
    : "No active batch run";

  return (
    <footer className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{summary}</p>
      <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
        {isRunning ? "Running..." : "Run batch"}
      </button>
    </footer>
  );
}
