import type { BatchLogLine } from "../types";

type BatchLogPanelProps = {
  logs?: BatchLogLine[];
};

export function BatchLogPanel({ logs = [] }: BatchLogPanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <header className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Log
      </header>
      <div className="space-y-1">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No log entries yet.</p>
        ) : (
          logs.map((log) => (
            <p key={log.id} className="font-mono text-xs text-muted-foreground">
              {log.message}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
