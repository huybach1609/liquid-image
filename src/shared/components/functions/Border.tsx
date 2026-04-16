const BorderFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Border size</label>
      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. 20" />
      <label className="block text-xs text-muted-foreground">Border color</label>
      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. #ffffff" />
    </div>
  );
};

export default BorderFunction;
