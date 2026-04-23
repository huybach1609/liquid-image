import { useBatchStore } from "../state/batch.store";
import { X, FileWarning, CheckCircle2, Loader2, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";

export function BatchQueuePanel() {
  const { t } = useTranslation("batch");
  const { queue, stats, addFiles, removeFile, clearQueue } = useBatchStore();

  const handleAddFiles = async () => {
    const selected = await open({
      multiple: true,
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "tif", "tiff"] }],
    });
    if (Array.isArray(selected)) {
      addFiles(
        (selected as string[]).map((p: string) => ({
          path: p,
          name: p.split(/[/\\]/).pop() || "unknown",
        })),
      );
    } else if (typeof selected === "string") {
      addFiles([{ path: selected as string, name: (selected as string).split(/[/\\]/).pop() || "unknown" }]);
    }
  };

  return (
    <aside className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] border-r border-border/70">
      <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t("queue.title", "Input Queue")}
        </p>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="text-[10px] text-muted-foreground hover:text-destructive"
            >
              {t("queue.clear", "Clear")}
            </button>
          )}
          <button
            type="button"
            onClick={handleAddFiles}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
          >
            + {t("queue.addFiles", "Add files")}
          </button>
        </div>
      </header>

      <div className="overflow-auto px-3 py-3 space-y-2">
        {queue.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-2 opacity-50">
            <Clock className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("queue.empty", "Queue is empty. Add some images to start.")}
            </p>
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-lg border px-3 py-2 transition-colors ${
                item.status === "running"
                  ? "border-primary/50 bg-primary/5"
                  : item.status === "error"
                    ? "border-destructive/50 bg-destructive/5"
                    : item.status === "done"
                      ? "border-success/50 bg-success/5"
                      : "border-border/70 bg-background hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.fileName}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{item.path}</p>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {item.status === "running" && <Loader2 className="size-3.5 animate-spin text-primary" />}
                  {item.status === "done" && <CheckCircle2 className="size-3.5 text-success" />}
                  {item.status === "error" && <FileWarning className="size-3.5 text-destructive" />}
                  <button
                    onClick={() => removeFile(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
              {item.errorMessage && (
                <p className="mt-1 text-[10px] text-destructive truncate">{item.errorMessage}</p>
              )}
            </div>
          ))
        )}
      </div>

      <footer className="border-t border-border/70 px-4 py-3 bg-muted/10">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <p>
            {stats.total} {t("queue.total", "total")}
          </p>
          <div className="flex gap-3">
            {stats.done > 0 && <span className="text-success">{stats.done} {t("queue.done", "done")}</span>}
            {stats.error > 0 && <span className="text-destructive">{stats.error} {t("queue.errors", "errors")}</span>}
          </div>
        </div>
      </footer>
    </aside>
  );
}
