import { Play, FlaskConical, StopCircle } from "lucide-react";
import { useBatchStore } from "../state/batch.store";
import { useTranslation } from "react-i18next";

export function BatchBottomBar() {
  const { t } = useTranslation("batch");
  const { isRunning, setRunning, queue, pipeline } = useBatchStore();

  const canRun = queue.length > 0 && pipeline.length > 0;

  return (
    <footer className="border-t border-border/70 px-4 py-3 bg-muted/5">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={!canRun || isRunning}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FlaskConical className="size-3.5 text-primary" />
          {t("actions.dryRun", "Dry run")}
        </button>

        {!isRunning ? (
          <button
            type="button"
            disabled={!canRun}
            onClick={() => setRunning(true)}
            className="flex-[1.5] flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Play className="size-3.5 fill-current" />
            {t("actions.runBatch", "Run batch")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="flex-[1.5] flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-all"
          >
            <StopCircle className="size-3.5" />
            {t("actions.stopBatch", "Stop")}
          </button>
        )}
      </div>
    </footer>
  );
}
