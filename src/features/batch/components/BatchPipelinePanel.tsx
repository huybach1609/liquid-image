import type { BatchPipelineStep } from "../types";

type BatchPipelinePanelProps = {
  steps?: BatchPipelineStep[];
};

export function BatchPipelinePanel({ steps = [] }: BatchPipelinePanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <header className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Pipeline
      </header>
      <div className="space-y-2">
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pipeline steps configured.</p>
        ) : (
          steps.map((step) => (
            <div key={step.id} className="rounded-md border border-border p-2 text-sm">
              {step.label}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
