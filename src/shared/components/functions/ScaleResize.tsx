import { useSingleStore } from "@/features/single/state/single.store";

const ScaleResizeFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const resizeWidth =
    typeof functionParams.resizeWidth === "string"
      ? functionParams.resizeWidth
      : typeof functionParams.resizeWidth === "number"
        ? String(functionParams.resizeWidth)
        : "";
  const resizeHeight =
    typeof functionParams.resizeHeight === "string"
      ? functionParams.resizeHeight
      : typeof functionParams.resizeHeight === "number"
        ? String(functionParams.resizeHeight)
        : "";

  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Width</label>
      <input
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="e.g. 1920"
        value={resizeWidth}
        onChange={(e) => updateFunctionParam("resizeWidth", e.target.value)}
      />
      <label className="block text-xs text-muted-foreground">Height</label>
      <input
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="e.g. 1080"
        value={resizeHeight}
        onChange={(e) => updateFunctionParam("resizeHeight", e.target.value)}
      />
    </div>
  );
};

export default ScaleResizeFunction;
