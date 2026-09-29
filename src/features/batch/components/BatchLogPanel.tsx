import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useBatchStore } from "../state/batch.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LogFilter = "all" | "error" | "success";

function formatTimestamp(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function BatchLogPanel() {
  const { t } = useTranslation("batch");
  const logs = useBatchStore((s) => s.logs);
  const clearLogs = useBatchStore((s) => s.clearLogs);

  const [filter, setFilter] = useState<LogFilter>("all");
  const [copied, setCopied] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logs.length > 0) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs.length]);

  // Derived counts
  const { errorCount, successCount } = useMemo(() => {
    let errors = 0;
    let successes = 0;
    for (const log of logs) {
      if (log.level === "error") errors++;
      else if (log.level === "success") successes++;
    }
    return { errorCount: errors, successCount: successes };
  }, [logs]);

  // Filtered log list
  const filteredLogs = useMemo(() => {
    if (filter === "error") return logs.filter((l) => l.level === "error");
    if (filter === "success") return logs.filter((l) => l.level === "success");
    return logs;
  }, [logs, filter]);

  const handleCopyLogs = useCallback(() => {
    if (logs.length === 0) return;
    const text = logs
      .map(
        (l) =>
          `[${formatTimestamp(l.createdAt)}] [${l.level.toUpperCase()}] ${l.message}`,
      )
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [logs]);

  return (
    <div className="flex h-full min-h-[360px] flex-col gap-3 font-sans">
      {/* Header and Actions */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <span>{t("log.title", "Execution Log")}</span>
          {logs.length > 0 ? (
            <Badge variant="secondary" className="font-mono text-[10px] tabular-nums">
              {logs.length}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {logs.length > 0 ? (
            <>
              {/* Filter pills */}
              <div className="flex items-center rounded-md border border-border/60 bg-muted/20 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                    filter === "all"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("log.all", "All")}
                </button>
                {errorCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setFilter("error")}
                    className={cn(
                      "rounded px-2 py-0.5 text-[11px] font-medium transition-colors flex items-center gap-1",
                      filter === "error"
                        ? "bg-destructive/15 text-destructive font-semibold shadow-xs"
                        : "text-destructive/80 hover:text-destructive",
                    )}
                  >
                    <span>{t("log.errors", "Errors")}</span>
                    <span className="font-mono tabular-nums">({errorCount})</span>
                  </button>
                ) : null}
                {successCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setFilter("success")}
                    className={cn(
                      "rounded px-2 py-0.5 text-[11px] font-medium transition-colors flex items-center gap-1",
                      filter === "success"
                        ? "bg-emerald-500/15 text-emerald-500 font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{t("log.success", "Success")}</span>
                    <span className="font-mono tabular-nums">({successCount})</span>
                  </button>
                ) : null}
              </div>

              {/* Copy logs */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleCopyLogs}
                title={copied ? t("log.copied", "Copied!") : t("log.copy", "Copy logs")}
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>

              {/* Clear logs */}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={clearLogs}
                title={t("log.clear", "Clear logs")}
                className="size-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          ) : null}
        </div>
      </header>

      {/* Main Content Area */}
      {logs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-card/20 p-6 text-center min-h-[220px]">
          <p className="text-xs text-muted-foreground">
            {t(
              "log.empty",
              "No log entries yet. Run a batch to see output.",
            )}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col rounded-lg border border-border/70 bg-card/50 dark:bg-black/35 overflow-hidden shadow-xs">
          {/* Status bar */}
          <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground font-mono">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>TERMINAL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="tabular-nums">
                {filteredLogs.length} / {logs.length} entries
              </span>
            </div>
          </div>

          {/* Log Lines */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-1.5 font-mono text-xs select-text">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 leading-relaxed selection:bg-primary/20"
              >
                <span className="shrink-0 text-muted-foreground/50 tabular-nums select-none text-[11px]">
                  [{formatTimestamp(log.createdAt)}]
                </span>
                <span className="shrink-0 pt-0.5 select-none">
                  {log.level === "error" ? (
                    <AlertCircle className="size-3 text-destructive" />
                  ) : log.level === "success" ? (
                    <CheckCircle2 className="size-3 text-emerald-500" />
                  ) : (
                    <Info className="size-3 text-primary" />
                  )}
                </span>
                <span
                  className={cn(
                    "break-all flex-1 text-xs",
                    log.level === "error"
                      ? "text-destructive font-medium"
                      : log.level === "success"
                        ? "text-emerald-500/90"
                        : "text-foreground/90",
                  )}
                >
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
