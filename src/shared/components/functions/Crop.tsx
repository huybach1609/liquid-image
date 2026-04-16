export const CropFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Aspect ratio</label>
      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option>Free</option>
        <option>1:1</option>
        <option>16:9</option>
      </select>
      <button type="button" className="rounded-md border border-border px-3 py-2 text-xs">
        Reset crop
      </button>
    </div>
  );
};

export default CropFunction;