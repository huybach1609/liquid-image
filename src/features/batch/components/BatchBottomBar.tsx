import { Play, FlaskConical, StopCircle } from "lucide-react";
import { useBatchStore } from "../state/batch.store";
import { useTranslation } from "react-i18next";
import { useBatchRunner } from "../hooks/useBatchRunner";

export function BatchBottomBar() {
  const { t } = useTranslation("batch");
  const { queue, pipeline } = useBatchStore();
  const { isRunning, runBatch, cancelBatch, runDryRun } = useBatchRunner();

  const canRun = queue.length > 0 && pipeline.length > 0;

  return (
    <footer className="flex h-14 shrink-0 items-center border-t border-border/70 px-4 bg-muted/5">
      <div className="flex w-full gap-3">
        <button
          type="button"
          disabled={!canRun || isRunning}
          onClick={runDryRun}
          className="flex-1 h-8 flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-medium hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FlaskConical className="size-3.5 text-primary" />
          {t("actions.dryRun", "Dry run")}
        </button>

        {!isRunning ? (
          <button
            type="button"
            disabled={!canRun}
            onClick={runBatch}
            className="flex-[1.5] h-8 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            <Play className="size-3.5 fill-current" />
            {t("actions.runBatch", "Run batch")}
          </button>
        ) : (
          <button
            type="button"
            onClick={cancelBatch}
            className="flex-[1.5] h-8 flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-xs font-bold text-destructive-foreground shadow-xs hover:bg-destructive/90 transition-all"
          >
            <StopCircle className="size-3.5" />
            {t("actions.stopBatch", "Stop")}
          </button>
        )}
      </div>
    </footer>
  );
}
