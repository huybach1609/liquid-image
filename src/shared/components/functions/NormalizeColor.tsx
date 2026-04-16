import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useSingleStore } from "@/features/single/state/single.store";

const NormalizeColorFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const strength =
    typeof functionParams.normalizeStrength === "number"
      ? functionParams.normalizeStrength
      : typeof functionParams.normalizeStrength === "string"
        ? Number(functionParams.normalizeStrength) || 60
        : 60;

  return (
    <div className="space-y-3">
      <Label className="block text-xs text-muted-foreground">Strength</Label>
      <Slider
        min={0}
        max={100}
        value={[strength]}
        onValueChange={(value) => updateFunctionParam("normalizeStrength", value[0])}
      />
      <span className="text-xs text-muted-foreground">{strength}</span>
      <p className="text-xs text-muted-foreground">Normalize luminance and color distribution.</p>
    </div>
  );
};

export default NormalizeColorFunction;
