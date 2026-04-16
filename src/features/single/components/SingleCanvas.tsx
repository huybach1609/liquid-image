export function SingleCanvas() {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <header className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Canvas
      </header>
      <div className="flex min-h-48 items-center justify-center rounded-md border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">Image preview area</p>
      </div>
    </section>
  );
}
