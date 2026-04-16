const TextLogoFunction = () => {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Text</label>
      <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Your watermark text" />
      <label className="block text-xs text-muted-foreground">Position</label>
      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option>bottom-right</option>
        <option>bottom-left</option>
        <option>center</option>
      </select>
    </div>
  );
};

export default TextLogoFunction;
