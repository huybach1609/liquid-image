const MirrorFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Direction</label>
      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option>Horizontal</option>
        <option>Vertical</option>
        <option>Both</option>
      </select>
    </div>
  );
};

export default MirrorFunction;