const RotateFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Angle (degrees)</label>
      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. 90" />
      <button type="button" className="rounded-md border border-border px-3 py-2 text-xs">
        Auto rotate by EXIF
      </button>
    </div>
  );
};

export default RotateFunction;
