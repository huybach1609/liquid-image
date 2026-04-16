import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSingleStore } from "@/features/single/state/single.store";

const BlackWhiteFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const intensity =
    typeof functionParams.bwIntensity === "number"
      ? functionParams.bwIntensity
      : typeof functionParams.bwIntensity === "string"
        ? Number(functionParams.bwIntensity) || 80
        : 80;

  return (
    <div className="space-y-3">
      <Label className="block text-xs text-muted-foreground">Intensity</Label>
      <Slider
        min={0}
        max={100}
        value={[intensity]}
        onValueChange={(value) => updateFunctionParam("bwIntensity", value[0])}
      />
      <span className="text-xs text-muted-foreground">{intensity}</span>
      <p className="text-xs text-muted-foreground">Convert image to monochrome style.</p>
    </div>
  );
};

export default BlackWhiteFunction;