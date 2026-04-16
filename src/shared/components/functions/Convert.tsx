const ConvertFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Output format</label>
      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option>PNG</option>
        <option>JPG</option>
        <option>WEBP</option>
      </select>
      <label className="block text-xs text-muted-foreground">Quality</label>
      <input type="range" min={1} max={100} defaultValue={85} className="w-full" />
    </div>
  );
};

export default ConvertFunction;