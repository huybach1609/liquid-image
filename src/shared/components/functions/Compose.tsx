import { Select,  SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSingleStore } from "@/features/single/state/single.store";
import { Input } from "../ui/input";

const ComposeFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const composeBlendMode =
    typeof functionParams.composeBlendMode === "string" ? functionParams.composeBlendMode : "over";
  const composeOpacity =
    typeof functionParams.composeOpacity === "number"
      ? functionParams.composeOpacity
      : typeof functionParams.composeOpacity === "string"
        ? Number(functionParams.composeOpacity) || 100
        : 100;
  const composeOverlayPath =
    typeof functionParams.composeOverlayPath === "string" ? functionParams.composeOverlayPath : "overlay.png";

  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Overlay image path</label>
      <Input
        value={composeOverlayPath}
        onChange={(e) => updateFunctionParam("composeOverlayPath", e.target.value)}
      />
      <span className="text-xs text-muted-foreground">{composeOverlayPath}</span>

      <label className="block text-xs text-muted-foreground">Blend mode</label>
      <Select
        value={composeBlendMode}
        onValueChange={(value) => updateFunctionParam("composeBlendMode", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a blend mode" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="over">over</SelectItem>
          <SelectItem value="multiply">multiply</SelectItem>
          <SelectItem value="screen">screen</SelectItem>
        </SelectContent>
      </Select>

      <label className="block text-xs text-muted-foreground">Opacity</label>
      <Slider
        min={0}
        max={100}
        value={[composeOpacity]}
        onValueChange={(value) => updateFunctionParam("composeOpacity", value[0])}
      />
    </div>
  );
};

export default ComposeFunction;
