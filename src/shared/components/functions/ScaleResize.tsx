import { Slider } from "@/components/ui/slider";
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
      <Slider
        value={[Number(resizeWidth)]}
        onValueChange={(value) => updateFunctionParam("resizeWidth", value[0])}
      />
      <span className="text-xs text-muted-foreground">{resizeWidth}</span>
      <label className="block text-xs text-muted-foreground">Height</label>
      <Slider
        value={[Number(resizeHeight)]}
        onValueChange={(value) => updateFunctionParam("resizeHeight", value[0])}
      />
      <span className="text-xs text-muted-foreground">{resizeHeight}</span>
    </div>
  );
};

export default ScaleResizeFunction;
