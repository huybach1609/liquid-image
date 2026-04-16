const ComposeFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Blend mode</label>
      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option>over</option>
        <option>multiply</option>
        <option>screen</option>
      </select>
      <label className="block text-xs text-muted-foreground">Opacity</label>
      <input type="range" min={0} max={100} defaultValue={100} className="w-full" />
    </div>
  );
};

export default ComposeFunction;
