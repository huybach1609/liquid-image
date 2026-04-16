import { useSingleStore } from "@/features/single/state/single.store";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const BorderFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const borderSize =
    typeof functionParams.borderSize === "number"
      ? functionParams.borderSize
      : typeof functionParams.borderSize === "string"
        ? Number(functionParams.borderSize) || 10
        : 10;

  const borderColor =
    typeof functionParams.borderColor === "string" ? functionParams.borderColor : "black";

  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Border size</label>
      <Slider
        value={[borderSize]}
        onValueChange={(value) => updateFunctionParam("borderSize", value[0])}
      />
      <span className="text-xs text-muted-foreground">{borderSize}</span>
      <label className="block text-xs text-muted-foreground">Border color</label>
      <Select
        value={borderColor}
        onValueChange={(value) => updateFunctionParam("borderColor", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a color" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="black">Black</SelectItem>
          <SelectItem value="white">White</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BorderFunction;
