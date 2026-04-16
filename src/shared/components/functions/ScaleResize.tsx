const ScaleResizeFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Width</label>
      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. 1920" />
      <label className="block text-xs text-muted-foreground">Height</label>
      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. 1080" />
    </div>
  );
};

export default ScaleResizeFunction;
