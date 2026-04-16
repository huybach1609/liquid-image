import { Label } from "@/components/ui/label";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSingleStore } from "@/features/single/state/single.store";

const MirrorFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const mirrorAxis =
    typeof functionParams.mirrorAxis === "string" ? functionParams.mirrorAxis : "Horizontal";

  return (
    <div className="space-y-3">
      <Label className="block text-xs text-muted-foreground">Direction</Label>
      <Select
        value={mirrorAxis}
        onValueChange={(value) => updateFunctionParam("mirrorAxis", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a direction" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="Horizontal">Horizontal</SelectItem>
          <SelectItem value="Vertical">Vertical</SelectItem>
          <SelectItem value="Both">Both</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MirrorFunction;