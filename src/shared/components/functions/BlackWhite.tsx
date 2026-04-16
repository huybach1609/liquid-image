const BlackWhiteFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Intensity</label>
      <input type="range" min={0} max={100} defaultValue={80} className="w-full" />
      <p className="text-xs text-muted-foreground">Convert image to monochrome style.</p>
    </div>
  );
};

export default BlackWhiteFunction;