import type { SettingsState } from "../types";

type SharedOutputRulesFormProps = {
  value?: Pick<SettingsState, "conflictPolicy" | "onErrorPolicy">;
};

export function SharedOutputRulesForm({
  value = { conflictPolicy: "overwrite", onErrorPolicy: "skip-and-continue" },
}: SharedOutputRulesFormProps) {
  return (
    <section className="space-y-2 rounded-lg border border-border bg-card p-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Output Rules
      </h3>
      <p className="text-sm text-muted-foreground">On conflict: {value.conflictPolicy}</p>
      <p className="text-sm text-muted-foreground">On error: {value.onErrorPolicy}</p>
    </section>
  );
}
