import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getNumberParam, getStringParam } from "@/lib/functionParams";

const BlackWhiteFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const intensity = getNumberParam(functionParams, "bwIntensity", 54);
  const method = getStringParam(functionParams, "bwMethod", "gray");
  const dither = functionParams.bwDither === true || functionParams.bwDither === "true";
  const thresholdEnabled = functionParams.bwThresholdEnabled !== false && functionParams.bwThresholdEnabled !== "false";
  
  // In the template, Intensity and Threshold Value are effectively the same value for the CLI.
  // We'll use bwIntensity as the master value to ensure the CLI preview updates when either is moved.
  const thresholdValue = intensity;

  const handleIntensityChange = (v: number) => {
    updateFunctionParam("bwIntensity", v);
  };

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        monochrome
      </Badge>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Intensity</Label>
          <div className="text-xl font-light text-foreground">{intensity}</div>
          <Slider
            min={0}
            max={100}
            value={[intensity]}
            onValueChange={(v) => handleIntensityChange(v[0])}
          />
          <p className="text-[11px] text-muted-foreground/60">Convert image to monochrome style.</p>
        </div>

        <Separator className="bg-border/40" />

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Method</Label>
          <ToggleGroup
            type="single"
            value={method}
            onValueChange={(v) => v && updateFunctionParam("bwMethod", v)}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem value="gray" className="text-[11px] h-8 px-2">Colorspace</ToggleGroupItem>
            <ToggleGroupItem value="mono" className="text-[11px] h-8 px-2">Monochrome</ToggleGroupItem>
            <ToggleGroupItem value="rec709" className="text-[11px] h-8 px-2">Rec709Luma</ToggleGroupItem>
            <ToggleGroupItem value="rec601" className="text-[11px] h-8 px-2">Rec601Luma</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator className="bg-border/40" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-[12px] text-muted-foreground/70 font-normal cursor-pointer" htmlFor="dither-toggle">
              Dither (Floyd-Steinberg)
            </Label>
            <Switch
              id="dither-toggle"
              checked={dither}
              onCheckedChange={(v) => updateFunctionParam("bwDither", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-[12px] text-muted-foreground/70 font-normal cursor-pointer" htmlFor="thresh-toggle">
              Black threshold
            </Label>
            <Switch
              id="thresh-toggle"
              checked={thresholdEnabled}
              onCheckedChange={(v) => updateFunctionParam("bwThresholdEnabled", v)}
            />
          </div>

          {thresholdEnabled && (
            <div className="flex flex-col gap-2.5 mt-2">
              <Label className="text-xs font-medium text-muted-foreground/80">Threshold value</Label>
              <div className="text-xl font-light text-foreground">{thresholdValue}</div>
              <Slider
                min={0}
                max={100}
                value={[thresholdValue]}
                onValueChange={(v) => handleIntensityChange(v[0])}
              />
              <p className="text-[11px] text-muted-foreground/60">Pixels below this % → black, above → white.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlackWhiteFunction;
