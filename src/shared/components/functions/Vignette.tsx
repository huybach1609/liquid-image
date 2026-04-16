const VignetteFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Radius</label>
      <input type="range" min={0} max={100} defaultValue={40} className="w-full" />
      <label className="block text-xs text-muted-foreground">Softness</label>
      <input type="range" min={0} max={100} defaultValue={60} className="w-full" />
    </div>
  );
};

export default VignetteFunction;
