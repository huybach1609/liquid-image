import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSingleStore } from "@/features/single/state/single.store";

const MirrorFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const mirrorAxis =
    typeof functionParams.mirrorAxis === "string"
      ? functionParams.mirrorAxis
      : "Horizontal";

  return (
    <div className="space-y-3">
      <Label>Direction</Label>
     
      <RadioGroup
        value={mirrorAxis}
        onValueChange={(value) => updateFunctionParam("mirrorAxis", value)}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="Horizontal" id="Horizontal">Horizontal</RadioGroupItem>
          <Label htmlFor="Horizontal">Horizontal</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="Vertical" id="Vertical">Vertical</RadioGroupItem>
          <Label htmlFor="Vertical">Vertical</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="Both" id="Both">Both</RadioGroupItem>
          <Label htmlFor="Both">Both</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default MirrorFunction;
