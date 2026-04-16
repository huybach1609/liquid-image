type SingleCliPreviewProps = {
  commandPreview: string;
};

export function SingleCliPreview({ commandPreview }: SingleCliPreviewProps) {
  return (
    <>
      <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        CLI Preview
      </p>
      <code className="text-xs text-primary">{commandPreview}</code>
    </>
  );
}
