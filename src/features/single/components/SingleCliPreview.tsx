type SingleCliPreviewProps = {
  commandPreview: string;
};

export function SingleCliPreview({ commandPreview }: SingleCliPreviewProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-3">
      <header className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        CLI Preview
      </header>
      <code className="block rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
        {commandPreview}
      </code>
    </section>
  );
}
