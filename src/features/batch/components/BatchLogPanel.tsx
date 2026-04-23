import { useBatchStore } from "../state/batch.store";
import { useTranslation } from "react-i18next";
import { Terminal } from "lucide-react";

export function BatchLogPanel() {
  const { t } = useTranslation("batch");
  const { logs } = useBatchStore();

  return (
    <div className="flex h-full flex-col font-mono">
      <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        <Terminal className="size-3" />
        {t("log.title", "Execution Log")}
      </div>
      
      {logs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border border-dashed border-border/50 rounded-lg bg-muted/5 opacity-40">
          <p className="text-[10px] text-muted-foreground italic">
            {t("log.empty", "No log entries yet. Run a batch to see output.")}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto space-y-1.5 p-3 border border-border/50 rounded-lg bg-black/5 dark:bg-black/20 text-[11px]">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 leading-relaxed">
              <span className="text-muted-foreground/50 tabular-nums">
                [{new Date(log.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span className={`
                ${log.level === 'error' ? 'text-destructive' : ''}
                ${log.level === 'success' ? 'text-success' : ''}
                ${log.level === 'info' ? 'text-primary' : ''}
              `}>
                {log.level === 'error' ? '✕' : log.level === 'success' ? '✓' : 'ℹ'} {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
