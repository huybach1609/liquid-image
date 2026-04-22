import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { getNumberParam, getStringParam } from "@/lib/functionParams";

const METHOD_DESCRIPTIONS: Record<string, string> = {
  normalize: "Stretches color range to cover full spectrum — every channel gets a min/max remap.",
  "auto-level": "Finds actual min/max per channel and remaps to full range — mathematically perfect normalization.",
  "auto-gamma": "Adjusts gamma so the mean pixel value equals 50% gray automatically.",
};

const NormalizeColorFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const strength = getNumberParam(functionParams, "normalizeStrength", 60);
  const method = getStringParam(functionParams, "normalizeMethod", "normalize");

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        color normalization
      </Badge>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Method</Label>
          <ToggleGroup
            type="single"
            value={method}
            onValueChange={(v) => v && updateFunctionParam("normalizeMethod", v)}
            className="flex flex-col gap-2"
          >
            <ToggleGroupItem value="normalize" className="text-[11px] h-8 justify-start px-3">Normalize</ToggleGroupItem>
            <ToggleGroupItem value="auto-level" className="text-[11px] h-8 justify-start px-3">Auto Level</ToggleGroupItem>
            <ToggleGroupItem value="auto-gamma" className="text-[11px] h-8 justify-start px-3">Auto Gamma</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Strength</Label>
          <div className="text-xl font-light text-foreground">{strength}</div>
          <Slider
            min={0}
            max={100}
            value={[strength]}
            onValueChange={(v) => updateFunctionParam("normalizeStrength", v[0])}
          />
        </div>

        <Alert className="bg-primary/5 border-primary/20 p-3">
          <div className="flex gap-2 items-start">
            <InfoIcon className="size-3.5 text-primary mt-0.5 shrink-0" />
            <AlertDescription className="text-[11px] text-muted-foreground leading-normal">
              {METHOD_DESCRIPTIONS[method]}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default NormalizeColorFunction;
