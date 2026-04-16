const ContrastFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Contrast</label>
      <input type="range" min={-100} max={100} defaultValue={0} className="w-full" />
      <p className="text-xs text-muted-foreground">Adjust image contrast intensity.</p>
    </div>
  );
};

export default ContrastFunction;
