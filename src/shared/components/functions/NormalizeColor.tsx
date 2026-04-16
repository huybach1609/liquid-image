const NormalizeColorFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Strength</label>
      <input type="range" min={0} max={100} defaultValue={60} className="w-full" />
      <p className="text-xs text-muted-foreground">Normalize luminance and color distribution.</p>
    </div>
  );
};

export default NormalizeColorFunction;
