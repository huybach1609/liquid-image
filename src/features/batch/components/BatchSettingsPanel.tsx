export function BatchSettingsPanel() {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <header className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Settings
      </header>
      <p className="text-sm text-muted-foreground">
        Batch runtime settings and ImageMagick limits will be configured here.
      </p>
    </section>
  );
}
