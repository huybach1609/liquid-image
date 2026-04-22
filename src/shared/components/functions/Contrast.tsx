import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { getNumberParam, getStringParam } from "@/lib/functionParams";

const MODE_DESCRIPTIONS: Record<string, string> = {
  bc: "Adjusts brightness and contrast together using values from −100 to +100.",
  sig: "Sigmoidal curve — avoids clipping highlights and shadows for smoother contrast.",
  stretch: "Stretches the intensity range; specify how many pixels clip to pure black/white.",
  level: "Set black point, white point, and gamma directly for fine-grained control.",
  clahe: "Adaptive histogram equalization on local tiles for detail in flat regions.",
  norm: "Auto-stretches color range to full spectrum — equivalent to contrast-stretch 0.",
};

const ContrastFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const amount = getNumberParam(functionParams, "contrastAmount", 0);
  const mode = getStringParam(functionParams, "contrastMode", "bc");
  const brightness = getNumberParam(functionParams, "brightnessAmount", 0);

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        tương phản
      </Badge>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Contrast</Label>
          <div className="text-xl font-light text-foreground">{amount}</div>
          <Slider
            min={-100}
            max={100}
            value={[amount]}
            onValueChange={(v) => updateFunctionParam("contrastAmount", v[0])}
          />
          <p className="text-[11px] text-muted-foreground/60">Adjust image contrast intensity.</p>
        </div>

        <Separator className="bg-border/40" />

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Mode</Label>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && updateFunctionParam("contrastMode", v)}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem value="bc" className="text-[11px] h-8 px-2 text-center leading-tight">Brightness Contrast</ToggleGroupItem>
            <ToggleGroupItem value="sig" className="text-[11px] h-8 px-2">Sigmoidal</ToggleGroupItem>
            <ToggleGroupItem value="stretch" className="text-[11px] h-8 px-2">Stretch</ToggleGroupItem>
            <ToggleGroupItem value="level" className="text-[11px] h-8 px-2">Level</ToggleGroupItem>
            <ToggleGroupItem value="clahe" className="text-[11px] h-8 px-2">CLAHE</ToggleGroupItem>
            <ToggleGroupItem value="norm" className="text-[11px] h-8 px-2">Normalize</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {mode === "bc" && (
          <>
            <Separator className="bg-border/40" />
            <div className="flex flex-col gap-2.5">
              <Label className="text-xs font-medium text-muted-foreground/80">Brightness</Label>
              <div className="text-xl font-light text-foreground">{brightness}</div>
              <Slider
                min={-100}
                max={100}
                value={[brightness]}
                onValueChange={(v) => updateFunctionParam("brightnessAmount", v[0])}
              />
              <p className="text-[11px] text-muted-foreground/60">Adjust brightness alongside contrast.</p>
            </div>
          </>
        )}

        <Alert className="bg-primary/5 border-primary/20 p-3 mt-2">
          <div className="flex gap-2 items-start">
            <InfoIcon className="size-3.5 text-primary mt-0.5 shrink-0" />
            <AlertDescription className="text-[11px] text-muted-foreground leading-normal">
              {MODE_DESCRIPTIONS[mode]}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default ContrastFunction;
