import type { SettingsState } from "../types";

type SharedDestinationFormProps = {
  value?: Pick<SettingsState, "outputFolder" | "namingPattern">;
};

export function SharedDestinationForm({
  value = { outputFolder: "./out/", namingPattern: "same-name" },
}: SharedDestinationFormProps) {
  return (
    <section className="space-y-2 rounded-lg border border-border bg-card p-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Destination
      </h3>
      <p className="text-sm text-muted-foreground">Output: {value.outputFolder}</p>
      <p className="text-sm text-muted-foreground">Pattern: {value.namingPattern}</p>
    </section>
  );
}
