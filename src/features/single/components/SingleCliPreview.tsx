type CommandPreviewItem = {
  label: string;
  command: string;
};

type SingleCliPreviewProps = {
  commandPreviews: CommandPreviewItem[];
};

export function SingleCliPreview({ commandPreviews }: SingleCliPreviewProps) {
  return (
    <>
      <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        CLI Preview
      </p>
      <div className="space-y-2">
        {commandPreviews.map((item) => (
          <div key={item.label} className="space-y-1">
            {commandPreviews.length > 1 ? (
              <p className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                {item.label}
              </p>
            ) : null}
            <div className="overflow-x-auto">
              <code className="block   text-xs text-primary">
                {item.command}
              </code>
            </div>
          </div>
        ))}
      </div>
    </>
  );
  
}