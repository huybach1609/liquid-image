import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSingleStore } from "@/features/single/state/single.store";

const ContrastFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const amount =
    typeof functionParams.contrastAmount === "number"
      ? functionParams.contrastAmount
      : typeof functionParams.contrastAmount === "string"
        ? Number(functionParams.contrastAmount) || 0
        : 0;

  return (
    <div className="space-y-3">
      <Label className="block text-xs text-muted-foreground">Contrast</Label>
      <Slider
        min={-100}
        max={100}
        value={[amount]}
        onValueChange={(value) => updateFunctionParam("contrastAmount", value[0])}
      />
      <span className="text-xs text-muted-foreground">{amount}</span>
      <p className="text-xs text-muted-foreground">Adjust image contrast intensity.</p>
    </div>
  );
};

export default ContrastFunction;
