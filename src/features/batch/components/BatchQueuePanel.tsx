import type { BatchQueueItem } from "../types";

type BatchQueuePanelProps = {
  items?: BatchQueueItem[];
};

export function BatchQueuePanel({ items = [] }: BatchQueuePanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <header className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Input Queue
      </header>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files in queue.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-md border border-border p-2 text-sm">
              {item.fileName}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
