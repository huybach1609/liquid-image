type SharedConcurrencyFormProps = {
  workers?: number;
};

export function SharedConcurrencyForm({ workers = 4 }: SharedConcurrencyFormProps) {
  return (
    <section className="space-y-2 rounded-lg border border-border bg-card p-3">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Concurrency
      </h3>
      <p className="text-sm text-muted-foreground">Workers: {workers}</p>
    </section>
  );
}
